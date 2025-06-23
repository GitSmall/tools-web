<template>
  <div class="page-footer">
    <p>
      <b>{{ setting.name }}</b>
    </p>
    <p>{{ setting.copyright }}</p>
    <p>
      <img src="../../assets/icon-gongan.png" alt="" />
      <a
        href="https://beian.mps.gov.cn/#/query/webSearch?code=41090002411003"
        rel="noreferrer"
        target="_blank"
        >{{ setting.gov }}</a
      >
      <a href="https://beian.miit.gov.cn/" target="_blank">{{ setting.icp }}</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getSettings } from "@/api/admin";

const setting = ref({});

getSettings().then((res) => {
  console.log(res);
  if (res.code == 200) {
    setting.value = res.data.setting;
  }
});
</script>
<style scoped lang="scss">
.page-footer {
  display: flex;
  height: 40px;
  margin-top: 5px;
  font-size: 12px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  img {
    display: inline-block;
    width: 14px;
  }
  a {
    color: unset;
    margin-left: 8px;
    &:hover {
      opacity: 0.6;
    }
  }
}
</style>
