import request from "./request";
import qs from "qs";
export const RequestData = {
  baseUrl: "",
  method: "",
  query: false,
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  },
  getData(url, method, params, blob) {
    this.method = method;
    const data = {
      url: this.baseUrl + url,
      method: this.method,
    };
    if (blob) {
      data["responseType"] = "blob";
    }
    if (params) {
      if (this.query) {
        data["params"] = params;
        data["paramsSerializer"] = (params) =>
          qs.stringify(params, { arrayFormat: "repeat" });
      } else {
        if (method === GET) {
          data["params"] = params;
          data["paramsSerializer"] = (params) =>
            qs.stringify(params, { arrayFormat: "repeat" });
        } else {
          data["data"] = params;
        }
      }
    }
    return data;
  },
  base(url, method = GET, params = {}, query = false, blob = false) {
    this.query = query;
    return request(this.getData(url, method, params, blob));
  },
};
export const getUrl = (uri) => request.defaults.baseURL + uri;
export const GET = "get";
export const POST = "post";
export const DELETE = "delete";
