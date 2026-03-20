import Dashboard from '../models/Dashboard.js'

// @desc    Get dashboard for logged in user
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne({ user: req.user._id })

    if (!dashboard) {
      dashboard = await Dashboard.create({
        user: req.user._id,
        layouts: {},
        widgets: []
      })
    }

    res.status(200).json(dashboard)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Save dashboard layout and widgets
// @route   POST /api/dashboard
// @access  Private
export const saveDashboard = async (req, res) => {
  try {
    const { layouts, widgets } = req.body

    let dashboard = await Dashboard.findOne({ user: req.user._id })

    if (dashboard) {
      dashboard.layouts = layouts
      dashboard.widgets = widgets
      await dashboard.save()
    } else {
      dashboard = await Dashboard.create({
        user: req.user._id,
        layouts,
        widgets
      })
    }

    res.status(200).json(dashboard)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}