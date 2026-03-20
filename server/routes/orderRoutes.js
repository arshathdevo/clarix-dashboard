import express from 'express'
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getDashboardData
} from '../controllers/orderController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

// @route   GET /api/orders/dashboard
router.get('/dashboard', protect, getDashboardData)

// @route   GET /api/orders
router.get('/', protect, getOrders)

// @route   POST /api/orders
router.post('/', protect, createOrder)

// @route   PUT /api/orders/:id
router.put('/:id', protect, updateOrder)

// @route   DELETE /api/orders/:id
router.delete('/:id', protect, deleteOrder)

export default router