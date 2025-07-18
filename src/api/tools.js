import { RequestData, POST, GET } from "@/utils/request-data";

const requestData = Object.create(RequestData);

requestData.setBaseUrl("/web");

// 上传效果图记录
export const logPage = (params) =>
  requestData.base("/tools/thumb", GET, params);
// 上传效果图
export const thumbUpload = (params) =>
  requestData.base("/tools/thumb/upload", POST, params);
// 分快上传
export const thumbUploadChunk = (params) =>
  requestData.base("/tools/thumb/upload-chunk", POST, params);
// 查询上传任务
export const thumbUploadTask = (id) =>
  requestData.base(`/tools/thumb/status/${id}`, GET);
// 秘钥生成记录
export const secretThumbPage = (params) =>
  requestData.base("/secretThumb", GET, params);
// 生成秘钥
export const createSecretThumb = (params) =>
  requestData.base("/secretThumb", POST, params);
// 根据excel生成条形码PDF
export const createByExcel = (params) =>
  requestData.base("/createPdf/createByExcel", POST, params, false, true);
// 根据文本生成条形码PDF
export const createByText = (params) =>
  requestData.base("/createPdf/createByText", POST, params, false, true);
// 上传zip，修改其中PDF名称，并返回zip
export const replacePdf = (params) =>
  requestData.base("/replacePdf/processZip", POST, params, false, true);
