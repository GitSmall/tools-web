<template>
  <el-dialog
    v-model="visible"
    title="称重计划详情"
    width="1000"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <div class="dialog-body" v-loading="loading">
      <el-descriptions :column="4" label-width="100px" border>
        <el-descriptions-item label="主单号">
          {{ detData.name }}
        </el-descriptions-item>
        <el-descriptions-item label="货箱数量">
          {{ detData.boxCount }}
        </el-descriptions-item>
        <el-descriptions-item label="总重量">
          {{ detData.totalWeight }} KG
        </el-descriptions-item>
        <el-descriptions-item label="总体积">
          {{ detData.totalVolume }} CBM
        </el-descriptions-item>
        <template v-if="type === 'view'">
          <el-descriptions-item label="创建时间" rowspan="2">
            {{ detData.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ detData.updatedAt }}
          </el-descriptions-item>
        </template>
      </el-descriptions>

      <!-- 扫描或输入箱号 -->
      <el-form
        v-if="type === 'join'"
        :model="formData"
        style="margin: 10px auto 0; width: 50%"
      >
        <el-form-item label="箱规" prop="size">
          <el-radio-group v-model="formData.size">
            <el-radio
              v-for="item in boxSizes"
              :key="item.value"
              :label="item.label"
              >{{ item.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="箱号" prop="boxNumber">
          <el-input
            ref="boxNumberRef"
            v-model="formData.boxNumber"
            placeholder="请扫描或输入箱号"
            @keydown.enter="joinBox()"
          ></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="weight">
          <el-input
            v-model="formData.weight"
            placeholder="请输入重量"
            @keydown.enter="joinBox()"
          ></el-input>
        </el-form-item>
      </el-form>

      <el-table
        :data="detData.boxes"
        border
        style="margin-top: 10px; max-height: 400px"
      >
        <el-table-column prop="boxNumber" label="箱号"></el-table-column>
        <el-table-column prop="weight" label="重量KG"></el-table-column>
        <el-table-column label="规格CM">
          <template #default="{ row }">
            {{ row.length }}*{{ row.width }}*{{ row.height }}
          </template>
        </el-table-column>
        <el-table-column label="体积CBM">
          <template #default="{ row }">
            {{ (row.length * row.width * row.height) / 1000000 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button
              type="primary"
              plain
              size="small"
              @click="deleteBox(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import {
  weighingPlanRead,
  weighingPlanAddBox,
  weighingPlanBoxDelete,
} from "@/api/tools";

const props = defineProps({
  fatherInit: Function,
});
const visible = ref(false);
const type = ref("view");
const detData = ref({
  boxes: [],
});
const formData = ref({
  size: "60*50*40",
  boxNo: "",
});
const loading = ref(false);
const boxNumberRef = ref(null);
const boxSizes = [
  {
    value: "50*40*35",
    label: "50*40*35",
  },
  {
    value: "60*50*40",
    label: "60*50*40",
  },
];

const init = ({ id }, typeParam) => {
  console.log("====", id);
  type.value = typeParam;
  visible.value = true;
  loading.value = true;
  if (typeParam === "join") {
    setTimeout(() => {
      boxNumberRef.value && boxNumberRef.value.focus();
    }, 100);
  }
  weighingPlanRead(id)
    .then((res) => {
      console.log("===", res);
      detData.value = res.data.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const joinBox = () => {
  const { size, boxNumber, weight } = formData.value;
  if (!boxNumber || !weight) {
    return ElMessage.warning("箱号和重量不能为空");
  }
  const box = {
    weighingPlanId: detData.value.id,
    boxNumber,
    weight,
    length: size.split("*")[0],
    width: size.split("*")[1],
    height: size.split("*")[2],
  };
  loading.value = true;
  weighingPlanAddBox(box)
    .then((res) => {
      if (res.code == 200) {
        ElMessage.success(res.message);
        console.log("===", res);
        const { boxes, boxCount, totalWeight, totalVolume } = res.data.data;
        detData.value.boxes = boxes;
        detData.value.boxCount = boxCount;
        detData.value.totalWeight = totalWeight;
        detData.value.totalVolume = totalVolume;
        formData.value.boxNumber = "";
        formData.value.weight = "";
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const deleteBox = (id) => {
  ElMessageBox.confirm("确认删除该货箱?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        // 确定是confirm 取消是cancel X号是close
        instance.confirmButtonLoading = true; // 给确定按钮加loading
        const res = await weighingPlanBoxDelete(id);
        if (res.code == 200) {
          ElMessage.success(res.message);
          console.log("===", res);
          const { boxes, boxCount, totalVolume, totalWeight } = res.data;
          detData.value.boxes = boxes;
          detData.value.boxCount = boxCount;
          detData.value.totalWeight = totalWeight;
          detData.value.totalVolume = totalVolume;
        }
        instance.confirmButtonLoading = false;
        done();
      } else {
        done();
      }
    },
  });
};

const closeDialog = () => {
  visible.value = false;
  detData.value = {
    boxes: [],
  };
  props.fatherInit();
};

defineExpose({
  init,
});
</script>
<style scoped lang=""></style>
