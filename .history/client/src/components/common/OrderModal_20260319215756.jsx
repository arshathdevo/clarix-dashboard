import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const COUNTRIES = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong']
const PRODUCTS = [
  'Fiber Internet 300 Mbps',
  '5G Unlimited Mobile Plan',
  'Fiber Internet 1 Gbps',
  'Business Internet 500 Mbps',
  'VoIP Corporate Package'
]
const STATUSES = ['Pending', 'In progress', 'Completed']
const CREATORS = [
  'Mr. Michael Harris',
  'Mr. Ryan Cooper',
  'Ms. Olivia Carter',
  'Mr. Lucas Martin'
]

const initialForm = {
  firstName: '', lastName: '', email: '', phone: '',
  streetAddress: '', city: '', state: '', postalCode: '',
  country: '', product: '', quantity: 1, unitPrice: '',
  totalAmount: '0.00', status: 'Pending', createdBy: ''
}

function OrderModal({ isOpen, onClose, onSubmit, editData }) {
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData)
      } else {
        setFormData(initialForm)
      }
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'quantity' && Number(value) < 1) return

    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      // Recalculate total inline without separate useEffect
      if (name === 'quantity' || name === 'unitPrice') {
        const qty = parseFloat(name === 'quantity' ? value : prev.quantity) || 0
        const price = parseFloat(name === 'unitPrice' ? value : prev.unitPrice) || 0
        updated.totalAmount = (qty * price).toFixed(2)
      }

      return updated
    })

    setErrors((prev) => {
      const updated = { ...prev }
      delete updated[name]
      return updated
    })
  }

  const validate = () => {
    const newErrors = {}
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone',
      'streetAddress', 'city', 'state', 'postalCode',
      'country', 'product', 'quantity', 'unitPrice',
      'status', 'createdBy'
    ]
    requiredFields.forEach((field) => {
      if (!formData[field] && formData[field] !== 0) {
        newErrors[field] = 'Please fill the field'
      }
    })
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill all required fields')
      return
    }
    onSubmit(formData)
  }

  const InputField = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  )

  const SelectField = ({ label, name, options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-40"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl z-20">
              <h2 className="text-lg font-semibold text-gray-800">
                {editData ? 'Edit Order' : 'Create Order'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="First name" name="firstName" placeholder="John" />
                  <InputField label="Last name" name="lastName" placeholder="Doe" />
                  <InputField label="Email ID" name="email" type="email" placeholder="john@example.com" />
                  <InputField label="Phone number" name="phone" placeholder="+1 234 567 8900" />
                  <div className="col-span-2">
                    <InputField label="Street address" name="streetAddress" placeholder="123 Main St" />
                  </div>
                  <InputField label="City" name="city" placeholder="New York" />
                  <InputField label="State / Province" name="state" placeholder="NY" />
                  <InputField label="Postal code" name="postalCode" placeholder="10001" />
                  <SelectField label="Country" name="country" options={COUNTRIES} />
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <SelectField label="Choose product" name="product" options={PRODUCTS} />
                  </div>
                  <InputField label="Quantity" name="quantity" type="number" placeholder="1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        autoComplete="off"
                        className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                          errors.unitPrice ? 'border-red-400 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.unitPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total amount
                    </label>
                    <input
                      type="text"
                      value={`$${formData.totalAmount}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <SelectField label="Status" name="status" options={STATUSES} />
                  <SelectField label="Created by" name="createdBy" options={CREATORS} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                >
                  {editData ? 'Save Changes' : 'Submit'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default OrderModal