import { RequestData, POST, GET } from "@/utils/request-data";

const request = Object.create(RequestData);

request.setBaseUrl("/web");

export const signIn = (params) => request.base("/auth/sign_in", POST, params);
export const signUp = (params) => request.base("/auth/sign_up", POST, params);
export const userInfo = () => request.base("/users/me", GET);
