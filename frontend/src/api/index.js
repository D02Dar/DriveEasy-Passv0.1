// TODO: 添加 useI18n 支持多语言
import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import router from '@/router'

// 根据当前的环境动态选择API基础URL
function getBaseUrl() {
  // 如果.env中配置了API地址，优先使用
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 根据当前主机名决定API地址
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api'; // 开发环境使用Vite代理
  } else if (hostname === '590702.xyz') {
    // 使用与前端相同主机，不同端口的后端
    return `http://${hostname}:3001/api`;
  }

  // 默认回退到代理
  return '/api';
}

// 创建axios实例
const request = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加认证token
    const token = store.getters['auth/token']
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 显示加载状态
    store.dispatch('setLoading', true)

    return config
  },
  error => {
    store.dispatch('setLoading', false)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    store.dispatch('setLoading', false)
    return response.data
  },
  error => {
    store.dispatch('setLoading', false)

    const { response } = error

    if (response) {
      const { status, data } = response

      switch (status) {
        case 401:
          // 未授权，清除认证信息并跳转到登录页
          // 使用clearAuth避免调用API logout造成无限循环
          store.dispatch('auth/clearAuth')
          router.push('/login')
          ElMessage.error('认证失败，请重新登录')
          break

        case 403:
          ElMessage.error('权限不足')
          break

        case 404:
          ElMessage.error('请求的资源不存在')
          break

        case 422:
          // 表单验证错误
          const errors = data.errors || {}
          const errorMessages = Object.values(errors).flat()
          if (errorMessages.length > 0) {
            ElMessage.error(errorMessages[0])
          }
          break


        case 500:
          ElMessage.error('服务器内部错误')
          break

        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else {
      // 网络错误
      ElMessage.error('网络连接失败')
    }

    return Promise.reject(error)
  }
)

// API接口定义
const api = {
  // 认证相关
  auth: {
    login: (data) => request.post('/auth/login', data),
    register: (data) => request.post('/auth/register', data),
    logout: () => request.post('/auth/logout'),
    getProfile: () => request.get('/auth/profile'),
    updateProfile: (data) => request.put('/auth/profile', data),
    changePassword: (data) => request.put('/auth/password', data),
    deleteAccount: (data) => request.delete('/auth/account', { data })
  },

  // 题目分类
  categories: {
    getAll: () => request.get('/categories'),
    getById: (id) => request.get(`/categories/${id}`)
  },

  // 题目相关
  questions: {
    getByCategory: (categoryId, params) => request.get(`/questions/getByCategory/${categoryId}`, { params }),
    getById: (id) => request.get(`/questions/${id}`),
    submitAnswer: (data) => request.post('/questions/submit', data),
    bookmark: (questionId) => request.post(`/questions/${questionId}/bookmark`),
    unbookmark: (questionId) => request.delete(`/questions/${questionId}/bookmark`),
    getBookmarks: (params) => request.get('/questions/bookmarks', { params })
  },

  // 练习记录
  practice: {
    getRecords: (params) => request.get('/practice/records', { params }),
    getStats: () => request.get('/practice/stats'),
    createSession: (data) => request.post('/practice/sessions', data),
    updateSession: (sessionId, data) => request.put(`/practice/sessions/${sessionId}`, data),
    getSessionQuestions: (sessionId) => request.get(`/practice/sessions/${sessionId}/questions`),
  },

  // 事故记录
  accidents: {
    getAll: (params) => request.get('/accidents', { params }),
    getById: (id) => request.get(`/accidents/${id}`),
    create: (data) => request.post('/accidents', data),
    update: (id, data) => request.put(`/accidents/${id}`, data),
    delete: (id) => request.delete(`/accidents/${id}`),
    uploadPhoto: (reportId, formData) => request.post(`/accidents/${reportId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deletePhoto: (reportId, photoId) => request.delete(`/accidents/${reportId}/photos/${photoId}`)
  },

  // 驾校信息
  schools: {
    getAll: (params) => request.get('/schools', { params }),
    getById: (id) => request.get(`/schools/${id}`),
    getNearby: (lat, lng, radius) => request.get('/schools/nearby', {
      params: { lat, lng, radius }
    })
  },

  // 通知
  notifications: {
    getAll: (params) => request.get('/notifications', { params }),
    markAsRead: (id) => request.put(`/notifications/${id}/read`),
    markAllAsRead: () => request.put('/notifications/read-all')
  },

  // 管理员接口
  admin: {
    // 仪表盘统计
    getStats: () => request.get('/admin/stats'),

    // 用户管理
    users: {
      getAll: (params) => request.get('/admin/users', { params }),
      getById: (id) => request.get(`/admin/users/${id}`),
      update: (id, data) => request.put(`/admin/users/${id}`, data),
      delete: (id) => request.delete(`/admin/users/${id}`)
    },

    // 题目管理
    questions: {
      getAll: (params) => request.get('/admin/questions', { params }),
      getById: (id) => request.get(`/admin/questions/${id}`),
      create: (data) => request.post('/admin/questions', data),
      update: (id, data) => request.put(`/admin/questions/${id}`, data),
      delete: (id) => request.delete(`/admin/questions/${id}`),
      batchImport: (data) => request.post('/admin/questions/batch-import', data)
    },

    // 分类管理
    categories: {
      getAll: () => request.get('/admin/categories'),
      create: (data) => request.post('/admin/categories', data),
      update: (id, data) => request.put(`/admin/categories/${id}`, data),
      delete: (id) => request.delete(`/admin/categories/${id}`)
    }
  },

  // 文件上传
  upload: {
    image: (formData) => request.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    file: (formData) => request.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
