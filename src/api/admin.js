import { RequestData, POST, GET } from "@/utils/request-data";

const requestData = Object.create(RequestData);

requestData.setBaseUrl("/admin");

// 设置
export const getSettings = () => requestData.base("/settings", GET);
