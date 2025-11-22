import CachePolicy from "http-cache-semantics";
async function loadRemoteImage(src) {
  const req = new Request(src);
  const res = await fetch(req);
  if (!res.ok) {
    throw new Error(
      `Failed to load remote image ${src}. The request did not return a 200 OK response. (received ${res.status}))`
    );
  }
  const policy = new CachePolicy(webToCachePolicyRequest(req), webToCachePolicyResponse(res));
  const expires = policy.storable() ? policy.timeToLive() : 0;
  return {
    data: Buffer.from(await res.arrayBuffer()),
    expires: Date.now() + expires,
    etag: res.headers.get("Etag") ?? void 0,
    lastModified: res.headers.get("Last-Modified") ?? void 0
  };
}
async function revalidateRemoteImage(src, revalidationData) {
  const headers = {
    ...revalidationData.etag && { "If-None-Match": revalidationData.etag },
    ...revalidationData.lastModified && { "If-Modified-Since": revalidationData.lastModified }
  };
  const req = new Request(src, { headers });
  const res = await fetch(req);
  if (!res.ok && res.status !== 304) {
    throw new Error(
      `Failed to revalidate cached remote image ${src}. The request did not return a 200 OK / 304 NOT MODIFIED response. (received ${res.status} ${res.statusText})`
    );
  }
  const data = Buffer.from(await res.arrayBuffer());
  if (res.ok && !data.length) {
    return await loadRemoteImage(src);
  }
  const policy = new CachePolicy(
    webToCachePolicyRequest(req),
    webToCachePolicyResponse(
      res.ok ? res : new Response(null, { status: 200, headers: res.headers })
    )
    // 304 responses themselves are not cacheable, so just pretend to get the refreshed TTL
  );
  const expires = policy.storable() ? policy.timeToLive() : 0;
  return {
    data,
    expires: Date.now() + expires,
    // While servers should respond with the same headers as a 200 response, if they don't we should reuse the stored value
    etag: res.headers.get("Etag") ?? (res.ok ? void 0 : revalidationData.etag),
    lastModified: res.headers.get("Last-Modified") ?? (res.ok ? void 0 : revalidationData.lastModified)
  };
}
function webToCachePolicyRequest({ url, method, headers: _headers }) {
  let headers = {};
  try {
    headers = Object.fromEntries(_headers.entries());
  } catch {
  }
  return {
    method,
    url,
    headers
  };
}
function webToCachePolicyResponse({ status, headers: _headers }) {
  let headers = {};
  try {
    headers = Object.fromEntries(_headers.entries());
  } catch {
  }
  return {
    status,
    headers
  };
}
export {
  loadRemoteImage,
  revalidateRemoteImage
};
