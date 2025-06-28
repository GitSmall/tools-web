<template>
  <el-dialog
    v-model="visible"
    title="密钥生成记录"
    width="800"
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
      <el-table-column label="密钥">
        <template #default="{ row }">
          {{ row.key }}
          <Copy v-if="!row.status" :textToCopy="row.key" />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'info' : 'primary'">{{
            row.status ? "已使用" : "未使用"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column prop="updatedAt" label="使用时间" width="170" />
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
import { secretThumbPage } from "@/api/tools";
import Pagination from "@/components/Pagination/index.vue";
import Copy from "@/components/Copy/index.vue";

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
  secretThumbPage({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
  })
    .then((res) => {
      tableData.value = res.data.data;
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
