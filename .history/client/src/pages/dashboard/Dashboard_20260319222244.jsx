import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import WidgetRenderer from '../../components/widgets/WidgetRenderer'
import WidgetSettings from '../../components/widgets/WidgetSettings'
import { dashboardService, orderService } from '../../services/api'
import {
  setLayouts, setWidgets, setConfigMode,
  addWidget, updateWidget, deleteWidget, setDateFilter
} from '../../store/slices/dashboardSlice'
import { setOrders } from '../../store/slices/orderSlice'

const WIDGET_TYPES = [
  { type: 'bar-chart', label: 'Bar Chart', group: 'Charts' },
  { type: 'line-chart', label: 'Line Chart', group: 'Charts' },
  { type: 'pie-chart', label: 'Pie Chart', group: 'Charts' },
  { type: 'area-chart', label: 'Area Chart', group: 'Charts' },
  { type: 'scatter-plot', label: 'Scatter Plot', group: 'Charts' },
  { type: 'table', label: 'Table', group: 'Tables' },
  { type: 'kpi', label: 'KPI Value', group: 'KPIs' }
]

const DATE_FILTERS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' }
]

const DEFAULT_WIDGET_SIZES = {
  'bar-chart': { w: 6, h: 4 },
  'line-chart': { w: 6, h: 4 },
  'pie-chart': { w: 4, h: 4 },
  'area-chart': { w: 6, h: 4 },
  'scatter-plot': { w: 6, h: 4 },
  'table': { w: 8, h: 4 },
  'kpi': { w: 3, h: 2 }
}

const WIDGET_HEIGHTS = {
  'bar-chart': 280,
  'line-chart': 280,
  'pie-chart': 280,
  'area-chart': 280,
  'scatter-plot': 280,
  'table': 300,
  'kpi': 140
}

function Dashboard() {
  const dispatch = useDispatch()
  const { layouts, widgets, isConfigMode, dateFilter } = useSelector(
    (state) => state.dashboard
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState({
    Charts: true, Tables: true, KPIs: true
  })
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    fetchDashboard()
    fetchOrders()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [dateFilter])

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getDashboard()
      dispatch(setLayouts(res.data.layouts || {}))
      dispatch(setWidgets(res.data.widgets || []))
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const filter = dateFilter !== 'all' ? dateFilter : ''
      const res = await orderService.getOrders(
        filter ? `?filter=${filter}` : ''
      )
      dispatch(setOrders(res.data))
    } catch (error) {
      console.error('Failed to fetch orders')
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await dashboardService.saveDashboard({ layouts, widgets })
      toast.success('Dashboard saved successfully')
      dispatch(setConfigMode(false))
    } catch (error) {
      toast.error('Failed to save dashboard')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddWidget = (type) => {
    const id = `widget-${Date.now()}`
    const size = DEFAULT_WIDGET_SIZES[type]
    const newWidget = {
      id,
      type,
      title: 'Untitled',
      description: '',
      width: size.w,
      height: size.h,
      config: {}
    }
    dispatch(addWidget(newWidget))
    toast.success(`${type.replace(/-/g, ' ')} added!`)
  }

  const handleSettingsSave = (updatedWidget) => {
    dispatch(updateWidget(updatedWidget))
    toast.success('Widget settings saved')
  }

  const handleDeleteWidget = (id) => {
    dispatch(deleteWidget(id))
    toast.success('Widget removed')
  }

  const handleOpenSettings = (widget) => {
    setSelectedWidget(widget)
    setIsSettingsOpen(true)
  }

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  const groups = [...new Set(WIDGET_TYPES.map((w) => w.group))]

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              {widgets.length === 0
                ? 'No widgets configured yet'
                : `${widgets.length} widget${widgets.length > 1 ? 's' : ''} configured`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isConfigMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Show data for</span>
                <select
                  value={dateFilter}
                  onChange={(e) => dispatch(setDateFilter(e.target.value))}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DATE_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            )}
            {isConfigMode ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => dispatch(setConfigMode(false))}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => dispatch(setConfigMode(true))}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configure Dashboard
              </motion.button>
            )}
          </div>
        </div>

        {isConfigMode ? (
          <div className="flex gap-6">
            {/* Widget Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Widgets</h3>
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div key={group}>
                      <button
                        onClick={() => toggleGroup(group)}
                        className="w-full flex items-center justify-between text-sm font-medium text-gray-600 py-1"
                      >
                        <span>{group}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedGroups[group] ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedGroups[group] && (
                        <div className="mt-2 space-y-1 pl-2">
                          {WIDGET_TYPES.filter((w) => w.group === group).map((widget) => (
                            <motion.button
                              key={widget.type}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAddWidget(widget.type)}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              {widget.label}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1">
              {widgets.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-96 text-center p-8">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />