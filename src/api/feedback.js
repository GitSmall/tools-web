import { RequestData, POST, GET } from "@/utils/request-data";

const request = Object.create(RequestData);

request.setBaseUrl("/web");

export const feedbackSubmit = (params) =>
  request.base("/feedback/submit", POST, params);
export const feedbackList = (params) =>
  request.base("/feedback/list", POST, params);
