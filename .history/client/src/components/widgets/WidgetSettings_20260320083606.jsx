import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const METRICS = [
  'Customer ID', 'Customer name', 'Email id', 'Address',
  'Order date', 'Product', 'Status', 'Created by',
  'Total amount', 'Unit price', 'Quantity'
]
const NON_NUMERIC_METRICS = [
  'Customer ID', 'Customer name', 'Email id', 'Address',
  'Order date', 'Product', 'Status', 'Created by'
]
const AGGREGATIONS = ['Sum', 'Average', 'Count']
const DATA_FORMATS = ['Number', 'Currency']
const CHART_FIELDS = [
  'Product', 'Quantity', 'Unit price',
  'Total amount', 'Status', 'Created by', 'Duration'
]
const PIE_FIELDS = [
  'Product', 'Quantity', 'Unit price',
  'Total amount', 'Status', 'Created by'
]
const TABLE_COLUMNS = [
  'Customer ID', 'Customer name', 'Email id', 'Phone number',
  'Address', 'Order ID', 'Order date', 'Product', 'Quantity',
  'Unit price', 'Total amount', 'Status', 'Created by'
]
const SORT_OPTIONS = ['Ascending', 'Descending', 'Order date']
const PAGINATION_OPTIONS = ['5', '10', '15']
const FILTER_OPERATORS = ['Equals', 'Contains', 'Greater than', 'Less than']

const InputRow = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
)

