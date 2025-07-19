<template>
  <div>
    <el-form
      :model="ruleForm"
      ref="formRef"
      :rules="rules"
      label-width="160px"
      style="width: 600px"
    >
      <el-form-item>
        <template #label>
          <span>附件</span>
          <el-popover placement="right" :width="500">
            <template #reference>
              <i-ep-questionFilled class="mt-[7px]"></i-ep-questionFilled>
            </template>
            <p class="pb-[10px]">
              Zip文件中需仅包含一个XLSX表格文件及多个PDF文件。如下图所示：
            </p>
            <img src="../../assets/example-replace.png" class="w-[500px]" />
          </el-popover>
        </template>
        <el-upload
          ref="uploadRef"
          drag
          action="#"
          class="w-full"
          :auto-upload="false"
          :show-file-list="false"
          accept=".zip"
          @change="fileChange"
        >
          <div class="el-upload__text">
            <i-ep-upload class="m-auto mb-2" />
            <p>仅允许ZIP文件，可点击或拖拽上传</p>
            <p class="text-[#409EFF]">
              {{ ruleForm.file ? ruleForm.file.name : "" }}
            </p>
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="PDF名称当前列" prop="sourceColumn">
        <el-row class="w-full">
          <el-col :span="16">
            <el-input
              v-model="ruleForm.sourceColumn"
              placeholder="请输入PDF名称当前列"
            ></el-input>
          </el-col>
          <el-col :span="6">
            <el-popover placement="right" :width="400">
              <template #reference>
                <i-ep-questionFilled
                  class="mt-[7px] ml-[10px]"
                ></i-ep-questionFilled>
              </template>
              <p class="pb-[10px]">
                Excel中条形码数据列的标题名称。例如下图中的<b>Tracking</b>
              </p>
              <img src="../../assets/example.png" class="w-[400px]" />
            </el-popover>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="PDF名称目标列" prop="targetColumn">
        <el-row class="w-full">
          <el-col :span="16">
            <el-input
              v-model="ruleForm.targetColumn"
              placeholder="请输入PDF名称目标列"
            ></el-input>
          </el-col>
          <el-col :span="6">
            <el-popover placement="right" :width="400">
              <template #reference>
                <i-ep-questionFilled
                  class="mt-[7px] ml-[10px]"
                ></i-ep-questionFilled>
              </template>
              <p class="pb-[10px]">
                Excel中条形码数据列的标题名称。例如下图中的<b>Tracking</b>
              </p>
              <img src="../../assets/example.png" class="w-[400px]" />
            </el-popover>
          </el-col>
        </el-row>
      </el-form-item>
      <div style="text-align: center">
        <el-button type="primary" :loading="loading" @click="quickReplace"
          >立即替换</el-button
        >
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { replacePdf } from "@/api/tools";
import { downloadByBlob } from "@/utils/download";
const ruleForm = reactive({
  file: null,
  sourceColumn: "运单号",
  targetColumn: "客户单号/入库单号",
});
const rules = reactive({
  sourceColumn: [
    {
      required: true,
      message: "请输入数据列名称",
      trigger: "blur",
    },
  ],
  targetColumn: [
    {
      required: true,
      message: "请输入数据列名称",
      trigger: "blur",
    },
  ],
});
const loading = ref(false);
const formRef = ref(null);
const uploadRef = ref();
const fileChange = (file) => {
  ruleForm.file = file.raw;
};
const quickReplace = async () => {
  const valid = await formRef.value.validate();
  if (!valid) {
    return;
  }
  console.log("---");
  const { file, sourceColumn, targetColumn } = ruleForm;
  if (!file) {
    return ElMessage.warning("请上传文件");
  }
  const params = new FormData();
  params.append("file", file, encodeURIComponent(file.name));
  params.append("sourceColumn", sourceColumn);
  params.append("targetColumn", targetColumn);
  loading.value = true;
  replacePdf(params)
    .then((res) => {
      console.log(res);
      if (res.status == 200 && res.data) {
        downloadByBlob(res, true);
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
<style scoped lang=""></style>
