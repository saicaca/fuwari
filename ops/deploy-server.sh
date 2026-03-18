#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/fuwari-blog}"
RELEASE_ID="${RELEASE_ID:?RELEASE_ID is required}"
MAIN_SERVICE="${MAIN_SERVICE:-fuwari-blog.service}"
PUBLISH_SERVICE="${PUBLISH_SERVICE:-fuwari-blog-publish.service}"

RELEASES_DIR="${APP_DIR}/releases"
SHARED_DIR="${APP_DIR}/shared"
INCOMING_DIR="${APP_DIR}/incoming"
CURRENT_LINK="${APP_DIR}/current"
ENV_FILE="${SHARED_DIR}/.env.production"
ARCHIVE_PATH="${INCOMING_DIR}/${RELEASE_ID}.tar.gz"
STAGING_DIR="${RELEASES_DIR}/.${RELEASE_ID}.tmp"
RELEASE_DIR="${RELEASES_DIR}/${RELEASE_ID}"
IMPORTED_DIR="${SHARED_DIR}/content/posts/imported"
RUNTIME_DIR="${SHARED_DIR}/runtime"
IMPORTED_ASSETS_DIR="${SHARED_DIR}/public/imported-assets"
RELEASE_MANAGER_TARGET="/usr/local/bin/fuwari-release"

cleanup() {
	if [[ -d "${STAGING_DIR}" ]]; then
		rm -rf "${STAGING_DIR}"
	fi
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
	local health_url="$1"
	local attempt

	for attempt in $(seq 1 10); do
		if curl -fsS "${health_url}" >/dev/null; then
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

trap cleanup EXIT

mkdir -p "${APP_DIR}" "${RELEASES_DIR}" "${SHARED_DIR}" "${INCOMING_DIR}" "${IMPORTED_DIR}"
mkdir -p "${RUNTIME_DIR}" "${IMPORTED_ASSETS_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
	echo "缺少生产环境文件: ${ENV_FILE}"
	exit 1
fi

if [[ ! -f "${ARCHIVE_PATH}" ]]; then
	echo "缺少待部署包: ${ARCHIVE_PATH}"
	exit 1
fi

if [[ -e "${RELEASE_DIR}" || -e "${STAGING_DIR}" ]]; then
	echo "版本目录已存在，请更换 RELEASE_ID: ${RELEASE_ID}"
	exit 1
fi

set -a
source "${ENV_FILE}"
set +a

KEEP_RELEASES="${KEEP_RELEASES:-5}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:${PORT:-4322}/}"

LEGACY_IMPORTED_DIR="${APP_DIR}/src/content/posts/imported"
LEGACY_RUNTIME_DIR="${APP_DIR}/.runtime"
LEGACY_IMPORTED_ASSETS_DIR="${APP_DIR}/public/imported-assets"

if [[ -d "${LEGACY_IMPORTED_DIR}" ]] && [[ -z "$(find "${IMPORTED_DIR}" -mindepth 1 -print -quit 2>/dev/null || true)" ]]; then
	cp -a "${LEGACY_IMPORTED_DIR}/." "${IMPORTED_DIR}/"
fi

if [[ -d "${LEGACY_RUNTIME_DIR}" ]] && [[ -z "$(find "${RUNTIME_DIR}" -mindepth 1 -print -quit 2>/dev/null || true)" ]]; then
	cp -a "${LEGACY_RUNTIME_DIR}/." "${RUNTIME_DIR}/"
fi

if [[ -d "${LEGACY_IMPORTED_ASSETS_DIR}" ]] && [[ -z "$(find "${IMPORTED_ASSETS_DIR}" -mindepth 1 -print -quit 2>/dev/null || true)" ]]; then
	cp -a "${LEGACY_IMPORTED_ASSETS_DIR}/." "${IMPORTED_ASSETS_DIR}/"
fi

NODE_BIN="${NODE_BIN:-$(find /root/.local/share/fnm/node-versions -path '*/installation/bin/node' 2>/dev/null | sort -V | tail -n 1)}"
if [[ -z "${NODE_BIN}" || ! -x "${NODE_BIN}" ]]; then
	echo "没找到可用的 Node 可执行文件，先检查 fnm 安装"
	exit 1
fi

COREPACK_BIN="${COREPACK_BIN:-$(dirname "${NODE_BIN}")/corepack}"
PNPM_BIN="${PNPM_BIN:-$(dirname "${NODE_BIN}")/pnpm}"

ln -sf "${NODE_BIN}" /usr/local/bin/node
ln -sf "${COREPACK_BIN}" /usr/local/bin/corepack
ln -sf "${PNPM_BIN}" /usr/local/bin/pnpm

corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.14.4 --activate >/dev/null 2>&1 || true

mkdir -p "${STAGING_DIR}"
tar -xzf "${ARCHIVE_PATH}" -C "${STAGING_DIR}"

if [[ ! -f "${STAGING_DIR}/dist/server/entry.mjs" ]]; then
	echo "部署包缺少 dist/server/entry.mjs，拒绝切换版本"
	exit 1
fi

if [[ ! -d "${STAGING_DIR}/node_modules" ]]; then
	echo "部署包缺少 node_modules，无法支持运行时和后台发布"
	exit 1
fi

mkdir -p "${STAGING_DIR}/src/content/posts"
rm -rf "${STAGING_DIR}/src/content/posts/imported"
ln -sfn "${IMPORTED_DIR}" "${STAGING_DIR}/src/content/posts/imported"
rm -rf "${STAGING_DIR}/.runtime"
ln -sfn "${RUNTIME_DIR}" "${STAGING_DIR}/.runtime"
mkdir -p "${STAGING_DIR}/public"
rm -rf "${STAGING_DIR}/public/imported-assets"
ln -sfn "${IMPORTED_ASSETS_DIR}" "${STAGING_DIR}/public/imported-assets"
ln -sfn "${ENV_FILE}" "${STAGING_DIR}/.env.production"

mv "${STAGING_DIR}" "${RELEASE_DIR}"
trap - EXIT

install -D -m 0644 "${RELEASE_DIR}/ops/systemd/fuwari-blog.service" "/etc/systemd/system/${MAIN_SERVICE}"
install -D -m 0644 "${RELEASE_DIR}/ops/systemd/fuwari-blog-publish.service" "/etc/systemd/system/${PUBLISH_SERVICE}"
install -D -m 0755 "${RELEASE_DIR}/ops/release-manager.sh" "${RELEASE_MANAGER_TARGET}"

systemctl daemon-reload
systemctl enable "${MAIN_SERVICE}"

previous_target="$(readlink -f "${CURRENT_LINK}" 2>/dev/null || true)"

ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"

if ! systemctl restart "${MAIN_SERVICE}"; then
	echo "主服务启动失败，执行回滚"
	rollback "${previous_target}"
	exit 1
fi

if ! check_health "${HEALTHCHECK_URL}"; then
	echo "健康检查失败，执行回滚"
	rollback "${previous_target}"
	exit 1
fi

rm -f "${ARCHIVE_PATH}"
prune_old_releases "${KEEP_RELEASES}"

systemctl status "${MAIN_SERVICE}" --no-pager
echo "当前版本: $(basename "$(readlink -f "${CURRENT_LINK}")")"
