<template>
  <el-dropdown 
    trigger="click" 
    placement="bottom-end"
    @command="handleLanguageChange"
  >
    <el-button 
      :type="variant === 'text' ? 'text' : 'default'"
      :size="size"
      class="language-switcher"
    >
      <el-icon><Operation /></el-icon>
      <span v-if="showText" class="language-text">
        {{ currentLanguage.flag }} {{ currentLanguage.name }}
      </span>
      <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
    </el-button>
    
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          v-for="lang in supportedLanguages" 
          :key="lang.code"
          :command="lang.code"
          :class="{ 'is-active': currentLocale === lang.code }"
        >
          <div class="language-option">
            <span class="flag">{{ lang.flag }}</span>
            <span class="name">{{ lang.name }}</span>
            <el-icon v-if="currentLocale === lang.code" class="check-icon">
              <Check />
            </el-icon>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { setLanguage, supportedLanguages } from '@/i18n'
import { Operation, ArrowDown, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'LanguageSwitcher',
  components: {
    Operation,
    ArrowDown,
    Check
  },
  props: {
    // 显示变体：default, text, icon
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'text', 'icon'].includes(value)
    },
    // 按钮大小
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value)
    },
    // 是否显示文字
    showText: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const { locale } = useI18n()
    const store = useStore()

    // 当前语言
    const currentLocale = computed(() => locale.value)
    
    // 当前语言对象
    const currentLanguage = computed(() => {
      return supportedLanguages.find(lang => lang.code === currentLocale.value) || supportedLanguages[0]
    })

    // 切换语言
    const handleLanguageChange = async (langCode) => {
      if (langCode === currentLocale.value) return

      try {
        // 更新 i18n 语言
        setLanguage(langCode)
        
        // 更新 Vuex 状态
        await store.dispatch('app/setLanguage', langCode)
        
        // 显示成功消息
        const successMessages = {
          'zh-CN': '语言切换成功',
          'en-US': 'Language switched successfully',
          'th-TH': 'เปลี่ยนภาษาสำเร็จ'
        }
        ElMessage.success({
          message: successMessages[langCode] || successMessages['zh-CN'],
          duration: 2000
        })
        
        // 可选：刷新页面以确保所有组件都更新
        // window.location.reload()
        
      } catch (error) {
        console.error('Language switch failed:', error)
        const errorMessages = {
          'zh-CN': '语言切换失败',
          'en-US': 'Language switch failed',
          'th-TH': 'เปลี่ยนภาษาล้มเหลว'
        }
        ElMessage.error({
          message: errorMessages[currentLocale.value] || errorMessages['zh-CN'],
          duration: 3000
        })
      }
    }

    return {
      currentLocale,
      currentLanguage,
      supportedLanguages,
      handleLanguageChange
    }
  }
}
</script>

<style lang="scss" scoped>
.language-switcher {
  .language-text {
    margin: 0 4px;
    font-size: 14px;
  }
  
  .dropdown-icon {
    margin-left: 4px;
    font-size: 12px;
    transition: transform 0.3s ease;
  }
  
  &:hover .dropdown-icon {
    transform: rotate(180deg);
  }
}

.language-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  
  .flag {
    font-size: 16px;
  }
  
  .name {
    flex: 1;
    font-size: 14px;
  }
  
  .check-icon {
    color: var(--el-color-primary);
    font-size: 14px;
  }
}

:deep(.el-dropdown-menu__item) {
  &.is-active {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
  
  &:hover {
    background-color: var(--el-color-primary-light-8);
  }
}

// 不同变体的样式
.language-switcher {
  &.is-text {
    border: none;
    background: transparent;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .language-text {
    display: none;
  }
}
</style>
