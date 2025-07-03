<template>
  <div class="schools-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon><School /></el-icon>
            {{ $t('schools.title') }}
          </h1>
          <p class="page-subtitle">{{ $t('schools.subtitle') }}</p>
        </div>
        <div class="header-actions">
          <el-button @click="getCurrentLocation" :loading="locating">
            <el-icon><Location /></el-icon>
            {{ locating ? $t('schools.locating') : $t('schools.getLocation') }}
          </el-button>
          <el-button @click="refreshSchools" :loading="loading">
            <el-icon><Refresh /></el-icon>
            {{ $t('common.refresh') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="filter-card">
        <div class="filter-content">
          <el-input
            v-model="searchKeyword"
            :placeholder="$t('schools.searchPlaceholder')"
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
            style="width: 300px"
          />
          <el-select
            v-model="filterPartner"
            :placeholder="$t('schools.filterType')"
            clearable
            @change="handlePartnerFilter"
            style="width: 150px"
          >
            <el-option :label="$t('schools.partnerSchool')" :value="true" />
            <el-option :label="$t('schools.regularSchool')" :value="false" />
          </el-select>
          <el-select
            v-model="sortBy"
            :placeholder="$t('schools.sortBy')"
            @change="handleSort"
            style="width: 150px"
          >
            <el-option :label="$t('schools.defaultSort')" value="default" />
            <el-option :label="$t('schools.nearestDistance')" value="distance" />
            <el-option :label="$t('schools.nameSort')" value="name" />
          </el-select>
          <el-button @click="clearFilters">{{ $t('schools.clearFilters') }}</el-button>
        </div>
      </div>
    </div>

    <!-- 位置信息 -->
    <div v-if="userLocation" class="location-info">
      <div class="location-card">
        <el-icon><LocationInformation /></el-icon>
        <span>{{ $t('schools.currentLocation') }}: {{ userLocation.address || $t('schools.locationObtained') }}</span>
        <el-button size="small" @click="searchNearby" :disabled="loading">
          {{ $t('schools.searchNearby') }}
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="schools.length === 0" class="empty-state">
      <el-icon class="empty-icon"><School /></el-icon>
      <h3>{{ searchKeyword || filterPartner !== null ? $t('schools.noSchoolsFound') : $t('schools.noSchoolsInfo') }}</h3>
      <p>{{ searchKeyword || filterPartner !== null ? $t('schools.tryOtherConditions') : $t('schools.tryLaterOrContact') }}</p>
      <el-button type="primary" @click="clearFilters">
        {{ $t('schools.searchAgain') }}
      </el-button>
    </div>

    <!-- 驾校列表 -->
    <div v-else class="schools-container">
      <div class="schools-grid">
        <div
          v-for="school in schools"
          :key="school.id"
          class="school-card"
          @click="viewSchoolDetail(school)"
        >
          <div class="school-header">
            <div class="school-logo">
              <img v-if="school.logoUrl" :src="school.logoUrl" :alt="school.name" />
              <el-icon v-else><School /></el-icon>
            </div>
            <div class="school-info">
              <h3 class="school-name">{{ school.name }}</h3>
              <div class="school-badges">
                <el-tag v-if="school.isPartner" type="success" size="small">
                  {{ $t('schools.partnerSchool') }}
                </el-tag>
                <span v-if="school.distance" class="distance-tag">
                  {{ formatDistance(school.distance) }}
                </span>
              </div>
            </div>
          </div>

          <div class="school-content">
            <div class="school-address">
              <el-icon><LocationInformation /></el-icon>
              <span>{{ school.address || $t('schools.addressNotProvided') }}</span>
            </div>
            <div v-if="school.description" class="school-description">
              {{ school.description }}
            </div>
          </div>

          <div class="school-footer">
            <div class="contact-info">
              <div v-if="school.phone" class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>{{ school.phone }}</span>
              </div>
              <div v-if="school.lineId" class="contact-item">
                <el-icon><ChatLineSquare /></el-icon>
                <span>Line: {{ school.lineId }}</span>
              </div>
            </div>
            <div class="school-actions">
              <el-button
                size="small"
                @click.stop="callSchool(school)"
                :disabled="!school.phone"
              >
                <el-icon><Phone /></el-icon>
                {{ $t('schools.makeCall') }}
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click.stop="navigateToSchool(school)"
                :disabled="!school.latitude || !school.longitude"
              >
                <el-icon><Guide /></el-icon>
                {{ $t('schools.navigate') }}
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
          :total="totalSchools"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 驾校详情对话框 -->
    <el-dialog
      v-model="schoolDetailVisible"
      :title="selectedSchool?.name"
      width="800px"
      :before-close="handleCloseSchoolDetail"
    >
      <div v-if="selectedSchool" class="school-detail-content">
        <div class="detail-header">
          <div class="detail-logo">
            <img v-if="selectedSchool.logoUrl" :src="selectedSchool.logoUrl" :alt="selectedSchool.name" />
            <el-icon v-else><School /></el-icon>
          </div>
          <div class="detail-info">
            <h2 class="detail-name">{{ selectedSchool.name }}</h2>
            <div class="detail-badges">
              <el-tag v-if="selectedSchool.isPartner" type="success">
                {{ $t('schools.partnerSchool') }}
              </el-tag>
              <span v-if="selectedSchool.distance" class="distance-info">
                {{ $t('schools.distanceFromYou', { distance: formatDistance(selectedSchool.distance) }) }}
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>{{ $t('schools.basicInfo') }}</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>{{ $t('schools.address') }}:</label>
              <span>{{ selectedSchool.address || $t('schools.notProvided') }}</span>
            </div>
            <div class="detail-item">
              <label>{{ $t('schools.phone') }}:</label>
              <span>{{ selectedSchool.phone || $t('schools.notProvided') }}</span>
            </div>
            <div class="detail-item">
              <label>Line ID:</label>
              <span>{{ selectedSchool.lineId || $t('schools.notProvided') }}</span>
            </div>
            <div class="detail-item">
              <label>{{ $t('schools.website') }}:</label>
              <span v-if="selectedSchool.websiteUrl">
                <el-link :href="selectedSchool.websiteUrl" target="_blank" type="primary">
                  {{ $t('schools.visitWebsite') }}
                </el-link>
              </span>
              <span v-else>{{ $t('schools.notProvided') }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedSchool.description" class="detail-section">
          <h4>{{ $t('schools.schoolIntroduction') }}</h4>
          <p class="description-text">{{ selectedSchool.description }}</p>
        </div>

        <div v-if="selectedSchool.latitude && selectedSchool.longitude" class="detail-section">
          <h4>{{ $t('schools.locationInfo') }}</h4>
          <div class="map-placeholder">
            <el-icon><LocationInformation /></el-icon>
            <p>{{ $t('schools.mapInDevelopment') }}</p>
            <p>{{ $t('schools.coordinates') }}: {{ selectedSchool.latitude }}, {{ selectedSchool.longitude }}</p>
          </div>
        </div>

        <div class="detail-actions">
          <el-button
            v-if="selectedSchool.phone"
            @click="callSchool(selectedSchool)"
          >
            <el-icon><Phone /></el-icon>
            {{ $t('schools.makeCall') }}
          </el-button>
          <el-button
            v-if="selectedSchool.latitude && selectedSchool.longitude"
            type="primary"
            @click="navigateToSchool(selectedSchool)"
          >
            <el-icon><Guide /></el-icon>
            {{ $t('schools.navigateToSchool') }}
          </el-button>
          <el-button
            v-if="selectedSchool.websiteUrl"
            @click="visitWebsite(selectedSchool)"
          >
            <el-icon><Link /></el-icon>
            {{ $t('schools.visitWebsite') }}
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="schoolDetailVisible = false">{{ $t('common.close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '@/api'
import {
  School,
  Location,
  Refresh,
  Search,
  LocationInformation,
  Phone,
  ChatLineSquare,
  Guide,
  Link
} from '@element-plus/icons-vue'

export default {
  name: 'Schools',
  components: {
    School,
    Location,
    Refresh,
    Search,
    LocationInformation,
    Phone,
    ChatLineSquare,
    Guide,
    Link
  },
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const locating = ref(false)
    const schools = ref([])
    const searchKeyword = ref('')
    const filterPartner = ref(null)
    const sortBy = ref('default')
    const currentPage = ref(1)
    const pageSize = ref(12)
    const totalSchools = ref(0)
    
    const schoolDetailVisible = ref(false)
    const selectedSchool = ref(null)
    
    const userLocation = ref(null)

    // 获取驾校列表
    const fetchSchools = async () => {
      try {
        loading.value = true
        const params = {
          page: currentPage.value,
          limit: pageSize.value
        }

        if (searchKeyword.value) {
          params.search = searchKeyword.value
        }

        if (filterPartner.value !== null) {
          params.isPartner = filterPartner.value
        }

        // 如果有用户位置且选择距离排序，添加位置参数
        if (userLocation.value && sortBy.value === 'distance') {
          params.lat = userLocation.value.latitude
          params.lng = userLocation.value.longitude
          params.radius = 50 // 50公里范围
        }

        const response = await api.schools.getAll(params)
        schools.value = response.data.schools
        totalSchools.value = response.data.pagination.total

        // 如果有用户位置，计算距离
        if (userLocation.value) {
          schools.value.forEach(school => {
            if (school.latitude && school.longitude) {
              school.distance = calculateDistance(
                userLocation.value.latitude,
                userLocation.value.longitude,
                school.latitude,
                school.longitude
              )
            }
          })

          // 如果选择距离排序，重新排序
          if (sortBy.value === 'distance') {
            schools.value.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
          }
        }
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error(t('schools.fetchSchoolsFailed'))
      } finally {
        loading.value = false
      }
    }

    // 计算两点间距离（使用 Haversine 公式）
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371 // 地球半径（公里）
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    // 格式化距离
    const formatDistance = (distance) => {
      if (!distance) return ''
      if (distance < 1) {
        return `${Math.round(distance * 1000)}${t('schools.meters')}`
      } else {
        return `${distance.toFixed(1)}${t('schools.kilometers')}`
      }
    }

    // 获取当前位置
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        ElMessage.error(t('schools.geolocationNotSupported'))
        return
      }

      locating.value = true
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          
          // 尝试获取地址信息（这里可以集成地图API）
          userLocation.value.address = `${t('schools.latitude')}: ${position.coords.latitude.toFixed(4)}, ${t('schools.longitude')}: ${position.coords.longitude.toFixed(4)}`

          ElMessage.success(t('schools.locationSuccess'))
          locating.value = false
          
          // 重新获取驾校列表以计算距离
          fetchSchools()
        },
        (error) => {
          console.error('Error:', error)
          let message = t('schools.locationFailed')
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = t('schools.locationPermissionDenied')
              break
            case error.POSITION_UNAVAILABLE:
              message = t('schools.locationUnavailable')
              break
            case error.TIMEOUT:
              message = t('schools.locationTimeout')
              break
          }
          ElMessage.error(message)
          locating.value = false
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5分钟缓存
        }
      )
    }

    // 搜索附近驾校
    const searchNearby = async () => {
      if (!userLocation.value) {
        ElMessage.warning(t('schools.pleaseGetLocationFirst'))
        return
      }

      try {
        loading.value = true
        const response = await api.schools.getNearby({
          lat: userLocation.value.latitude,
          lng: userLocation.value.longitude,
          radius: 20 // 20公里范围
        })

        schools.value = response.data.schools
        totalSchools.value = response.data.schools.length

        // 计算并添加距离信息
        schools.value.forEach(school => {
          if (school.latitude && school.longitude) {
            school.distance = calculateDistance(
              userLocation.value.latitude,
              userLocation.value.longitude,
              school.latitude,
              school.longitude
            )
          }
        })

        // 按距离排序
        schools.value.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))

        ElMessage.success(t('schools.foundNearbySchools', { count: schools.value.length }))
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error(t('schools.searchNearbyFailed'))
      } finally {
        loading.value = false
      }
    }

    // 搜索处理
    const handleSearch = () => {
      currentPage.value = 1
      fetchSchools()
    }

    // 合作伙伴筛选
    const handlePartnerFilter = () => {
      currentPage.value = 1
      fetchSchools()
    }

    // 排序处理
    const handleSort = () => {
      if (sortBy.value === 'distance' && !userLocation.value) {
        ElMessage.warning(t('messages.warning'))
        sortBy.value = 'default'
        return
      }
      fetchSchools()
    }

    // 清除筛选
    const clearFilters = () => {
      searchKeyword.value = ''
      filterPartner.value = null
      sortBy.value = 'default'
      currentPage.value = 1
      fetchSchools()
    }

    // 分页处理
    const handleSizeChange = (newSize) => {
      pageSize.value = newSize
      currentPage.value = 1
      fetchSchools()
    }

    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage
      fetchSchools()
    }

    // 查看驾校详情
    const viewSchoolDetail = (school) => {
      selectedSchool.value = school
      schoolDetailVisible.value = true
    }

    // 拨打电话
    const callSchool = (school) => {
      if (school.phone) {
        window.location.href = `tel:${school.phone}`
      } else {
        ElMessage.warning(t('messages.warning'))
      }
    }

    // 导航到驾校
    const navigateToSchool = (school) => {
      if (school.latitude && school.longitude) {
        const url = `https://www.google.com/maps?q=${school.latitude},${school.longitude}`
        window.open(url, '_blank')
      } else {
        ElMessage.warning(t('messages.warning'))
      }
    }

    // 访问网站
    const visitWebsite = (school) => {
      if (school.websiteUrl) {
        window.open(school.websiteUrl, '_blank')
      } else {
        ElMessage.warning(t('messages.warning'))
      }
    }

    // 刷新驾校列表
    const refreshSchools = () => {
      fetchSchools()
    }

    // 关闭详情对话框
    const handleCloseSchoolDetail = () => {
      schoolDetailVisible.value = false
      selectedSchool.value = null
    }

    onMounted(() => {
      fetchSchools()
    })

    return {
      loading,
      locating,
      schools,
      searchKeyword,
      filterPartner,
      sortBy,
      currentPage,
      pageSize,
      totalSchools,
      schoolDetailVisible,
      selectedSchool,
      userLocation,
      formatDistance,
      getCurrentLocation,
      searchNearby,
      handleSearch,
      handlePartnerFilter,
      handleSort,
      clearFilters,
      handleSizeChange,
      handleCurrentChange,
      viewSchoolDetail,
      callSchool,
      navigateToSchool,
      visitWebsite,
      refreshSchools,
      handleCloseSchoolDetail,
      // 图标
      School,
      Location,
      Refresh,
      Search,
      LocationInformation,
      Phone,
      ChatLineSquare,
      Guide,
      Link
    }
  }
}
</script>

