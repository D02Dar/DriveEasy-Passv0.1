<template>
  <div class="accident-report-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon><Warning /></el-icon>
            {{ $t('accident.title') }}
          </h1>
          <p class="page-subtitle">{{ $t('accident.subtitle') }}</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="createNewReport">
            <el-icon><Plus /></el-icon>
            {{ $t('accident.newReport') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalReports }}</div>
          <div class="stat-label">{{ $t('accident.totalReports') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon draft">
          <el-icon><Edit /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ draftReports }}</div>
          <div class="stat-label">{{ $t('accident.draft') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon submitted">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ submittedReports }}</div>
          <div class="stat-label">{{ $t('accident.submitted') }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-card">
        <div class="filter-content">
          <el-select
            v-model="selectedStatus"
            :placeholder="$t('accident.selectStatus')"
            clearable
            @change="handleStatusChange"
            style="width: 150px"
          >
            <el-option :label="$t('accident.draft')" value="draft" />
            <el-option :label="$t('accident.submitted')" value="submitted" />
            <el-option :label="$t('accident.archived')" value="archived" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            :range-separator="$t('accident.dateTo')"
            :start-placeholder="$t('accident.startDate')"
            :end-placeholder="$t('accident.endDate')"
            @change="handleDateChange"
            style="width: 240px"
          />
          <el-button @click="clearFilters">{{ $t('accident.clearFilters') }}</el-button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="reports.length === 0" class="empty-state">
      <el-icon class="empty-icon"><Warning /></el-icon>
      <h3>{{ selectedStatus || dateRange ? $t('accident.noReportsFound') : $t('accident.noReports') }}</h3>
      <p>{{ selectedStatus || dateRange ? $t('accident.tryOtherFilters') : $t('accident.noReportsDesc') }}</p>
      <el-button type="primary" @click="createNewReport">
        {{ $t('accident.createReport') }}
      </el-button>
    </div>

    <!-- 报告列表 -->
    <div v-else class="reports-container">
      <div class="reports-grid">
        <div
          v-for="report in reports"
          :key="report.id"
          class="report-card"
          @click="viewReport(report)"
        >
          <div class="report-header">
            <div class="report-status">
              <el-tag
                :type="getStatusType(report.status)"
                size="small"
              >
                {{ getStatusText(report.status) }}
              </el-tag>
            </div>
            <div class="report-date">
              {{ formatDate(report.accidentTime) }}
            </div>
          </div>

          <div class="report-content">
            <div class="report-location">
              <el-icon><Location /></el-icon>
              <span>{{ report.accidentLocation || $t('accident.noLocation') }}</span>
            </div>
            <div class="report-description">
              {{ report.description || $t('accident.noDescription') }}
            </div>
          </div>

          <div class="report-footer">
            <div class="report-info">
              <span class="photo-count" v-if="report.photoCount > 0">
                <el-icon><Picture /></el-icon>
                {{ $t('accident.photoCount', { count: report.photoCount }) }}
              </span>
              <span class="created-time">
                {{ $t('accident.createdAt') }} {{ formatDate(report.createdAt) }}
              </span>
            </div>
            <div class="report-actions">
              <el-button
                size="small"
                @click.stop="editReport(report)"
              >
                <el-icon><Edit /></el-icon>
                {{ $t('common.edit') }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click.stop="deleteReport(report)"
              >
                <el-icon><Delete /></el-icon>
                {{ $t('common.delete') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="totalReports"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 创建/编辑报告对话框 -->
    <el-dialog
      v-model="reportDialogVisible"
      :title="isEditing ? $t('accident.editReport') : $t('accident.createReport')"
      width="700px"
      :before-close="handleCloseReportDialog"
    >
      <el-form
        ref="reportForm"
        :model="reportForm"
        :rules="reportRules"
        label-width="100px"
      >
        <el-form-item :label="$t('accident.accidentTime')" prop="accidentTime">
          <el-date-picker
            v-model="reportFormData.accidentTime"
            type="datetime"
            :placeholder="$t('accident.selectAccidentTime')"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('accident.accidentLocation')" prop="accidentLocation">
          <el-input
            v-model="reportFormData.accidentLocation"
            :placeholder="$t('accident.enterAccidentLocation')"
          />
        </el-form-item>

        <el-form-item :label="$t('accident.accidentDescription')" prop="description">
          <el-input
            v-model="reportFormData.description"
            type="textarea"
            :rows="4"
            :placeholder="$t('accident.enterAccidentDescription')"
          />
        </el-form-item>

        <el-form-item :label="$t('accident.otherPartyInfo')" prop="otherPartyInfo">
          <el-input
            v-model="reportFormData.otherPartyInfo"
            type="textarea"
            :rows="3"
            :placeholder="$t('accident.enterOtherPartyInfo')"
          />
        </el-form-item>

        <el-form-item :label="$t('accident.scenePhotos')">
          <div class="photo-upload-section">
            <el-upload
              ref="photoUpload"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :data="uploadData"
              list-type="picture-card"
              :file-list="photoList"
              :on-success="handlePhotoSuccess"
              :on-remove="handlePhotoRemove"
              :before-upload="beforePhotoUpload"
              accept="image/*"
              multiple
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">
              {{ $t('accident.uploadTip') }}
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="reportDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button @click="saveDraft" :loading="saving">{{ $t('accident.saveDraft') }}</el-button>
        <el-button type="primary" @click="submitReport" :loading="saving">
          {{ isEditing ? $t('accident.updateReport') : $t('accident.submitReport') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 报告详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('accident.reportDetailTitle', { location: selectedReport?.accidentLocation || $t('accident.unknownLocation') })"
      width="800px"
      :before-close="handleCloseDetailDialog"
    >
      <div v-if="selectedReport" class="report-detail-content">
        <div class="detail-section">
          <h4>{{ $t('accident.basicInfo') }}</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>{{ $t('accident.accidentTime') }}:</label>
              <span>{{ formatDate(selectedReport.accidentTime) }}</span>
            </div>
            <div class="detail-item">
              <label>{{ $t('accident.accidentLocation') }}:</label>
              <span>{{ selectedReport.accidentLocation || $t('accident.notSpecified') }}</span>
            </div>
            <div class="detail-item">
              <label>{{ $t('accident.reportStatus') }}:</label>
              <el-tag :type="getStatusType(selectedReport.status)" size="small">
                {{ getStatusText(selectedReport.status) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>{{ $t('accident.createdAt') }}:</label>
              <span>{{ formatDate(selectedReport.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="selectedReport.description">
          <h4>{{ $t('accident.accidentDescription') }}</h4>
          <p class="description-text">{{ selectedReport.description }}</p>
        </div>

        <div class="detail-section" v-if="selectedReport.otherPartyInfo">
          <h4>{{ $t('accident.otherPartyInfo') }}</h4>
          <p class="description-text">{{ selectedReport.otherPartyInfo }}</p>
        </div>

        <div class="detail-section" v-if="reportPhotos.length > 0">
          <h4>{{ $t('accident.scenePhotos') }}</h4>
          <div class="photos-gallery">
            <div
              v-for="photo in reportPhotos"
              :key="photo.id"
              class="photo-item"
              @click="previewPhoto(photo)"
            >
              <img :src="photo.imageUrl" :alt="photo.caption" />
              <div class="photo-overlay">
                <el-icon><ZoomIn /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">{{ $t('common.close') }}</el-button>
        <el-button @click="editReport(selectedReport)">{{ $t('accident.editReport') }}</el-button>
        <el-button v-if="selectedReport?.pdfUrl" type="primary" @click="downloadPDF">
          {{ $t('accident.downloadPDF') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="previewUrls"
      :initial-index="previewIndex"
      @close="previewVisible = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import {
  Warning,
  Plus,
  Document,
  Edit,
  Check,
  Location,
  Picture,
  Delete,
  ZoomIn
} from '@element-plus/icons-vue'

export default {
  name: 'AccidentReport',
  components: {
    Warning,
    Plus,
    Document,
    Edit,
    Check,
    Location,
    Picture,
    Delete,
    ZoomIn
  },
  setup() {
    const store = useStore()
    const { t } = useI18n()

    const loading = ref(false)
    const saving = ref(false)
    const reports = ref([])
    const selectedStatus = ref('')
    const dateRange = ref([])
    const currentPage = ref(1)
    const pageSize = ref(12)
    const totalReports = ref(0)

    const reportDialogVisible = ref(false)
    const detailDialogVisible = ref(false)
    const isEditing = ref(false)
    const selectedReport = ref(null)
    const reportPhotos = ref([])

    const previewVisible = ref(false)
    const previewUrls = ref([])
    const previewIndex = ref(0)

    const photoList = ref([])
    const reportForm = ref(null)

    const reportFormData = reactive({
      accidentTime: null,
      accidentLocation: '',
      description: '',
      otherPartyInfo: ''
    })

    const reportRules = computed(() => ({
      accidentTime: [
        { required: true, message: t('accident.pleaseSelectAccidentTime'), trigger: 'change' }
      ],
      accidentLocation: [
        { required: true, message: t('accident.pleaseEnterAccidentLocation'), trigger: 'blur' }
      ]
    }))

    // 计算统计数据
    const draftReports = computed(() => {
      return reports.value.filter(r => r.status === 'draft').length
    })

    const submittedReports = computed(() => {
      return reports.value.filter(r => r.status === 'submitted').length
    })

    // 上传配置
    const uploadUrl = computed(() => {
      return `${import.meta.env.VITE_API_BASE_URL}/accidents/${selectedReport.value?.id || 'temp'}/photos`
    })

    const uploadHeaders = computed(() => {
      const token = store.getters['auth/token']
      return token ? { Authorization: `Bearer ${token}` } : {}
    })

    const uploadData = computed(() => ({
      photoType: 'scene',
      caption: ''
    }))

    // 获取事故报告列表
    const fetchReports = async () => {
      try {
        loading.value = true
        const params = {
          page: currentPage.value,
          limit: pageSize.value
        }

        if (selectedStatus.value) {
          params.status = selectedStatus.value
        }

        if (dateRange.value && dateRange.value.length === 2) {
          params.startDate = dateRange.value[0].toISOString()
          params.endDate = dateRange.value[1].toISOString()
        }

        const response = await api.accidents.getAll(params)
        reports.value = response.data.reports
        totalReports.value = response.data.pagination.total
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error(t('accident.fetchReportsFailed'))
      } finally {
        loading.value = false
      }
    }

    // 获取报告详情
    const fetchReportDetail = async (reportId) => {
      try {
        const response = await api.accidents.getById(reportId)
        selectedReport.value = response.data
        reportPhotos.value = response.data.photos || []
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error(t('accident.fetchReportDetailFailed'))
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        'draft': 'info',
        'submitted': 'success',
        'archived': 'warning'
      }
      return typeMap[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const textMap = {
        'draft': t('accident.draft'),
        'submitted': t('accident.submitted'),
        'archived': t('accident.archived')
      }
      return textMap[status] || t('accident.unknown')
    }

    // 筛选处理
    const handleStatusChange = () => {
      currentPage.value = 1
      fetchReports()
    }

    const handleDateChange = () => {
      currentPage.value = 1
      fetchReports()
    }

    const clearFilters = () => {
      selectedStatus.value = ''
      dateRange.value = []
      currentPage.value = 1
      fetchReports()
    }

    // 分页处理
    const handleSizeChange = (newSize) => {
      pageSize.value = newSize
      currentPage.value = 1
      fetchReports()
    }

    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage
      fetchReports()
    }

    // 创建新报告
    const createNewReport = () => {
      isEditing.value = false
      selectedReport.value = null
      Object.assign(reportFormData, {
        accidentTime: null,
        accidentLocation: '',
        description: '',
        otherPartyInfo: ''
      })
      photoList.value = []
      reportDialogVisible.value = true
    }

    // 编辑报告
    const editReport = async (report) => {
      isEditing.value = true
      selectedReport.value = report

      Object.assign(reportFormData, {
        accidentTime: new Date(report.accidentTime),
        accidentLocation: report.accidentLocation || '',
        description: report.description || '',
        otherPartyInfo: report.otherPartyInfo || ''
      })

      // 获取照片列表
      await fetchReportDetail(report.id)
      photoList.value = reportPhotos.value.map(photo => ({
        name: photo.caption || 'photo',
        url: photo.imageUrl,
        uid: photo.id
      }))

      reportDialogVisible.value = true
      detailDialogVisible.value = false
    }

    // 查看报告
    const viewReport = async (report) => {
      await fetchReportDetail(report.id)
      detailDialogVisible.value = true
    }

    // 删除报告
    const deleteReport = async (report) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除事故报告"${report.accidentLocation || '未知地点'}"吗？`,
          '确认删除',
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )

        await api.accidents.delete(report.id)
        ElMessage.success(t('messages.success'))

        // 从列表中移除
        const index = reports.value.findIndex(r => r.id === report.id)
        if (index > -1) {
          reports.value.splice(index, 1)
          totalReports.value--
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error:', error)
          ElMessage.error(t('messages.error'))
        }
      }
    }

    // 保存草稿
    const saveDraft = async () => {
      if (!reportForm.value) return

      try {
        const valid = await reportForm.value.validate()
        if (!valid) return

        saving.value = true

        const data = {
          ...reportFormData,
          status: 'draft'
        }

        if (isEditing.value && selectedReport.value) {
          await api.accidents.update(selectedReport.value.id, data)
          ElMessage.success(t('messages.success'))
        } else {
          const response = await api.accidents.create(data)
          ElMessage.success(t('messages.success'))
          selectedReport.value = { id: response.data.reportId }
        }

        reportDialogVisible.value = false
        fetchReports()
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error(t('messages.error'))
      } finally {
        saving.value = false
      }
    }

    // 提交报告
    const submitReport = async () => {
      if (!reportForm.value) return

      try {
        const valid = await reportForm.value.validate()
        if (!valid) return

        saving.value = true

        const data = {
          ...reportFormData,
          status: 'submitted'
        }

        if (isEditing.value && selectedReport.value) {
          await api.accidents.update(selectedReport.value.id, data)
          ElMessage.success(t('messages.success'))
        } else {
          await api.accidents.create(data)
          ElMessage.success(t('messages.success'))
        }

        reportDialogVisible.value = false
        fetchReports()
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error(t('messages.error'))
      } finally {
        saving.value = false
      }
    }

    // 照片上传处理
    const beforePhotoUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        ElMessage.error(t('messages.error'))
        return false
      }
      if (!isLt10M) {
        ElMessage.error(t('messages.error'))
        return false
      }
      return true
    }

    const handlePhotoSuccess = (response) => {
      if (response.success) {
        ElMessage.success(t('messages.success'))
      } else {
        ElMessage.error(t('messages.error'))
      }
    }

    const handlePhotoRemove = (file) => {
      if (file.uid && selectedReport.value) {
        // 删除服务器上的照片
        api.accidents.deletePhoto(selectedReport.value.id, file.uid)
          .catch(error => {
            console.error('Error:', error)
          })
      }
    }

    // 预览照片
    const previewPhoto = (photo) => {
      previewUrls.value = reportPhotos.value.map(p => p.imageUrl)
      previewIndex.value = reportPhotos.value.findIndex(p => p.id === photo.id)
      previewVisible.value = true
    }

    // 下载PDF
    const downloadPDF = () => {
      if (selectedReport.value?.pdfUrl) {
        window.open(selectedReport.value.pdfUrl, '_blank')
      } else {
        ElMessage.info(t('messages.info'))
      }
    }

    // 关闭对话框
    const handleCloseReportDialog = () => {
      reportDialogVisible.value = false
    }

    const handleCloseDetailDialog = () => {
      detailDialogVisible.value = false
      selectedReport.value = null
      reportPhotos.value = []
    }

    onMounted(() => {
      fetchReports()
    })

    return {
      loading,
      saving,
      reports,
      selectedStatus,
      dateRange,
      currentPage,
      pageSize,
      totalReports,
      draftReports,
      submittedReports,
      reportDialogVisible,
      detailDialogVisible,
      isEditing,
      selectedReport,
      reportPhotos,
      previewVisible,
      previewUrls,
      previewIndex,
      photoList,
      reportForm,
      reportFormData,
      reportRules,
      uploadUrl,
      uploadHeaders,
      uploadData,
      formatDate,
      getStatusType,
      getStatusText,
      handleStatusChange,
      handleDateChange,
      clearFilters,
      handleSizeChange,
      handleCurrentChange,
      createNewReport,
      editReport,
      viewReport,
      deleteReport,
      saveDraft,
      submitReport,
      beforePhotoUpload,
      handlePhotoSuccess,
      handlePhotoRemove,
      previewPhoto,
      downloadPDF,
      handleCloseReportDialog,
      handleCloseDetailDialog,
      // 图标
      Warning,
      Plus,
      Document,
      Edit,
      Check,
      Location,
      Picture,
      Delete,
      ZoomIn
    }
  }
}
</script>

<style lang="scss" scoped>
.accident-report-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-subtitle {
    font-size: 16px;
    color: var(--el-text-color-regular);
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;

  &.total { background: var(--el-color-warning); }
  &.draft { background: var(--el-color-info); }
  &.submitted { background: var(--el-color-success); }
}

.stat-content {
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  .stat-label {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin-top: 4px;
  }
}

.filter-section {
  margin-bottom: 24px;
}

.filter-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.loading-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .empty-icon {
    font-size: 64px;
    color: var(--el-text-color-placeholder);
    margin-bottom: 20px;
  }

  h3 {
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
  }

  p {
    color: var(--el-text-color-regular);
    margin-bottom: 20px;
  }
}

.reports-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.report-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.report-date {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.report-content {
  margin-bottom: 16px;
}

.report-location {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.report-description {
  color: var(--el-text-color-regular);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.photo-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-color-primary);
}

.created-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.report-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.photo-upload-section {
  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.report-detail-content {
  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;

    label {
      font-weight: 500;
      color: var(--el-text-color-regular);
      min-width: 80px;
    }

    span {
      color: var(--el-text-color-primary);
    }
  }

  .description-text {
    line-height: 1.6;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-lighter);
    padding: 16px;
    border-radius: 6px;
  }
}

.photos-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);

    .photo-overlay {
      opacity: 1;
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.3s;
}

@media (max-width: 768px) {
  .accident-report-page {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .photos-gallery {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .report-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
