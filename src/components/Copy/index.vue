<template>
  <i-ep-copy-document @click="copyText"></i-ep-copy-document>
</template>

<script setup>
import { ElMessage } from "element-plus";

const props = defineProps({
  textToCopy: {
    type: String,
    required: true,
  },
});

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(props.textToCopy);
    ElMessage.success("复制成功！");
  } catch (err) {
    ElMessage.error("复制失败！");
  }
};
</script>

<style scoped lang="scss">
svg {
  display: inline-block;
  cursor: pointer;
  margin-left: 3px;
  &:hover {
    color: #409eff;
  }
}
</style>
