import { createRouter, createWebHashHistory } from "vue-router";
import { ElMessage } from "element-plus";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useUserStore } from "@/store/user";
import getPageTitle from "@/utils/getPageTitle";
import { getToken, getStorageUser } from "@/utils/auth.js";
NProgress.configure({ showSpinner: false });

import Layout from "@/layout/index.vue";
const whiteList = ["/login"];

const routes = [
  {
    path: "/login",
    name: "Login",
    hidden: true,
    component: () => import("@/views/login.vue"),
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/home/index.vue"),
        meta: { title: "首页", icon: "dashboard" },
      },
    ],
  },
  {
    path: "/tools",
    component: Layout,
    meta: { title: "即用工具", icon: "tools" },
    children: [
      {
        path: "barcode",
        name: "Barcode",
        component: () => import("@/views/tools/barcode.vue"),
        meta: { title: "条形码生成", icon: "barcode" },
      },
      {
        path: "string",
        name: "String",
        component: () => import("@/views/tools/string.vue"),
        meta: { title: "字符串处理", icon: "strReplace" },
      },
      {
        path: "thumbUp",
        name: "ThumbUp",
        component: () => import("@/views/tools/thumbUp.vue"),
        meta: { title: "效果图上传", icon: "thumbUp" },
      },
      {
        path: "replace",
        name: "Replace",
        component: () => import("@/views/tools/replace.vue"),
        meta: { title: "文件名替换", icon: "rename" },
      },
      {
        path: "4px-backup",
        name: "Backup4px",
        component: () => import("@/views/tools/4pxBackup.vue"),
        meta: { title: "4PX面单备份", icon: "rename", isAdmin: true },
      },
    ],
  },
  // {
  //   path: "/feedback",
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: "",
  //       name: "Feedback",
  //       component: () => import("@/views/feedback/index.vue"),
  //       meta: { title: "意见反馈" },
  //     },
  //   ],
  // },
  // {
  //   path: "/feedback",
  //   component: Layout,
  //   children: [
  //     {
  //       path: "",
  //       name: "Feedback",
  //       component: () => import("@/views/feedback/index.vue"),
  //       meta: { title: "意见反馈", icon: "dashboard", idAdmin: true },
  //     },
  //   ],
  // },
  {
    path: "/404",
    component: () => import("@/views/404.vue"),
    hidden: true,
  },
  { path: "/:pathMatch(.*)*", redirect: "/404", hidden: true },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  NProgress.start();
  // 设置页面标题
  document.title = getPageTitle(to.meta.title);
  // 通过token判断用户是否登录
  const hasToken = getToken();
  if (hasToken) {
    if (to.path === "/login") {
      // 如果已登录，重定向到主页
      next({ path: "/" });
      NProgress.done();
    } else {
      // 判断用户是否已拉取完user_info信息
      const userInfo = getStorageUser();
      if (userInfo && userInfo.username) {
        next();
      } else {
        try {
          // 获取用户信息
          await userStore.getInfo();
          next();
        } catch (error) {
          // 删除token并重定向到登录页面
          userStore.logout();
          next(`/login?redirect=${to.path}`);
        }
      }
      NProgress.done();
    }
  } else {
    // 用户未登录
    if (whiteList.indexOf(to.path) !== -1) {
      // 白名单中的路由放过
      next();
    } else {
      // 重定向到登录页面
      next(`/login?redirect=${to.path}`);
    }
    NProgress.done();
  }
});

router.afterEach(() => {
  NProgress.done();
});

router.onError((error, to) => {
  NProgress.done();
  console.error(error);
  const errors = ["Failed to fetch dynamically imported module"];
  if (errors.some((e) => error.message.includes(e))) {
    console.log("to", to);
    window.location = to.fullPath;
  } else {
    ElMessage.error({
      message: error.message,
    });
  }
});

export function resetRouter() {
  //获取所有路由
  router.getRoutes().forEach((route) => {
    const { name } = route; //获取路由name
    if (name && !whiteList.includes(name)) {
      //路由不属于白名单,则删除
      router.hasRoute(name) && router.removeRoute(name);
    }
  });
}

export default router;
