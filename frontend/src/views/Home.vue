<template>
  <div class="home">
    <!-- 主要内容 -->
    <main class="main">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h2 class="hero-title">{{ $t('home.title') }}</h2>
            <p class="hero-subtitle">
              {{ $t('home.subtitle') }}
            </p>
            <div class="hero-actions">
              <router-link
                :to="isAuthenticated ? '/practice' : '/register'"
                class="btn btn-primary btn-large"
              >
                {{ isAuthenticated ? $t('home.startPractice') : $t('home.register') }}
              </router-link>
            </div>
          </div>
          <div class="hero-image">
            <img src="/images/hero-car.svg" alt="DriveEasy Pass" />
          </div>
        </div>
      </section>

      <!-- 功能特色 -->
      <section class="features">
        <div class="container">
          <h3 class="section-title">{{ $t('home.features.title') }}</h3>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon size="48"><Document /></el-icon>
              </div>
              <h4>{{ $t('home.features.practice.title') }}</h4>
              <p>{{ $t('home.features.practice.description') }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon size="48"><TrendCharts /></el-icon>
              </div>
              <h4>{{ $t('home.features.progress.title') }}</h4>
              <p>{{ $t('home.features.progress.description') }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon size="48"><Star /></el-icon>
              </div>
              <h4>{{ $t('home.features.bookmarks.title') }}</h4>
              <p>{{ $t('home.features.bookmarks.description') }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon size="48"><Warning /></el-icon>
              </div>
              <h4>{{ $t('home.features.accident.title') }}</h4>
              <p>{{ $t('home.features.accident.description') }}</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <el-icon size="48"><ChatDotRound /></el-icon>
              </div>
              <h4>{{ $t('home.features.multilang.title') }}</h4>
              <p>{{ $t('home.features.multilang.description') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 统计数据 -->
      <section class="stats">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">10000+</div>
              <div class="stat-label">{{ $t('home.stats.questions') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">5000+</div>
              <div class="stat-label">{{ $t('home.stats.users') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">95%</div>
              <div class="stat-label">{{ $t('home.stats.passRate') }}</div>
            </div>

          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>驾考助手</h4>
            <p>专业的驾驶考试练习平台</p>
          </div>
          <div class="footer-section">
            <h4>功能</h4>
            <ul>
              <li><router-link to="/practice">题库练习</router-link></li>
              <li><router-link to="/accident-report">事故记录</router-link></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>帮助</h4>
            <ul>
              <li><a href="#" @click.prevent>使用指南</a></li>
              <li><a href="#" @click.prevent>常见问题</a></li>
              <li><a href="#" @click.prevent>联系我们</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 驾考助手. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  Document,
  TrendCharts,
  Star,
  Warning,
  Location,
  ChatDotRound
} from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: {
    Document,
    TrendCharts,
    Star,
    Warning,
    Location,
    ChatDotRound
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  }
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main {
  flex: 1;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 20px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: 2px solid transparent;

  &.btn-large {
    padding: 16px 32px;
    font-size: 18px;
  }

  &.btn-primary {
    background: white;
    color: var(--el-color-primary);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }

  &.btn-outline {
    background: transparent;
    color: white;
    border-color: white;

    &:hover {
      background: white;
      color: var(--el-color-primary);
    }
  }
}

.hero-image img {
  width: 100%;
  height: auto;
}

.features {
  padding: 80px 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 36px;
  margin-bottom: 60px;
  color: var(--el-text-color-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

.feature-icon {
  color: var(--el-color-primary);
  margin-bottom: 20px;
}

.feature-card h4 {
  font-size: 20px;
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
}

.feature-card p {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.stats {
  padding: 60px 0;
  background: var(--el-color-primary);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 18px;
  opacity: 0.9;
}

.footer {
  background: #2c3e50;
  color: white;
  padding: 40px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h4 {
  margin-bottom: 20px;
  color: white;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 10px;
}

.footer-section a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: white;
  }
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding-top: 20px;
  text-align: center;
  color: #bdc3c7;
}

@media (max-width: 768px) {
  .hero .container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-title {
    font-size: 36px;
  }

  .nav-links {
    gap: 10px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