<style lang="scss" scoped>
.schools-page {
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

.header-actions {
  display: flex;
  gap: 12px;
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

.location-info {
  margin-bottom: 24px;
}

.location-card {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--el-color-primary);

  .el-icon {
    font-size: 20px;
  }

  span {
    flex: 1;
    font-weight: 500;
  }
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

.schools-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.schools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.school-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.school-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.school-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .el-icon {
    font-size: 28px;
    color: var(--el-text-color-placeholder);
  }
}

.school-info {
  flex: 1;
}

.school-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  line-height: 1.3;
}

.school-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.distance-tag {
  font-size: 12px;
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
  padding: 2px 6px;
  border-radius: 4px;
}

.school-content {
  margin-bottom: 16px;
}

.school-address {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--el-text-color-regular);

  .el-icon {
    color: var(--el-color-primary);
  }
}

.school-description {
  color: var(--el-text-color-regular);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.school-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-regular);

  .el-icon {
    color: var(--el-color-primary);
  }
}

.school-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.school-detail-content {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .detail-logo {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    background: var(--el-fill-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .el-icon {
      font-size: 36px;
      color: var(--el-text-color-placeholder);
    }
  }

  .detail-info {
    flex: 1;
  }

  .detail-name {
    font-size: 24px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
  }

  .detail-badges {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .distance-info {
    font-size: 14px;
    color: var(--el-color-info);
    background: var(--el-color-info-light-9);
    padding: 4px 8px;
    border-radius: 4px;
  }

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
      min-width: 60px;
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

  .map-placeholder {
    text-align: center;
    padding: 40px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    color: var(--el-text-color-regular);

    .el-icon {
      font-size: 48px;
      color: var(--el-text-color-placeholder);
      margin-bottom: 12px;
    }

    p {
      margin: 8px 0;
    }
  }

  .detail-actions {
    display: flex;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

@media (max-width: 768px) {
  .schools-page {
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

  .schools-grid {
    grid-template-columns: 1fr;
  }

  .school-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .detail-header {
    flex-direction: column;
    text-align: center;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
