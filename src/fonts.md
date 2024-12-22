---
    layout: home
---

<style>
.icon-container {
    display: flex;
    flex-wrap: wrap;
    max-width: 90%;
    width: 100%;
    gap: 50px;
}

.icon-item {
    max-width: 200px;
    text-align: center;
}

.icon-item i {
    display: block;
    width: 200px;
    height: 200px;
    font-size: 120px; /* 确保图标大小 */
    line-height: 100px; /* 垂直居中 */
}

</style>

<script setup>
import { ref, onMounted, watch } from 'vue';

const wh40kClassNames = ref([]);
const wh40kIconNumbers = ref(0);
const isFontLoaded = ref(false);
const getWh40kClassNames = () => {
    const classNames = new Set();
    const regex = /\.wh40k-[\w-]+/g;
    for (const stylesheet of document.styleSheets) {
        if (stylesheet?.href !== undefined &&
            !stylesheet.href?.includes("warhammer")) {
            continue;
        }
        for (const rule of stylesheet.cssRules) {
            if (rule.selectorText) {
                const matches = rule.selectorText.match(regex);
                if (matches) {
                    matches.forEach(className => classNames.add(className.slice(1, className.length)));
                }
            }
        }
    }
    return Array.from(classNames);
}
onMounted(() => {
    // 动态创建 link 元素
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '/wh40k-icon/font/warhammer40k.css';
    cssLink.id = 'warhammer40k-css';
    cssLink.onload = () => {
        document.fonts.load('1em warhammer40k').then(() => {
            wh40kClassNames.value = getWh40kClassNames();
            isFontLoaded.value = true;
            console.log('Font warhammer40k loaded');
        });
    };
    document.head.appendChild(cssLink);
});
// 监听 wh40kClassNames 的变化
watch([wh40kClassNames, isFontLoaded], ([newClassNames, newIsFontLoaded]) => {
    if (newClassNames.length > 0 && newIsFontLoaded) {
        wh40kIconNumbers.value = newClassNames.length;
        console.log('CSS 文件和字体加载完成，开始渲染图标');
    }
});
</script>

<div v-if="isFontLoaded"> 字体中一共有 {{ wh40kIconNumbers }} 个 Icon</div>
<div>
   <i v-if="isFontLoaded" class="wh40k-asuryani" style="font-size: 50px"></i>
  图标范例-阿苏焉尼
</div>

# Warhammer 40K Fonts

<div class="icon-container">
    <div v-if="isFontLoaded" v-for="className in wh40kClassNames" :key="className" class="icon-item">
        <i :class="className"></i>
        <p>{{ className }}</p>
    </div>
</div>
