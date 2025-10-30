<template>
    <div class="admin-report">
        <div class="page-header">
            <div class="header-content">
                <div class="icon-wrapper">
                    <i class="fa-solid fa-chart-pie"></i>
                </div>
                <div>
                    <h1>Báo cáo thống kê</h1>
                    <p class="subtitle">Phân tích thu chi và doanh số</p>
                </div>
            </div>
        </div>

        <el-card class="report-card" shadow="never">
            <div class="controls">
                <el-input-number v-model="year" :min="2000" :max="2100" label="Năm" size="large" />
                <el-select v-model="month" placeholder="Chọn tháng" style="width:160px" size="large">
                    <el-option v-for="m in 12" :key="m" :label="`Tháng ${m}`" :value="m" />
                </el-select>
                <el-button type="primary" size="large" @click="loadDailyStats" :loading="loading" class="load-btn">
                    <i class="fa-solid fa-chart-line"></i>
                    <span>Tải dữ liệu</span>
                </el-button>
            </div>

            <div class="charts">
                <stats-line-chart
                    class="chart-full"
                    :title="`Thu / chi theo ngày (${year}/${String(month).padStart(2,'0')})`"
                    :series="financeSeries"
                    xKey="day"
                    yKey="total"
                    :colors="financeColors"
                    xAxisName="Ngày"
                    yAxisName="Giá trị (₫)"
                    height="360px"
                    :tooltip-formatter="financeTooltipFormatter"
                    @point-click="handleFinancePointClick"
                />
            </div>

            <el-divider />

            <div class="detail-panel">
                <div class="detail-panel-header">
                    <h3 v-if="selectedDay !== null">{{ detailSeriesLabel }} • {{ detailDateLabel }}</h3>
                    <h3 v-else>Chi tiết theo ngày</h3>
                    <p v-if="selectedDay !== null" class="detail-summary">Tổng giá trị: {{ formatCurrency(detailValue) }}</p>
                    <p v-else>Nhấp vào một điểm trên biểu đồ để xem chi tiết.</p>
                </div>

                <div v-if="detailLoading" class="detail-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Đang tải dữ liệu...</span>
                </div>
                <el-empty
                    v-else-if="selectedDay === null"
                    description="Nhấp vào một điểm trên biểu đồ thu / chi để xem chi tiết."
                />
                <el-empty
                    v-else-if="!detailRecords.length"
                    :description="detailEmptyDescription"
                />
                <template v-else>
                    <el-table v-if="detailType === 'income'" :data="detailRecords" border size="small">
                        <el-table-column prop="code" label="Mã đơn" width="140" />
                        <el-table-column prop="customerName" label="Khách hàng" min-width="160" show-overflow-tooltip />
                        <el-table-column prop="statusLabel" label="Trạng thái" width="140" />
                        <el-table-column prop="total" label="Tổng đơn" width="160">
                            <template #default="scope"><span class="price-text">{{ formatCurrency(scope.row.total) }}</span></template>
                        </el-table-column>
                        <el-table-column prop="completedAtLabel" label="Hoàn thành lúc" min-width="180" />
                    </el-table>
                    <el-table v-else :data="detailRecords" border size="small">
                        <el-table-column prop="code" label="Mã phiếu" width="140" />
                        <el-table-column prop="totalQuantity" label="Số lượng" width="120" />
                        <el-table-column prop="totalAmount" label="Giá trị" width="160">
                            <template #default="scope"><span class="price-text">{{ formatCurrency(scope.row.totalAmount) }}</span></template>
                        </el-table-column>
                        <el-table-column prop="importDateLabel" label="Thời gian" min-width="180" />
                        <el-table-column prop="note" label="Ghi chú" min-width="200" show-overflow-tooltip />
                    </el-table>
                </template>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import StatsLineChart from '@/components/StatsLineChart.vue'
import { fetchImportHistory } from '@/api/inventory'
import { getAdminOrders } from '@/api/order'

const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const loading = ref(false)
const revenuePoints = ref([])
const financeSeries = ref([])
const financeColors = ['#22c55e', '#ef4444']
const detailLoading = ref(false)
const detailRecords = ref([])
const detailType = ref(null)
const detailDateLabel = ref('')
const detailSeriesLabel = ref('')
const detailValue = ref(0)
const selectedDay = ref(null)

