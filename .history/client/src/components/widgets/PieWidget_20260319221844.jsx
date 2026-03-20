import { useMemo } from 'react'
import { useSelector } from 'react-redux'
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

function PieWidget({ widget }) {
  const { orders } = useSelector((state) => state.orders)
  const config = widget.config || {}

  const data = useMemo(() => {
    if (!orders.length || !config.chartData) return []

    const grouped = {}
    orders.forEach((order) => {
      const key = getFieldValue(order, config.chartData)
      if (!grouped[key]) grouped[key] = { name: key, value: 0 }
      grouped[key].value += 1
    })

    return Object.values(grouped)
  }, [orders, config.chartData])

  if (!config.chartData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Configure chart data in settings
      </div>
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
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius="70%"
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        {config.showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )
}

export default PieWidget