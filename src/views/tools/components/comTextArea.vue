<template>
  <div class="flex flex-col gap-[6px] w-full items-end">
    <div class="flex gap-[15px]">
      <el-tag
        v-for="(item, index) in props.variableList"
        :key="index"
        class="cursor-pointer"
        @click="insertVariable(item.value)"
        >{{ item.label }}</el-tag
      >
      <el-dropdown v-if="ruleList.length" @command="handleCommand">
        <span
          class="el-dropdown-link text-12px flex items-center cursor-pointer"
        >
          选择
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in props.ruleList"
              :key="item"
              :command="item"
            >
              {{ item }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div
      ref="editorRef"
      class="content w-full"
      contenteditable
      @input="handleInput"
      @paste="handlePaste"
      @blur="saveSelection"
    ></div>
    <p class="counter flex justify-between w-full">
      <span>在上方输入，例：Pro-${sentence}</span>
      <span>{{ currentCharCount }}/{{ maxChars }}</span>
    </p>
    <!-- <el-popover
      popper-class="variable-select-popper"
      :width="200"
      trigger="hover"
    >
      <template #default>
        <el-select
          :teleported="false"
          filterable
          placeholder="输入变量名筛选"
          :suffix-icon="Search"
          @change="insertVariable"
        >
          <el-option
            v-for="(item, index) in props.variableList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
      <template #reference>
        <el-button size="small" type="primary" @click="saveCaretPosition"
          >插入变量</el-button
        >
      </template>
    </el-popover> -->
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  variableList: {
    type: Array,
    default: () => [],
  },
  maxChars: {
    type: Number,
    default: 200,
  },
  ruleList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);
const editorRef = ref();
const currentCharCount = ref(0);
// 保存最后一次有效选区
let lastSelection = undefined;

/**
 * @description: 创建变量元素
 * @param {*} varName 变量名
 * @return {*} 创建的span元素
 */
const createVarElement = (varName, useVar = true) => {
  const span = document.createElement("span");
  span.className = "variable";
  span.contentEditable = "false"; // 不可编辑
  span.dataset.var = varName;
  span.textContent = useVar ? `\${${varName}}` : varName;
  return span;
};

const handleCommand = (command) => {
  editorRef.value.innerHTML = "";
  insertVariable(command, false);
};
/**
 * 保存当前光标位置（专为插入变量按钮点击设计）
 */
const saveCaretPosition = () => {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  // 保存有效选区
  lastSelection = selection.getRangeAt(0).cloneRange();
  editorRef.value?.focus();
};

/**
 * 常规光标位置保存（用于blur事件）
 */
const saveSelection = () => {
  const selection = window.getSelection();
  if (selection?.rangeCount) {
    const range = selection.getRangeAt(0);
    if (editorRef.value?.contains(range.commonAncestorContainer)) {
      lastSelection = range.cloneRange();
    }
  }
};

/**
 * @description: 插入变量
 * @param {*} varName 变量名
 * @return {*} 无
 */
const insertVariable = (varName, useVar = true) => {
  if (!varName) return;

  // 恢复选区前先确保编辑器聚焦
  editorRef.value?.focus();
  const selection = window.getSelection();

  // 恢复选区逻辑优化
  if (
    lastSelection &&
    editorRef.value?.contains(lastSelection.startContainer)
  ) {
    selection.removeAllRanges();
    selection.addRange(lastSelection);
  }

  // 插入变量元素
  const varElement = createVarElement(varName, useVar);
  const range = selection.getRangeAt(0);
  range.insertNode(varElement);

  // // 定位到变量后方
  requestAnimationFrame(() => {
    const newRange = document.createRange();
    newRange.setStartAfter(varElement);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    saveSelection(); // 保存新的光标位置
  });

  updateCharCount();
  emitUpdate();
};

// 更新字符统计
const updateCharCount = () => {
  const text = editorRef.value?.textContent || "";
  currentCharCount.value = text.length;
};
// 发送更新事件
const emitUpdate = () => {
  const content = editorRef.value?.textContent?.replace(/\n/g, "") || "";
  emit("update:modelValue", content);
};

// 处理输入事件
const handleInput = () => {
  updateCharCount();
  emitUpdate();
};

const handlePaste = (event) => {
  // 阻止默认行为，即不允许粘贴任何格式的内容
  event.preventDefault();
  // 获取剪贴板数据
  const text = event.clipboardData?.getData("text/plain") || "";
  // 使用document.execCommand('insertText', false, text)插入纯文本
  document.execCommand("insertText", false, text);
};

/**
 * 初始化内容时转换变量标签
 * @param value 原始文本
 * @returns 转换后的HTML字符串
 */
const initHtml = (value) => {
  return value.replace(/\$\{(\w+)\}/g, (_, varName) => {
    return createVarElement(varName).outerHTML;
  });
};

onMounted(() => {
  editorRef.value.innerHTML = initHtml(props.modelValue);
  updateCharCount();
});

watch(
  () => props.modelValue,
  (newVal) => {
    const parsedHTML = initHtml(newVal);
    if (parsedHTML !== editorRef.value?.innerHTML) {
      editorRef.value.innerHTML = parsedHTML;
      updateCharCount();
    }
  }
);
</script>

<style lang="scss" scoped>
.content {
  min-height: 100px;
  border: 1px solid #ddd;
  padding: 8px;
  line-height: 1rem;
  position: relative;
  word-wrap: break-word;
  overflow-y: auto;
  border-radius: 0.25rem;
  resize: both;

  &:focus {
    border: 1px solid #409eff;
  }
}

.counter {
  color: #999;
  font-size: 12px;
}

:deep(.variable) {
  background-color: #f0f2f5;
  border-radius: 3px;
  padding: 0 4px;
  margin: 0 2px 4px;
  color: #409eff;
  display: inline-block;
}
</style>
