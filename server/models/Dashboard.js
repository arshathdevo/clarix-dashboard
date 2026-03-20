import mongoose from 'mongoose'

const widgetSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, default: 'Untitled' },
  description: { type: String, default: '' },
  width: { type: Number, default: 4 },
  height: { type: Number, default: 4 },
  config: { type: mongoose.Schema.Types.Mixed, default: {} }
})

const dashboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    layouts: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    widgets: {
      type: [widgetSchema],
      default: []
    }
  },
  { timestamps: true }
)

const Dashboard = mongoose.model('Dashboard', dashboardSchema)

export default Dashboard