const IMPORT_PAGE_SIZE = 200
const MAX_IMPORT_PAGES = 5
const ORDER_PAGE_SIZE = 200
const MAX_ORDER_PAGES = 8

const normalizePoints = (points = [], xKey = 'day', yKey = 'total') => {
    if (!Array.isArray(points)) return []
    return points
        .map((p) => {
            const rawX = p?.[xKey] ?? p?.day ?? p?.date ?? p?.label
            if (rawX === undefined || rawX === null || rawX === '') return null
            const numericX = Number(rawX)
            const xValue = Number.isNaN(numericX) ? rawX : numericX
            const rawY = p?.[yKey] ?? p?.total ?? p?.value ?? 0
            const numericY = Number(rawY)
            const yValue = Number.isNaN(numericY) ? 0 : numericY
            return {
                [xKey]: xValue,
                [yKey]: yValue
            }
        })
        .filter(Boolean)
        .sort((a, b) => {
            const ax = a[xKey]
            const bx = b[xKey]
            if (typeof ax === 'number' && typeof bx === 'number') return ax - bx
            return String(ax).localeCompare(String(bx))
        })
}

const extractArray = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    const sources = [payload, payload?.data]
    for (const source of sources) {
        if (!source) continue
        if (Array.isArray(source)) return source
        const keys = ['items', 'records', 'result', 'data', 'rows', 'list', 'values']
        for (const key of keys) {
            const candidate = source?.[key]
            if (Array.isArray(candidate)) return candidate
            if (candidate && Array.isArray(candidate.items)) return candidate.items
            if (candidate && Array.isArray(candidate.data)) return candidate.data
        }
    }
    return []
}

const toNumberOr = (value, fallback) => {
    if (value === null || value === undefined || value === '') return fallback
    const parsed = Number(value)
    return Number.isNaN(parsed) ? fallback : parsed
}

const getDaysInMonth = (yr, mn) => {
    const now = new Date()
    const yearNum = toNumberOr(yr, now.getFullYear())
    let monthNum = toNumberOr(mn, now.getMonth() + 1)
    if (monthNum < 1) monthNum = 1
    if (monthNum > 12) monthNum = 12
    return new Date(yearNum, monthNum, 0).getDate()
}

const formatDateParam = (date, endOfDay = false) => {
    const pad = (val) => String(val).padStart(2, '0')
    const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    const timePart = endOfDay ? '23:59:59' : '00:00:00'
    return `${datePart}T${timePart}`
}

const buildMonthRange = (yr, mn) => {
    const now = new Date()
    const yearNum = toNumberOr(yr, now.getFullYear())
    let monthNum = toNumberOr(mn, now.getMonth() + 1)
    if (monthNum < 1) monthNum = 1
    if (monthNum > 12) monthNum = 12
    const start = new Date(yearNum, monthNum - 1, 1)
    const end = new Date(yearNum, monthNum, 0)
    return {
        fromDate: formatDateParam(start, false),
        toDate: formatDateParam(end, true)
    }
}

const resolveTotalItems = (payload) => {
    const candidates = [
        payload?.totalItems,
        payload?.total,
        payload?.count,
        payload?.totalCount,
        payload?.totalRecords,
        payload?.data?.totalItems,
        payload?.data?.total,
        payload?.data?.count,
        payload?.data?.totalCount,
        payload?.data?.totalRecords
    ]
    const found = candidates.find((value) => value !== undefined)
    return toNumberOr(found, 0)
}

