#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/fuwari-blog}"
MAIN_SERVICE="${MAIN_SERVICE:-fuwari-blog.service}"

CURRENT_LINK="${APP_DIR}/current"
RELEASES_DIR="${APP_DIR}/releases"
ENV_FILE="${APP_DIR}/shared/.env.production"

cleanup() {
	if [[ -d "${STAGING_DIR}" ]]; then
		rm -rf "${STAGING_DIR}"
	fi
}

rollback() {
	echo "回滚到上一版本: ${CURRENT_DIR}"
	ln -sfn "${CURRENT_DIR}" "${CURRENT_LINK}"
	systemctl restart "${MAIN_SERVICE}" || true
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

prune_old_releases() {
	local keep_count="$1"
	local current_target release_path
	local -a release_paths=()

	if ! [[ "${keep_count}" =~ ^[0-9]+$ ]] || (( keep_count < 1 )); then
		return 0
	fi

	current_target="$(readlink -f "${CURRENT_LINK}" 2>/dev/null || true)"

	mapfile -t release_paths < <(find "${RELEASES_DIR}" -mindepth 1 -maxdepth 1 -type d | sort -r)

	if (( ${#release_paths[@]} <= keep_count )); then
		return 0
	fi

	for release_path in "${release_paths[@]:keep_count}"; do
		if [[ "${release_path}" == "${current_target}" ]]; then
			continue
		fi
		rm -rf "${release_path}"
	done
}

if [[ ! -L "${CURRENT_LINK}" ]]; then
	echo "缺少 current 软链接，先完成一次正式部署"
	exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
	echo "缺少生产环境文件: ${ENV_FILE}"
	exit 1
fi

set -a
source "${ENV_FILE}"
set +a

KEEP_RELEASES="${KEEP_RELEASES:-5}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:${PORT:-4322}/}"

CURRENT_DIR="$(readlink -f "${CURRENT_LINK}")"
CURRENT_RELEASE="$(basename "${CURRENT_DIR}")"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
NEW_RELEASE_ID="${TIMESTAMP}-publish"
STAGING_DIR="${RELEASES_DIR}/.${NEW_RELEASE_ID}.tmp"
NEW_RELEASE_DIR="${RELEASES_DIR}/${NEW_RELEASE_ID}"

if [[ -e "${STAGING_DIR}" || -e "${NEW_RELEASE_DIR}" ]]; then
	echo "发布版本目录已存在，请稍后重试: ${NEW_RELEASE_ID}"
	exit 1
fi

trap cleanup EXIT

mkdir -p "${STAGING_DIR}"
cp -al "${CURRENT_DIR}/." "${STAGING_DIR}/"

rm -rf "${STAGING_DIR}/dist" "${STAGING_DIR}/.astro"

cat > "${STAGING_DIR}/REVISION" <<EOF
release_id=${NEW_RELEASE_ID}
source=server-publish
source_release=${CURRENT_RELEASE}
published_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

cd "${STAGING_DIR}"

export HOME="${HOME:-/root}"
export PATH="/usr/local/bin:/usr/bin:/bin:${PATH:-}"

/usr/local/bin/corepack pnpm build

mv "${STAGING_DIR}" "${NEW_RELEASE_DIR}"
trap - EXIT

ln -sfn "${NEW_RELEASE_DIR}" "${CURRENT_LINK}"

if ! systemctl restart "${MAIN_SERVICE}"; then
	echo "主服务启动失败，执行回滚"
	rollback
	exit 1
fi

if ! check_health; then
	echo "健康检查失败，执行回滚"
	rollback
	exit 1
fi

prune_old_releases "${KEEP_RELEASES}"
echo "发布完成，当前版本: ${NEW_RELEASE_ID}"
