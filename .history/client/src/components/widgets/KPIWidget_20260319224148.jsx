import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const getFieldValue = (order, field) => {
  const map = {
    'Total amount': order.totalAmount,
    'Unit price': order.unitPrice,
    'Quantity': order.quantity,
    'Customer name': `${order.firstName} ${order.lastName}`,
    'Email id': order.email,
    'Address': order.streetAddress,
    'Product': order.product,
    'Status': order.status,
    'Created by': order.createdBy,
  }
  return map[field]
}

const aggregateData = (orders, metric, aggregation) => {
  if (!orders.length) return 0
  const values = orders.map((o) => getFieldValue(o, metric))
  if (aggregation === 'Count') return orders.length
  const numericValues = values.map((v) => parseFloat(v)).filter((v) => !isNaN(v))
  if (!numericValues.length) return 0
  if (aggregation === 'Sum') return numericValues.reduce((a, b) => a + b, 0)
  if (aggregation === 'Average') return numericValues.reduce((a, b) => a + b, 0) / numericValues.length
  return 0
}

const KPI_THEMES = [
  { bg: 'from-indigo-500 to-purple-600', icon: '◈', light: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'from-cyan-500 to-blue-600', icon: '◎', light: 'bg-cyan-100', text: 'text-cyan-600' },
  { bg: 'from-emerald-500 to-teal-600', icon: '◆', light: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'from-orange-500 to-rose-600', icon: '◉', light: 'bg-orange-100', text: 'text-orange-600' },
]

function KPIWidget({ widget }) {
  const { orders } = useSelector((state) => state.orders)
  const config = widget.config || {}
  const theme = KPI_THEMES[Math.abs(widget.id?.charCodeAt(7) || 0) % KPI_THEMES.length]

  const value = useMemo(() => {
    return aggregateData(orders, config.metric, config.aggregation)
  }, [orders, config.metric, config.aggregation])

  const formattedValue = useMemo(() => {
    const precision = config.decimalPrecision ?? 0
    const formatted = Number(value).toFixed(precision)
    if (config.dataFormat === 'Currency') return `$${Number(formatted).toLocaleString()}`
    return Number(formatted).toLocaleString()
  }, [value, config])

  if (!config.metric) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">◈</div>
        <p className="text-gray-400 text-xs">Configure metric in settings</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col justify-between h-full"
    >
      {/* Top section */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {config.metric}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{config.aggregation}</p>
        </div>
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center text-white text-lg shadow-lg`}
        >
          {theme.icon}
        </motion.div>
      </div>

      {/* Value */}
      <div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl font-bold text-gray-800 mt-3"
        >
          {formattedValue}
        </motion.p>
        {widget.description && (
          <p className="text-xs text-gray-400 mt-1">{widget.description}</p>
        )}
        {/* Bottom bar */}
        <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${theme.bg} opacity-60`} />
      </div>
    </motion.div>
  )
}

export default KPIWidget