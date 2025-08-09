import { defineStore } from "pinia";
import { signIn, userInfo } from "@/api/login";
import {
  getToken,
  getStorageUser,
  setStorageUser,
  setToken,
  removeToken,
  removeStorageUser,
} from "@/utils/auth.js";

export const useUserStore = defineStore("user", {
  // 定义状态
  state: () => ({
    token: getToken() || "",
    info: getStorageUser(),
  }),

  // 定义派生状态
  getters: {
    doubleCount: (state) => state.count * 2,
  },

  // 定义修改状态的方法
  actions: {
    login(userData) {
      const { login, password } = userData;
      return new Promise((resolve, reject) => {
        signIn({ login: login.trim(), password: password })
          .then((res) => {
            console.log("res", res);
            if (res.code !== 200) {
              resolve(false);
              return;
            }
            const { data } = res;
            this.token = data.token;
            setToken(data.token);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // get user info
    getInfo() {
      return new Promise((resolve, reject) => {
        console.log("获取信息", userInfo);
        userInfo()
          .then((res) => {
            console.log("res", res);
            const { user } = res.data;
            if (!user) {
              reject("验证失败，请重新登陆");
            }
            this.info = user;
            setStorageUser(user);
            resolve(user);
          })
          .catch((error) => {
            console.log("error", error);
            reject(error);
          })
          .finally(() => {
            console.log("finally");
          });
      });
    },

    // user logout
    logout() {
      return new Promise((resolve, reject) => {
        this.token = "";
        this.info = {};
        removeToken();
        removeStorageUser();
        resolve(true);
      });
    },
  },
});
