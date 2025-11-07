<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :router="true"
        :unique-opened="true"
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#fff"
        text-color="#333"
        active-text-color="#409EFF"
        :collapse-transition="false"
        mode="vertical"
      >
        <!--递归路由对象-->
        <sidebar-item
          v-for="item in routes"
          :key="item.path"
          :item="item"
          :base-path="item.path"
        />
      </el-menu>
    </el-scrollbar>
    <!-- <div class="btn-container">
      <el-button :icon="Edit" size="small" @click="router.push('/feedback')">{{
        isCollapse ? "" : "意见&建议"
      }}</el-button>
    </div> -->
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import sidebarItem from "./sidebarItem.vue";
import { useAppStore } from "@/store/app";

const appStore = useAppStore();
const route = useRoute();
const router = useRouter();

const routes = ref([]);

const sidebar = computed(() => appStore.sidebar);
const isCollapse = computed(() => {
  return !sidebar.value.opened;
});
const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});

onMounted(() => {
  const allRoutes = JSON.parse(JSON.stringify(router.options.routes));
  routes.value = allRoutes;
});
</script>
<style lang="scss" scoped>
.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
  text-align: left;
}
.btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  flex-shrink: 0;
  border-top: 1px solid #eee;
}
</style>
