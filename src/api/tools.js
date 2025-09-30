import { RequestData, POST, GET, DELETE } from "@/utils/request-data";

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
// 备份面单
export const backup4pxParcel = (params) =>
  requestData.base("/backup/4px", POST, params);
// 校验是否备份
export const backup4pxParcelValidate = (params) =>
  requestData.base("/backup/validate", POST, params);
// 备份记录
export const backup4pxParcelPage = (params) =>
  requestData.base("/backup/page", POST, params);

// 称重计划
export const weighingPlanPage = (params) =>
  requestData.base("/weighingPlan/plans", GET, params);
export const weighingPlanCreate = (params) =>
  requestData.base("/weighingPlan/plans", POST, params);
export const weighingPlanEdit = (params) =>
  requestData.base("/weighingPlan/plans/edit", POST, params);
export const weighingPlanRead = (id) =>
  requestData.base(`/weighingPlan/plans/${id}`, GET);
export const weighingPlanDelete = (id) =>
  requestData.base(`/weighingPlan/plans/${id}`, DELETE);

export const weighingPlanAddBox = (params) =>
  requestData.base("/weighingPlan/plans/boxes", POST, params);

export const weighingPlanDown = (id) =>
  requestData.base(`/weighingPlan/plans/${id}/download`, GET);

export const weighingPlanBoxDelete = (id) =>
  requestData.base(`/weighingPlan/boxes/${id}`, DELETE);
