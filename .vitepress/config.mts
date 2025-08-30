import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "wh40k-icons",
    description: "Warhammer 40k icons collect",
    srcDir: "src",
    base: '/wh40k-icon/',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' }
            , { text: "混沌", link: '/svgs/chaos/README' }
            , { text: "通用", link: '/svgs/general/README' }
            , { text: "帝国", link: '/svgs/human_imperium/README' }
            , { text: "异形", link: "/svgs/xenos/README" }
            , { text: "font-page", link: "/fonts" }
        ],
        sidebar: [],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/Certseeds/wh40k-icon' }
        ],
        footer: {
            copyright: `2024-${new Date().getFullYear()} Certseeds`
        },
        lastUpdated: {
            formatOptions: {
                era: "short",
                year: "numeric",
                month: "long",
                weekday: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: false,
                timeZone: "UTC",
                timeZoneName: "longGeneric",
                fractionalSecondDigits: 3,
                formatMatcher: "basic",
            },
        }, search: {
            provider: 'local'
        }
    },
    head: [
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'zh-CN' }],
        ['meta', { property: 'og:title', content: 'wh40k-icon | warhammer 40k icons show page' }],
        ['meta', { property: 'og:site_name', content: 'wh40k-icon' }],
        ['meta', { property: 'og:url', content: 'https://certseeds.github.io/wh40k-icon' }],
        ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { property: 'twitter:title', content: 'wh40k-icon | warhammer 40k icons show page' }],
        ['meta', { property: 'twitter:description', content: 'warhammer 40k icons' }],
        ['meta', { property: 'keywords', content: 'vitepress, warhammer, icons, svg' }],
        ['meta', { property: 'robots', content: 'index, follow' }],
        ['meta', { property: 'author', content: 'Certseeds, shitake, farvig' }],
        ['link', { rel: 'stylesheet', href: '/wh40k-icon/custom.css' }],
        ['meta', { name: 'google-site-verification', content: 'RUZjTQhfsgxj0JmyySNM82pLKT-9thJwEbNZz372ee4' }]
    ],
    sitemap: {
        hostname: 'https://certseeds.github.io/wh40k-icon'
    },
    lastUpdated: true,
    metaChunk: true,
    vite: {
        build: {
            assetsInlineLimit: 0
        }
    }
})
