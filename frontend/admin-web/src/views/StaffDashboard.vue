<template>
  <div class="dashboard-page py-4">
    <div class="container-fluid px-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="font-display fw-bold mb-1" style="font-size: 1.6rem;">
            <i class="fas fa-chart-line me-2 text-primary"></i>Dashboard Thống Kê
          </h2>
          <p class="text-muted mb-0 small">
            Tổng quan hệ thống thư viện — Cập nhật lúc {{ lastUpdated }}
          </p>
        </div>
        <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="fetchStats" :disabled="loading">
          <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
          Làm mới
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3 text-muted">Đang tải dữ liệu thống kê...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2">
        <i class="fas fa-exclamation-circle"></i>
        <div>
          <strong>Không thể tải dữ liệu:</strong> {{ error }}
          <button class="btn btn-sm btn-outline-danger ms-3" @click="fetchStats">Thử lại</button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- === KPI CARDS ROW === -->
        <div class="row g-3 mb-4">
          <!-- Tổng đầu sách -->
          <div class="col-6 col-md-3">
            <div class="kpi-card h-100" style="--accent: #6366f1;">
              <div class="kpi-icon" style="background: rgba(99,102,241,0.15); color: #6366f1;">
                <i class="fas fa-book fa-lg"></i>
              </div>
              <div class="kpi-body">
                <div class="kpi-label">Tổng Đầu Sách</div>
                <div class="kpi-value">{{ stats.tongQuan?.tongSach || 0 }}</div>
                <div class="kpi-sub text-muted">đầu sách trong kho</div>
              </div>
            </div>
          </div>

          <!-- Tổng độc giả -->
          <div class="col-6 col-md-3">
            <div class="kpi-card h-100" style="--accent: #10b981;">
              <div class="kpi-icon" style="background: rgba(16,185,129,0.15); color: #10b981;">
                <i class="fas fa-users fa-lg"></i>
              </div>
              <div class="kpi-body">
                <div class="kpi-label">Tổng Độc Giả</div>
                <div class="kpi-value">{{ stats.tongQuan?.tongDocGia || 0 }}</div>
                <div class="kpi-sub">
                  <span class="text-danger fw-semibold">{{ stats.tongQuan?.docGiaBiKhoa || 0 }}</span>
                  <span class="text-muted"> bị khóa</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Đang mượn -->
          <div class="col-6 col-md-3">
            <div class="kpi-card h-100" style="--accent: #3b82f6;">
              <div class="kpi-icon" style="background: rgba(59,130,246,0.15); color: #3b82f6;">
                <i class="fas fa-book-reader fa-lg"></i>
              </div>
              <div class="kpi-body">
                <div class="kpi-label">Đang Mượn</div>
                <div class="kpi-value">{{ stats.tongQuan?.dangMuon || 0 }}</div>
                <div class="kpi-sub text-muted">{{ stats.tongQuan?.tongSoQuyenDangMuon || 0 }} quyển ngoài kho</div>
              </div>
            </div>
          </div>

          <!-- Chờ duyệt & Quá hạn -->
          <div class="col-6 col-md-3">
            <div class="kpi-card h-100" style="--accent: #f59e0b;">
              <div class="kpi-icon" style="background: rgba(245,158,11,0.15); color: #f59e0b;">
                <i class="fas fa-exclamation-triangle fa-lg"></i>
              </div>
              <div class="kpi-body">
                <div class="kpi-label">Cần Xử Lý</div>
                <div class="kpi-value">{{ (stats.tongQuan?.choDuyet || 0) + (stats.tongQuan?.quaHan || 0) }}</div>
                <div class="kpi-sub">
                  <span class="text-warning fw-semibold">{{ stats.tongQuan?.choDuyet || 0 }}</span>
                  <span class="text-muted"> chờ</span> &bull;
                  <span class="text-danger fw-semibold">{{ stats.tongQuan?.quaHan || 0 }}</span>
                  <span class="text-muted"> quá hạn</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- === CHARTS ROW === -->
        <div class="row g-4 mb-4">
          <!-- Line Chart: Mượn theo tháng -->
          <div class="col-12 col-lg-8">
            <div class="chart-card h-100">
              <div class="chart-card-header">
                <div>
                  <h6 class="chart-title mb-0">
                    <i class="fas fa-chart-area me-2 text-primary"></i>Hoạt Động Mượn Sách (6 tháng)
                  </h6>
                  <p class="chart-subtitle mb-0">Số phiếu mượn và số quyển sách mượn mỗi tháng</p>
                </div>
              </div>
              <div class="chart-body" style="height: 260px;">
                <canvas ref="lineChartRef"></canvas>
              </div>
            </div>
          </div>

          <!-- Doughnut Chart: Trạng thái phiếu mượn -->
          <div class="col-12 col-lg-4">
            <div class="chart-card h-100">
              <div class="chart-card-header">
                <div>
                  <h6 class="chart-title mb-0">
                    <i class="fas fa-chart-pie me-2 text-success"></i>Phân Bổ Trạng Thái
                  </h6>
                  <p class="chart-subtitle mb-0">Tổng phiếu mượn theo trạng thái</p>
                </div>
              </div>
              <div class="chart-body d-flex align-items-center justify-content-center" style="height: 260px;">
                <canvas ref="doughnutChartRef" style="max-width: 220px; max-height: 220px;"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- === TOP SÁCH + TRẠNG THÁI CHI TIẾT === -->
        <div class="row g-4">
          <!-- Bar Chart: Top sách -->
          <div class="col-12 col-lg-7">
            <div class="chart-card h-100">
              <div class="chart-card-header">
                <div>
                  <h6 class="chart-title mb-0">
                    <i class="fas fa-trophy me-2 text-warning"></i>Top Sách Được Mượn Nhiều Nhất
                  </h6>
                  <p class="chart-subtitle mb-0">Tính theo tổng số lượng quyển đã được mượn</p>
                </div>
              </div>
              <div class="chart-body" style="height: 280px;">
                <canvas ref="barChartRef"></canvas>
              </div>
            </div>
          </div>

          <!-- Status Detail Table -->
          <div class="col-12 col-lg-5">
            <div class="chart-card h-100">
              <div class="chart-card-header">
                <div>
                  <h6 class="chart-title mb-0">
                    <i class="fas fa-list-check me-2 text-info"></i>Chi Tiết Theo Trạng Thái
                  </h6>
                  <p class="chart-subtitle mb-0">Số phiếu mượn chia theo từng trạng thái</p>
                </div>
              </div>
              <div class="chart-body">
                <div class="status-list">
                  <div
                    v-for="item in statusDetailList"
                    :key="item.key"
                    class="status-row"
                  >
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="status-dot" :style="{ background: item.color }"></span>
                      <span class="status-name">{{ item.label }}</span>
                      <span class="ms-auto status-count fw-bold" :style="{ color: item.color }">
                        {{ item.count }}
                      </span>
                    </div>
                    <div class="progress" style="height: 6px; border-radius: 99px;">
                      <div
                        class="progress-bar"
                        :style="{
                          width: totalPhieuMuon > 0 ? (item.count / totalPhieuMuon * 100) + '%' : '0%',
                          background: item.color
                        }"
                      ></div>
                    </div>
                  </div>

                  <div class="mt-3 pt-3 border-top text-center">
                    <small class="text-muted">
                      Tổng: <strong class="text-dark">{{ totalPhieuMuon }}</strong> phiếu mượn trong hệ thống
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions row -->
        <div class="row g-3 mt-2">
          <div class="col-12">
            <div class="quick-actions-bar">
              <span class="quick-title">Lối tắt nhanh:</span>
              <router-link to="/muonsach" class="quick-btn">
                <i class="fas fa-clock me-1"></i>Phiếu chờ duyệt
                <span v-if="stats.tongQuan?.choDuyet" class="badge bg-warning text-dark ms-1">{{ stats.tongQuan.choDuyet }}</span>
              </router-link>
              <router-link to="/muonsach" class="quick-btn">
                <i class="fas fa-exclamation-triangle me-1 text-danger"></i>Quá hạn
                <span v-if="stats.tongQuan?.quaHan" class="badge bg-danger ms-1">{{ stats.tongQuan.quaHan }}</span>
              </router-link>
              <router-link to="/docgia" class="quick-btn">
                <i class="fas fa-user-lock me-1 text-secondary"></i>Tài khoản bị khóa
                <span v-if="stats.tongQuan?.docGiaBiKhoa" class="badge bg-secondary ms-1">{{ stats.tongQuan.docGiaBiKhoa }}</span>
              </router-link>
              <router-link to="/sach" class="quick-btn">
                <i class="fas fa-book me-1 text-primary"></i>Quản lý sách
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  Chart,
  LineElement, BarElement, ArcElement,
  PointElement, LinearScale, CategoryScale,
  Tooltip, Legend, Filler,
  DoughnutController, LineController, BarController
} from 'chart.js'
import DashboardService from '@/services/dashboard.service'

