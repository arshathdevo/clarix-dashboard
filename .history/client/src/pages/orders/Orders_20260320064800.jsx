import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import OrderModal from '../../components/common/OrderModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { orderService } from '../../services/api'
import {
  setOrders, addOrder, updateOrder,
  deleteOrder, setLoading
} from '../../store/slices/orderSlice'

const STATUS_STYLES = {
  'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
  'In progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border border-emerald-200'
}

const STATUS_DOT = {
  'Pending': 'bg-amber-400',
  'In progress': 'bg-blue-400',
  'Completed': 'bg-emerald-400'
}

const SUMMARY_CARDS = (orders) => [
  {
    label: 'Total Orders',
    value: orders.length,
    icon: '📋',
    gradient: 'from-indigo-500 to-purple-600',
    light: 'bg-indigo-50 text-indigo-600'
  },
  {
    label: 'Completed',
    value: orders.filter((o) => o.status === 'Completed').length,
    icon: '✅',
    gradient: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50 text-emerald-600'
  },
  {
    label: 'In Progress',
    value: orders.filter((o) => o.status === 'In progress').length,
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-600',
    light: 'bg-blue-50 text-blue-600'
  },
  {
    label: 'Total Revenue',
    value: `$${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}`,
    icon: '💰',
    gradient: 'from-orange-500 to-rose-600',
    light: 'bg-orange-50 text-orange-600'
  }
]

function Orders() {
  const dispatch = useDispatch()
  const { orders, isLoading } = useSelector((state) => state.orders)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, order: null })
  const [search, setSearch] = useState('')
  const contextRef = useRef(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, order: null })
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const fetchOrders = async () => {
    try {
      dispatch(setLoading())
      const res = await orderService.getOrders()
      dispatch(setOrders(res.data))
    } catch (error) {
      toast.error('Failed to fetch orders')
    }
  }

  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        const res = await orderService.updateOrder(editData._id, formData)
        dispatch(updateOrder(res.data))
        toast.success('Order updated successfully')
      } else {
        await orderService.createOrder(formData)
        // Socket.io handles addOrder via orderCreated event
        // so we don't dispatch here to avoid duplicates
        toast.success('Order created successfully')
      }
      setIsModalOpen(false)
      setEditData(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async () => {
    try {
      await orderService.deleteOrder(deleteId)
      dispatch(deleteOrder(deleteId))
      toast.success('Order deleted successfully')
      setIsConfirmOpen(false)
      setDeleteId(null)
    } catch (error) {
      toast.error('Failed to delete order')
    }
  }

  const handleContextMenu = (e, order) => {
    e.preventDefault()
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, order })
  }

  const handleEdit = () => {
    setEditData(contextMenu.order)
    setIsModalOpen(true)
    setContextMenu({ visible: false, x: 0, y: 0, order: null })
  }

  const handleDeleteClick = () => {
    setDeleteId(contextMenu.order._id)
    setIsConfirmOpen(true)
    setContextMenu({ visible: false, x: 0, y: 0, order: null })
  }

  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase()
    return (
      order.firstName?.toLowerCase().includes(q) ||
      order.lastName?.toLowerCase().includes(q) ||
      order.email?.toLowerCase().includes(q) ||
      order.product?.toLowerCase().includes(q) ||
      order.status?.toLowerCase().includes(q)
    )
  })

  const summaryCards = SUMMARY_CARDS(orders)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Orders</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage and track all customer orders
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditData(null); setIsModalOpen(true) }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Order
          </motion.button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.light} flex items-center justify-center text-lg`}>
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Table Header */}
          <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">All Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredOrders.length} of {orders.length} orders
              </p>
            </div>
            {/* Search */}
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </motion.div>
              <h3 className="text-gray-600 font-semibold">
                {search ? 'No orders match your search' : 'No orders yet'}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {search ? 'Try a different search term' : 'Click "Create Order" to add your first order'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Customer', 'Product', 'Qty', 'Unit Price', 'Total', 'Status', 'Created By', 'Date'].map((h) => (
                      <th key={h} className="px-3 md:px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.03 }}
                        onContextMenu={(e) => handleContextMenu(e, order)}
                        className={`border-b border-gray-50 hover:bg-indigo-50 cursor-context-menu transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                              {order.firstName?.charAt(0)}{order.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {order.firstName} {order.lastName}
                              </p>
                              <p className="text-xs text-gray-400">{order.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-gray-700 max-w-32 truncate">{order.product}</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{order.quantity}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">${order.unitPrice}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-gray-800">${order.totalAmount}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.status]}`} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{order.createdBy}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Context Menu */}
        <AnimatePresence>
          {contextMenu.visible && (
            <motion.div
              ref={contextRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-44"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Order
              </button>
              <div className="mx-3 my-1 border-t border-gray-100" />
              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Order
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <OrderModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditData(null) }}
          onSubmit={handleSubmit}
          editData={editData}
        />
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete Order"
          message="Are you sure you want to delete this order? This action cannot be undone."
        />
      </div>
    </Layout>
  )
}

export default Orders