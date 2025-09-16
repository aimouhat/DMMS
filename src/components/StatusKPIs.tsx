import React from 'react';
import { StatusStats } from '../types/action';

interface StatusKPIsProps {
  stats: StatusStats[];
}

const StatusKPIs: React.FC<StatusKPIsProps> = ({ stats }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-500';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Delay':
        return 'bg-amber-500';
      case 'Not started':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Ensure all 4 status types are always shown
  const allStatusTypes = ['Not started', 'In Progress', 'Delay', 'Done'];
  const statusColors = {
    'Done': '#10B981',
    'In Progress': '#3B82F6',
    'Delay': '#F59E0B',
    'Not started': '#EF4444'
  };

  const completeStats = allStatusTypes.map(status => {
    const existingStat = stats.find(s => s.status === status);
    return existingStat || {
      status,
      count: 0,
      percentage: 0,
      color: statusColors[status as keyof typeof statusColors]
    };
  });

  const totalActions = stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-2 sm:p-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 space-y-1 sm:space-y-0">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Action Status KPIs</h3>
        <div className="text-left sm:text-right">
          <div className="text-xs text-gray-600">Total Actions</div>
          <div className="text-lg sm:text-xl font-bold text-blue-600">{totalActions}</div>
        </div>
      </div>
      
      {/* Mobile: 2x2 Grid, Desktop: 1x4 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {completeStats.map((stat) => (
          <div key={stat.status} className="text-center p-2 sm:p-0">
            <div className="flex items-center justify-center mb-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(stat.status)} mr-1`}></div>
              <span className="text-xs font-medium text-gray-600 truncate">{stat.status}</span>
            </div>
            <div className="text-base sm:text-lg font-bold" style={{ color: stat.color }}>
              {stat.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {stat.count} actions
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusKPIs;