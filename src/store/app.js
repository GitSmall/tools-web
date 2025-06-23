import { defineStore } from "pinia";
import Cookies from "js-cookie";

export const useAppStore = defineStore("app", {
  // 定义状态
  state: () => ({
    sidebar: {
      opened: Cookies.get("sidebarStatus")
        ? !!+Cookies.get("sidebarStatus")
        : true,
      withoutAnimation: false,
    },
  }),

  // 定义派生状态
  getters: {},

  // 定义修改状态的方法
  actions: {
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = false;
      if (this.sidebar.opened) {
        Cookies.set("sidebarStatus", 1);
      } else {
        Cookies.set("sidebarStatus", 0);
      }
    },
    closeSideBar(withoutAnimation) {
      Cookies.set("sidebarStatus", 0);
      this.sidebar.opened = false;
      this.sidebar.withoutAnimation = withoutAnimation;
    },
  },
});
