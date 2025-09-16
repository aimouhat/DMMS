import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search, Calendar, Filter, X, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  onFilter: (filters: {
    dateRange: { start: Date | null; end: Date | null };
    searchTerm: string;
    status: string;
    area: string;
  }) => void;
  areas: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilter, areas }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('auto-filter');
  const [area, setArea] = useState('');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    handleFilter();
  }, []);

  const handleFilter = () => {
    onFilter({
      dateRange: { start: startDate, end: endDate },
      searchTerm,
      status: status === 'auto-filter' ? 'auto-filter' : status,
      area
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchTerm('');
    setStatus('auto-filter');
    setArea('');
    onFilter({
      dateRange: { start: null, end: null },
      searchTerm: '',
      status: 'auto-filter',
      area: ''
    });
  };

  if (isMobileView) {
    return (
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-3 rounded-xl shadow-lg">
        {/* Mobile Search Bar */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search actions..."
            className="pl-9 pr-4 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === '') handleFilter();
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                handleFilter();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-2 text-white bg-blue-950/50 px-3 py-2 rounded-lg border border-blue-700"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-blue-950/50 text-gray-300 rounded-lg hover:bg-blue-950 hover:text-white transition-colors border border-blue-700 text-sm"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              onClick={handleFilter}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {showMobileFilters && (
          <div className="mt-3 space-y-3 border-t border-blue-700 pt-3">
            {/* Date Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  placeholderText="Start date"
                  className="pl-9 pr-3 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  placeholderText="End date"
                  className="pl-9 pr-3 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            {/* Status and Area Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="pl-9 pr-3 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="auto-filter" className="bg-blue-900">Active Only</option>
                  <option value="" className="bg-blue-900">All Status</option>
                  <option value="Not started" className="bg-blue-900">Not started</option>
                  <option value="In Progress" className="bg-blue-900">In Progress</option>
                  <option value="Delay" className="bg-blue-900">Delay</option>
                  <option value="Done" className="bg-blue-900">Done</option>
                </select>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="pl-9 pr-3 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none text-sm"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option value="" className="bg-blue-900">All Areas</option>
                  {areas.map(area => (
                    <option key={area} value={area} className="bg-blue-900">{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-4 rounded-xl shadow-lg">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search actions..."
            className="pl-9 pr-4 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === '') handleFilter();
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                handleFilter();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 min-w-[340px]">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              placeholderText="Start date"
              className="pl-9 pr-4 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              placeholderText="End date"
              className="pl-9 pr-4 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

        <div className="relative min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            className="pl-9 pr-4 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="auto-filter" className="bg-blue-900">Active Actions Only</option>
            <option value="" className="bg-blue-900">All Statuses</option>
            <option value="Not started" className="bg-blue-900">Not started</option>
            <option value="In Progress" className="bg-blue-900">In Progress</option>
            <option value="Delay" className="bg-blue-900">Delay</option>
            <option value="Done" className="bg-blue-900">Done</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            className="pl-9 pr-4 py-2 w-full bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="" className="bg-blue-900">All Areas</option>
            {areas.map(area => (
              <option key={area} value={area} className="bg-blue-900">{area}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-950/50 text-gray-300 rounded-lg hover:bg-blue-950 hover:text-white transition-colors border border-blue-700"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={handleFilter}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;