const aggregateImportExpensesByDay = (records = []) => {
    const dayBuckets = new Map()
    records.forEach((record) => {
        const dateValue = record?.importDate ?? record?.ImportDate ?? record?.createdAt ?? record?.CreatedAt ?? record?.createdDate ?? record?.CreatedDate
        if (!dateValue) return
        const parsed = new Date(dateValue)
        if (Number.isNaN(parsed.getTime())) return
        const day = parsed.getDate()
        const baseAmount = Number(record?.totalAmount ?? record?.TotalAmount ?? record?.amount ?? record?.Amount ?? 0)
        let total = Number.isFinite(baseAmount) ? baseAmount : 0
        if (!total) {
            const items = record?.items ?? record?.Items ?? record?.details ?? record?.Details ?? record?.lines ?? record?.Lines
            if (Array.isArray(items)) {
                total = items.reduce((acc, item) => {
                    const quantity = Number(item?.quantity ?? item?.Quantity ?? item?.soluong ?? item?.SoLuong ?? 0) || 0
                    const price = Number(item?.unitPrice ?? item?.UnitPrice ?? item?.price ?? item?.Price ?? 0) || 0
                    const line = Number(item?.lineTotal ?? item?.LineTotal ?? item?.total ?? item?.Total ?? quantity * price) || (quantity * price)
                    return acc + (Number.isFinite(line) ? line : 0)
                }, 0)
            }
        }
        const previous = dayBuckets.get(day) ?? 0
        dayBuckets.set(day, previous + (Number.isFinite(total) ? total : 0))
    })
    return Array.from(dayBuckets.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([day, total]) => ({ day, total: Number(total) }))
}

const aggregateCompletedOrderRevenueByDay = (records = []) => {
    const dayBuckets = new Map()
    records.forEach((record, index) => {
        const normalized = normalizeOrderSummary(record, index)
        if (normalized.status !== 'HoanThanh') return
        const resolvedDate = normalized.completedAt || normalized.createdAt
        if (!resolvedDate) return
        const parsed = new Date(resolvedDate)
        if (Number.isNaN(parsed.getTime())) return
        const day = parsed.getDate()
        const amount = Number(normalized.total) || 0
        dayBuckets.set(day, (dayBuckets.get(day) || 0) + amount)
    })
    return Array.from(dayBuckets.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([day, total]) => ({ day, total: Number(total) }))
}

const fillMonthlySeries = (points = [], totalDays = 31, xKey = 'day', yKey = 'total') => {
    const valueMap = new Map()
    points.forEach((point) => {
        const rawDay = point?.[xKey] ?? point?.day
        const dayNumber = Number(rawDay)
        if (!Number.isFinite(dayNumber) || dayNumber < 1) return
        const value = Number(point?.[yKey] ?? point?.total ?? point?.value ?? 0)
        valueMap.set(Math.trunc(dayNumber), Number.isFinite(value) ? value : 0)
    })
    const filled = []
    for (let day = 1; day <= totalDays; day += 1) {
        filled.push({ [xKey]: day, [yKey]: valueMap.get(day) ?? 0 })
    }
    return filled
}

const buildFinanceSeriesDataset = (incomePoints = [], expensePoints = [], totalDays = 31) => {
    const incomeSeries = fillMonthlySeries(incomePoints, totalDays, 'day', 'total')
    const expenseSeries = fillMonthlySeries(expensePoints, totalDays, 'day', 'total')
    return [
        {
            name: 'Thu (bán hàng)',
            data: incomeSeries,
            xKey: 'day',
            yKey: 'total',
            areaOpacity: 0.24,
            metaType: 'income'
        },
        {
            name: 'Chi (nhập hàng)',
            data: expenseSeries,
            xKey: 'day',
            yKey: 'total',
            areaOpacity: 0.18,
            metaType: 'expense'
        }
    ]
}

const formatCurrencyValue = (value) => {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric.toLocaleString('vi-VN') : '0'
}

const financeTooltipFormatter = (params) => {
    if (!Array.isArray(params) || !params.length) return ''
    const axisLabel = params[0].axisValueLabel ?? params[0].axisValue ?? ''
    const lines = [axisLabel]
    params.forEach((item) => {
        const numeric = Number(item.data ?? item.value ?? 0)
        const formatted = Number.isFinite(numeric) ? formatCurrencyValue(numeric) : item.data
        lines.push(`${item.marker || ''}${item.seriesName}: ${formatted}₫`)
    })
    return lines.join('<br/>')
}

const toKey = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[^a-z0-9]+/gi, '')
        .toLowerCase()

const canonicalStatus = (value) => {
    const key = toKey(value)
    if (!key) return 'DaDatHang'
    if (key.includes('danggiao')) return 'DangGiao'
    if (key.includes('hoanthanh')) return 'HoanThanh'
    if (key.includes('dahuy') || key.includes('huy')) return 'DaHuy'
    if (key.includes('dadathang')) return 'DaDatHang'
    return 'DaDatHang'
}

