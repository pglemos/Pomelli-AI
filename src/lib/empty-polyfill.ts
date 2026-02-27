// Empty polyfill for browser
const noop = () => {};
const empty = {};

export default typeof window !== 'undefined' ? window.fetch : noop;
export const Request = typeof window !== 'undefined' ? window.Request : noop;
export const Response = typeof window !== 'undefined' ? window.Response : noop;
export const Headers = typeof window !== 'undefined' ? window.Headers : noop;
export const FormData = typeof window !== 'undefined' ? window.FormData : noop;
