<template>
  <div class="navbar">
    <p :class="['title', { close: !sidebar.opened }]">
      <span>Tool Scripts</span>
      <img src="/logo.svg" alt="" />
    </p>

    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggle-click="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <ScreenFull id="screenfull" class="right-menu-item hover-effect" />
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img src="@/assets/avatar.png" class="user-avatar" />
          <i class="el-icon-caret-bottom" />
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <router-link to="/">
              <el-dropdown-item>首页</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided>
              <span style="display: block" @click="logout">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="user-name">欢迎登录, {{ name || "游客" }}!</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";
import Breadcrumb from "@/components/Breadcrumb/index.vue";
import Hamburger from "@/components/Hamburger/index.vue";
import ScreenFull from "@/components/Screenfull/index.vue";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const userStore = useUserStore();

const sidebar = computed(() => appStore.sidebar);
const name = computed(() => userStore.info.nickname || userStore.info.username);
const toggleSideBar = () => {
  appStore.toggleSidebar();
};
const logout = async () => {
  await userStore.logout();
  router.push(`/login?redirect=${route.fullPath}`);
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .title {
    float: left;
    position: relative;
    width: 240px;
    line-height: 50px;
    font-size: 16px;
    font-weight: Bold;
    color: #000;
    position: relative;
    cursor: pointer;
    img {
      display: none;
    }
    &:hover {
      opacity: 0.5;
    }
    &.close {
      width: 60px;
      span {
        display: none;
      }
      img {
        display: inline-block;
        width: 20px;
      }
    }
  }

  @keyframes shine {
    0% {
      background-position: 50% 0;
    }
    100% {
      background-position: -190% 0;
    }
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }

  .user-name {
    float: right;
    margin-right: 40px;
    line-height: 50px;
    font-size: 14px;
  }
}
</style>
