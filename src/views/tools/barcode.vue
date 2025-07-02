<template>
  <div>
    <el-form
      :model="ruleForm"
      ref="formRef"
      :rules="rules"
      label-width="100px"
      style="width: 600px"
    >
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="ruleForm.type">
          <el-radio :value="1" border>Excel</el-radio>
          <el-radio :value="2" border>文本</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="ruleForm.type == 1" label="附件">
        <el-upload
          ref="uploadRef"
          drag
          action="#"
          class="w-full"
          :auto-upload="false"
          :show-file-list="false"
          accept=".xlsx,.xls"
          @change="fileChange"
        >
          <div class="el-upload__text">
            <i-ep-upload class="m-auto mb-2" />
            <p>可点击或拖拽上传</p>
            <p class="text-[#409EFF]">
              {{ ruleForm.file ? ruleForm.file.name : "" }}
            </p>
          </div>
        </el-upload>
      </el-form-item>
      <template v-if="ruleForm.type == 1">
        <el-form-item label="数据列名称" prop="name">
          <el-row class="w-full">
            <el-col :span="16">
              <el-input
                v-model="ruleForm.name"
                placeholder="请输入数据列名称"
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
        <el-form-item label="单PDF容量" prop="chunkSize">
          <el-row class="w-full">
            <el-col :span="8">
              <el-input
                v-model="ruleForm.chunkSize"
                placeholder="请输入单个PDF容量"
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
                  单PDF容量默认为500，假如Excel文件中的数据量大于500(或设定值),
                  将会输出多个PDF文件
                </p>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
      </template>
      <el-form-item v-if="ruleForm.type == 2" label="条码内容" prop="text">
        <el-input
          v-model="ruleForm.text"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 12 }"
          placeholder="请输入内容。空格或回车隔开"
        ></el-input>
      </el-form-item>
      <div style="text-align: center">
        <el-button type="primary" :loading="loading" @click="quickCreate"
          >立即生成</el-button
        >
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { createByExcel, createByText } from "@/api/tools";
import { downloadByBlob } from "@/utils/download";
const ruleForm = reactive({
  type: 1,
  file: null,
  name: "Tracking",
  chunkSize: 500,
  width: 2, // 条码线条宽度，增加清晰度
  height: 100, // 条码高度
  margin: 20, // 边距
  fontSize: 20,
  textMargin: 10,
});
const rules = reactive({
  name: [
    {
      required: true,
      message: "请输入数据列名称",
      trigger: "blur",
    },
  ],
  text: [
    {
      required: true,
      message: "请输入条码内容",
      trigger: "blur",
    },
  ],
  chunkSize: [
    { required: true, message: "请输入整数" },
    { type: "number", message: "单PDF容量必须是整数" },
  ],
});
const loading = ref(false);
const formRef = ref(null);
const uploadRef = ref();
const fileChange = (file) => {
  ruleForm.file = file.raw;
};
const quickCreate = async () => {
  const valid = await formRef.value.validate();
  if (!valid) {
    return;
  }
  console.log("---");
  const { type, file, name, text, chunkSize } = ruleForm;
  if (type == 1) {
    if (!file) {
      return ElMessage.warning("请上传文件");
    }
    const params = new FormData();
    params.append("file", file);
    params.append("name", name);
    params.append("chunkSize", chunkSize || 500);
    loading.value = true;
    createByExcel(params)
      .then((res) => {
        console.log(res);
        if (res.status == 200 && res.data) {
          downloadByBlob(res);
        }
      })
      .finally(() => {
        loading.value = false;
      });
  } else if (type == 2) {
    console.log(text);
    loading.value = true;
    createByText({ text })
      .then((res) => {
        console.log(res);
        if (res.status == 200 && res.data) {
          downloadByBlob(res);
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }
};
</script>
<style scoped lang=""></style>
