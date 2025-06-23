<template>
  <div
    :class="{ hidden: total == 0, isFixed: isFixed }"
    class="pagination-container"
  >
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { scrollTo } from "@/utils/scroll-to";
const props = defineProps({
  isFixed: {
    type: Boolean,
    default: true,
  },
  total: {
    required: true,
    type: Number,
  },
  page: {
    type: Number,
    default: 1,
  },
  limit: {
    type: Number,
    default: 30,
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 30, 50, 100];
    },
  },
  layout: {
    type: String,
    default: "total, sizes, prev, pager, next, jumper",
  },
  background: {
    type: Boolean,
    default: true,
  },
  autoScroll: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["pagination", "update:page", "update:limit"]);
const currentPage = computed({
  get() {
    return props.page;
  },
  set(val) {
    emit("update:page", val);
  },
});
const pageSize = computed({
  get() {
    return props.limit;
  },
  set(val) {
    emit("update:limit", val);
  },
});

const handleSizeChange = (val) => {
  emit("pagination", { page: currentPage.value, limit: val });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
};
const handleCurrentChange = (val) => {
  emit("pagination", { page: val, limit: pageSize.value });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
};
</script>

<style scoped>
.pagination-container.isFixed {
  position: fixed;
  z-index: 3;
  bottom: 0px;
  background: #fff;
  padding: 5px 20px 5px 0;
}
.pagination-container.hidden {
  display: none;
}
</style>
