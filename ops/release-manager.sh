#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/fuwari-blog}"
MAIN_SERVICE="${MAIN_SERVICE:-fuwari-blog.service}"

RELEASES_DIR="${APP_DIR}/releases"
CURRENT_LINK="${APP_DIR}/current"
ENV_FILE="${APP_DIR}/shared/.env.production"

if [[ -f "${ENV_FILE}" ]]; then
	set -a
	source "${ENV_FILE}"
	set +a
fi

HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:${PORT:-4322}/}"

usage() {
	cat <<'EOF'
用法:
  fuwari-release list
  fuwari-release current
  fuwari-release switch <release-id>
EOF
}

rollback() {
	local previous_target="$1"

	if [[ -n "${previous_target}" && -d "${previous_target}" ]]; then
		echo "回滚到上一版本: ${previous_target}"
		ln -sfn "${previous_target}" "${CURRENT_LINK}"
		systemctl restart "${MAIN_SERVICE}" || true
	fi
}

check_health() {
	local attempt

	for attempt in $(seq 1 10); do
		if curl -fsS "${HEALTHCHECK_URL}" >/dev/null; then
			return 0
		fi
		sleep 2
	done

	return 1
}

show_current() {
	local current_target

	current_target="$(readlink -f "${CURRENT_LINK}" 2>/dev/null || true)"
	if [[ -z "${current_target}" ]]; then
		echo "当前没有活动版本"
		return 1
	fi

	echo "current=$(basename "${current_target}")"
	if [[ -f "${current_target}/REVISION" ]]; then
		cat "${current_target}/REVISION"
	fi
}

list_releases() {
	local current_release release_path release_id marker
	local built_at git_sha source_release
	local -a release_paths=()

	current_release="$(basename "$(readlink -f "${CURRENT_LINK}" 2>/dev/null || true)")"
	mapfile -t release_paths < <(find "${RELEASES_DIR}" -mindepth 1 -maxdepth 1 -type d | sort -r)

	for release_path in "${release_paths[@]}"; do
		release_id="$(basename "${release_path}")"
		marker=" "
		if [[ "${release_id}" == "${current_release}" ]]; then
			marker="*"
		fi

		built_at="-"
		git_sha="-"
		source_release="-"
		if [[ -f "${release_path}/REVISION" ]]; then
			built_at="$(grep -E '^(built_at|published_at)=' "${release_path}/REVISION" | head -n 1 | cut -d= -f2- || true)"
			git_sha="$(grep -E '^git_sha=' "${release_path}/REVISION" | head -n 1 | cut -d= -f2- || true)"
			source_release="$(grep -E '^source=' "${release_path}/REVISION" | head -n 1 | cut -d= -f2- || true)"
		fi

		printf "%s %s  source=%s  git=%s  at=%s\n" "${marker}" "${release_id}" "${source_release:--}" "${git_sha:--}" "${built_at:--}"
	done
}

switch_release() {
	local release_id="$1"
	local release_dir="${RELEASES_DIR}/${release_id}"
	local previous_target

	if [[ ! -d "${release_dir}" ]]; then
		echo "版本不存在: ${release_id}"
		exit 1
	fi

	previous_target="$(readlink -f "${CURRENT_LINK}" 2>/dev/null || true)"
	ln -sfn "${release_dir}" "${CURRENT_LINK}"

	if ! systemctl restart "${MAIN_SERVICE}"; then
		echo "主服务启动失败，执行回滚"
		rollback "${previous_target}"
		exit 1
	fi

	if ! check_health; then
		echo "健康检查失败，执行回滚"
		rollback "${previous_target}"
		exit 1
	fi

	echo "切换完成: ${release_id}"
}

case "${1:-}" in
	list)
		list_releases
		;;
	current)
		show_current
		;;
	switch)
		if [[ $# -ne 2 ]]; then
			usage
			exit 1
		fi
		switch_release "$2"
		;;
	*)
		usage
		exit 1
		;;
esac
