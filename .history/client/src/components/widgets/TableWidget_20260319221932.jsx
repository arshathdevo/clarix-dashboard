import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

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

const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'In progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700'
}

const getCellValue = (order, col) => {
  const mapper = COLUMN_MAP[col]
  if (!mapper) return '—'
  if (typeof mapper === 'function') return mapper(order)
  return order[mapper] || '—'
}

function TableWidget({ widget }) {
  const { orders } = useSelector((state) => state.orders)
  const config = widget.config || {}
  const [page, setPage] = useState(0)

  const columns = config.columns || []
  const pageSize = parseInt(config.pagination) || orders.length
  const fontSize = config.fontSize || 14
  const headerBg = config.headerBg || '#54bd95'

  const sortedOrders = useMemo(() => {
    if (!orders.length) return []
    const sorted = [...orders]
    if (config.sortBy === 'Ascending') {
      sorted.sort((a, b) => a.totalAmount - b.totalAmount)
    } else if (config.sortBy === 'Descending') {
      sorted.sort((a, b) => b.totalAmount - a.totalAmount)
    } else if (config.sortBy === 'Order date') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return sorted
  }, [orders, config.sortBy])

  const paginatedOrders = useMemo(() => {
    if (!config.pagination) return sortedOrders
    return sortedOrders.slice(page * pageSize, (page + 1) * pageSize)
  }, [sortedOrders, page, pageSize, config.pagination])

  const totalPages = Math.ceil(sortedOrders.length / pageSize)

  if (!columns.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Configure columns in settings
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto flex-1">
        <table className="w-full" style={{ fontSize: `${fontSize}px` }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-white font-medium whitespace-nowrap"
                  style={{ backgroundColor: headerBg }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {col === 'Status' ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    ) : (
                      getCellValue(order, col)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {config.pagination && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
          <p className="text-xs text-gray-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-2 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableWidget