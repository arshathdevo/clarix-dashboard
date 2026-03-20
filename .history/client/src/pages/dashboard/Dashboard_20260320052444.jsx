import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Responsive, WidthProvider } from 'react-grid-layout'
import Layout from '../../components/layout/Layout'
import WidgetRenderer from '../../components/widgets/WidgetRenderer'
import WidgetSettings from '../../components/widgets/WidgetSettings'
import { dashboardService, orderService } from '../../services/api'
import {
  setLayouts, setWidgets, setConfigMode,
  addWidget, updateWidget, deleteWidget, setDateFilter
} from '../../store/slices/dashboardSlice'
import { setOrders } from '../../store/slices/orderSlice'

const ResponsiveGridLayout = WidthProvider(Responsive)

const WIDGET_TYPES = [
  { type: 'bar-chart', label: 'Bar Chart', group: 'Charts', icon: '📊' },
  { type: 'line-chart', label: 'Line Chart', group: 'Charts', icon: '📈' },
  { type: 'pie-chart', label: 'Pie Chart', group: 'Charts', icon: '🥧' },
  { type: 'area-chart', label: 'Area Chart', group: 'Charts', icon: '📉' },
  { type: 'scatter-plot', label: 'Scatter Plot', group: 'Charts', icon: '✦' },
  { type: 'table', label: 'Table', group: 'Tables', icon: '📋' },
  { type: 'kpi', label: 'KPI Value', group: 'KPIs', icon: '◈' }
]

const DATE_FILTERS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' }
]

const DEFAULT_WIDGET_SIZES = {
  'bar-chart': { w: 6, h: 5 },
  'line-chart': { w: 6, h: 5 },
  'pie-chart': { w: 4, h: 5 },
  'area-chart': { w: 6, h: 5 },
  'scatter-plot': { w: 6, h: 5 },
  'table': { w: 8, h: 5 },
  'kpi': { w: 3, h: 3 }
}

