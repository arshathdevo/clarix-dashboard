import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LabelList
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
    const key = getFieldValue(order, xAxis)
    const val = parseFloat(getFieldValue(order, yAxis)) || 1
    if (!grouped[key]) grouped[key] = { name: key, value: 0, count: 0 }
    grouped[key].value += val
    grouped[key].count += 1
  })

  return Object.values(grouped).slice(0, 10)
}

function ChartWidget({ widget }) {
  const { orders } = useSelector((state) => state.orders)
  const config = widget.config || {}
  const color = config.chartColor || '#6366f1'
  const showLabel = config.showDataLabel || false

  const data = useMemo(() => {
    return prepareChartData(orders, config.xAxis, config.yAxis)
  }, [orders, config.xAxis, config.yAxis])

  if (!config.xAxis || !config.yAxis) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Configure X and Y axis in settings
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

  const commonProps = {
    data,
    margin: { top: 5, right: 10, left: 0, bottom: 5 }
  }

  const renderChart = () => {
    switch (widget.type) {
      case 'bar-chart':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]}>
              {showLabel && <LabelList dataKey="value" position="top" style={{ fontSize: 10 }} />}
            </Bar>
          </BarChart>
        )

      case 'line-chart':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color }}
            >
              {showLabel && <LabelList dataKey="value" position="top" style={{ fontSize: 10 }} />}
            </Line>
          </LineChart>
        )

      case 'area-chart':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            >
              {showLabel && <LabelList dataKey="value" position="top" style={{ fontSize: 10 }} />}
            </Area>
          </AreaChart>
        )

      case 'scatter-plot':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis dataKey="value" tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill={color} />
          </ScatterChart>
        )

      default:
        return null
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  )
}

export default ChartWidget