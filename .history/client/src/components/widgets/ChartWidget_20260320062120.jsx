import { useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts'

const getFieldValue = (order, field) => {
  const map = {
    'Product': order.product,
    'Quantity': order.quantity,
    'Unit price': order.unitPrice,
    'Total amount': order.totalAmount,
    'Status': order.status,
    'Created by': order.createdBy,
    'Duration': new Date(order.createdAt).toLocaleDateString()
  }
  return map[field]
}

const prepareChartData = (orders, xAxis, yAxis) => {
  if (!orders.length || !xAxis || !yAxis) return []
  const grouped = {}
  orders.forEach((order) => {
    const key = String(getFieldValue(order, xAxis) || 'Unknown')
    const val = parseFloat(getFieldValue(order, yAxis)) || 1
    if (!grouped[key]) grouped[key] = { name: key, value: 0, count: 0 }
    grouped[key].value += val
    grouped[key].count += 1
  })
  return Object.values(grouped)
    .map((item) => ({ ...item, value: parseFloat(item.value.toFixed(2)) }))
    .slice(0, 10)
}

const truncateLabel = (label, maxLen = 10) => {
  if (!label) return ''
  return label.length > maxLen ? label.slice(0, maxLen) + '…' : label
}

const BAR_COLORS = [
  '#6366f1', '#06b6d4', '#f59e0b',
  '#10b981', '#f43f5e', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#3b82f6'
]

const CustomTooltip = ({ active, payload, label, yAxis }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-600">
          {payload[0].value?.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">{yAxis}</p>
      </div>
    )
  }
  return null
}

function ChartWidget({ widget }) {
  const { orders } = useSelector((state) => state.orders)
  const config = widget.config || {}
  const color = config.chartColor || '#6366f1'
  const showLabel = config.showDataLabel || false

  const data = useMemo(() => {
    return prepareChartData(orders, config.xAxis, config.yAxis)
  }, [orders, config.xAxis, config.yAxis])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(timer)
  }, [])

  if (!config.xAxis || !config.yAxis) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full gap-2"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-400 text-xs text-center">Configure X and Y axis in settings</p>
      </motion.div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No data available
      </div>
    )
  }

  const commonProps = {
    data,
    margin: { top: showLabel ? 24 : 10, right: 16, left: 0, bottom: 8 }
  }

  const xAxisProps = {
    dataKey: 'name',
    tick: { fontSize: 10, fill: '#9ca3af' },
    tickFormatter: (v) => truncateLabel(String(v), 10),
    axisLine: false,
    tickLine: false,
    interval: 0
  }

  const yAxisProps = {
    tick: { fontSize: 10, fill: '#9ca3af' },
    width: 45,
    axisLine: false,
    tickLine: false
  }

  const renderChart = () => {
    switch (widget.type) {
      case 'bar-chart':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip yAxis={config.yAxis} />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((_, index) => (
                <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
              {showLabel && (
                <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#6b7280' }} />
              )}
            </Bar>
          </BarChart>
        )

      case 'line-chart':
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id={`line-grad-${widget.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={color} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip yAxis={config.yAxis} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={`url(#line-grad-${widget.id})`}
              strokeWidth={3}
              dot={{ fill: color, r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', fill: color }}
            >
              {showLabel && (
                <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#6b7280' }} />
              )}
            </Line>
          </LineChart>
        )

      case 'area-chart':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`area-grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip yAxis={config.yAxis} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#area-grad-${widget.id})`}
              dot={{ fill: color, r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: color }}
            >
              {showLabel && (
                <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#6b7280' }} />
              )}
            </Area>
          </AreaChart>
        )

      case 'scatter-plot':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v) => truncateLabel(String(v), 10)}
              type="category"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="value"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              width={45}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip yAxis={config.yAxis} />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data}>
              {data.map((_, index) => (
                <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        )

      default:
        return null
    }
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
      style={{ minHeight: 0, minWidth: 0 }}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={0}>
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ChartWidget