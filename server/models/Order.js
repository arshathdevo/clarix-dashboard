import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    streetAddress: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      enum: ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong']
    },
    product: {
      type: String,
      required: [true, 'Product is required'],
      enum: [
        'Fiber Internet 300 Mbps',
        '5G Unlimited Mobile Plan',
        'Fiber Internet 1 Gbps',
        'Business Internet 500 Mbps',
        'VoIP Corporate Package'
      ]
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity cannot be less than 1'],
      default: 1
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required']
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Pending', 'In progress', 'Completed'],
      default: 'Pending'
    },
    createdBy: {
      type: String,
      required: [true, 'Created by is required'],
      enum: [
        'Mr. Michael Harris',
        'Mr. Ryan Cooper',
        'Ms. Olivia Carter',
        'Mr. Lucas Martin'
      ]
    }
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)

export default Order