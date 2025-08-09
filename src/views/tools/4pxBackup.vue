<template>
  <div class="flex h-full gap-[20px]">
    <el-card class="flex-1 h-full">
      <template #header>
        <div class="card-header flex justify-between">
          <span>查询包裹</span>
          <el-button type="primary" link @click="showList"
            >查询历史备份面单</el-button
          >
        </div>
      </template>
      <el-input v-model="token" placeholder="Token">
        <template #append>
          <el-button type="primary" :loading="tokenLoading" @click="getToken"
            >获取Token</el-button
          >
        </template>
      </el-input>
      <el-descriptions :column="4" border class="mt-[10px]">
        <el-descriptions-item label="总数">{{
          validRes.total
        }}</el-descriptions-item>
        <el-descriptions-item label="已备份">{{
          validRes.exist
        }}</el-descriptions-item>
        <el-descriptions-item label="没有单号">{{
          validRes.noWaybill
        }}</el-descriptions-item>
        <el-descriptions-item label="可备份" label-class-name="label-success">{{
          validRes.unExist
        }}</el-descriptions-item>
      </el-descriptions>

      <!-- v-if="validRes.parcels && validRes.parcels.length > 0" -->
      <el-table
        :data="validRes.parcels"
        class="mt-[10px]"
        style="height: calc(100vh - 400px)"
        border
      >
        <el-table-column prop="parcelNo" label="包裹号"></el-table-column>
        <el-table-column prop="waybillNo" label="面单号"></el-table-column>
      </el-table>

      <div class="flex justify-between items-center text-[13px] mt-[10px]">
        <el-button
          type="primary"
          :loading="searchLoading"
          @click="searchParcels"
          >查询可备份数据</el-button
        >
        <el-button
          v-if="validRes.unExist > 0"
          type="success"
          :loading="backupLoading"
          @click="startBackup"
          >开始备份</el-button
        >
      </div>
    </el-card>

    <el-card class="flex-1 h-full" header="备份结果">
      <div v-if="resultData">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="总数" label-class-name="label-primary">{{
            resultData.total
          }}</el-descriptions-item>
          <el-descriptions-item label="成功" label-class-name="label-success">{{
            resultData.success
          }}</el-descriptions-item>
          <el-descriptions-item label="失败" label-class-name="label-error">{{
            resultData.failed
          }}</el-descriptions-item>
        </el-descriptions>
        <el-table
          v-if="resultData.errors && resultData.errors.length > 0"
          :data="resultData.errors"
          class="mt-[20px]"
          border
        >
          <el-table-column prop="parcelNo" label="包裹号"></el-table-column>
          <el-table-column prop="waybillNo" label="面单号"></el-table-column>
          <el-table-column prop="error" label="错误信息"></el-table-column>
        </el-table>
      </div>
      <div
        v-else-if="backupLoading"
        v-loading="true"
        element-loading-text="正在备份，请稍后..."
        class="h-full py-[40px]"
      ></div>
      <el-empty v-else description="暂无备份结果"></el-empty>
    </el-card>

    <BackupList ref="backupListRef" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { useUserStore } from "@/store/user";
import { backup4pxParcel, backup4pxParcelValidate } from "@/api/tools";
import BackupList from "./components/backupList.vue";

const userStore = useUserStore();

const isAdmin = computed(() => {
  return userStore.info.role == 100;
});

const token = ref("");
if (localStorage.getItem("erpToken")) {
  token.value = localStorage.getItem("erpToken");
}
const tokenLoading = ref(false);
const getToken = async () => {
  if (!isAdmin.value)
    return ElMessage.warning({ message: "权限不足", duration: 5 * 1000 });
  const userId = "5330306864850944";
  tokenLoading.value = true;
  try {
    const adminRes = await axios.post(
      `https://api.shopmell.com/admin/passport/login`,
      {
        account: "admin",
        password: "QVOXXFVI",
      }
    );
    console.log(adminRes);
    if (adminRes.data.code != 200) {
      throw new Error(adminRes.data.message);
    }
    const adminToken = adminRes.data.data;
    console.log("adminToken", adminToken);
    const secretRes = await axios.post(
      `https://api.shopmell.com/admin/passport/secret/login/${userId}`,
      {
        headers: { "x-access-token": adminToken },
      }
    );
    console.log("secretRes", secretRes);
    const { nonceStr, signature } = secretRes.data.data;
    const loginRes = await axios.post(
      "https://api.shopmell.com/erp/dealer/passport/secret/login",
      {
        nonceStr,
        signature,
      }
    );
    console.log("loginRes", loginRes);
    token.value = loginRes.data.data;
    localStorage.setItem("erpToken", token.value);
  } catch (error) {
    console.log(error);
    ElMessage.error({ message: error.message, duration: 5 * 1000 });
  } finally {
    tokenLoading.value = false;
  }
};

const searchLoading = ref(false);
const validRes = ref({
  total: "",
  exist: 0,
  noWaybill: 0,
  unExist: 0,
  parcels: [],
});
const resultData = ref(null);
const searchParcels = async () => {
  if (!isAdmin.value)
    return ElMessage.warning({ message: "权限不足", duration: 5 * 1000 });
  if (!token.value) {
    return ElMessage.warning({ message: "请先获取token", duration: 5 * 1000 });
  }
  validRes.value = {
    total: "",
    exist: 0,
    noWaybill: 0,
    unExist: 0,
    parcels: [],
  };
  searchLoading.value = true;
  try {
    const res = await axios.post(
      "https://api.shopmell.com/erp/dealer/order/parcel/page",
      {
        trackingStatus: "ALL",
        timeField: "CREATE_TIME",
        customCarrierIds: [],
        otherLogisticsIds: [],
        countryCodes: [],
        storeIds: [],
        pageNo: 1,
        pageSize: 10000,
        parcelType: 0,
        applyWaybillStatusList: [0, 1, 2],
        customLabelStatusList: [0, 1, 2],
        listStatus: [10, 20, 22, 24, 25],
        isVirtual: 0,
      },
      { headers: { "x-access-token": token.value } }
    );
    console.log(res);
    if (res.data.code != 200) {
      localStorage.removeItem("erpToken");
      return ElMessage.error(`三方接口报错，${res.data.message}`);
    }
    const arr = res.data.data.data.map((it) => {
      return {
        parcelId: it.id,
        waybillNo: it.waybillNo,
        logisticsName: it.logisticsName,
        parcelNo: it.parcelNo,
      };
    });
    const validArr = await backup4pxParcelValidate({ parcels: arr });
    console.log("validArr", validArr);
    validRes.value = validArr.data.results;
  } catch (error) {
    console.log(error);
  } finally {
    searchLoading.value = false;
  }
};

const backupListRef = ref(null);
const showList = () => {
  backupListRef.value.init();
};

const backupLoading = ref(false);
const startBackup = async () => {
  backupLoading.value = true;
  resultData.value = null;
  backup4pxParcel({
    parcels: validRes.value.parcels,
    token: token.value,
  })
    .then((res) => {
      console.log(res);
      if (res.code == 200) {
        ElMessage.success(res.message);
        resultData.value = res.data.results;
        validRes.value = {
          total: "",
          exist: 0,
          noWaybill: 0,
          unExist: 0,
          parcels: [],
        };
      }
    })
    .finally(() => {
      backupLoading.value = false;
    });
};
</script>

<style lang="scss">
.label-success {
  background-color: rgba(103, 194, 58, 0.3) !important;
}
.label-error {
  background-color: rgba(245, 108, 108, 0.3) !important;
}
.label-primary {
  background-color: rgba(64, 158, 255, 0.3) !important;
}
</style>
