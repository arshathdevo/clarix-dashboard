import { useMemo } from 'react'
import { useSelector } from 'react-redux'

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

  const numericValues = values
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v))

  if (!numericValues.length) return 0

  if (aggregation === 'Sum') {
    return numericValues.reduce((a, b) => a + b, 0)
  }
  if (aggregation === 'Average') {
    return numericValues.reduce((a, b) => a + b, 0) / numericValues.length
  }

  return 0
}

function KPIWidget({ widget }) {
  const { orders } = useSelector((state) => state.orders)
  const config = widget.config || {}

  const value = useMemo(() => {
    return aggregateData(orders, config.metric, config.aggregation)
  }, [orders, config.metric, config.aggregation])

  const formattedValue = useMemo(() => {
    const precision = config.decimalPrecision ?? 0
    const formatted = Number(value).toFixed(precision)
    if (config.dataFormat === 'Currency') return `$${formatted}`
    return formatted
  }, [value, config])

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <p className="text-sm font-medium text-gray-500">
          {config.metric || 'No metric selected'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {config.aggregation || 'No aggregation'}
        </p>
      </div>
      <div>
        <p className="text-4xl font-bold text-indigo-600 mt-4">
          {config.metric ? formattedValue : '—'}
        </p>
        {widget.description && (
          <p className="text-xs text-gray-400 mt-2">{widget.description}</p>
        )}
      </div>
    </div>
  )
}

export default KPIWidget