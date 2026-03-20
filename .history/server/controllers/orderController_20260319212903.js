import Order from '../models/Order.js'
import { io } from '../index.js'

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone,
      streetAddress, city, state, postalCode,
      country, product, quantity, unitPrice,
      totalAmount, status, createdBy
    } = req.body

    const order = await Order.create({
      firstName, lastName, email, phone,
      streetAddress, city, state, postalCode,
      country, product, quantity, unitPrice,
      totalAmount, status, createdBy
    })

    // Emit real-time event to all connected clients
    io.emit('orderCreated', order)

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update an order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    // Emit real-time event to all connected clients
    io.emit('orderUpdated', updatedOrder)

    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    await order.deleteOne()

    // Emit real-time event to all connected clients
    io.emit('orderDeleted', req.params.id)

    res.status(200).json({ message: 'Order removed', id: req.params.id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get dashboard aggregated data
// @route   GET /api/orders/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const { filter } = req.query

    let dateQuery = {}
    const now = new Date()

    if (filter === 'today') {
      dateQuery = {
        createdAt: {
          $gte: new Date(now.setHours(0, 0, 0, 0))
        }
      }
    } else if (filter === 'last7') {
      dateQuery = {
        createdAt: {
          $gte: new Date(now.setDate(now.getDate() - 7))
        }
      }
    } else if (filter === 'last30') {
      dateQuery = {
        createdAt: {
          $gte: new Date(now.setDate(now.getDate() - 30))
        }
      }
    } else if (filter === 'last90') {
      dateQuery = {
        createdAt: {
          $gte: new Date(now.setDate(now.getDate() - 90))
        }
      }
    }

    const orders = await Order.find(dateQuery).sort({ createdAt: -1 })

    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}