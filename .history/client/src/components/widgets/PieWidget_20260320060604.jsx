import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

const COLORS = [
  '#6366f1', '#06b6d4', '#f59e0b',
  '#10b981', '#f43f5e', '#8b5cf6',
  '#ec4899', '#14b8a6'
]

const getFieldValue = (order, field) => {
  const map = {
    'Product': order.product,
    'Quantity': order.quantity,
    'Unit price': order.unitPrice,
    'Total amount': order.totalAmount,
    'Status': order.status,
    'Created by': order.createdBy
  }
  return map[field]
}

const renderCustomLabel = ({ percent }) => {
  if (percent < 0.05) return null
  return `${(percent * 100).toFixed(0)}%`
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: payload[0].payload.fill }}
          />
          <p className="text-xs font-semibold text-gray-700">{payload[0].name}</p>
        </div>
        <p className="text-sm font-bold text-gray-800">{payload[0].value}</p>
        <p className="text-xs text-gray-400">
          {((payload[0].payload.percent || 0) * 100).toFixed(1)}%
        </p>
      </div>
    )
  }
  return null
}

function PieWidget({ widget }) {
  const { orders } = useSelector((state) => state.orders)
  const config = widget.config || {}

  const data = useMemo(() => {
    if (!orders.length || !config.chartData) return []
    const grouped = {}
    orders.forEach((order) => {
      const key = getFieldValue(order, config.chartData)
      if (!key) return
      if (!grouped[key]) grouped[key] = { name: key, value: 0 }
      grouped[key].value += 1
    })
    const total = Object.values(grouped).reduce((sum, d) => sum + d.value, 0)
    return Object.values(grouped).map((d) => ({
      ...d,
      percent: d.value / total,
      fill: COLORS[Object.keys(grouped).indexOf(d.name) % COLORS.length]
    }))
  }, [orders, config.chartData])

  if (!config.chartData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full gap-2"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <p className="text-gray-400 text-xs">Configure chart data in settings</p>
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
         <Pie
  data={data}
  cx="50%"
  cy="42%"
  outerRadius="38%"
  innerRadius="22%"
  dataKey="value"
  label={renderCustomLabel}
  labelLine={true}
  paddingAngle={3}
  animationBegin={0}
  animationDuration={800}
>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default PieWidget