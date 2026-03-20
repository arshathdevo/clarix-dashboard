import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  layouts: {},
  widgets: [],
  dateFilter: 'all',
  isConfigMode: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.isLoading = true
    },
    setLayouts: (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.layouts = action.payload
    },
    setWidgets: (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.widgets = action.payload
    },
    addWidget: (state, action) => {
      state.widgets.push(action.payload)
    },
    updateWidget: (state, action) => {
      const index = state.widgets.findIndex(
        (w) => w.id === action.payload.id
      )
      if (index !== -1) {
        state.widgets[index] = action.payload
      }
    },
    deleteWidget: (state, action) => {
      state.widgets = state.widgets.filter(
        (w) => w.id !== action.payload
      )
    },
    setDateFilter: (state, action) => {
      state.dateFilter = action.payload
    },
    setConfigMode: (state, action) => {
      state.isConfigMode = action.payload
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
  setLayouts,
  setWidgets,
  addWidget,
  updateWidget,
  deleteWidget,
  setDateFilter,
  setConfigMode,
  setError,
  reset
} = dashboardSlice.actions

export default dashboardSlice.reducer