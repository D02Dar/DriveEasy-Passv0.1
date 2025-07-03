<template>
  <div class="app-sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <el-icon><CaretRight /></el-icon>
        </div>
        <transition name="fade">
          <h2 v-show="!isCollapsed" class="brand-title">
            {{ isAdminArea ? $t('nav.adminDashboard') : $t('common.appName') }}
          </h2>
        </transition>
      </div>
      <el-button
        class="collapse-btn"
        text
        @click="toggleCollapse"
      >
        <el-icon>
          <component :is="isCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </el-button>
    </div>

    <!-- 用户信息 -->
    <div class="sidebar-user" v-if="currentUser">
      <el-avatar :size="isCollapsed ? 32 : 48" :src="currentUser.avatar">
        <el-icon><User /></el-icon>
      </el-avatar>
      <transition name="fade">
        <div v-show="!isCollapsed" class="user-info">
          <div class="username">{{ currentUser.username }}</div>
          <div class="user-role">{{ userRoleText }}</div>
        </div>
      </transition>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div v-show="!isCollapsed" class="section-title">{{ $t('nav.mainFeatures') }}</div>
        <router-link 
          v-for="item in navigationItems" 
          :key="item.name"
          :to="item.path" 
          class="nav-item"
          :class="{ active: isActiveRoute(item.path) }"
        >
          <el-icon class="nav-icon">
            <component :is="item.icon" />
          </el-icon>
          <transition name="fade">
            <span v-show="!isCollapsed" class="nav-text">{{ item.name }}</span>
          </transition>
          <div v-if="item.badge && !isCollapsed" class="nav-badge">
            {{ item.badge }}
          </div>
        </router-link>
      </div>

      <!-- 管理员专用菜单 -->
      <div v-if="isAdminArea" class="nav-section">
        <div v-show="!isCollapsed" class="section-title">{{ $t('nav.systemManagement') }}</div>
        <router-link 
          v-for="item in adminItems" 
          :key="item.name"
          :to="item.path" 
          class="nav-item"
          :class="{ active: isActiveRoute(item.path) }"
        >
          <el-icon class="nav-icon">
            <component :is="item.icon" />
          </el-icon>
          <transition name="fade">
            <span v-show="!isCollapsed" class="nav-text">{{ item.name }}</span>
          </transition>
        </router-link>
      </div>
    </nav>

    <!-- 底部操作 -->
    <div class="sidebar-footer">
      <!-- 返回用户区/管理区切换 -->
      <router-link 
        v-if="isAdmin"
        :to="isAdminArea ? '/dashboard' : '/admin/dashboard'"
        class="nav-item switch-area"
      >
        <el-icon class="nav-icon">
          <component :is="isAdminArea ? 'User' : 'Setting'" />
        </el-icon>
        <transition name="fade">
          <span v-show="!isCollapsed" class="nav-text">
            {{ isAdminArea ? $t('nav.userCenter') : $t('nav.adminDashboard') }}
          </span>
        </transition>
      </router-link>

      <!-- 语言切换 -->
      <div class="nav-item language-item">
        <el-icon class="nav-icon">
          <Operation />
        </el-icon>
        <transition name="fade">
          <span v-show="!isCollapsed" class="nav-text">{{ $t('nav.languageSettings') }}</span>
        </transition>
        <div class="language-switcher-container" :class="{ collapsed: isCollapsed }">
          <LanguageSwitcher
            :variant="isCollapsed ? 'icon' : 'default'"
            size="small"
            :show-text="!isCollapsed"
          />
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="nav-item logout-item" @click="handleLogout">
        <el-icon class="nav-icon">
          <SwitchButton />
        </el-icon>
        <transition name="fade">
          <span v-show="!isCollapsed" class="nav-text">{{ $t('nav.logout') }}</span>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import {
  CaretRight,
  User,
  Expand,
  Fold,
  House,
  Reading,
  Document,
  Star,
  School,
  Setting,
  SwitchButton,
  DataBoard,
  Folder,
  TrendCharts,
  Bell,
  Operation
} from '@element-plus/icons-vue'

