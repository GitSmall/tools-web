<template>
  <div class="loginPage">
    <div class="shell">
      <div id="img-box">
        <img src="../assets/login.png" alt="" />
        <i-ep-refresh class="el-icon" @click="init" />
        <div class="textLines" :key="activeId">
          <div
            v-for="(it, index) in texts"
            :class="{ name: it.name, title: it.title }"
            :style="{ animationDelay: index + 1 + 's' }"
          >
            {{ it.text }}
          </div>
        </div>
      </div>
      <div class="right">
        <div id="form-body">
          <!-- 猫头鹰控件 -->
          <div id="owl-login" :class="['login-owl', { password: inFocus }]">
            <div class="hand"></div>
            <div class="hand hand-r"></div>
            <div class="arms">
              <div class="arm"></div>
              <div class="arm arm-r"></div>
            </div>
          </div>
          <div id="input-area">
            <el-form
              v-if="formType == 'login'"
              :model="loginForm"
              label-width="0"
              ref="loginFormRef"
              :rules="rules"
            >
              <el-form-item prop="login">
                <el-input
                  type="text"
                  v-model="loginForm.login"
                  autocomplete="off"
                  size="large"
                  placeholder="账号"
                >
                  <template #prefix>
                    <i-ep-user />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item style="margin-top: 12px" prop="password">
                <el-input
                  type="password"
                  v-model="loginForm.password"
                  show-password
                  placeholder="密码"
                  autocomplete="off"
                  size="large"
                  @keyup.enter.native="confirm"
                  @focus="inFocus = true"
                  @blur="inFocus = false"
                >
                  <template #prefix>
                    <i-ep-lock />
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
            <el-form
              v-if="formType == 'register'"
              :model="registerForm"
              label-width="0"
              :rules="rules"
              ref="registerFormRef"
            >
              <el-form-item prop="email">
                <el-input
                  type="text"
                  v-model="registerForm.email"
                  autocomplete="off"
                  size="large"
                  placeholder="邮箱"
                >
                  <template #prefix>
                    <i-ep-message />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="username">
                <el-input
                  type="text"
                  v-model="registerForm.username"
                  autocomplete="off"
                  size="large"
                  placeholder="账号"
                >
                  <template #prefix>
                    <i-ep-user />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="nickname">
                <el-input
                  type="text"
                  v-model="registerForm.nickname"
                  autocomplete="off"
                  size="large"
                  placeholder="昵称"
                >
                  <template #prefix>
                    <i-ep-edit />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item style="margin-top: 12px">
                <el-input
                  type="password"
                  v-model="registerForm.password"
                  show-password
                  placeholder="密码"
                  autocomplete="off"
                  size="large"
                  @keyup.enter.native="confirm"
                  @focus="inFocus = true"
                  @blur="inFocus = false"
                >
                  <template #prefix>
                    <i-ep-lock />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item style="margin-top: 12px" prop="confirmPassword">
                <el-input
                  type="password"
                  v-model="registerForm.confirmPassword"
                  show-password
                  placeholder="确认密码"
                  autocomplete="off"
                  size="large"
                  @keyup.enter.native="confirm"
                  @focus="inFocus = true"
                  @blur="inFocus = false"
                >
                  <template #prefix>
                    <i-ep-lock />
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
          </div>
          <div
            class="submit-buttons"
            :style="{ marginTop: formType == 'login' ? '40px' : '20px' }"
          >
            <el-button
              v-if="formType == 'login'"
              :loading="loading"
              type="primary"
              round
              @click="confirm"
              style="width: 100%"
              size="large"
              >登录</el-button
            >
            <el-button
              v-if="formType == 'register'"
              :loading="loading"
              type="primary"
              round
              @click="register"
              style="width: 100%"
              size="large"
              >注册</el-button
            >
          </div>
          <div id="forgot-pass">
            <template v-if="formType == 'login'">
              <i></i>
              <!-- <a @click="jump1">忘记密码 ?</a> -->
              <a @click="setFormType('register')">注册</a>
            </template>
            <template v-else>
              <i></i>
              <a @click="setFormType('login')">返回登录</a>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { signUp } from "@/api/login";
import { useUserStore } from "@/store/user";
import { poetryData } from "@/utils/shici";
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const inFocus = ref(false);
const loginForm = ref({
  login: "",
  password: "",
});
const registerForm = ref({});
const loginFormRef = ref(null);
const registerFormRef = ref(null);
const validatePass2 = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入确认密码"));
  } else if (value !== registerForm.value.password) {
    callback(new Error("两次密码不一致"));
  } else {
    callback();
  }
};
const rules = reactive({
  login: [{ required: true, message: "请输入账号或邮箱", trigger: "blur" }],
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 16, message: "长度在 6 到 16 个字符", trigger: "blur" },
  ],
  confirmPassword: [{ validator: validatePass2, trigger: "blur" }],
});
const texts = ref([]);
const usedIds = ref([]);
const activeId = ref(0);
const formType = ref("login");
const loading = ref(false);

const redirect = ref(undefined);

watch(
  () => route.query.redirect,
  (value) => {
    redirect.value = value;
  },
  { immediate: true }
);