const STATUS_LABEL_MAP = {
    DaDatHang: 'Đã đặt hàng',
    DangGiao: 'Đang giao',
    HoanThanh: 'Hoàn thành',
    DaHuy: 'Đã hủy'
}

const formatCurrency = (value) => `${formatCurrencyValue(value)}₫`

const formatDateTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date)
}

const matchesDay = (dateValue, yearValue, monthValue, dayValue) => {
    if (!dateValue) return false
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return false
    return (
        date.getFullYear() === yearValue &&
        date.getMonth() + 1 === monthValue &&
        date.getDate() === dayValue
    )
}

const buildDayRange = (yr, mn, day) => {
    const yearNum = toNumberOr(yr, new Date().getFullYear())
    const monthNum = toNumberOr(mn, new Date().getMonth() + 1)
    const safeDay = Math.max(1, Math.min(day, getDaysInMonth(yearNum, monthNum)))
    const target = new Date(yearNum, monthNum - 1, safeDay)
    return {
        fromDate: formatDateParam(target, false),
        toDate: formatDateParam(target, true)
    }
}

const normalizeOrderSummary = (raw = {}, index = 0) => {
    const code = raw.code ?? raw.orderCode ?? raw.mahd ?? raw.id ?? `ORDER-${index + 1}`
    const createdAt = raw.createdAt ?? raw.createdDate ?? raw.ngaylap ?? raw.created_time ?? ''
    const completedAt =
        raw.completedAt ?? raw.completedDate ?? raw.ngayHoanThanh ?? raw.completed_time ?? raw.thoigianhoanthanh ?? ''
    const customer = raw.customer ?? raw.customerInfo ?? raw.khachhang ?? {}
    const customerName = raw.customerName ?? raw.tenkh ?? customer.fullName ?? customer.name ?? ''
    const total = Number(raw.total ?? raw.tongtien ?? raw.amount ?? 0) || 0
    const status = canonicalStatus(raw.status ?? raw.trangthai)
    const resolvedCompletedAt = completedAt || createdAt
    return {
        code: String(code),
        customerName,
        total,
        status,
        statusLabel: STATUS_LABEL_MAP[status] ?? status,
        createdAt,
        completedAt: resolvedCompletedAt,
        completedAtLabel: formatDateTime(resolvedCompletedAt)
    }
}

const normalizeImportSummary = (raw = {}, index = 0) => {
    const code = raw.code ?? raw.Code ?? raw.maPhieu ?? raw.MAPHIEU ?? `IMPORT-${index + 1}`
    const totalQuantity = Number(raw.totalQuantity ?? raw.TotalQuantity ?? raw.quantity ?? raw.Quantity ?? 0) || 0
    let totalAmount = Number(raw.totalAmount ?? raw.TotalAmount ?? raw.amount ?? raw.Amount ?? 0)
    if (!Number.isFinite(totalAmount) || totalAmount === 0) {
        const details = raw.items ?? raw.Items ?? raw.details ?? raw.Details ?? []
        if (Array.isArray(details)) {
            totalAmount = details.reduce((acc, item) => {
                const quantity = Number(item?.quantity ?? item?.Quantity ?? item?.soluong ?? item?.SoLuong ?? 0) || 0
                const price = Number(item?.unitPrice ?? item?.UnitPrice ?? item?.price ?? item?.Price ?? 0) || 0
                const lineTotal = Number(item?.lineTotal ?? item?.LineTotal ?? item?.total ?? item?.Total ?? quantity * price) || (quantity * price)
                return acc + (Number.isFinite(lineTotal) ? lineTotal : 0)
            }, 0)
        } else {
            totalAmount = 0
        }
    }
    const importDate = raw.importDate ?? raw.ImportDate ?? raw.createdAt ?? raw.CreatedAt ?? ''
    return {
        code: String(code),
        totalQuantity,
        totalAmount: Number(totalAmount) || 0,
        importDate,
        importDateLabel: formatDateTime(importDate),
        note: raw.note ?? raw.Note ?? raw.ghichu ?? raw.GHICHU ?? ''
    }
}

const detailEmptyDescription = computed(() => {
    if (detailType.value === 'income') return 'Không có đơn hàng cho ngày đã chọn.'
    if (detailType.value === 'expense') return 'Không có phiếu nhập nào cho ngày đã chọn.'
    return 'Nhấp vào một điểm trên biểu đồ thu / chi để xem chi tiết.'
})

