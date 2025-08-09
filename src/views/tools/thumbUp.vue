<template>
  <div class="flex h-full gap-[20px]">
    <el-card class="flex-1 h-full">
      <template #header>
        <div class="card-header flex justify-between">
          <span>选择文件</span>
          <div>
            <el-button v-if="isAdmin" type="primary" link @click="showPwdList"
              >查看密钥生成记录</el-button
            >
            <el-button
              type="primary"
              :loading="createLoading"
              link
              @click="showUsablePwd"
              >查看可用密钥</el-button
            >
          </div>
        </div>
      </template>
      <div
        class="mb-[10px]"
        style="height: calc(100vh - 300px); overflow-y: auto"
      >
        <el-upload
          drag
          action="#"
          multiple
          accept=".zip"
          :auto-upload="false"
          :show-file-list="false"
          @change="fileChange"
        >
          <i-ep-uploadFilled
            class="el-icon el-icon--upload"
          ></i-ep-uploadFilled>
          <div class="el-upload__text">
            将zip文件拖到此处，或<em>点击上传</em>
          </div>
        </el-upload>
        <div class="fileList">
          <div class="item" v-for="(it, index) in fileList" :key="it.name">
            <span>{{ it.name }}</span>
            <i-ep-close @click="deleteItem(index)"></i-ep-close>
          </div>
        </div>
      </div>
      <el-button
        v-if="isAdmin"
        type="success"
        :loading="createLoading"
        @click="createPWD"
        >生成密钥</el-button
      >
      <el-button type="primary" :loading="loading" @click="startUpload">
        {{ loading ? "正在上传" : "立即上传"
        }}{{ fileList.length ? `(数量: ${fileList.length})` : "" }}
      </el-button>
    </el-card>
    <el-card class="flex-1 h-full">
      <template #header>
        <div class="card-header flex justify-between">
          <span>上传结果</span>
          <el-button type="primary" link @click="showLogs"
            >查看上传记录</el-button
          >
        </div>
      </template>
      <template v-if="excelLink">
        <p class="pb-10px text-left">
          <el-link :href="excelLink" target="_blank" type="primary"
            >文件链接, 点击下载</el-link
          >
        </p>
        <el-table
          :data="tableData"
          sum-text="合计"
          border
          show-summary
          style="width: 100%"
        >
          <el-table-column prop="originalName" label="文件名" />
          <el-table-column
            prop="foldersScanned"
            label="子文件夹数量"
            width="130"
          />
          <el-table-column prop="imagesUploaded" label="上传成功" width="90" />
          <el-table-column prop="imagesFailed" label="上传失败" width="90" />
        </el-table>
      </template>
      <template v-else>
        <el-empty
          v-if="!loading"
          :image-size="100"
          description="暂无上传结果，请选择文件并上传"
        />
        <div v-else class="text-[13px]">
          正在上传并处理，预计时间较长请勿关闭该页面...
          <div class="flex justify-center mt-[10px] gap-x-[60px]">
            <el-progress
              v-if="uploadProgress"
              type="dashboard"
              :percentage="
                (uploadProgress.uploadedChunks / uploadProgress.totalChunks) *
                100
              "
              :color="colors"
            >
              <template #default="{ percentage }">
                <span class="progress-value">{{ percentage.toFixed(1) }}%</span>
                <span class="progress-label">发送进度</span>
              </template>
            </el-progress>
            <el-progress
              type="dashboard"
              :percentage="percentage"
              :color="colors"
            >
              <template #default="{ percentage }">
                <span class="progress-value">{{ percentage.toFixed(1) }}%</span>
                <span class="progress-label">处理进度</span>
              </template>
            </el-progress>
          </div>
        </div>
      </template>
    </el-card>

    <PwdList ref="pwdListRef" />
    <LogList ref="logListRef" />
    <!--  -->
    <div v-if="env == 'production'" class="mask">
      图片上传暂不可用，请联系管理员使用本地部署版本
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { ref, computed } from "vue";
import {
  thumbUpload,
  createSecretThumb,
  secretThumbPage,
  thumbUploadTask,
  thumbUploadChunk,
} from "@/api/tools";
import { useUserStore } from "@/store/user";
import LogList from "./components/logList.vue";
import PwdList from "./components/pwdList.vue";

