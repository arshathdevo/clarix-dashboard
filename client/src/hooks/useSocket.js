import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import {
  addOrder, updateOrder, deleteOrder
} from '../store/slices/orderSlice'
import toast from 'react-hot-toast'

let socket

const useSocket = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    socket = io('http://localhost:5000')

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    socket.on('orderCreated', (order) => {
      dispatch(addOrder(order))
      toast.success('New order received!', {
        icon: '🔔',
        style: {
          borderLeft: '4px solid #6366f1'
        }
      })
    })

    socket.on('orderUpdated', (order) => {
      dispatch(updateOrder(order))
      toast.success('Order updated!', {
        icon: '✏️',
        style: {
          borderLeft: '4px solid #06b6d4'
        }
      })
    })

    socket.on('orderDeleted', (id) => {
      dispatch(deleteOrder(id))
      toast.success('Order deleted!', {
        icon: '🗑️',
        style: {
          borderLeft: '4px solid #f43f5e'
        }
      })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    return () => {
      socket.disconnect()
    }
  }, [dispatch])
}

export default useSocket