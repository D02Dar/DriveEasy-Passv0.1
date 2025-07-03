<template>
  <div id="app">
    <AppLayout>
      <router-view />
    </AppLayout>
  </div>
</template>

<script>
import { AppLayout } from '@/components/layout'

export default {
  name: 'App',
  components: {
    AppLayout
  },
  mounted() {
    // 应用初始化
    this.initApp()
  },
  methods: {
    async initApp() {
      // 检查用户登录状态
      await this.$store.dispatch('auth/checkAuth')

      // 设置主题
      this.setTheme()

      // 设置语言
      this.setLanguage()
    },

    setTheme() {
      const theme = localStorage.getItem('theme') || 'light'
      document.documentElement.setAttribute('data-theme', theme)
    },

    setLanguage() {
      const language = localStorage.getItem('language') || 'zh-CN'
      this.$store.commit('app/SET_LANGUAGE', language)

      // 设置i18n语言
      if (this.$i18n) {
        this.$i18n.locale = language
      }

      // 设置HTML lang属性
      document.documentElement.lang = language
    }
  }
}
</script>

<style lang="scss">
// 全局样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
  color: var(--el-text-color-primary);
  background-color: var(--el-bg-color);
}

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-darker);
}

// 响应式断点
@media (max-width: 768px) {
  .el-container {
    flex-direction: column;
  }
}
</style>
