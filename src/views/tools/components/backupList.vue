<template>
  <el-dialog
    v-model="visible"
    title="查询备份记录"
    width="1200"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <div class="flex">
      <el-input
        placeholder="包裹号、运单号批量查询。中间以空格隔开"
        v-model="searchParams.value"
        clearable
        class="input-with-select"
      >
        <template #prepend>
          <el-select v-model="searchParams.label" placeholder="请选择">
            <el-option label="包裹号" value="parcelNos"></el-option>
            <el-option label="运单号" value="waybillNos"></el-option>
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="getLog"></el-button>
        </template>
      </el-input>
    </div>
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      height="450px"
      class="min-h-[100px] my-[16px]"
    >
      <el-table-column prop="parcelNo" label="包裹号" width="340" />
      <el-table-column prop="waybillNo" label="运单号" width="230" />
      <el-table-column label="PDF链接(点击链接预览)">
        <template #default="{ row }">
          <el-link @click="preview(row.url)">{{ row.url }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="备份时间" width="170" />
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
import { ref, reactive } from "vue";
import { Search, Link } from "@element-plus/icons-vue";
import { backup4pxParcelPage } from "@/api/tools";
import Pagination from "@/components/Pagination/index.vue";

const visible = ref(false);
const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchParams = reactive({
  label: "parcelNos",
  value: "",
});

const init = () => {
  visible.value = true;
  getLog();
};
const getLog = () => {
  loading.value = true;
  const { label, value } = searchParams;
  const params = {
    currentPage: currentPage.value,
    pageSize: pageSize.value,
  };
  if (label && value.trim()) {
    params[label] = value.trim().split(/\s+/);
  }
  backup4pxParcelPage(params)
    .then((res) => {
      tableData.value = res.data.logs;
      total.value = res.data.pagination.total;
    })
    .finally(() => {
      loading.value = false;
    });
};

const preview = (url) => {
  window.open("https://ljx-img1.oss-cn-hongkong.aliyuncs.com/" + url);
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

<style scoped lang="scss">
:deep(.input-with-select) {
  width: 600px;
  .el-input-group__prepend {
    padding-right: 0;
    background-color: #fff;
  }
  .el-select {
    width: 100px;
    margin-right: 0;
    .el-input {
      width: 100px;
    }
  }
  .el-input-group__append {
    padding: 0;
    button {
      margin: 0;
    }
  }
}
</style>
