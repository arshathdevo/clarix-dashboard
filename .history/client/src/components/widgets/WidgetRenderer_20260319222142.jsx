import KPIWidget from './KPIWidget'
import ChartWidget from './ChartWidget'
import PieWidget from './PieWidget'
import TableWidget from './TableWidget'

function WidgetRenderer({ widget }) {
  const renderWidget = () => {
    switch (widget.type) {
      case 'kpi':
        return <KPIWidget widget={widget} />
      case 'bar-chart':
      case 'line-chart':
      case 'area-chart':
      case 'scatter-plot':
        return <ChartWidget widget={widget} />
      case 'pie-chart':
        return <PieWidget widget={widget} />
      case 'table':
        return <TableWidget widget={widget} />
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Unknown widget type
          </div>
        )
    }
  }

  return (
    <div className="w-full h-full">
      {renderWidget()}
    </div>
  )
}

export default WidgetRenderer