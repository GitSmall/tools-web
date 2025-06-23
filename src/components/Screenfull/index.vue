<template>
  <div>
    <svg-icon
      :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'"
      @click="click"
    />
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import screenfull from "screenfull";
import { ref, onMounted, onBeforeUnmount } from "vue";
const isFullscreen = ref(false);
onMounted(() => {
  init();
});
onBeforeUnmount(() => {
  destroy();
});
const click = () => {
  if (!screenfull.enabled) {
    ElMessage.warning("you browser can not work");
    return false;
  }
  screenfull.toggle();
};
const change = () => {
  isFullscreen.value = screenfull.isFullscreen;
};
const init = () => {
  if (screenfull.enabled) {
    screenfull.on("change", change);
  }
};
const destroy = () => {
  if (screenfull.enabled) {
    screenfull.off("change", change);
  }
};
</script>

<style scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #5a5e66;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
}
</style>
