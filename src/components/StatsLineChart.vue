<template>
  <div class="stats-line-chart">
    <div class="chart-header">
      <h3>{{ title }}</h3>
    </div>
    <div ref="chartRef" :style="{ height: height }" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: { type: String, default: '' },
  points: { type: Array, default: () => [] },
  xKey: { type: String, default: 'day' },
  yKey: { type: String, default: 'total' },
  height: { type: String, default: '320px' }
})

const chartRef = ref(null)
let chart = null

const init = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  render()
}

const render = () => {
  if (!chart) return
  const xData = (props.points || []).map((p) => p[props.xKey])
  const yData = (props.points || []).map((p) => Number(p[props.yKey] ?? 0))

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        if (!params || !params.length) return ''
        const p = params[0]
        return `${p.axisValue}<br/>${p.seriesName}: ${p.data?.toLocaleString?.() ?? p.data}`
      }
    },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      name: 'Ngày'
    },
    yAxis: {
      type: 'value',
      name: props.yKey === 'total' ? 'Tổng (₫)' : (props.yKey === 'quantity' ? 'Số lượng' : props.yKey)
    },
    series: [
      {
        name: props.title || props.yKey,
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {}
      }
    ],
    grid: { left: '6%', right: '4%', bottom: '8%', top: '10%' }
  }

  chart.setOption(option)
}

onMounted(() => {
  init()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => chart?.resize())
  try {
    chart?.dispose()
  } catch (e) {}
})

watch(() => props.points, () => {
  render()
})
</script>

<style scoped>
.stats-line-chart .chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.stats-line-chart h3 {
  margin: 0;
  font-size: 16px;
}
</style>