const init = () => {
  // 随机取出poetryData中的一位数据,保证取出数据的id在usedIds中不存在
  let randomData = poetryData[Math.floor(Math.random() * poetryData.length)];
  while (usedIds.value.includes(randomData.id)) {
    randomData = poetryData[Math.floor(Math.random() * poetryData.length)];
  }
  const { id, content, from } = randomData;
  usedIds.value.push(id);
  // 将content中的文字，以其中的中文标点符号分割成文字数组
  let textsData = content
    .split(/[。，？,、!、?、;、:、《、》、【、】、〈、〉、『、』、...]/)
    .filter((it) => !!it)
    .map((it) => {
      return { text: it };
    });
  console.log(textsData);
  if (from.length > 9) {
    const splitData = from.split("《");
    console.log(splitData);
    splitData.forEach((it, index) => {
      if (index === 0) {
        textsData.push({ text: it, name: true });
      } else {
        textsData.unshift({ text: "《" + it, title: true });
      }
    });
  } else {
    textsData.push({ text: from, name: true });
  }
  activeId.value = id;
  texts.value = textsData;
};

init();
const setFormType = (type) => {
  if (loading.value) {
    return;
  }
  formType.value = type;
};
const confirm = async () => {
  const valid = await loginFormRef.value.validate();
  console.log(valid, !valid);
  if (!valid) {
    return;
  }
  console.log("1");
  loading.value = true;
  const { login, password } = loginForm.value;
  userStore
    .login({ login, password })
    .then(() => {
      console.log("-----");
      router.push({ path: redirect.value || "/" });
    })
    .finally(() => {
      loading.value = false;
    });
};
const register = async () => {
  const valid = await registerFormRef.value.validate();
  if (!valid) {
    return;
  }
  console.log("1");
  loading.value = true;
  signUp(registerForm.value)
    .then((res) => {
      console.log("res", res);
      if (res.code == 200) {
        ElMessage.success("注册成功，请登录");
        setTimeout(() => {
          setFormType("login");
        }, 1000);
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
<style scoped lang="scss">
.loginPage {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .shell {
    display: flex;
    justify-content: center;
  }

  .right {
    position: relative;
    width: 460px;
    height: 460px;
    background-color: #fff;
    box-shadow: 0px 0px 10px #a7e0ea;
    border-radius: 0 15px 15px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #img-box {
    position: relative;
    width: 260px;
    height: 460px;
    border-radius: 15px 0 0 15px;
    overflow: hidden;
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .textLines {
      font-family: "fangsong";
      padding: 0 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 15px;
      position: relative;
      z-index: 1;
      height: 100%;
      color: #000;
      font-weight: bold;
      > div {
        opacity: 0; /* 初始透明度为0 */
        animation: fadeIn 1.2s forwards; /* 动画名称、持续时间、动画执行完后样式 */
        &.title {
          margin-bottom: 10px;
        }
        &.name {
          text-align: right;
          &:first-child {
            padding-top: 10px;
          }
        }
      }
    }
    .el-icon {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 2;
      color: #666;
      cursor: pointer;
      &:hover {
        color: #409eff;
      }
    }
  }
  @keyframes fadeIn {
    to {
      opacity: 1;
    } /* 目标透明度为1 */
  }

  #form-body {
    position: relative;
    width: 320px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    #owl-login {
      position: absolute;
      top: -100px;
      left: 50%;
      width: 211px;
      height: 108px;
      background-image: url(../assets/login/owl-login@2x.png);
      background-size: 211px 108px;
      margin-left: -111px;
      .hand {
        width: 34px;
        height: 34px;
        border-radius: 40px;
        background-color: #472d20;
        transform: scaleY(0.6);
        transition: 0.3s ease-out;
        position: absolute;
        left: 14px;
        bottom: -8px;
        &.hand-r {
          left: 170px;
        }
      }
      .arms {
        top: 58px;
        position: absolute;
        width: 100%;
        height: 41px;
        overflow: hidden;
        .arm {
          width: 40px;
          height: 65px;
          position: absolute;
          left: 20px;
          top: 40px;
          transition: 0.3s ease-out;
          transform: rotate(-20deg);
          background-image: url(../assets/login/owl-login-arm@2x.png);
          background-size: 40px 65px;
          &.arm-r {
            transform: rotate(20deg) scaleX(-1);
            left: 158px;
          }
        }
      }
      &.password {
        .hand {
          transform: translateX(42px) translateY(-15px) scale(0.7);
          &.hand-r {
            transform: translateX(-42px) translateY(-15px) scale(0.7);
          }
        }
        .arm {
          transform: translateY(-40px) translateX(40px);
          &.arm-r {
            transform: translateY(-40px) translateX(-40px) scaleX(-1);
          }
        }
      }
    }
    .submit-buttons {
      width: 100%;
    }
  }

  #input-area {
    width: 100%;
    margin-top: 40px;
  }

  .f-inp {
    padding: 13px 25px;
    border: 2px solid #6e6d6d;
    line-height: 1;
    border-radius: 20px;
    margin-bottom: 15px;
  }

  .f-inp input {
    width: 100%;
    font-size: 14px;
    padding: 0;
    margin: 0;
    border: 0;
  }

  .f-inp input::placeholder {
    color: #b9b9b9;
  }

  #forgot-pass {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }

  #forgot-pass a {
    color: #868686;
    font-size: 12px;
    text-decoration: none;
    display: inline-block;
    margin-right: 20px; /*字之间空距离 */
    cursor: pointer;
    &:hover {
      color: #409eff;
      text-decoration: underline;
    }
  }
}
</style>
