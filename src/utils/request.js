import axios from "axios";
import { ElMessageBox, ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";
import { getToken } from "@/utils/auth";
let userStore = null;
// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 请求路径
  // withCredentials: true, // 当跨域请求时发送cookie
  timeout: 18000000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 请求发送前 处理
    if (userStore === null) {
      userStore = useUserStore();
    }
    if (userStore.token || getToken()) {
      // 请求携带token
      config.headers["token"] = getToken();
    }
    if (config["responseType"] === "blob") {
      config["timeout"] = 0;
    }
    return config;
  },
  (error) => {
    // 请求出错
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  /**
   * 如果要获取http头部信息或者状态信息
   * Please return  response => response
   */

  /**
   * 通过HTTP状态码来判断请求状态
   */
  async (response) => {
    const res = response;
    let data = res.data;
    console.log("--res", res);
    console.log("--data", data);
    // 如果请求响应码不为200，请求出错
    if (res.status !== 200) {
      ElMessage.error({
        message: data.message || "request occur Error",
        duration: 5 * 1000,
      });

      // 具体错误响应码具体处理，现暂处理500错误
      if (res.status === 500) {
        // to re-login
        // ElMessageBox.confirm('服务器请求异常，您可以点击取消以停留在此页面，或重新登录', '服务器异常', {
        ElMessageBox.confirm(res.message, "服务器异常", {
          confirmButtonText: "重新登录",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          userStore.logout().then(() => {
            location.reload();
          });
        });
      }
      return Promise.reject(new Error(res.message || "Error"));
    } else {
      console.log("res.headers", res.headers);
      if (res.headers["content-type"].indexOf("application/json") == -1) {
        return res;
      }
      console.log(data instanceof Blob);
      if (data instanceof Blob) {
        const text = await data.text();
        data = JSON.parse(text);
        console.log("data", data);
      }
      if (data.code !== 200) {
        if (data.code === 401) {
          ElMessage.error({
            message:
              data.errors.length > 0
                ? data.errors[0]
                : data.message || "request occur Error",
            duration: 3 * 1000,
          });
          setTimeout(() => {
            userStore.logout().then(() => {
              location.reload();
            });
          }, 1000);
        } else if (data.code === 1001) {
          ElMessage.error({
            message: "参数错误",
            duration: 3 * 1000,
          });
        } else {
          ElMessage.error({
            message:
              data.errors.length > 0
                ? data.errors[0]
                : data.message || "request occur Error",
            duration: 3 * 1000,
          });
        }
        return data;
      } else {
        return data;
      }
    }
  },
  (error) => {
    console.log(error);
    ElMessage.error({ message: error.message, duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

export default service;
