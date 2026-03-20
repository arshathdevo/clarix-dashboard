import { createSlice } from '@reduxjs/toolkit'

const user = JSON.parse(localStorage.getItem('user'))

const initialState = {
  user: user ? user : null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.isLoading = true
    },
    setUser: (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.user = action.payload
    },
    setError: (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
      state.user = null
    },
    logout: (state) => {
      state.user = null
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
      localStorage.removeItem('user')
    },
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
    }
  }
})

export const { setLoading, setUser, setError, logout, reset } = authSlice.actions
export default authSlice.reducer