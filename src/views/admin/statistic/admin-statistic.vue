<template>
  <div class="admin-statistic">
    <!-- Tiêu đề trang -->
    <div class="page-header">
      <div class="header-content">
        <div class="icon-wrapper">
          <i class="fa-solid fa-chart-column"></i>
        </div>
        <div>
          <h1>Thống kê khách hàng</h1>
          <p class="subtitle">Theo dõi hoạt động và chi tiêu của khách hàng</p>
        </div>
      </div>
    </div>

    <el-card class="statistic-card" shadow="never">
      <!-- Bộ lọc thời gian -->
      <div class="controls">
        <el-radio-group v-model="quickOption" size="large" @change="applyQuickRange">
          <el-radio-button label="today">Hôm nay</el-radio-button>
          <el-radio-button label="week">7 ngày qua</el-radio-button>
          <el-radio-button label="month">30 ngày qua</el-radio-button>
        </el-radio-group>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          range-separator="đến"
          value-format="YYYY-MM-DDTHH:mm:ss"
          size="large"
        />
        <el-button type="primary" size="large" class="load-btn" @click="loadData">
          <i class="fa-solid fa-magnifying-glass-chart" style="margin-right: 5px"></i>
          <span>Thống kê</span>
        </el-button>
        <el-button type="success" size="large" @click="exportExcel" :disabled="!customers.length">
          <i class="fa-solid fa-file-excel" style="margin-right: 5px"></i>
          Xuất Excel
        </el-button>
        <el-button type="info" size="large" @click="printList" :disabled="!customers.length">
          <i class="fa-solid fa-print" style="margin-right: 5px"></i>
          In danh sách
        </el-button>
      </div>

      <!-- Bảng thống kê -->
      <el-table :data="customers" border stripe height="600" size="large" class="statistic-table">
        <el-table-column prop="code" label="Mã KH" width="140" />
        <el-table-column prop="fullName" label="Họ tên" min-width="180" />
        <el-table-column prop="email" label="Email" min-width="220" />
        <el-table-column prop="phone" label="SĐT" width="140" />
        <el-table-column prop="address" label="Địa chỉ" min-width="220" show-overflow-tooltip />
        <el-table-column prop="orderCount" label="Số đơn" width="90" align="center" />
        <el-table-column prop="totalSpent" label="Tổng chi (VNĐ)" width="160">
          <template #default="scope">
            <span class="price-text">{{ scope.row.totalSpent.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderDate" label="Ngày đặt" width="160">
          <template #default="scope">
            {{ scope.row.orderDate ? new Date(scope.row.orderDate).toLocaleDateString() : '—' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Thống kê tổng hợp -->
      <div class="summary">
        <div><strong>Số lượng khách hàng:</strong> {{ customers.length }}</div>
        <div><strong>Số lượng đơn hàng:</strong> {{ totalOrders }}</div>
        <div><strong>Tổng doanh thu:</strong> {{ totalRevenue.toLocaleString() }} VNĐ</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { getCustomerStatistic } from '@/api/stats'

const dateRange = ref([])
const customers = ref([])
const quickOption = ref('')

// Gọi API thống kê
async function loadData() {
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('Vui lòng chọn khoảng thời gian')
    return
  }
  try {
    const [from, to] = dateRange.value
    const res = await getCustomerStatistic(from, to)
    customers.value = Array.isArray(res) ? res : (res.data || [])
  } catch (err) {
    ElMessage.error('Không thể tải dữ liệu khách hàng')
  }
}

// Thống kê các thông số chung
const totalOrders = computed(() =>
  customers.value.reduce((sum, c) => sum + (c.orderCount || 0), 0)
)

const totalRevenue = computed(() =>
  customers.value.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
)

// Xuất Excel
function exportExcel() {
  if (!customers.value.length) {
    ElMessage.warning('Không có dữ liệu để xuất')
    return
  }

  // Chuẩn bị dữ liệu khách hàng
  const exportData = customers.value.map(c => ({
    'Mã KH': c.code,
    'Họ tên': c.fullName,
    'Địa chỉ': c.address || '',
    'SĐT': c.phone,
    'Số đơn': c.orderCount || 0,
    'Tổng chi (VNĐ)': c.totalSpent?.toLocaleString() || '0',
    'Ngày đặt': c.orderDate ? new Date(c.orderDate).toLocaleDateString() : '—'
  }))

  // Tính tổng hợp
  const totalCustomers = customers.value.length
  const totalOrders = customers.value.reduce((sum, c) => sum + (c.orderCount || 0), 0)
  const totalRevenue = customers.value.reduce((sum, c) => sum + (c.totalSpent || 0), 0)

  // Thêm dòng trống và dòng tổng vào cuối file
  exportData.push({})
  exportData.push({ 'Mã KH': 'Tổng khách hàng:', 'Họ tên': totalCustomers })
  exportData.push({ 'Mã KH': 'Tổng đơn hàng:', 'Họ tên': totalOrders })
  exportData.push({ 'Mã KH': 'Tổng doanh thu (VNĐ):', 'Họ tên': totalRevenue.toLocaleString() })

  // Tạo và ghi file Excel
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ThongKeKhachHang')
  XLSX.writeFile(wb, 'ThongKeKhachHang.xlsx')
}

// In danh sách
function printList() {
  if (!customers.value.length) {
    ElMessage.warning('Không có dữ liệu để in')
    return
  }

  // Hàm chuyển số thành chữ tiếng Việt
  function numberToWords(num) {
    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
    const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"]

    if (num === 0) return "không đồng"

    function readTriple(n) {
      let result = ""
      const hundred = Math.floor(n / 100)
      const ten = Math.floor((n % 100) / 10)
      const one = n % 10

      if (hundred > 0) {
        result += units[hundred] + " trăm "
        if (ten === 0 && one > 0) result += "lẻ "
      }
      if (ten > 1) {
        result += tens[ten] + " "
        if (one === 1) result += "mốt "
        else if (one === 5) result += "lăm "
        else if (one > 0) result += units[one] + " "
      } else if (ten === 1) {
        if (one === 5) result += "mười lăm "
        else if (one > 0) result += "mười " + units[one] + " "
        else result += "mười "
      } else if (ten === 0 && one > 0) {
        result += units[one] + " "
      }

      return result.trim()
    }

    const scales = ["", "nghìn", "triệu", "tỷ"]
    let words = []
    let scale = 0

    while (num > 0) {
      const triple = num % 1000
      if (triple > 0) {
        words.unshift(readTriple(triple) + " " + scales[scale])
      }
      num = Math.floor(num / 1000)
      scale++
    }

    return words.join(" ").trim() + " đồng"
  }

  const now = new Date()
  const printDate = now.toLocaleString()
  const [from, to] = dateRange.value
  const fromLabel = from ? new Date(from).toLocaleDateString() : '—'
  const toLabel = to ? new Date(to).toLocaleDateString() : '—'

  const totalCustomers = customers.value.length
  const totalOrders = customers.value.reduce((sum, c) => sum + (c.orderCount || 0), 0)
  const totalRevenue = customers.value.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
  const totalRevenueText = numberToWords(totalRevenue)

  const win = window.open('', '', 'width=900,height=700')

  let html = `
    <html>
    <head>
      <title>Thống kê danh sách khách hàng</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: "DejaVu Sans", Arial, sans-serif; padding: 20px; color: #000; }
        h2 { text-align: center; font-size: 22px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
        th, td { border: 1px solid #000; padding: 6px 8px; }
        th { text-align: center; background: #eee; }
        td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7) { text-align: center; }
      </style>
    </head>
    <body>
      <h2>THỐNG KÊ DANH SÁCH KHÁCH HÀNG</h2>
      <p><strong>Ngày in danh sách:</strong> ${printDate}</p>
      <p><strong>Thời gian thống kê:</strong> ${fromLabel} → ${toLabel}</p>

      <table>
        <tr>
          <th>Mã KH</th>
          <th>Họ tên</th>
          <th>Địa chỉ</th>
          <th>SĐT</th>
          <th>Số đơn</th>
          <th>Tổng chi (VNĐ)</th>
          <th>Ngày đặt</th>
        </tr>`

  customers.value.forEach(c => {
    html += `
      <tr>
        <td>${c.code}</td>
        <td>${c.fullName}</td>
        <td>${c.address || ''}</td>
        <td>${c.phone}</td>
        <td style="text-align:center">${c.orderCount || 0}</td>
        <td style="text-align:right">${c.totalSpent.toLocaleString()}</td>
        <td>${c.orderDate ? new Date(c.orderDate).toLocaleDateString() : '—'}</td>
      </tr>`
  })

  html += `
      </table>
      <p><strong>Số lượng khách hàng:</strong> ${totalCustomers}</p>
      <p><strong>Số lượng đơn hàng:</strong> ${totalOrders}</p>
      <p><strong>Tổng doanh thu:</strong> ${totalRevenue.toLocaleString()} VNĐ</p>
      <p><strong>Tổng doanh thu (bằng chữ):</strong> ${totalRevenueText.charAt(0).toUpperCase() + totalRevenueText.slice(1)}</p>
    </body>
    </html>
  `

  win.document.write(html)
  win.document.close()
  win.print()
}

// Bộ lọc nhanh
function applyQuickRange() {
  const today = dayjs()
  let from, to

  if (quickOption.value === 'today') {
    from = today.startOf('day')
    to = today.endOf('day')
  } else if (quickOption.value === 'week') {
    from = today.subtract(7, 'day').startOf('day')
    to = today.endOf('day')
  } else if (quickOption.value === 'month') {
    from = today.subtract(30, 'day').startOf('day')
    to = today.endOf('day')
  }

  // Tạo bản sao thật sự — tách biệt hoàn toàn hai object
  dateRange.value = [
    new Date(from.valueOf()),
    new Date(to.valueOf())
  ]
}
</script>

<style scoped>
.admin-statistic {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(245, 87, 108, 0.08);
  border: 1px solid rgba(245, 87, 108, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.page-header h1 {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 4px;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.statistic-card {
  padding: 20px !important;
  border-radius: 16px !important;
  border: 1px solid rgba(245, 87, 108, 0.1);
  box-shadow: 0 2px 12px rgba(245, 87, 108, 0.08) !important;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
}

.load-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  border: none !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.load-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 87, 108, 0.4) !important;
}

.price-text {
  color: #f5576c;
  font-weight: 600;
}

.statistic-table {
  border-radius: 12px;
  overflow: hidden;
}

.summary {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 15px;
  font-weight: 600;
  color: #444;
  border: 1px solid rgba(245, 87, 108, 0.1);
}

.summary div {
  flex: 1;
  min-width: 200px;
  padding: 4px 8px;
}

.summary strong {
  color: #f5576c;
}

</style>