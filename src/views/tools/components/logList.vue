<template>
  <el-dialog
    v-model="visible"
    title="上传记录"
    width="700"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      max-height="400px"
      class="min-h-[100px] mb-[16px]"
    >
      <el-table-column prop="url" label="文件链接" />
      <el-table-column prop="createdAt" label="创建时间" width="170" />
    </el-table>
    <Pagination
      :isFixed="false"
      v-model:page="currentPage"
      v-model:limit="pageSize"
      :total="total"
      @pagination="getLog()"
    />
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import { logPage } from "@/api/tools";
import Pagination from "@/components/Pagination/index.vue";

const visible = ref(false);
const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const init = () => {
  visible.value = true;
  getLog();
};
const getLog = () => {
  loading.value = true;
  logPage({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
  })
    .then((res) => {
      tableData.value = res.data.logs;
      total.value = res.data.pagination.total;
    })
    .finally(() => {
      loading.value = false;
    });
};

const closeDialog = () => {
  visible.value = false;
  loading.value = false;
  tableData.value = [];
  total.value = 0;
  currentPage.value = 1;
  pageSize.value = 10;
};
defineExpose({
  init,
});
</script>
