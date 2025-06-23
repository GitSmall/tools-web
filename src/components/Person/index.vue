<template>
  <div class="person-dialog">
    <el-dialog
      v-model:visible="showDetailDialog"
      title="个人详情"
      append-to-body
      :show-close="false"
      width="25%"
    >
      <div>
        <el-row>
          <el-col :span="8">
            <div class="grid-content bg-purple contentText">
              <div>
                <div class="divLabel" style="color: orange">
                  <i class="el-icon-user" />
                  <label>账户名</label>
                </div>
                <div style="text-align: center; margin-top: 20px">
                  <span>{{ data.user.account }}</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="grid-content bg-purple contentText">
              <div>
                <div class="divLabel" style="color: blueviolet">
                  <i class="el-icon-medal-1" />
                  <label>等级</label>
                </div>
                <div style="text-align: center; margin-top: 20px">
                  <span>LV1</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="grid-content bg-purple contentText">
              <div>
                <div class="divLabel" style="color: limegreen">
                  <i class="el-icon-chicken" />
                  <label>余额</label>
                </div>
                <div style="text-align: center; margin-top: 20px">
                  <span>{{ data.user.balance }}</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
});
const noteArea = ref("");
const showDetailDialog = ref(true);
onMounted(() => {
  noteArea.value = props.note;
});
const emit = defineEmits(["close"]);
const closeDialog = () => {
  emit("close");
};
</script>
<style lang="scss" scoped>
.contentText {
  > div {
    margin-bottom: 20px;
  }
  .divLabel {
    display: inline-block;
    width: 100%;
    text-align: center;
    padding: 0 10px;
  }
}
</style>
