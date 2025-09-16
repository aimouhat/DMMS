import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Action } from '../types/action';
import { format, subDays, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Calendar, TrendingUp, BarChart3, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ActionTimelineProps {
  actions: Action[];
}

const ActionTimeline: React.FC<ActionTimelineProps> = ({ actions }) => {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30' | 'custom'>('7');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const statusColors = {
    'Done': '#10B981',
    'In Progress': '#3B82F6',
    'Delay': '#F59E0B',
    'Not started': '#EF4444'
  };

  const getDateRange = () => {
    const today = new Date();
    
    if (timeRange === 'custom') {
      // Ensure we have valid dates for custom range
      const start = customStartDate ? startOfDay(customStartDate) : startOfDay(subDays(today, 6));
      const end = customEndDate ? endOfDay(customEndDate) : endOfDay(today);
      
      return { start, end };
    }
    
    const days = parseInt(timeRange);
    return {
      start: startOfDay(subDays(today, days - 1)),
      end: endOfDay(today)
    };
  };

  const getFilteredActions = () => {
    const { start, end } = getDateRange();
    
    return actions.filter(action => {
      const actionDate = parseISO(action.fromDate);
      return isWithinInterval(actionDate, { start, end });
    });
  };

  const generateTimelineData = () => {
    const { start, end } = getDateRange();
    const filteredActions = getFilteredActions();
    
    // Generate date labels
    const dates: Date[] = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count actions by date and status
    const dataByStatus: { [status: string]: number[] } = {
      'Done': [],
      'In Progress': [],
      'Delay': [],
      'Not started': []
    };

    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      Object.keys(statusColors).forEach(status => {
        const count = filteredActions.filter(action => 
          action.fromDate === dateStr && action.status === status
        ).length;
        dataByStatus[status].push(count);
      });
    });

    return {
      labels: dates.map(date => format(date, 'dd/MM')),
      datasets: Object.entries(statusColors).map(([status, color]) => ({
        label: status,
        data: dataByStatus[status],
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
      }))
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          title: (context: any) => {
            const dateIndex = context[0].dataIndex;
            const { start } = getDateRange();
            const targetDate = new Date(start);
            targetDate.setDate(targetDate.getDate() + dateIndex);
            return format(targetDate, 'EEEE, dd MMMM yyyy');
          },
          afterBody: (context: any) => {
            const dateIndex = context[0].dataIndex;
            const total = context.reduce((sum: number, item: any) => sum + item.raw, 0);
            return total > 0 ? [`Total: ${total} actions`] : ['No actions on this date'];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    }
  };

  const handleTimeRangeChange = (range: '7' | '14' | '30' | 'custom') => {
    setTimeRange(range);
    if (range !== 'custom') {
      setShowCustomPicker(false);
      setCustomStartDate(null);
      setCustomEndDate(null);
    } else {
      setShowCustomPicker(true);
    }
  };

  const getStatsForRange = () => {
    const filteredActions = getFilteredActions();
    const totalActions = filteredActions.length;
    
    const statusCounts = filteredActions.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalActions, statusCounts };
  };

  const { totalActions, statusCounts } = getStatsForRange();
  const { start, end } = getDateRange();

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Actions Timeline</h3>
        </div>
        
        {/* Time Range Buttons */}
        <div className="flex flex-wrap gap-2">
          {(['7', '14', '30'] as const).map((days) => (
            <button
              key={days}
              onClick={() => handleTimeRangeChange(days)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                timeRange === days
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} days
            </button>
          ))}
          <button
            onClick={() => handleTimeRangeChange('custom')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 flex items-center space-x-1 ${
              timeRange === 'custom'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <DatePicker
                selected={customStartDate}
                onChange={setCustomStartDate}
                placeholderText="Select start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <DatePicker
                selected={customEndDate}
                onChange={setCustomEndDate}
                placeholderText="Select end date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="dd/MM/yyyy"
                minDate={customStartDate}
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Period: {format(start, 'dd MMM')} - {format(end, 'dd MMM yyyy')}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Total: {totalActions} actions</span>
            </div>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                ></div>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="h-64">
          {totalActions > 0 ? (
            <Line data={generateTimelineData()} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No actions found for the selected period</p>
                <p className="text-xs text-gray-400 mt-1">Try selecting a different date range</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionTimeline;