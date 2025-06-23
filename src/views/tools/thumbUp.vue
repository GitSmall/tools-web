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
          <!-- <el-icon class="el-icon--"><upload-filled /></el-icon> -->
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
      <el-button type="primary" :loading="loading" @click="startUpload"
        >{{ loading ? "正在上传" : "立即上传"
        }}{{ fileList.length ? `(数量: ${fileList.length})` : "" }}</el-button
      >
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
        <p v-else class="text-[13px]">
          正在上传，预计时间较长请勿关闭该页面...
        </p>
      </template>
    </el-card>

    <!-- 密钥列表 -->
    <PwdList ref="pwdListRef" />

    <!-- 上传记录列表 -->
    <LogList ref="logListRef" />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { ref, computed } from "vue";
import { thumbUpload, createSecretThumb, secretThumbPage } from "@/api/tools";
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

// 获取user.role, 判断是否是管理员
const isAdmin = computed(() => {
  return userStore.info.role == 100;
});

const fileChange = (file) => {
  if (
    fileList.value.find((it) => it.name === file.name && it.size === file.size)
  ) {
    return;
  } else {
    if (fileList.value.length < 6) {
      fileList.value.push(file);
    } else {
      ElMessage.warning("最多支持同时上传6个文件");
    }
  }
};
const deleteItem = (index) => {
  fileList.value.splice(index, 1);
};
const startUpload = () => {
  if (fileList.value.length == 0) {
    return ElMessage.warning("请选择zip文件");
  }
  ElMessageBox.prompt("请输入管理员提供的随机密钥", "验证", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /^[a-zA-Z0-9]+$/,
    inputErrorMessage: "格式错误",
  }).then(({ value }) => {
    const formData = new FormData();
    fileList.value.forEach((file) => formData.append("zipFiles", file.raw));
    formData.append("key", value);
    excelLink.value = "";
    tableData.value = [];
    loading.value = true;
    thumbUpload(formData)
      .then((res) => {
        console.log(res);
        if (res.code == 200) {
          fileList.value = [];
          const { excelUrl, results } = res.data.data;
          excelLink.value = excelUrl;
          tableData.value = results;
        }
      })
      .finally(() => {
        loading.value = false;
      });
  });
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
  secretThumbPage({
    status: 0,
  })
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
</style>
