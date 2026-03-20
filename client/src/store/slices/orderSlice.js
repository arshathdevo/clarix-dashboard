import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orders: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.isLoading = true
    },
    setOrders: (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.orders = action.payload
    },
    addOrder: (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.orders.unshift(action.payload)
    },
    updateOrder: (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      const index = state.orders.findIndex(
        (order) => order._id === action.payload._id
      )
      if (index !== -1) {
        state.orders[index] = action.payload
      }
    },
    deleteOrder: (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.orders = state.orders.filter(
        (order) => order._id !== action.payload
      )
    },
    setError: (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
    },
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
    }
  }
})

export const {
  setLoading,
  setOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  setError,
  reset
} = orderSlice.actions

export default orderSlice.reducer