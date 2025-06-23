import Cookies from "js-cookie";

const TokenKey = "tools_token";
const userKey = "tools_user";

export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token) {
  return Cookies.set(TokenKey, token);
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}

export function getStorageUser() {
  return Cookies.get(userKey) ? JSON.parse(Cookies.get(userKey)) : {};
}

export function setStorageUser(userInfo) {
  return Cookies.set(userKey, JSON.stringify(userInfo));
}

export function removeStorageUser() {
  return Cookies.remove(userKey);
}

export function getTheSame(arr1, arr2) {
  // 判断用户权限是否包含路由权限
  if (!arr2 || !arr1) {
    return false;
  }
  const str = arr1.toString();
  for (let i = 0; i < arr2.length; i++) {
    if (str.indexOf(arr2[i].toString()) > -1) {
      for (let j = 0; j < arr1.length; j++) {
        if (arr2[i] === arr1[j]) {
          return true;
        }
      }
    }
  }
  return false;
}
