import { createApp } from "vue";
import "virtual:svg-icons-register";
import "virtual:windi.css";
import ElementPlus from "element-plus";
import { createPinia } from "pinia";
import "./style.css";
import "./styles/index.scss";
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();
app.use(ElementPlus);
app.use(pinia);
app.use(router);
app.mount("#app");