const fetchMonthlyImportExpensePoints = async (yearValue, monthValue) => {
    const { fromDate, toDate } = buildMonthRange(yearValue, monthValue)
    const aggregatedRecords = []
    const baseParams = {
        page: 1,
        pageSize: IMPORT_PAGE_SIZE,
        fromDate,
        toDate
    }

    const firstResponse = await fetchImportHistory(baseParams)
    aggregatedRecords.push(...extractArray(firstResponse))

    const totalItems = resolveTotalItems(firstResponse)
    const totalPages = IMPORT_PAGE_SIZE > 0 ? Math.ceil(totalItems / IMPORT_PAGE_SIZE) : 1
    if (totalPages > 1) {
        const maxPages = Math.min(totalPages, MAX_IMPORT_PAGES)
        const extraPromises = []
        for (let page = 2; page <= maxPages; page += 1) {
            extraPromises.push(fetchImportHistory({ ...baseParams, page }))
        }
        if (extraPromises.length) {
            const extraResults = await Promise.allSettled(extraPromises)
            extraResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    aggregatedRecords.push(...extractArray(result.value))
                } else {
                    console.error('fetchImportHistory page error', result.reason)
                }
            })
        }
    }

    return aggregateImportExpensesByDay(aggregatedRecords)
}

const fetchMonthlyCompletedRevenuePoints = async (yearValue, monthValue) => {
    const { fromDate, toDate } = buildMonthRange(yearValue, monthValue)
    const aggregatedRecords = []
    const baseParams = {
        page: 1,
        pageSize: ORDER_PAGE_SIZE,
        status: 'HoanThanh',
        fromDate,
        toDate
    }

    const firstResponse = await getAdminOrders(baseParams)
    aggregatedRecords.push(...extractArray(firstResponse))

    const totalItems = resolveTotalItems(firstResponse)
    const totalPages = ORDER_PAGE_SIZE > 0 ? Math.ceil(totalItems / ORDER_PAGE_SIZE) : 1
    if (totalPages > 1) {
        const maxPages = Math.min(totalPages, MAX_ORDER_PAGES)
        const extraPromises = []
        for (let page = 2; page <= maxPages; page += 1) {
            extraPromises.push(getAdminOrders({ ...baseParams, page }))
        }
        if (extraPromises.length) {
            const extraResults = await Promise.allSettled(extraPromises)
            extraResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    aggregatedRecords.push(...extractArray(result.value))
                } else {
                    console.error('getAdminOrders page error', result.reason)
                }
            })
        }
    }

    return aggregateCompletedOrderRevenueByDay(aggregatedRecords)
}

const handleFinancePointClick = async ({ xValue, value, metaType, meta }) => {
    const now = new Date()
    const currentYear = toNumberOr(year.value, now.getFullYear())
    const currentMonth = toNumberOr(month.value, now.getMonth() + 1)
    const dayNumber = Number(xValue)
    if (!Number.isFinite(dayNumber) || dayNumber < 1) return

    const targetDate = new Date(currentYear, currentMonth - 1, dayNumber)
    detailDateLabel.value = new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'full'
    }).format(targetDate)
    detailSeriesLabel.value = meta?.name ?? meta?.seriesName ?? (metaType === 'expense' ? 'Chi (nhập hàng)' : 'Thu (bán hàng)')
    detailType.value = metaType === 'expense' ? 'expense' : 'income'
    detailValue.value = Number(value) || 0
    selectedDay.value = dayNumber
    detailRecords.value = []
    detailLoading.value = true
    try {
        const { fromDate, toDate } = buildDayRange(currentYear, currentMonth, dayNumber)
        if (detailType.value === 'income') {
            const response = await getAdminOrders({ page: 1, pageSize: 200, fromDate, toDate, status: 'HoanThanh' })
            const list = extractArray(response)
            detailRecords.value = list
                .map((item, index) => normalizeOrderSummary(item, index))
                .filter((order) => matchesDay(order.completedAt || order.createdAt, currentYear, currentMonth, dayNumber))
                .filter((order) => order.status === 'HoanThanh')
                .sort((a, b) => {
                    const dateA = new Date(a.completedAt)
                    const dateB = new Date(b.completedAt)
                    return (dateB.getTime() || 0) - (dateA.getTime() || 0)
                })
        } else {
            const response = await fetchImportHistory({ page: 1, pageSize: 200, fromDate, toDate })
            const list = extractArray(response)
            detailRecords.value = list.map((item, index) => normalizeImportSummary(item, index))
        }
    } catch (error) {
        console.error('handleFinancePointClick error', error)
        detailRecords.value = []
        ElMessage.error(error?.response?.data?.message || 'Không thể tải chi tiết cho ngày đã chọn')
    } finally {
        detailLoading.value = false
    }
}