function WidgetSettings({ widget, isOpen, onClose, onSave }) {
  const [config, setConfig] = useState({})
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [width, setWidth] = useState(widget?.width || 4)
  const [height, setHeight] = useState(widget?.height || 4)

  useEffect(() => {
    if (widget) {
      setConfig(widget.config || {})
      setTitle(widget.title || 'Untitled')
      setDescription(widget.description || '')
      setWidth(widget.width || 4)
      setHeight(widget.height || 4)
    }
  }, [widget])

  const handleSave = () => {
    onSave({ ...widget, title, description, width, height, config })
    onClose()
  }

  const toggleColumn = (col) => {
    const cols = config.columns || []
    if (cols.includes(col)) {
      setConfig({ ...config, columns: cols.filter((c) => c !== col) })
    } else {
      setConfig({ ...config, columns: [...cols, col] })
    }
  }

  const addFilter = () => {
    const filters = config.filters || []
    setConfig({
      ...config,
      filters: [...filters, { field: '', operator: 'Equals', value: '' }]
    })
  }

  const updateFilter = (index, key, value) => {
    const updated = [...(config.filters || [])]
    updated[index] = { ...updated[index], [key]: value }
    setConfig({ ...config, filters: updated })
  }

  const removeFilter = (index) => {
    const updated = (config.filters || []).filter((_, i) => i !== index)
    setConfig({ ...config, filters: updated })
  }

  if (!widget) return null

  const isChart = ['bar-chart', 'line-chart', 'area-chart', 'scatter-plot'].includes(widget.type)
  const isPie = widget.type === 'pie-chart'
  const isTable = widget.type === 'table'
  const isKpi = widget.type === 'kpi'
  const isAggregationDisabled = NON_NUMERIC_METRICS.includes(config.metric)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 z-40 flex flex-col shadow-xl"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Widget Settings</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* General */}
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">General</p>
              <div className="space-y-3">
                <InputRow label="Widget title">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </InputRow>
                <InputRow label="Widget type">
                  <input
                    type="text"
                    value={widget.type.replace(/-/g, ' ')}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed capitalize"
                  />
                </InputRow>
                <InputRow label="Description">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </InputRow>
              </div>
            </div>

            {/* Widget Size */}
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Widget Size</p>
              <div className="grid grid-cols-2 gap-3">
                <InputRow label="Width (columns)">
                  <input
                    type="number"
                    value={width}
                    min={1}
                    max={12}
                    onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </InputRow>
                <InputRow label="Height (rows)">
                  <input
                    type="number"
                    value={height}
                    min={1}
                    onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </InputRow>
              </div>
            </div>

            {/* KPI Settings */}
            {isKpi && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Data Settings</p>
                <div className="space-y-3">
                  <InputRow label="Select metric">
                    <select
                      value={config.metric || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        metric: e.target.value,
                        aggregation: NON_NUMERIC_METRICS.includes(e.target.value) ? 'Count' : config.aggregation
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select...</option>
                      {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </InputRow>
                  <InputRow label="Aggregation">
                    <select
                      value={config.aggregation || ''}
                      onChange={(e) => setConfig({ ...config, aggregation: e.target.value })}
                      disabled={isAggregationDisabled}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <option value="">Select...</option>
                      {AGGREGATIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </InputRow>
                  {isAggregationDisabled && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      Only numeric fields support Sum and Average. Count is applied automatically.
                    </p>
                  )}
                  <InputRow label="Data format">
                    <select
                      value={config.dataFormat || 'Number'}
                      onChange={(e) => setConfig({ ...config, dataFormat: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {DATA_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </InputRow>
                  <InputRow label="Decimal precision">
                    <input
                      type="number"
                      value={config.decimalPrecision ?? 0}
                      min={0}
                      onChange={(e) => setConfig({ ...config, decimalPrecision: Math.max(0, parseInt(e.target.value)) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </InputRow>
                </div>
              </div>
            )}

            {/* Chart Settings */}
            {isChart && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Data Settings</p>
                <div className="space-y-3">
                  <InputRow label="Choose X-Axis data">
                    <select
                      value={config.xAxis || ''}
                      onChange={(e) => setConfig({ ...config, xAxis: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select...</option>
                      {CHART_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </InputRow>
                  <InputRow label="Choose Y-Axis data">
                    <select
                      value={config.yAxis || ''}
                      onChange={(e) => setConfig({ ...config, yAxis: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select...</option>
                      {CHART_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </InputRow>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider pt-2">Styling</p>
                  <InputRow label="Chart color">
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={config.chartColor || '#6366f1'}
                        onChange={(e) => setConfig({ ...config, chartColor: e.target.value })}
                        className="w-10 h-9 border border-gray-200 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.chartColor || '#6366f1'}
                        onChange={(e) => setConfig({ ...config, chartColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </InputRow>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showLabel"
                      checked={config.showDataLabel || false}
                      onChange={(e) => setConfig({ ...config, showDataLabel: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="showLabel" className="text-sm text-gray-600">Show data label</label>
                  </div>
                </div>
              </div>
            )}

            {/* Pie Settings */}
            {isPie && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Data Settings</p>
                <div className="space-y-3">
                  <InputRow label="Choose chart data">
                    <select
                      value={config.chartData || ''}
                      onChange={(e) => setConfig({ ...config, chartData: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select...</option>
                      {PIE_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </InputRow>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showLegend"
                      checked={config.showLegend || false}
                      onChange={(e) => setConfig({ ...config, showLegend: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="showLegend" className="text-sm text-gray-600">Show legend</label>
                  </div>
                </div>
              </div>
            )}

            {/* Table Settings */}
            {isTable && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Data Settings</p>
                <div className="space-y-3">
                  <InputRow label="Choose columns">
                    <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {TABLE_COLUMNS.map((col) => (
                        <div key={col} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={col}
                            checked={(config.columns || []).includes(col)}
                            onChange={() => toggleColumn(col)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <label htmlFor={col} className="text-sm text-gray-600">{col}</label>
                        </div>
                      ))}
                    </div>
                  </InputRow>
                  <InputRow label="Sort by">
                    <select
                      value={config.sortBy || ''}
                      onChange={(e) => setConfig({ ...config, sortBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">None</option>
                      {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </InputRow>
                  <InputRow label="Pagination">
                    <select
                      value={config.pagination || ''}
                      onChange={(e) => setConfig({ ...config, pagination: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">None</option>
                      {PAGINATION_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </InputRow>

                  {/* Apply Filter */}
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="applyFilter"
                        checked={config.applyFilter || false}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            applyFilter: e.target.checked,
                            filters: e.target.checked
                              ? (config.filters?.length ? config.filters : [{ field: '', operator: 'Equals', value: '' }])
                              : []
                          })
                        }}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <label htmlFor="applyFilter" className="text-sm font-medium text-gray-700">
                        Apply filter
                      </label>
                    </div>

                    {/* Filter rows */}
                    {config.applyFilter && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 bg-gray-50 rounded-xl p-3 border border-gray-100"
                      >
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Filter conditions
                        </p>
                        {(config.filters || []).map((filter, index) => (
                          <div key={index} className="space-y-1.5 bg-white rounded-lg p-2 border border-gray-100">
                            <select
                              value={filter.field || ''}
                              onChange={(e) => updateFilter(index, 'field', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Select field...</option>
                              {TABLE_COLUMNS.map((col) => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                            <select
                              value={filter.operator || 'Equals'}
                              onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {FILTER_OPERATORS.map((op) => (
                                <option key={op} value={op}>{op}</option>
                              ))}
                            </select>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={filter.value || ''}
                                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                placeholder="Value..."
                                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => removeFilter(index)}
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={addFilter}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-indigo-300 rounded-lg text-xs text-indigo-600 hover:bg-indigo-50 transition font-medium"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add filter
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Styling */}
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider pt-2">Styling</p>
                  <InputRow label="Font size (12-18)">
                    <input
                      type="number"
                      value={config.fontSize || 14}
                      min={12}
                      max={18}
                      onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </InputRow>
                  <InputRow label="Header background">
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={config.headerBg || '#54bd95'}
                        onChange={(e) => setConfig({ ...config, headerBg: e.target.value })}
                        className="w-10 h-9 border border-gray-200 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.headerBg || '#54bd95'}
                        onChange={(e) => setConfig({ ...config, headerBg: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </InputRow>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
            >
              Apply Settings
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WidgetSettings