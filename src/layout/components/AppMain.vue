<template>
  <section class="app-main">
    <router-view />
  </section>
</template>

<script setup></script>

<style scoped>
.app-main {
  height: calc(100% - 45px);
  width: 100%;
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 20px;
  overflow-y: auto;
}
.fixed-header + .app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