// Register Chart.js components
Chart.register(
  LineElement, BarElement, ArcElement,
  PointElement, LinearScale, CategoryScale,
  Tooltip, Legend, Filler,
  DoughnutController, LineController, BarController
)

// Refs
const lineChartRef = ref(null)
const doughnutChartRef = ref(null)
const barChartRef = ref(null)

let lineChart = null
let doughnutChart = null
let barChart = null

const loading = ref(true)
const error = ref(null)
const stats = ref({})
const lastUpdated = ref('')

// ========== Status detail config ==========
const STATUS_CONFIG = [
  { key: 'chờ duyệt',     label: 'Chờ Duyệt',       color: '#f59e0b' },
  { key: 'đã duyệt',      label: 'Đã Duyệt',         color: '#3b82f6' },
  { key: 'đang mượn',     label: 'Đang Mượn',         color: '#6366f1' },
  { key: 'đang chờ trả',  label: 'Đang Chờ Trả',     color: '#8b5cf6' },
  { key: 'đã trả',        label: 'Đã Trả',            color: '#10b981' },
  { key: 'quá hạn',       label: 'Quá Hạn',           color: '#ef4444' },
  { key: 'từ chối',       label: 'Từ Chối',           color: '#6b7280' },
]

const statusDetailList = computed(() => {
  const detail = stats.value?.chiTietTrangThai || {}
  return STATUS_CONFIG.map(cfg => ({
    ...cfg,
    count: detail[cfg.key]?.count || 0,
  }))
})

