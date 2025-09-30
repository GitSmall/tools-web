<template>
  <div>
    <div class="desktop-main-title">
      <h2>常用工具</h2>
    </div>
    <div class="desktop-main-mid">
      <div class="desktop-card">
        <img src="~@/assets/home/desk.webp" style="width: 100%; height: 100%" />
        <div class="img-title">条形码生成</div>
        <div class="desktop-card__content" @click="jumpRoute('/tools/barcode')">
          <p class="desktop-card__title">条形码生成</p>
          <p class="desktop-card__description">
            通过Excel文件，批量生成条形码PDF
          </p>
        </div>
      </div>
      <div class="desktop-card">
        <img src="~@/assets/home/desk2.jpg" style="width: 100%; height: 100%" />
        <div class="img-title">效果图上传</div>
        <div class="desktop-card__content" @click="jumpRoute('/tools/thumbUp')">
          <p class="desktop-card__title">效果图上传</p>
          <p class="desktop-card__description">
            上传压缩包，批量处理里层文件中的效果图片。输入Excel文件
          </p>
        </div>
      </div>
      <div class="desktop-card">
        <img src="~@/assets/home/desk3.jpg" style="width: 100%; height: 100%" />
        <div class="img-title">字符串处理</div>
        <div class="desktop-card__content" @click="jumpRoute('/tools/string')">
          <p class="desktop-card__title">字符串处理</p>
          <p class="desktop-card__description">批量处理字符串，添加前缀后缀</p>
        </div>
      </div>
      <div class="desktop-card">
        <img src="~@/assets/home/desk4.jpg" style="width: 100%; height: 100%" />
        <div class="img-title">文件名替换</div>
        <div class="desktop-card__content" @click="jumpRoute('/tools/replace')">
          <p class="desktop-card__title">文件名替换</p>
          <p class="desktop-card__description">
            上传压缩包，根据Excel文件中的数据，修改同目录下文件的名称
          </p>
        </div>
      </div>
      <div class="desktop-card">
        <img src="~@/assets/home/desk5.jpg" style="width: 100%; height: 100%" />
        <div class="img-title !text-[#666]">4PX面单备份</div>
        <div
          class="desktop-card__content"
          @click="jumpRoute('/tools/4px-backup')"
        >
          <p class="desktop-card__title">4PX面单备份</p>
          <p class="desktop-card__description">
            备份某个ERP用户下线上处理中的4PX面单
          </p>
        </div>
      </div>
      <div class="desktop-card">
        <img src="~@/assets/home/desk6.jpg" style="width: 100%; height: 100%" />
        <div class="img-title !text-[#666]">货箱称重计划</div>
        <div
          class="desktop-card__content"
          @click="jumpRoute('/tools/weighingPlan')"
        >
          <p class="desktop-card__title">货箱称重计划</p>
          <p class="desktop-card__description">货箱重量及箱规体积记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
const jumpRoute = (path) => {
  router.push({ path });
};
</script>
<style scoped lang="scss">
.desktop-main-title {
  width: auto;
  height: 50px;
  line-height: 50px;
  font-weight: bold;
  font-size: 16px;
  text-align: left;
}
.desktop-main-mid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 200px;
}

.desktop-card {
  position: relative;
  width: calc(25% - 30px);
  height: 170px;
  margin: 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  float: left;
}

.desktop-card .img-title {
  position: absolute;
  top: 10px;
  left: 20px;
  font-size: 16px;
  color: #fff;
  font-weight: bold;
  opacity: 1;
}

.desktop-card:hover .img-title {
  opacity: 0;
}

.desktop-card:hover {
  transform: rotate(-5deg) scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.desktop-card__content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: #fff;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.desktop-card:hover .desktop-card__content {
  transform: translate(-50%, -50%) rotate(0deg);
  opacity: 1;
}

.desktop-card__title {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 700;
}

.desktop-card__description {
  margin: 10px 0 0;
  font-size: 14px;
  color: #777;
  line-height: 1.4;
}
</style>
