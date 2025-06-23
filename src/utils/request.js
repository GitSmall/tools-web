import axios from "axios";
import { ElMessageBox, ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";
import { getToken } from "@/utils/auth";
let userStore = null;
// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 请求路径
  // withCredentials: true, // 当跨域请求时发送cookie
  timeout: 300000, // 请求超时时间
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
  (response) => {
    const res = response;
    console.log("--", res);
    // 如果请求响应码不为200，请求出错
    if (res.status !== 200) {
      ElMessage.error({
        message: res.data.message || "request occur Error",
        duration: 5 * 1000,
      });

      // 具体错误响应码具体处理，现暂处理500错误
      if (res.code === 500) {
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
      if (res.headers["content-disposition"]) {
        return res;
      }
      if (res.data.code !== 200) {
        if (res.data.code === 1002 || res.data.code === 1010) {
          ElMessage.error({
            message: res.data.message || "服务器异常",
            duration: 3 * 1000,
          });
          setTimeout(() => {
            userStore.logout().then(() => {
              location.reload();
            });
          }, 1000);
        } else if (res.data.code === 1001) {
          ElMessage.error({
            message: "参数错误",
            duration: 3 * 1000,
          });
        } else {
          ElMessage.error({
            message:
              res.data.errors.length > 0
                ? res.data.errors[0]
                : res.data.message || "request occur Error",
            duration: 3 * 1000,
          });
        }
        return res.data;
      } else {
        return res.data;
      }
    }
  },
  (error) => {
    ElMessage.error({ message: error.message, duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

export default service;