const WIDGET_GRADIENT = {
  'bar-chart': 'from-indigo-500 to-purple-600',
  'line-chart': 'from-blue-500 to-cyan-600',
  'pie-chart': 'from-pink-500 to-rose-600',
  'area-chart': 'from-teal-500 to-emerald-600',
  'scatter-plot': 'from-orange-500 to-amber-600',
  'table': 'from-slate-500 to-gray-600',
  'kpi': 'from-violet-500 to-indigo-600'
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
      id, type,
      title: 'Untitled',
      description: '',
      width: size.w,
      height: size.h,
      config: {}
    }

    const existingLg = layouts.lg || []
    const maxY = existingLg.reduce(
      (max, l) => Math.max(max, l.y + l.h), 0
    )

    const newLayoutItem = {
      i: id,
      x: 0,
      y: maxY,
      w: size.w,
      h: size.h,
      minW: 1,
      minH: 2
    }

    dispatch(addWidget(newWidget))
    dispatch(setLayouts({
      lg: [...(layouts.lg || []), newLayoutItem],
      md: [...(layouts.md || []), { ...newLayoutItem, w: Math.min(size.w, 8) }],
      sm: [...(layouts.sm || []), { ...newLayoutItem, w: Math.min(size.w, 4) }]
    }))

    toast.success(`${type.replace(/-/g, ' ')} added!`)
  }

  const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
    dispatch(setLayouts(allLayouts))
  }, [dispatch])

  const handleSettingsSave = (updatedWidget) => {
    dispatch(updateWidget(updatedWidget))
    toast.success('Widget settings saved')
  }

  const handleDeleteWidget = (id) => {
    dispatch(deleteWidget(id))
    dispatch(setLayouts({
      lg: (layouts.lg || []).filter((l) => l.i !== id),
      md: (layouts.md || []).filter((l) => l.i !== id),
      sm: (layouts.sm || []).filter((l) => l.i !== id)
    }))
    if (selectedWidget?.id === id) setIsSettingsOpen(false)
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
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isConfigMode ? 'Configure Dashboard' : 'Dashboard'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {widgets.length === 0
                ? 'No widgets configured yet'
                : `${widgets.length} widget${widgets.length > 1 ? 's' : ''} active`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isConfigMode && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <select
                  value={dateFilter}
                  onChange={(e) => dispatch(setDateFilter(e.target.value))}
                  className="text-sm text-gray-600 focus:outline-none bg-transparent"
                >
                  {DATE_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            )}
            <AnimatePresence mode="wait">
              {isConfigMode ? (
                <motion.div
                  key="config-buttons"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2"
                >
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
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 shadow-lg shadow-indigo-200"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Configuration
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  key="configure-button"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => dispatch(setConfigMode(true))}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configure Dashboard
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isConfigMode ? (
            <motion.div
              key="config-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-6"
            >
              {/* Widget Sidebar */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-60 flex-shrink-0"
              >
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Add Widgets
                  </p>
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <div key={group}>
                        <button
                          onClick={() => toggleGroup(group)}
                          className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider py-1.5 hover:text-gray-700 transition"
                        >
                          <span>{group}</span>
                          <motion.svg
                            animate={{ rotate: expandedGroups[group] ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-3.5 h-3.5"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </button>
                        <AnimatePresence>
                          {expandedGroups[group] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 py-1">
                                {WIDGET_TYPES.filter((w) => w.group === group).map((widget) => (
                                  <motion.button
                                    key={widget.type}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleAddWidget(widget.type)}
                                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-3 group"
                                  >
                                    <span className="text-base">{widget.icon}</span>
                                    <span className="font-medium">{widget.label}</span>
                                    <svg
                                      className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition text-indigo-400"
                                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Canvas with react-grid-layout */}
              <div className="flex-1 min-w-0">
                {widgets.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-96 text-center p-8"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4"
                    >
                      <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </motion.div>
                    <h3 className="text-gray-600 font-semibold text-lg">Canvas is empty</h3>
                    <p className="text-gray-400 text-sm mt-2 max-w-xs">
                      Click any widget from the left panel to add it to your dashboard
                    </p>
                  </motion.div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-1">
                    <ResponsiveGridLayout
                      className="layout"
                      layouts={layouts}
                      breakpoints={{ lg: 1200, md: 768, sm: 480 }}
                      cols={{ lg: 12, md: 8, sm: 4 }}
                      rowHeight={60}
                      onLayoutChange={handleLayoutChange}
                      draggableHandle=".drag-handle"
                      margin={[10, 10]}
                      containerPadding={[10, 10]}
                      isResizable={true}
                      isDraggable={true}
                      resizeHandles={['se']}
                    >
                      {widgets.map((widget) => (
                        <div
                          key={widget.id}
                          className="bg-white rounded-2xl border border-gray-100 relative group flex flex-col shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          {/* Colored top bar */}
                          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${WIDGET_GRADIENT[widget.type]}`} />

                          {/* Drag handle header */}
                          <div className="drag-handle flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing select-none">
                            <div className="flex items-center gap-2">
                              {/* Drag dots indicator */}
                              <div className="grid grid-cols-2 gap-0.5 opacity-30 group-hover:opacity-70 transition">
                                {[...Array(6)].map((_, i) => (
                                  <div key={i} className="w-1 h-1 rounded-full bg-gray-500" />
                                ))}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 leading-tight">
                                  {widget.title}
                                </p>
                                <p className="text-xs text-gray-400 capitalize">
                                  {widget.type.replace(/-/g, ' ')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleOpenSettings(widget)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-50 transition"
                                title="Settings"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteWidget(widget.id)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>

                          {/* Widget Content */}
                          <div className="flex-1 min-h-0 px-4 pb-3 overflow-hidden">
                            <WidgetRenderer widget={widget} />
                          </div>
                        </div>
                      ))}
                    </ResponsiveGridLayout>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* View Mode */
            <motion.div
              key="view-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {widgets.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-96 text-center p-8"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mb-6"
                  >
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-gray-700 font-semibold text-xl">No widgets configured</h3>
                  <p className="text-gray-400 text-sm mt-2 mb-8 max-w-sm">
                    Start building your personalized dashboard by adding widgets
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => dispatch(setConfigMode(true))}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Configure Dashboard
                  </motion.button>
                </motion.div>
              ) : (
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}
                >
                  {widgets.map((widget, index) => (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                      style={{
                        gridColumn: `span ${Math.min(widget.width, 12)}`,
                        height: widget.type === 'kpi' ? 160 : 320
                      }}
                      className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${WIDGET_GRADIENT[widget.type]}`} />
                      <div className="flex-shrink-0 mb-3 pt-1">
                        <p className="text-sm font-semibold text-gray-800">{widget.title}</p>
                        {widget.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{widget.description}</p>
                        )}
                      </div>
                      <div className="flex-1 min-h-0">
                        <WidgetRenderer widget={widget} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Widget Settings Panel */}
      <WidgetSettings
        widget={selectedWidget}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
    </Layout>
  )
}

export default Dashboard