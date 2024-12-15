---
    layout: home
---

<link rel="stylesheet" href="/wh40k-icon/font/warhammer40k.css"  id="warhammer40k-css">

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
import { ref, onMounted } from 'vue';

const wh40kClassNames = ref([]);
const getWh40kClassNames = () => {
    const classNames = new Set();
    // 遍历所有样式表
    for (const stylesheet of document.styleSheets) {
        if (stylesheet?.href !== undefined &&
            !stylesheet.href?.includes("warhammer")) {
            continue;
        }
        // 遍历样式表中的所有规则
        for (const rule of stylesheet.cssRules) {
            if (rule.selectorText) {
                // 查找前缀为 "wh40k-" 的类名
                const matches = rule.selectorText.match(/\.wh40k-[\w-]+/g);
                if (matches) {
                    matches.forEach(className => classNames.add(className.slice(1, className.length)));
                }
            }
        }
    }
    return Array.from(classNames);
}
onMounted(() => {
    const cssLink = document.getElementById('warhammer40k-css');
    cssLink.addEventListener('load', () => {
        wh40kClassNames.value = getWh40kClassNames();
    });
});

</script>

<i class="wh40k-asuryani" style="font-size: 50px">example-element</i>

# Warhammer 40K Fonts

<div class="icon-container">
    <div v-for="className in wh40kClassNames" :key="className" class="icon-item">
        <i :class="className"></i>
        <p>{{ className }}</p>
    </div>
</div>
