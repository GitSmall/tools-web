<template>
  <div>
    <el-card>
      <el-button type="primary" @click="createPlan">创建称重计划</el-button>
    </el-card>
    <el-card style="margin-top: 10px">
      <el-table :data="tableData" border class="mb-[20px]">
        <el-table-column label="主单号">
          <template #default="{ row }">
            <el-link type="primary" @click="viewPlan(row)">{{
              row.name
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="airDate" width="120" label="航班日期" />
        <el-table-column prop="boxCount" width="110" label="货箱数量" />
        <el-table-column prop="totalWeight" width="110" label="总重量KG" />
        <el-table-column prop="totalVolume" width="110" label="总体积CBM" />
        <el-table-column prop="createdAt" width="170" label="创建时间" />
        <el-table-column prop="updatedAt" width="170" label="更新时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              plain
              size="small"
              @click="createPlan(row)"
              >编辑</el-button
            >
            <el-button
              type="primary"
              plain
              size="small"
              @click="viewPlan(row, 'join')"
              >加入货箱</el-button
            >
            <div class="mt-10px">
              <el-button
                type="primary"
                plain
                size="small"
                @click="viewPlan(row, 'view')"
                >查看</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="downloadFile(row.id, row.boxCount)"
                >下载</el-button
              >
              <el-button
                type="danger"
                plain
                size="small"
                @click="deletePlan(row.id)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        :isFixed="false"
        v-model:page="currentPage"
        v-model:limit="pageSize"
        :total="total"
        @pagination="init()"
      />
    </el-card>

    <CreatePlan ref="createPlanRef" :fatherInit="init"></CreatePlan>
    <ReadPlan ref="readPlanRef" :fatherInit="init"></ReadPlan>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  weighingPlanPage,
  weighingPlanDown,
  weighingPlanDelete,
} from "@/api/tools";
import Pagination from "@/components/Pagination/index.vue";
import { downloadByBlob } from "@/utils/download";
import CreatePlan from "./components/createPlan.vue";
import ReadPlan from "./components/readPlan.vue";

const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const createPlanRef = ref(null);
const readPlanRef = ref(null);

const init = () => {
  weighingPlanPage({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
  }).then((res) => {
    console.log(res);
    tableData.value = res.data.data;
    total.value = res.data.pagination.total;
  });
};

init();

const createPlan = (row) => {
  createPlanRef.value.init(row);
};

const viewPlan = (row, type) => {
  console.log(row);
  readPlanRef.value.init(row, type);
};

const downloadFile = (id, count) => {
  if (count == 0) return ElMessage.warning("货箱数量为0，没有可下载的文件");
  weighingPlanDown(id).then((res) => {
    downloadByBlob(res, true);
  });
};

const deletePlan = (id) => {
  ElMessageBox.confirm("确认删除该称重计划?", "提示", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        // 确定是confirm 取消是cancel X号是close
        instance.confirmButtonLoading = true; // 给确定按钮加loading
        const res = await weighingPlanDelete(id);
        if (res.code == 200) {
          ElMessage.success(res.message);
          init();
        }
        instance.confirmButtonLoading = false;
        done();
      } else {
        done();
      }
    },
  });
};
</script>
<style scoped lang=""></style>
