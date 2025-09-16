import React from 'react';
import { StatusStats } from '../types/action';

interface StatusCardProps {
  status: StatusStats;
}

const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
      <div className="text-gray-600 text-sm font-medium mb-1">Status</div>
      <div className="text-lg font-bold mb-2">{status.status}</div>
      <div className="flex items-center mt-1">
        <div 
          className="w-4 h-4 rounded-full mr-2" 
          style={{ backgroundColor: status.color }}
        ></div>
        <div className="text-2xl font-bold">{status.count}</div>
      </div>
      <div className="mt-2 flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full" 
            style={{ width: `${status.percentage}%`, backgroundColor: status.color }}
          ></div>
        </div>
        <span className="ml-2 text-sm font-medium">{status.percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default StatusCard;