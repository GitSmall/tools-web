<template>
  <el-dialog
    v-model="visible"
    :title="formData.id ? '编辑称重计划' : '创建称重计划'"
    width="600"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <!-- 输入航空主单号 -->
    <el-form :model="formData" label-position="left" label-width="100px">
      <el-form-item label="航空主单号">
        <el-input
          v-model="formData.name"
          placeholder="请输入航空主单号, 可以随便填写，后续可以更改"
        ></el-input>
      </el-form-item>
      <el-form-item label="航班日期">
        <el-date-picker
          v-model="formData.airDate"
          type="date"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          placeholder="选择日期"
        >
        </el-date-picker>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleCreate">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { weighingPlanCreate, weighingPlanEdit } from "@/api/tools";

const props = defineProps({
  fatherInit: {
    type: Function,
    default: () => {},
  },
});

const visible = ref(false);

const formData = ref({
  name: "",
  airDate: "",
});
const loading = ref(false);

const init = (row) => {
  console.log("====");
  visible.value = true;
  if (row) {
    const { name, airDate, id } = row;
    formData.value = {
      name,
      airDate,
      id,
    };
  }
};

const closeDialog = () => {
  visible.value = false;
  formData.value = {
    name: "",
    airDate: "",
  };
};

const handleCreate = async () => {
  const { name, airDate } = formData.value;
  if (!name.trim() || !airDate) {
    return ElMessage.warning("请输入航空主单号与航班日期");
  }
  loading.value = true;
  const params = { name: name.trim(), airDate };
  const httpUrl = formData.value.id ? weighingPlanEdit : weighingPlanCreate;
  if (formData.value.id) {
    params.id = formData.value.id;
  }
  httpUrl(params)
    .then((res) => {
      if (res.code == 200) {
        ElMessage.success("成功");
        props.fatherInit();
        closeDialog();
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

defineExpose({
  init,
});
</script>
<style scoped lang=""></style>
