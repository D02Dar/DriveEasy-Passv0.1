import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import { ElMessage } from 'element-plus'
import i18n from '@/i18n'

// 路由组件懒加载
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const Dashboard = () => import('@/views/user/Dashboard.vue')
const Practice = () => import('@/views/user/Practice.vue')
const PracticeDetail = () => import('@/views/user/PracticeDetail.vue')
const Bookmarks = () => import('@/views/user/Bookmarks.vue')
const Profile = () => import('@/views/user/Profile.vue')
const AccidentReport = () => import('@/views/user/AccidentReport.vue')
const Schools = () => import('@/views/user/Schools.vue')
const AdminDashboard = () => import('@/views/admin/Dashboard.vue')
const AdminQuestions = () => import('@/views/admin/Questions.vue')
const AdminUsers = () => import('@/views/admin/Users.vue')
const AdminReports = () => import('@/views/admin/Reports.vue')
const NotFound = () => import('@/views/error/NotFound.vue')
const LanguageTest = () => import('@/views/test/LanguageTest.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'home',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'login',
      requiresAuth: false,
      hideForAuth: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'register',
      requiresAuth: false,
      hideForAuth: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'userCenter',
      requiresAuth: true
    }
  },
  {
    path: '/practice',
    name: 'Practice',
    component: Practice,
    meta: {
      title: 'practice',
      requiresAuth: true
    }
  },
  {
    path: '/practice/:categoryId',
    name: 'PracticeDetail',
    component: PracticeDetail,
    meta: {
      title: 'startPractice',
      requiresAuth: true
    }
  },
  {
    path: '/bookmarks',
    name: 'Bookmarks',
    component: Bookmarks,
    meta: {
      title: 'bookmarks',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: 'profile',
      requiresAuth: true
    }
  },
  {
    path: '/accident-report',
    name: 'AccidentReport',
    component: AccidentReport,
    meta: {
      title: 'accidentReport',
      requiresAuth: true
    }
  },
  {
    path: '/schools',
    name: 'Schools',
    component: Schools,
    meta: {
      title: 'schools',
      requiresAuth: false
    }
  },
  // 管理员路由
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      title: 'adminDashboard',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/questions',
    name: 'AdminQuestions',
    component: AdminQuestions,
    meta: {
      title: 'questionManagement',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: {
      title: 'userManagement',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: AdminReports,
    meta: {
      title: 'reports',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 测试页面
  {
    path: '/test/language',
    name: 'LanguageTest',
    component: LanguageTest,
    meta: {
      title: 'languageTest',
      requiresAuth: false
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: 'notFound'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${i18n.global.t('pageTitle.' + to.meta.title)} - ${i18n.global.t('common.appName')}` : i18n.global.t('common.appName')

  // 如果有token但未认证，先检查认证状态
  const token = store.getters['auth/token']
  let isAuthenticated = store.getters['auth/isAuthenticated']

  if (token && !isAuthenticated) {
    // 尝试验证token有效性
    isAuthenticated = await store.dispatch('auth/checkAuth')
  }

  const userRole = store.getters['auth/userRole']

  // 如果需要认证但用户未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    ElMessage.warning(t('messages.warning'))
    next('/login')
    return
  }

  // 如果已登录用户访问登录/注册页面
  if (to.meta.hideForAuth && isAuthenticated) {
    next('/dashboard')
    return
  }

  // 如果需要管理员权限但用户不是管理员
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    ElMessage.error(t('messages.error'))
    next('/dashboard')
    return
  }

  next()
})

export default router
