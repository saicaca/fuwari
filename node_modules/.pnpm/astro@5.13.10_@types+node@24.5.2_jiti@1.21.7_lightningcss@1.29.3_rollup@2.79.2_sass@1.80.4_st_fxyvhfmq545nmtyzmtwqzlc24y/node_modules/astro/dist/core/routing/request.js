function getFirstForwardedValue(multiValueHeader) {
  return multiValueHeader?.toString()?.split(",").map((e) => e.trim())?.[0];
}
function getClientIpAddress(request) {
  return getFirstForwardedValue(request.headers.get("x-forwarded-for"));
}
export {
  getClientIpAddress
};
