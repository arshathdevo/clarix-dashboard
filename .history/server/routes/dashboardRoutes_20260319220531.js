import express from 'express'
import { getDashboard, saveDashboard } from '../controllers/dashboardController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

// @route   GET /api/dashboard
router.get('/', protect, getDashboard)

// @route   POST /api/dashboard
router.post('/', protect, saveDashboard)

export default router