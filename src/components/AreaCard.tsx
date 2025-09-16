import React from 'react';
import { AreaStats } from '../types/action';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AreaCardProps {
  stats: AreaStats;
}

const AreaCard: React.FC<AreaCardProps> = ({ stats }) => {
  const data = {
    labels: ['Done', 'Not Done'],
    datasets: [
      {
        data: [stats.done, stats.total - stats.done],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = (value / stats.total) * 100;
            return `${label}: ${value} (${percentage.toFixed(1)}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
      <div className="text-gray-600 text-sm font-medium mb-1">Area</div>
      <div className="text-lg font-bold mb-2 truncate">{stats.area}</div>
      <div className="flex-1 flex items-center justify-center">
        <div className="h-28 w-full">
          <Pie data={data} options={options} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-green-100 p-2 rounded">
          <div className="text-xs text-green-800">Done</div>
          <div className="text-lg font-bold text-green-800">{stats.done}</div>
        </div>
        <div className="bg-red-100 p-2 rounded">
          <div className="text-xs text-red-800">Not Done</div>
          <div className="text-lg font-bold text-red-800">{stats.total - stats.done}</div>
        </div>
      </div>
    </div>
  );
};

export default AreaCard;