const userStore = useUserStore();

const fileList = ref([]);
const createLoading = ref(false);
const pwdListRef = ref(null);
const loading = ref(false);
const logListRef = ref(null);
const tableData = ref([]);
const excelLink = ref("");
const taskId = ref("");
const percentage = ref(0);
const uploadProgress = ref(null);
const env = import.meta.env.VITE_NODE_ENV;

const colors = [
  { color: "#e6a23c", percentage: 40 },
  { color: "#6f7ad3", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#5cb87a", percentage: 100 },
];

const isAdmin = computed(() => {
  return userStore.info.role == 100;
});

const fileChange = (file) => {
  if (
    fileList.value.find((it) => it.name === file.name && it.size === file.size)
  ) {
    return;
  } else {
    if (fileList.value.length < 4) {
      fileList.value.push(file);
    } else {
      ElMessage.warning("最多支持同时上传4个文件");
    }
  }
};

const uploadLargeFile = async (files, secretKey, taskId) => {
  const chunkSize = 200 * 1024 * 1024;
  const chunkTasks = [];

  files.forEach((file) => {
    const chunkCount = Math.ceil(file.size / chunkSize);
    chunkTasks.push({ file, chunkCount });
  });

  console.log(
    `开始分块上传: ${files.length} 个文件, 总分块数: ${uploadProgress.value.totalChunks}, taskId: ${taskId}`
  );

  const uploadPromises = [];
  for (const { file, chunkCount } of chunkTasks) {
    for (let i = 0; i < chunkCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.raw.slice(start, end);
      const formData = new FormData();
      formData.append("chunk", chunk, `${file.name}-chunk-${i}`);
      formData.append("taskId", taskId);
      formData.append("index", `${file.name}-${i}`);
      formData.append("totalChunks", uploadProgress.value.totalChunks);
      formData.append("originalName", file.name);
      formData.append("key", secretKey);

      console.log(`发送 FormData (文件: ${file.name}, 分块: ${i}):`);
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}: ${typeof value === "string" ? value : "[Binary]"}`
        );
      }

      // uploadPromises.push(
      try {
        const result = await thumbUploadChunk(formData);
        // .then((result) => {
        console.log(
          `分块 ${file.name}-${i + 1}/${chunkCount} 上传完成`,
          result
        );
        if (result.code === 200) {
          uploadProgress.value.uploadedChunks++;
        } else {
          throw new Error(result.message);
        }
        // })
        // .catch((err) =>
      } catch (err) {
        console.error(`分块 ${file.name}-${i + 1} 上传失败:`, err);
        throw err;
      }
      // })
      // );
    }
  }

  // await Promise.all(uploadPromises);
};

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const checkStatus = async (taskIdValue) => {
  const response = await thumbUploadTask(taskIdValue);
  try {
    const { status, results: dataRes, progress, error } = response.data;
    percentage.value = progress;
    if (status === "completed") {
      setTimeout(() => {
        loading.value = false;
        fileList.value = [];
        taskId.value = "";
        uploadProgress.value = null;
        const { excelUrl, results } = dataRes;
        excelLink.value = excelUrl;
        tableData.value = results;
      }, 1000);
    } else if (status === "failed") {
      console.error("上传失败:", error);
      ElMessage.error("上传失败: " + error);
      loading.value = false;
      fileList.value = [];
      taskId.value = "";
      uploadProgress.value = null;
    } else {
      setTimeout(() => checkStatus(taskIdValue), 5000);
    }
  } catch (error) {
    setTimeout(() => checkStatus(taskIdValue), 5000);
  }
};

const startUpload = () => {
  if (fileList.value.length === 0) {
    return ElMessage.warning("请选择zip文件");
  }
  ElMessageBox.prompt("请输入管理员提供的随机密钥", "验证", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /^[a-zA-Z0-9]+$/,
    inputErrorMessage: "格式错误",
  })
    .then(async ({ value }) => {
      excelLink.value = "";
      tableData.value = [];
      loading.value = true;
      percentage.value = 0;

      const taskIdStr = generateUUID();
      taskId.value = taskIdStr;

      const largeFiles = fileList.value;
      // .filter(
      //   (file) => file.size > 500 * 1024 * 1024
      // );
      const smallFiles = [];
      // fileList.value.filter(
      //   (file) => file.size <= 500 * 1024 * 1024
      // );

      // 初始化上传进度
      let totalChunks = 0;
      largeFiles.forEach((file) => {
        totalChunks += Math.ceil(file.size / (200 * 1024 * 1024));
      });
      if (smallFiles.length > 0) {
        totalChunks += 1; // 小文件作为一个整体上传
      }
      uploadProgress.value = { uploadedChunks: 0, totalChunks };

      try {
        // 处理小文件
        if (smallFiles.length > 0) {
          const formData = new FormData();
          smallFiles.forEach((file) => formData.append("zipFiles", file.raw));
          formData.append("key", value);
          formData.append("taskId", taskIdStr); // 传递 taskId
          const res = await thumbUpload(formData);
          console.log("小文件上传结果:", res);
          if (res.code === 200) {
            uploadProgress.value.uploadedChunks++;
          } else {
            throw new Error(res.message);
          }
        }

        // 处理大文件
        if (largeFiles.length > 0) {
          await uploadLargeFile(largeFiles, value, taskIdStr);
        }

        console.log("所有文件上传完成，开始轮询状态");
        await checkStatus(taskIdStr);
      } catch (err) {
        ElMessage.error("上传失败: " + err.message);
        loading.value = false;
        uploadProgress.value = null;
        taskId.value = "";
      }
    })
    .catch(() => {
      loading.value = false;
    });
};

const deleteItem = (index) => {
  fileList.value.splice(index, 1);
};

const showLogs = () => {
  logListRef.value.init();
};

const showPwdList = () => {
  pwdListRef.value.init();
};

const createPWD = () => {
  createLoading.value = true;
  createSecretThumb()
    .then((res) => {
      if (res.code == 200) {
        ElMessageBox.alert(res.data.data.key, "密钥创建成功", {
          confirmButtonText: "复制",
          beforeClose: async (action, instance, done) => {
            if (action === "confirm") {
              instance.confirmButtonLoading = true;
              try {
                await navigator.clipboard.writeText(res.data.data.key);
                ElMessage.success("复制成功！");
                done();
              } catch (err) {
                ElMessage.error("复制失败！请手动复制");
              }
              instance.confirmButtonLoading = false;
            } else {
              done();
            }
          },
        });
      }
    })
    .finally(() => {
      createLoading.value = false;
    });
};

const showUsablePwd = () => {
  createLoading.value = true;
  secretThumbPage({ status: 0 })
    .then((res) => {
      console.log(res);
      const { code, data } = res;
      if (code == 200) {
        ElMessageBox.alert(
          data.data.length == 0
            ? "暂无可用密钥，请联系管理员生成"
            : data.data[0].key,
          "可用密钥",
          {
            confirmButtonText: data.data.length == 0 ? "关闭" : "复制",
            beforeClose: async (action, instance, done) => {
              if (action === "confirm" && data.data.length > 0) {
                instance.confirmButtonLoading = true;
                try {
                  await navigator.clipboard.writeText(data.data[0].key);
                  ElMessage.success("复制成功！");
                  done();
                } catch (err) {
                  ElMessage.error("复制失败！请手动复制");
                }
                instance.confirmButtonLoading = false;
              } else {
                done();
              }
            },
          }
        );
      }
    })
    .finally(() => {
      createLoading.value = false;
    });
};
</script>

<style scoped lang="scss">
:deep(.el-upload-dragger) {
  padding: 20px 10px;
}
.fileList {
  border: 1px solid #ddd;
  margin-top: 10px;
  padding: 0 20px;
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px dashed #ddd;
    font-size: 13px;
    &:last-child {
      border-bottom: none;
    }
    svg {
      cursor: pointer;
      &:hover {
        color: red;
      }
    }
  }
}
.el-progress {
  :deep(.progress-value) {
    display: block;
    margin-top: 10px;
    font-size: 28px;
  }
  :deep(.progress-label) {
    display: block;
    margin-top: 10px;
    font-size: 12px;
  }
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 200;
  background-color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
}
</style>
