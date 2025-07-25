<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>{{ t('auth.loginTitle') }}</h2>
          <p>{{ t('auth.logindes') }}</p>
        </div>

        <el-form
          ref="loginForm"
          :model="form"
          :rules="rules"
          class="login-form"
          @submit.prevent="handleSubmit"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              :placeholder="t('auth.enterUsername')"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              :placeholder="t('auth.enterPassword')"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleSubmit"
            />
          </el-form-item>

          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="form.remember">{{ $t('auth.rememberMe') }}</el-checkbox>
              <el-link type="primary" @click="handleForgotPassword">
                {{ $t('auth.forgotPassword') }}
              </el-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleSubmit"
            >
              {{ loading ? $t('auth.loggingIn') : $t('auth.login') }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p>
            {{ $t('auth.noAccount') }}
            <router-link to="/register" class="register-link">
              {{ $t('auth.registerNow') }}
            </router-link>
          </p>
        </div>
      </div>

      <div class="login-illustration">
        <img src="/images/login-illustration.svg" alt="Login Illustration" />
        <h3>{{ $t('auth.startJourney') }}</h3>
        <p>{{ $t('auth.practiceDescription') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

export default {
  name: 'Login',
  components: {
    User,
    Lock
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const { t } = useI18n()
    const loginForm = ref(null)
    const loading = ref(false)

    const form = reactive({
      username: '',
      password: '',
      remember: false
    })

    const rules = {
      username: [
        { required: true, message: t('validation.pleaseEnter'), trigger: 'blur' },
        { min: 3, max: 50, message: t('validation.usernameLength'), trigger: 'blur' }
      ],
      password: [
        { required: true, message: t('validation.pleaseEnter'), trigger: 'blur' },
        { min: 6, message: t('validation.passwordMinLength'), trigger: 'blur' }
      ]
    }

    const handleSubmit = async () => {
      if (!loginForm.value) return

      try {
        const valid = await loginForm.value.validate()
        if (!valid) return

        loading.value = true

        const result = await store.dispatch('auth/login', {
          username: form.username,
          password: form.password
        })

        if (result.success) {
          // 登录成功，根据用户角色跳转
          const userRole = store.getters['auth/userRole']
          let redirect

          if (userRole === 'admin') {
            redirect = '/admin/dashboard'
          } else {
            redirect = router.currentRoute.value.query.redirect || '/dashboard'
          }

          router.push(redirect)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        loading.value = false
      }
    }

    const handleForgotPassword = () => {
      ElMessage.info(t('messages.info'))
    }

    return {
      loginForm,
      form,
      rules,
      loading,
      handleSubmit,
      handleForgotPassword,
      User,
      Lock,
      t
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-card {
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  h2 {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
  }

  p {
    color: var(--el-text-color-regular);
    font-size: 16px;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }

  .el-input {
    --el-input-height: 48px;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-top: 30px;

  p {
    color: var(--el-text-color-regular);
  }

  .register-link {
    color: var(--el-color-primary);
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}

.login-illustration {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;

  img {
    width: 200px;
    height: auto;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  h3 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 15px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
    line-height: 1.6;
  }
}

@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .login-card {
    padding: 40px 30px;
  }

  .login-illustration {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }

  .login-card {
    padding: 30px 20px;
  }

  .login-header h2 {
    font-size: 24px;
  }
}
</style>

