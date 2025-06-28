<template>
  <div :class="classObj" class="app-wrapper">
    <Navbar />
    <div class="main-container">
      <Sidebar class="sidebar-container" />
      <div class="rt-main">
        <AppMain />
        <Footer />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store/app.js";
import { AppMain, Navbar, Sidebar, Footer } from "./components/index";
const appStore = useAppStore();

const { sidebar } = storeToRefs(appStore);
const classObj = computed(() => {
  return {
    hideSidebar: !sidebar.value.opened,
    openSidebar: sidebar.value.opened,
    withoutAnimation: sidebar.value.withoutAnimation,
  };
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100vw;
  padding: 10px 20px;
  &:after {
    content: "";
    display: table;
    clear: both;
  }
  .main-container {
    display: flex;
    margin-top: 10px;
    height: calc(100vh - 50px - 30px);
    gap: 15px;
    .sidebar-container {
      width: 240px;
      height: 100%;
      flex-shrink: 0;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      overflow: hidden;
    }
    .rt-main {
      flex: 1;
    }
  }
  &.hideSidebar {
    .sidebar-container {
      width: 54px;
    }
  }
}
</style>