const totalPhieuMuon = computed(() =>
  statusDetailList.value.reduce((sum, s) => sum + s.count, 0)
)

// ========== Chart helpers ==========
function destroyCharts() {
  if (lineChart) { lineChart.destroy(); lineChart = null }
  if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null }
  if (barChart) { barChart.destroy(); barChart = null }
}

function buildLineChart(data) {
  if (!lineChartRef.value) return
  const ctx = lineChartRef.value.getContext('2d')

  // Tạo danh sách 6 tháng gần nhất
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const labelMap = {}
  ;(data || []).forEach(row => { labelMap[row._id] = row })

  const phieuData = months.map(m => labelMap[m]?.soPhieuMuon || 0)
  const quyenData = months.map(m => labelMap[m]?.soSachMuon || 0)

  const labels = months.map(m => {
    const [y, mo] = m.split('-')
    return `T${parseInt(mo)}/${y}`
  })

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Số phiếu mượn',
          data: phieuData,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.12)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Số quyển sách',
          data: quyenData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } } },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  })
}

function buildDoughnutChart() {
  if (!doughnutChartRef.value) return
  const ctx = doughnutChartRef.value.getContext('2d')

  const labels = statusDetailList.value.filter(s => s.count > 0).map(s => s.label)
  const data   = statusDetailList.value.filter(s => s.count > 0).map(s => s.count)
  const colors = statusDetailList.value.filter(s => s.count > 0).map(s => s.color)

  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw} phiếu`
          }
        },
      },
    },
  })
}

function buildBarChart(topSach) {
  if (!barChartRef.value) return
  const ctx = barChartRef.value.getContext('2d')

  const top = (topSach || []).slice(0, 7)
  const labels = top.map(s => {
    const name = s.tenSach || 'Không xác định'
    return name.length > 22 ? name.substring(0, 22) + '…' : name
  })
  const data   = top.map(s => s.soLanMuon || 0)

  const gradient = ctx.createLinearGradient(0, 0, 0, 250)
  gradient.addColorStop(0, 'rgba(99,102,241,0.9)')
  gradient.addColorStop(1, 'rgba(139,92,246,0.5)')

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Số quyển mượn',
        data,
        backgroundColor: gradient,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 28,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} quyển mượn`
          }
        },
      },
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  })
}

// ========== Data fetching ==========
const fetchStats = async () => {
  loading.value = true
  error.value = null
  destroyCharts()

  try {
    const res = await DashboardService.getStats()
    stats.value = res.data

    const now = new Date()
    lastUpdated.value = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

    loading.value = false
    await nextTick()

    buildLineChart(stats.value.muonTheoThang)
    buildDoughnutChart()
    buildBarChart(stats.value.topSach)
  } catch (err) {
    loading.value = false
    error.value = err.response?.data?.message || err.message || 'Lỗi không xác định'
  }
}

onMounted(fetchStats)
onBeforeUnmount(destroyCharts)
</script>

<style scoped>
.dashboard-page {
  background: #f8f9fb;
  min-height: 100vh;
}

/* ---- KPI Cards ---- */
.kpi-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.2rem 1.4rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  border: 1px solid #e9ecef;
  transition: transform 0.18s, box-shadow 0.18s;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
}
.kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-body { flex: 1; }
.kpi-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  margin-bottom: 2px;
}
.kpi-value {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
  margin-bottom: 2px;
}
.kpi-sub { font-size: 0.75rem; }

/* ---- Chart Cards ---- */
.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}
.chart-card-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}
.chart-title {
  font-weight: 700;
  color: #111827;
  font-size: 0.88rem;
}
.chart-subtitle {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 2px;
}
.chart-body {
  flex: 1;
  position: relative;
}

/* ---- Status Detail List ---- */
.status-list { padding: 0.25rem 0; }
.status-row { margin-bottom: 0.85rem; }
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
.status-name { font-size: 0.82rem; color: #374151; }
.status-count { font-size: 0.88rem; }

/* ---- Quick Actions ---- */
.quick-actions-bar {
  background: #fff;
  border-radius: 14px;
  padding: 0.85rem 1.2rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid #e9ecef;
}
.quick-title {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 0.25rem;
}
.quick-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.85rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  background: #f3f4f6;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  border: 1px solid #e5e7eb;
}
.quick-btn:hover {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
}
</style>
