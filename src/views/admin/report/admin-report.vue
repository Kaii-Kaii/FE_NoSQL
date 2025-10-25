<template>
    <div class="admin-report">
        <h1>Báo cáo thống kê</h1>

        <el-card class="report-card" shadow="never">
            <div class="controls">
                <el-input-number v-model="year" :min="2000" :max="2100" label="Năm" />
                <el-select v-model="month" placeholder="Chọn tháng" style="width:140px">
                    <el-option v-for="m in 12" :key="m" :label="m" :value="m" />
                </el-select>
                <el-button type="primary" @click="loadDailyStats" :loading="loading">Tải dữ liệu</el-button>
            </div>

            <div class="charts">
                <stats-line-chart
                    :title="`Doanh thu theo ngày (${year}/${String(month).padStart(2,'0')})`"
                    :points="revenuePoints"
                    xKey="day"
                    yKey="total"
                />

                <stats-line-chart
                    :title="`Số sách bán theo ngày (${year}/${String(month).padStart(2,'0')})`"
                    :points="booksSoldPoints"
                    xKey="day"
                    yKey="quantity"
                />
            </div>

            <el-divider />

            <div class="top-books">
                <h3>Sách bán chạy</h3>
                <el-table :data="topBooks" stripe size="small">
                    <el-table-column prop="code" label="Mã" width="120" />
                    <el-table-column prop="name" label="Tên sách" />
                    <el-table-column prop="sold" label="Số bán" width="120" />
                </el-table>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import StatsLineChart from '@/components/StatsLineChart.vue'
import { getDailyRevenue, getDailyBooksSold, getTopBooks } from '@/api/stats'

const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const loading = ref(false)
const revenuePoints = ref([])
const booksSoldPoints = ref([])
const topBooks = ref([])

const normalizePoints = (points = [], xKey = 'day', yKey = 'total') => {
    if (!Array.isArray(points)) return []
    // Ensure sorted by day
    return points
        .map((p) => ({ day: Number(p[xKey]), value: Number(p[yKey] ?? 0), ...p }))
        .sort((a, b) => a.day - b.day)
        .map((p) => ({ day: p.day, [yKey]: p.value }))
}

const loadDailyStats = async () => {
    loading.value = true
    try {
        const r = await getDailyRevenue(year.value, month.value)
        const rData = r?.data ?? r
        revenuePoints.value = normalizePoints(rData.points ?? [], 'day', 'total')

        const b = await getDailyBooksSold(year.value, month.value)
        const bData = b?.data ?? b
        booksSoldPoints.value = normalizePoints(bData.points ?? [], 'day', 'quantity')

        const t = await getTopBooks(10)
        const tData = t?.data ?? t
        // Try to normalize top books payload (may be array or data.items)
        const items = Array.isArray(tData) ? tData : tData?.items ?? tData?.data ?? []
            topBooks.value = items.map((it) => ({
                code: (it.code ?? it.Code ?? it.masach ?? it.MASACH) || '',
                name: (it.name ?? it.Name ?? it.tensach ?? it.TENSACH) || '',
                sold: it.sold ?? it.Sold ?? it.quantity ?? it.Quantity ?? it.count ?? it.Count ?? 0
            }))
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
    gap: 12px;
}
.report-card {
    padding: 16px;
}
.controls {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
}
.charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.top-books {
    margin-top: 12px;
}
</style>