const loadDailyStats = async () => {
    const now = new Date()
    const currentYear = toNumberOr(year.value, now.getFullYear())
    const currentMonth = toNumberOr(month.value, now.getMonth() + 1)
    financeSeries.value = buildFinanceSeriesDataset([], [], getDaysInMonth(currentYear, currentMonth))
    selectedDay.value = null
    detailType.value = null
    detailDateLabel.value = ''
    detailSeriesLabel.value = ''
    detailValue.value = 0
    detailRecords.value = []
    loading.value = true
    try {
        const [revenueResult, importsResult] = await Promise.allSettled([
            fetchMonthlyCompletedRevenuePoints(currentYear, currentMonth),
            fetchMonthlyImportExpensePoints(currentYear, currentMonth)
        ])

        let incomePoints = []

        if (revenueResult.status === 'fulfilled') {
            const resolvedPoints = Array.isArray(revenueResult.value)
                ? normalizePoints(revenueResult.value, 'day', 'total')
                : normalizePoints([], 'day', 'total')
            revenuePoints.value = resolvedPoints
            incomePoints = [...resolvedPoints]
        } else {
            revenuePoints.value = []
            console.error('fetchMonthlyCompletedRevenuePoints error', revenueResult.reason)
            ElMessage.error(revenueResult.reason?.response?.data?.message || 'Không thể tải doanh thu theo ngày')
        }

        let expensePoints = []
        if (importsResult.status === 'fulfilled') {
            expensePoints = Array.isArray(importsResult.value) ? importsResult.value : []
        } else {
            console.error('fetchMonthlyImportExpensePoints error', importsResult.reason)
            ElMessage.warning(importsResult.reason?.response?.data?.message || 'Không thể tải chi phí nhập hàng')
        }

        const daysInMonth = getDaysInMonth(currentYear, currentMonth)
        financeSeries.value = buildFinanceSeriesDataset(incomePoints, expensePoints, daysInMonth)
    } catch (error) {
        console.error('loadDailyStats error', error)
        ElMessage.error(error?.response?.data?.message || 'Không thể tải dữ liệu thống kê')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadDailyStats()
})
</script>

<style scoped>
.admin-report {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.page-header {
    background: white;
    padding: 24px;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
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

.page-header .icon-wrapper {
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
    letter-spacing: -0.5px;
}

.page-header .subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
}

.report-card {
    padding: 20px !important;
    border-radius: 16px !important;
    border: 1px solid rgba(245, 87, 108, 0.1);
    box-shadow: 0 2px 12px rgba(245, 87, 108, 0.08) !important;
}

.controls {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

:deep(.el-input-number .el-input__wrapper) {
    border-radius: 12px;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
}

:deep(.el-input-number .el-input__wrapper:hover) {
    border-color: #f093fb;
}

:deep(.el-input-number .el-input__wrapper.is-focus) {
    border-color: #f5576c;
    box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.1);
}

:deep(.el-select .el-input__wrapper) {
    border-radius: 12px;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
}

:deep(.el-select .el-input__wrapper:hover) {
    border-color: #f093fb;
}

:deep(.el-select .el-input__wrapper.is-focus) {
    border-color: #f5576c;
    box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.1);
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

.charts {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
}

@media (min-width: 992px) {
    .charts {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.charts :deep(.chart-full) {
    grid-column: 1 / -1;
}
.detail-panel {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-panel-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.detail-panel-header p {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 14px;
}

.detail-panel-header .detail-summary {
    color: #f5576c;
    font-weight: 700;
    font-size: 16px;
}

.detail-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 160px;
    color: #6b7280;
    font-size: 14px;
}
</style>