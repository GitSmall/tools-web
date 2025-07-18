import { ElMessage } from "element-plus";

export const downloadByBlob = async (res, isDecode = false) => {
  // 下载blob数据
  if (JSON.stringify(res) !== "{}") {
    ElMessage.success("文件已开始下载");
    const contentDisposition = res.headers["content-disposition"];
    const contentType = res.headers["content-type"];
    let filename = "";
    if (
      contentDisposition &&
      (contentDisposition.indexOf("fileName") >= 0 ||
        contentDisposition.indexOf("filename") >= 0)
    ) {
      filename =
        contentDisposition.split("fileName=")[1] ||
        contentDisposition.split("filename=")[1];
    } else if (contentType.includes("application/pdf")) {
      filename = "download.pdf";
    } else if (contentType.includes("application/zip")) {
      filename = "download.zip";
    }

    const blob = new Blob([res.data]);
    const downloadElement = document.createElement("a");
    const href = window.URL.createObjectURL(blob); // 创建下载的链接
    downloadElement.href = href;
    console.log(filename);
    console.log(decodeURIComponent(filename));
    console.log("---", isDecode ? decodeURIComponent(filename) : filename);
    downloadElement.download = isDecode
      ? decodeURIComponent(filename)
      : filename; // 下载后文件名
    document.body.appendChild(downloadElement);
    downloadElement.click(); // 点击下载
    document.body.removeChild(downloadElement); // 下载完成移除元素
    window.URL.revokeObjectURL(href); // 释放掉blob对象
  } else {
    console.log("JSON.stringify(res)", JSON.stringify(res));
    const strJson = await blob2json(res);
    const parseJson = JSON.parse(strJson);
    console.log("====", parseJson);
    if (parseJson.code !== 200) {
      return parseJson;
    }
    ElMessage.error("下载时发错误，后台没有相应的文件!");
  }
};
