import { useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

const COLUMN_MAP = {
  'Customer ID': '_id',
  'Customer name': (o) => `${o.firstName} ${o.lastName}`,
  'Email id': 'email',
  'Phone number': 'phone',
  'Address': 'streetAddress',
  'Order ID': '_id',
  'Order date': (o) => new Date(o.createdAt).toLocaleDateString(),
  'Product': 'product',
  'Quantity': 'quantity',
  'Unit price': (o) => `$${o.unitPrice}`,
  'Total amount': (o) => `$${o.totalAmount}`,
  'Status': 'status',
  'Created by': 'createdBy'
}

const STATUS_STYLES = {
  'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
  'In progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border border-emerald-200'
}

const getCellValue = (order, col) => {
  const mapper = COLUMN_MAP[col]
  if (!mapper) return '—'
  if (typeof mapper === 'function') return mapper(order)
  return order[mapper] || '—'
}

const applyFilters = (orders, filters) => {
  if (!filters || !filters.length) return orders
  return orders.filter((order) => {
    return filters.every((filter) => {
      if (!filter.field || !filter.operator || !filter.value) return true
      const mapper = COLUMN_MAP[filter.field]
      let cellValue = ''
      if (typeof mapper === 'function') cellValue = mapper(order)
      else cellValue = order[mapper] || ''
      cellValue = String(cellValue).toLowerCase()
      const filterValue = filter.value.toLowerCase()
      switch (filter.operator) {
        case 'equals': return cellValue === filterValue
        case 'contains': return cellValue.includes(filterValue)
        case 'greater': return parseFloat(cellValue) > parseFloat(filterValue)
        case 'less': return parseFloat(cellValue) < parseFloat(filterValue)
        default: return true
      }
    })
  })
}

function TableWidget({ widget }) {
  const { orders } = useSelector((state) => state.orders)
  const config = widget.config || {}
  const [page, setPage] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(timer)
  }, [])

  const columns = config.columns || []
  const pageSize = parseInt(config.pagination) || orders.length
  const fontSize = config.fontSize || 14
  const headerBg = config.headerBg || '#6366f1'

  const filteredOrders = useMemo(() => {
    if (!config.applyFilter || !config.filters?.length) return orders
    return applyFilters(orders, config.filters)
  }, [orders, config.applyFilter, config.filters])

  const sortedOrders = useMemo(() => {
    if (!filteredOrders.length) return []
    const sorted = [...filteredOrders]
    if (config.sortBy === 'Ascending') {
      sorted.sort((a, b) => a.totalAmount - b.totalAmount)
    } else if (config.sortBy === 'Descending') {
      sorted.sort((a, b) => b.totalAmount - a.totalAmount)
    } else if (config.sortBy === 'Order date') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return sorted
  }, [filteredOrders, config.sortBy])

  const paginatedOrders = useMemo(() => {
    if (!config.pagination) return sortedOrders
    return sortedOrders.slice(page * pageSize, (page + 1) * pageSize)
  }, [sortedOrders, page, pageSize, config.pagination])

  const totalPages = Math.ceil(sortedOrders.length / pageSize)

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!columns.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full gap-2"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 4v16M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
          </svg>
        </div>
        <p className="text-gray-400 text-xs">Configure columns in settings</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full"
      style={{ minHeight: 0 }}
    >
      <div className="overflow-auto flex-1 rounded-xl border border-gray-100" style={{ minHeight: 0 }}>
        <table className="w-full border-collapse" style={{ fontSize: `${fontSize}px` }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col}
                  className="px-3 py-2.5 text-left text-white font-medium whitespace-nowrap text-xs tracking-wide"
                  style={{
                    backgroundColor: headerBg,
                    borderRadius: i === 0
                      ? '8px 0 0 0'
                      : i === columns.length - 1
                      ? '0 8px 0 0'
                      : '0'
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedOrders.map((order, rowIndex) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIndex * 0.03 }}
                  className={`transition-colors hover:bg-indigo-50 ${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="px-3 py-2 text-gray-600 whitespace-nowrap border-b border-gray-50"
                    >
                      {col === 'Status' ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      ) : (
                        <span className="text-gray-700">{getCellValue(order, col)}</span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {config.pagination && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 mt-2 flex-shrink-0">
          <p className="text-xs text-gray-400">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sortedOrders.length)} of {sortedOrders.length}
          </p>
          <div className="flex gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition font-medium"
            >
              Prev
            </motion.button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(i)}
                className={`w-7 h-7 text-xs rounded-lg font-medium transition ${
                  page === i
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition font-medium"
            >
              Next
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default TableWidget