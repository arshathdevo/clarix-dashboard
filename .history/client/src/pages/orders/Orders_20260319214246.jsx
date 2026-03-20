import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import OrderModal from '../../components/common/OrderModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { orderService } from '../../services/api'
import {
  setOrders, addOrder, updateOrder,
  deleteOrder, setLoading
} from '../../store/slices/orderSlice'

const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'In progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700'
}

function Orders() {
  const dispatch = useDispatch()
  const { orders, isLoading } = useSelector((state) => state.orders)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, order: null })
  const contextRef = useRef(null)

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders()
  }, [])

  // Close context menu on outside click
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
        const res = await orderService.createOrder(formData)
        dispatch(addOrder(res.data))
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Orders</h1>
            <p className="text-gray-500 text-sm mt-1">
              {orders.length} total orders
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditData(null); setIsModalOpen(true) }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Order
          </motion.button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-gray-600 font-medium">No orders yet</h3>
              <p className="text-gray-400 text-sm mt-1">Click "Create Order" to add your first order</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Customer', 'Product', 'Quantity', 'Unit Price', 'Total', 'Status', 'Created By', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onContextMenu={(e) => handleContextMenu(e, order)}
                      className="hover:bg-gray-50 cursor-context-menu transition"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {order.firstName} {order.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.product}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">${order.unitPrice}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">${order.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.createdBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <motion.div
            ref={contextRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-40"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </motion.div>
        )}

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