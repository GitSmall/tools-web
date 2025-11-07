<template>
  <div class="flex h-full gap-[10px]">
    <el-card class="flex-1 h-full">
      <template #header>
        <div class="card-header flex justify-between">
          <span>输入文本</span>
          <div class="stats">
            <p>字符数：{{ textarea.length }}</p>
            <p>行数：{{ lines }}</p>
          </div>
        </div>
      </template>
      <div
        class="input-area"
        style="height: calc(100vh - 300px); overflow-y: hidden"
      >
        <el-input
          class="input-textarea"
          v-model="textarea"
          @input="handleInput"
          @paste="handlePaste"
          type="textarea"
        ></el-input>
      </div>
    </el-card>
    <el-card class="center h-full" header="操作">
      <div
        class="flex flex-col gap-[20px] justify-center items-center"
        style="height: calc(100vh - 300px); overflow-y: auto"
      >
        <ComTextArea
          v-model="smsContent"
          :variableList="variableList"
          :ruleList="rules"
        ></ComTextArea>
        <div class="flex justify-center items-center gap-20px">
          <el-button
            v-if="smsContent"
            type="primary"
            plain
            :icon="DocumentAdd"
            @click="saveRule"
          ></el-button>
          <el-button type="primary" :icon="Switch" @click="startConvert"
            >开始转换</el-button
          >
        </div>
      </div>
    </el-card>
    <el-card class="flex-1 h-full">
      <template #header>
        <div class="card-header flex justify-between">
          <span>输出结果</span>
          <el-button v-if="res" link type="primary" @click="copy"
            >复制</el-button
          >
        </div>
      </template>
      <div style="height: calc(100vh - 300px); overflow-y: auto">
        <span v-if="!res" class="text-[#999] text-[13px]">暂无结果</span>
        <el-input
          v-else
          ref="inputRes"
          class="res-input"
          v-model="res"
          type="textarea"
        ></el-input>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Switch, DocumentAdd } from "@element-plus/icons-vue";
import ComTextArea from "./components/comTextArea.vue";
import { ElMessage } from "element-plus";
const textarea = ref("");
const smsContent = ref("");
const variableList = ref([
  { label: "每行", value: "sentence" },
  //   { label: "全部文本", value: "section" },
]);
const res = ref("");
const rules = ref([]);
rules.value = JSON.parse(localStorage.getItem("smsContent") || "[]");

const lines = computed(() => {
  if (textarea.value.trim()) {
    return textarea.value.split("\n").length;
  }
  return 0;
});

const handleInput = (value) => {
  // 将所有空格替换为换行符
  textarea.value = value.replace(/\s+/g, "\n");
};

// 专门处理粘贴事件（可选，确保粘贴时也能正确替换）
const handlePaste = (e) => {
  // 阻止默认粘贴行为
  // e.preventDefault();
  // // 获取剪贴板数据
  // const clipboardData = e.clipboardData || window.clipboardData;
  // const pastedText = clipboardData.getData("text/plain");
  // // 替换连续空格并赋值
  // textarea.value = textarea.value.replace(/\s+/g, "\n");
};

const copy = async () => {
  if (!res.value) {
    ElMessage.warning("请输入要复制的文本");
    return;
  }

  try {
    await navigator.clipboard.writeText(res.value);
    ElMessage.success("复制成功！");
  } catch (err) {
    ElMessage.error("复制失败，请手动复制");
    console.error("复制失败:", err);
  }
};

const saveRule = () => {
  const arr = JSON.parse(localStorage.getItem("smsContent") || "[]");
  if (arr.includes(smsContent.value)) {
    ElMessage.warning("该规则已存在");
    return;
  }
  arr.push(smsContent.value);
  localStorage.setItem("smsContent", JSON.stringify(arr));
  rules.value = arr;
  ElMessage.success("规则已保存");
};

const startConvert = () => {
  const allText = textarea.value.trim();
  if (!allText) {
    return ElMessage.warning("请输入有效文本");
  }
  const expression = smsContent.value;
  if (!expression) {
    return ElMessage.warning("请输入表达式");
  }
  if (!expression.includes("${sentence}")) {
    return ElMessage.warning("请插入变量");
  }
  console.log(allText);
  const arr = allText.split(/\s+/);
  console.log(arr);
  console.log(expression.includes("${sentence}"));
  let newArr = [];
  if (expression.includes("${sentence}")) {
    arr.forEach((it, index) => {
      console.log(expression.replace("${sentence}", it));
      newArr[index] = expression.replace("${sentence}", it);
    });
  }
  console.log(newArr);
  res.value = newArr.join("\n");
};
</script>
<style scoped lang="scss">
.stats {
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 20px;
  height: 30px;
  font-size: 13px;
}
.input-area {
  position: relative;
  .input-textarea {
    height: 100%;
    :deep(.el-textarea__inner) {
      height: 100%;
    }
  }
}
.res-input {
  height: 100%;
  :deep(.el-textarea__inner) {
    height: 100%;
  }
}
.center {
  width: 300px;
}
</style>
