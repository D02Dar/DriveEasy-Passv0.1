<template>
  <div class="admin-reports">
    <div class="page-header">
      <h1 class="page-title">{{ $t("pageTitle.current") }}</h1>
      <p class="page-description">查看系统统计数据和分析报告</p>
    </div>

    <div class="reports-content">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalQuestions || 0 }}</div>
            <div class="stat-label">题目总数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPractices || 0 }}</div>
            <div class="stat-label">练习次数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon danger">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalAccidents || 0 }}</div>
            <div class="stat-label">事故记录</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户注册趋势</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <p>图表功能开发中...</p>
          </div>
        </el-card>

        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>练习活跃度</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <p>图表功能开发中...</p>
          </div>
        </el-card>
      </div>

      <!-- 数据表格 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
            <el-button type="primary" size="small">导出数据</el-button>
          </div>
        </template>
        
        <el-table :data="recentActivities" style="width: 100%">
          <el-table-column prop="type" label="活动类型" width="120" />
          <el-table-column prop="user" label="用户" width="150" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="time" label="时间" width="180" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { User, Document, TrendCharts, Warning } from '@element-plus/icons-vue'

export default {
  name: 'AdminReports',
  components: {
    User,
    Document,
    TrendCharts,
    Warning
  },
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalQuestions: 0,
        totalPractices: 0,
        totalAccidents: 0
      },
      recentActivities: [
        {
          type: '用户注册',
          user: 'user123',
          description: '新用户注册',
          time: '2024-01-15 10:30:00'
        },
        {
          type: '题目练习',
          user: 'user456',
          description: '完成科目一练习',
          time: '2024-01-15 10:25:00'
        }
      ]
    }
  },
  async mounted() {
    await this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        // 这里应该调用API获取统计数据
        // const response = await this.$api.admin.getStats()
        // this.stats = response.data
        
        // 临时模拟数据
        this.stats = {
          totalUsers: 1250,
          totalQuestions: 3500,
          totalPractices: 8900,
          totalAccidents: 45
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-reports {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.page-description {
  color: var(--el-text-color-regular);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;

  &.primary { background: var(--el-color-primary); }
  &.success { background: var(--el-color-success); }
  &.warning { background: var(--el-color-warning); }
  &.danger { background: var(--el-color-danger); }
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  min-height: 300px;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
