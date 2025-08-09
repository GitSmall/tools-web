<template>
  <div>
    <el-form
      :model="form"
      :rules="rules"
      ref="feedbackForm"
      label-width="100px"
    >
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :value="1">问题反馈</el-radio>
          <el-radio :value="2">优化建议</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
          type="textarea"
          v-model="form.content"
          :rows="3"
          placeholder="请输入您的内容"
        ></el-input>
      </el-form-item>
      <el-button type="primary" @click="submitFeedback">提交</el-button>
    </el-form>

    <el-table :data="tableData" border class="mt-[20px]">
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'warning' : 'primary'">{{
            row.type === 1 ? "问题反馈" : "优化建议"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="反馈内容"></el-table-column>
      <el-table-column label="回复历史">
        <template #default="{ row }">
          <div v-if="row.FeedbackReplies && row.FeedbackReplies.length">
            <div
              v-for="reply in row.FeedbackReplies"
              :key="reply.id"
              class="reply-item"
            >
              <p>
                <strong>
                  {{ reply.User.username }} ({{
                    reply.role === 0 ? "用户" : "管理员"
                  }}, {{ reply.createdAt }}):
                </strong>
                {{ reply.reply }}
              </p>
            </div>
            <el-input
              type="textarea"
              v-model="row.replyInput"
              :rows="2"
              placeholder="输入追加反馈"
              style="margin-top: 10px"
            ></el-input>
            <el-button
              type="primary"
              size="small"
              @click="submitReply(row)"
              style="margin-top: 10px"
            >
              追加反馈
            </el-button>
          </div>
          <span v-else class="text-[#999] text-[12px]">暂无回复</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag
            :type="
              row.status === 0
                ? 'info'
                : row.status === 1
                ? 'primary'
                : 'success'
            "
            >{{
              row.status === 0
                ? "待处理"
                : row.status === 1
                ? "已回复"
                : "已关闭"
            }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ row.createdAt }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { feedbackSubmit, feedbackList } from "@/api/feedback";

const feedbackForm = ref(null);
const form = reactive({
  type: 0, // 默认问题反馈
  content: "",
});
const rules = {
  type: [{ required: true, message: "请选择反馈类型", trigger: "change" }],
  content: [
    { required: true, message: "请输入反馈内容", trigger: "blur" },
    { min: 1, max: 100, message: "反馈内容长度为 1-100 字符", trigger: "blur" },
  ],
};
const tableData = ref([]);

const submitFeedback = async () => {
  try {
    await feedbackForm.value.validate();
    const res = await feedbackSubmit({
      type: form.type,
      content: form.content,
    });
    if (res.code === 200) {
      ElMessage.success("反馈提交成功");
      form.content = "";
      form.type = 0;
      feedbackForm.value.resetFields();
      fetchFeedbackList();
    } else {
      ElMessage.error(res.message);
    }
  } catch (err) {
    console.error("提交反馈失败:", err);
    ElMessage.error("提交反馈失败: " + err.message);
  }
};

const submitReply = async (row) => {
  try {
    if (!row.replyInput || row.replyInput.trim().length === 0) {
      ElMessage.error("追加反馈内容不能为空");
      return;
    }
    const res = await axios.post("/web/feedback/reply", {
      feedbackId: row.id,
      reply: row.replyInput,
    });
    if (res.data.code === 200) {
      ElMessage.success("追加反馈成功");
      row.replyInput = "";
      fetchFeedbackList();
    } else {
      ElMessage.error(res.data.message);
    }
  } catch (err) {
    console.error("追加反馈失败:", err);
    ElMessage.error("追加反馈失败: " + err.message);
  }
};

const fetchFeedbackList = async () => {
  try {
    const res = await feedbackList();
    if (res.code === 200) {
      tableData.value = res.data.feedbacks;
      console.log("获取反馈列表:", res.data.feedbacks);
    } else {
      ElMessage.error(res.message);
    }
  } catch (err) {
    console.error("获取反馈列表失败:", err);
    ElMessage.error("获取反馈列表失败: " + err.message);
  }
};

onMounted(() => {
  fetchFeedbackList();
});
</script>
<style scoped lang="scss">
.el-form {
  width: 600px;
  margin: 0 auto;
}
.reply-item {
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}
</style>
