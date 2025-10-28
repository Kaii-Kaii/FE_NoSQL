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
  series: { type: Array, default: () => [] },
  xKey: { type: String, default: 'day' },
  yKey: { type: String, default: 'total' },
  height: { type: String, default: '320px' },
  colors: { type: Array, default: () => [] },
  xAxisName: { type: String, default: '' },
  yAxisName: { type: String, default: '' },
  tooltipFormatter: { type: Function, default: null }
})

const emit = defineEmits(['point-click'])

const chartRef = ref(null)
let chart = null
let seriesMeta = []
let currentXData = []

const resizeHandler = () => {
  chart?.resize?.()
}

const pickValue = (point, candidateKeys = []) => {
  if (!point) return undefined
  for (const key of candidateKeys) {
    if (point[key] !== undefined && point[key] !== null) {
      return point[key]
    }
  }
  return undefined
}

const convertAxisValue = (value) => {
  if (value === undefined || value === null) return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const numeric = Number(value)
  if (!Number.isNaN(numeric)) return numeric
  return value
}

const sortAxisValues = (values) => {
  if (!values.length) return values
  const numeric = values.every((val) => typeof val === 'number' && Number.isFinite(val))
  if (numeric) {
    return [...values].sort((a, b) => a - b)
  }
  const dateLike = values.every((val) => {
    if (typeof val !== 'string') return false
    const parsed = new Date(val)
    return !Number.isNaN(parsed.getTime())
  })
  if (dateLike) {
    return [...values].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  }
  return values
}

const defaultTooltipFormatter = (params) => {
  if (!Array.isArray(params) || !params.length) return ''
  const [first] = params
  const axisLabel = first.axisValueLabel ?? first.axisValue ?? ''
  const lines = [axisLabel]
  params.forEach((item) => {
    const rawValue = item.data ?? item.value
    const displayValue = typeof rawValue === 'number'
      ? rawValue.toLocaleString()
      : (Number(rawValue)?.toLocaleString?.() ?? rawValue)
    lines.push(`${item.marker || ''}${item.seriesName}: ${displayValue}`)
  })
  return lines.join('<br/>')
}

const init = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  render()
}

const handleChartClick = (params) => {
  if (!params || params.componentType !== 'series') return
  const seriesIndex = params.seriesIndex ?? 0
  const meta = Array.isArray(seriesMeta) ? seriesMeta[seriesIndex] : undefined
  const xValueFromAxis = params.axisValue ?? params.axisValueLabel ?? currentXData[params.dataIndex]
  const rawValue = typeof params.value === 'number' ? params.value : params.data
  let numericValue = Number(rawValue)
  if (Number.isNaN(numericValue)) {
    numericValue = Number(params?.data?.value ?? params?.data?.y ?? params?.data?.total ?? 0)
  }
  emit('point-click', {
    seriesName: params.seriesName,
    seriesIndex,
    meta,
    metaType: meta?.metaType ?? meta?.type ?? meta?.category ?? null,
    xValue: xValueFromAxis,
    value: Number.isFinite(numericValue) ? numericValue : 0,
    raw: params
  })
}

const registerEvents = () => {
  if (!chart) return
  chart.off('click', handleChartClick)
  chart.on('click', handleChartClick)
}

const render = () => {
  if (!chart) return

  const hasMultiSeries = Array.isArray(props.series) && props.series.length > 0
  const xKey = props.xKey
  const yKey = props.yKey
  const xAxisLabel = props.xAxisName || 'Ngày'
  const yAxisLabel = props.yAxisName || (yKey === 'total'
    ? 'Tổng (₫)'
    : (yKey === 'quantity' ? 'Số lượng' : yKey))

  let xData = []
  let seriesOption = []
  let legendData = []

  if (hasMultiSeries) {
    seriesMeta = props.series.map((seriesItem) => seriesItem || {})
    const allXValues = []
    const seenTokens = new Set()

    props.series.forEach((seriesItem, index) => {
      if (!seriesItem) return
      const dataSource = Array.isArray(seriesItem.data)
        ? seriesItem.data
        : (Array.isArray(seriesItem.points) ? seriesItem.points : [])
      const itemXKey = seriesItem.xKey || xKey
      const itemYKey = seriesItem.yKey || yKey
      const seriesName = seriesItem.name || `Series ${index + 1}`
      const valueMap = new Map()

      dataSource.forEach((point) => {
        const rawX = pickValue(point, [itemXKey, 'day', 'date', 'label', 'x'])
        const axisValue = convertAxisValue(rawX)
        if (axisValue === undefined || axisValue === null || axisValue === '') return
        const token = String(axisValue)
        if (!seenTokens.has(token)) {
          seenTokens.add(token)
          allXValues.push(axisValue)
        }
        const rawY = pickValue(point, [itemYKey, 'total', 'value', 'amount', 'y'])
        const numericY = Number(rawY)
        valueMap.set(token, Number.isFinite(numericY) ? numericY : 0)
      })

      legendData.push(seriesName)

      seriesOption.push({
        name: seriesName,
        type: seriesItem.type || 'line',
        smooth: seriesItem.smooth !== undefined ? seriesItem.smooth : true,
        symbol: seriesItem.symbol || 'circle',
        symbolSize: seriesItem.symbolSize || 6,
        areaStyle: seriesItem.area === false ? undefined : { opacity: seriesItem.areaOpacity ?? 0.18 },
        lineStyle: seriesItem.lineStyle || { width: 2 },
        emphasis: { focus: 'series' },
        data: [],
        __valueMap: valueMap
      })
    })

    xData = sortAxisValues(allXValues)

    seriesOption = seriesOption.map((item) => {
      const mappedData = xData.map((x) => item.__valueMap.get(String(x)) ?? 0)
      return {
        ...item,
        data: mappedData
      }
    })
  } else {
    seriesMeta = []
    xData = (props.points || []).map((p) => p[xKey])
    const yData = (props.points || []).map((p) => Number(p[yKey] ?? 0))
    seriesOption = [
      {
        name: props.title || yKey,
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: { opacity: 0.18 }
      }
    ]
  }

  const option = {
    color: Array.isArray(props.colors) && props.colors.length ? props.colors : undefined,
    tooltip: {
      trigger: 'axis',
      formatter: props.tooltipFormatter || defaultTooltipFormatter
    },
    legend: hasMultiSeries ? { data: legendData, top: 32 } : undefined,
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      name: xAxisLabel
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel
    },
    series: seriesOption,
    grid: { left: '6%', right: '4%', bottom: '8%', top: hasMultiSeries ? '18%' : '10%' }
  }

  // Remove helper maps before setting option
  if (hasMultiSeries) {
    option.series = option.series.map((item) => {
      const { __valueMap, ...rest } = item
      return rest
    })
  }

  chart.setOption(option, true)
  chart.resize()
  currentXData = Array.isArray(xData) ? xData : []
  registerEvents()
}

onMounted(() => {
  init()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  chart?.off?.('click', handleChartClick)
  window.removeEventListener('resize', resizeHandler)
  try {
    chart?.dispose()
  } finally {
    chart = null
    seriesMeta = []
    currentXData = []
  }
})

watch(
  [
    () => props.points,
    () => props.series,
    () => props.title,
    () => props.xKey,
    () => props.yKey,
    () => props.colors,
    () => props.xAxisName,
    () => props.yAxisName,
    () => props.tooltipFormatter
  ],
  () => {
    render()
  },
  { deep: true }
)
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