export default {
  name: 'AppSidebar',
  components: {
    LanguageSwitcher,
    CaretRight,
    User,
    Expand,
    Fold,
    House,
    Reading,
    Document,
    Star,
    School,
    Setting,
    SwitchButton,
    DataBoard,
    Folder,
    TrendCharts,
    Bell,
    Operation
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()

    const isCollapsed = ref(false)
    const isMobileOpen = computed(() => store.getters['app/sidebarMobileOpen'])

    // 计算属性
    const currentUser = computed(() => store.getters['auth/currentUser'])
    const isAdmin = computed(() => store.getters['auth/userRole'] === 'admin')
    const isAdminArea = computed(() => route.path.startsWith('/admin'))
    
    const userRoleText = computed(() => {
      return isAdmin.value ? t('nav.admin') : t('nav.user')
    })

    // 用户区导航菜单
    const userNavItems = computed(() => [
      { name: t('nav.userCenter'), path: '/dashboard', icon: 'House' },
      { name: t('nav.practiceBank'), path: '/practice', icon: 'Reading' },
      { name: t('nav.accidentRecord'), path: '/accident-report', icon: 'Document' },
      { name: t('nav.bookmarkedQuestions'), path: '/bookmarks', icon: 'Star' },
      { name: t('nav.schoolInfo'), path: '/schools', icon: 'School' },
      { name: t('nav.personalProfile'), path: '/profile', icon: 'User' }
    ])

    // 管理员区导航菜单
    const adminNavItems = computed(() => [
      { name: t('nav.adminDashboard'), path: '/admin/dashboard', icon: 'DataBoard' },
      { name: t('nav.questionManagement'), path: '/admin/questions', icon: 'Folder' },
      { name: t('nav.userManagement'), path: '/admin/users', icon: 'User' },
      { name: t('nav.dataReports'), path: '/admin/reports', icon: 'TrendCharts' }
    ])

    // 管理员专用功能
    const adminItems = computed(() => [
      { name: t('nav.systemSettings'), path: '/admin/settings', icon: 'Setting' },
      { name: t('nav.notificationManagement'), path: '/admin/notifications', icon: 'Bell' }
    ])

    // 当前导航菜单
    const navigationItems = computed(() => {
      return isAdminArea.value ? adminNavItems.value : userNavItems.value
    })

    // 方法
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
      // 同步到Vuex store
      store.dispatch('app/toggleSidebar')
      // 保存状态到本地存储
      localStorage.setItem('sidebar-collapsed', isCollapsed.value.toString())
    }

    const isActiveRoute = (path) => {
      return route.path === path || route.path.startsWith(path + '/')
    }

    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm(t('auth.confirmLogout'), t('common.confirm'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        })
        
        await store.dispatch('auth/logout')
        ElMessage.success(t('messages.success'))
        router.push('/')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error:', error)
          ElMessage.error(t('messages.error'))
        }
      }
    }

    // 初始化折叠状态
    const initCollapsedState = () => {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        isCollapsed.value = saved === 'true'
        // 同步到Vuex store
        store.commit('app/SET_SIDEBAR_COLLAPSED', isCollapsed.value)
      } else {
        // 如果没有本地存储，使用store中的状态
        isCollapsed.value = store.getters['app/sidebarCollapsed']
      }
    }

    // 组件挂载时初始化
    initCollapsedState()

    return {
      isCollapsed,
      isMobileOpen,
      currentUser,
      isAdmin,
      isAdminArea,
      userRoleText,
      navigationItems,
      adminItems,
      toggleCollapse,
      isActiveRoute,
      handleLogout
    }
  }
}
</script>

<style lang="scss" scoped>
.app-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1001;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

  &.collapsed {
    width: 80px;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  min-height: 80px;

  .collapsed & {
    padding: 20px 16px;
    flex-direction: column;
    gap: 12px;
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;

  .brand-logo {
    width: 40px;
    height: 40px;
    background: var(--el-color-primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
  }

  .brand-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin: 0;
    white-space: nowrap;
  }
}

.collapse-btn {
  padding: 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-light);

  .collapsed & {
    padding: 20px 16px;
    justify-content: center;
  }

  .user-info {
    .username {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      line-height: 1.2;
    }

    .user-role {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 2px;
    }
  }
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 24px 12px;
    margin-bottom: 8px;

    .collapsed & {
      display: none;
    }
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  text-decoration: none;
  color: var(--el-text-color-primary);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;

  .collapsed & {
    padding: 12px 16px;
    justify-content: center;
  }

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    border-right: 3px solid var(--el-color-primary);

    .collapsed & {
      border-right: none;
      border-left: 3px solid var(--el-color-primary);
    }
  }

  .nav-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .nav-text {
    font-weight: 500;
    white-space: nowrap;
  }

  .nav-badge {
    background: var(--el-color-danger);
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: auto;
  }

  &.switch-area {
    color: var(--el-color-info);

    &:hover {
      background: var(--el-color-info-light-9);
      color: var(--el-color-info);
    }
  }

  &.logout-item {
    color: var(--el-color-danger);

    &:hover {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }

  &.language-item {
    position: relative;

    .language-switcher-container {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);

      &.collapsed {
        position: static;
        transform: none;
        margin-left: auto;
      }
    }
  }
}

.sidebar-footer {
  border-top: 1px solid var(--el-border-color-light);
  padding: 16px 0;
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式设计
@media (max-width: 1024px) {
  .app-sidebar {
    transform: translateX(-100%);

    &.mobile-open {
      transform: translateX(0);
    }
  }
}
</style>
