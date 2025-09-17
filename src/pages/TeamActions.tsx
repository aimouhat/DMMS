import React, { useState, useEffect } from 'react';
import { useActions } from '../context/ActionContext';
import { Action } from '../types/action';
import { format } from 'date-fns';
import { Clock, User, Calendar, Tag, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { getActionHistory } from '../api/actions';
import Footer from '../components/Footer';

interface LogItem {
  id: number;
  actionId: number;
  userId: number | null;
  username: string | null;
  eventType: string;
  timestamp: string;
  changes: string | null;
}

const TeamActions: React.FC = () => {
  const { actions, updateAction } = useActions();
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionLogs, setActionLogs] = useState<LogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentDate = format(new Date(), 'dd MMM yyyy');

  // Filter only open actions (In Progress, Delay, Not started)
  const openActions = actions.filter(action => 
    ['In Progress', 'Delay', 'Not started'].includes(action.status)
  );

  // Group actions by discipline
  const actionsByDiscipline = openActions.reduce((acc, action) => {
    if (!acc[action.discipline]) {
      acc[action.discipline] = [];
    }
    acc[action.discipline].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  // Get all unique disciplines and ensure we have all disciplines even if empty
  const allDisciplines = ['Mechanical', 'Electrical', 'Automation', 'Process', 'Digitization', 'Operation', 'HSE', 'Asset Management'];
  const disciplines = allDisciplines.filter(discipline => 
    actionsByDiscipline[discipline] && actionsByDiscipline[discipline].length > 0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-green-500';
      case 'Delay':
        return 'bg-orange-500';
      case 'Not started':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'Delay':
        return 'bg-orange-100 border-orange-300 hover:bg-orange-200';
      case 'Not started':
        return 'bg-red-100 border-red-300 hover:bg-red-200';
      default:
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'text-green-800';
      case 'Delay':
        return 'text-orange-800';
      case 'Not started':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const handleActionClick = async (action: Action) => {
    setSelectedAction(action);
    setIsModalOpen(true);
    setIsLoadingLogs(true);
    
    try {
      const logs = await getActionHistory(action.id);
      setActionLogs(logs);
    } catch (error) {
      console.error('Error loading action logs:', error);
      setActionLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleStatusUpdate = async (actionId: number, newStatus: string) => {
    try {
      await updateAction(actionId, { status: newStatus });
      if (selectedAction && selectedAction.id === actionId) {
        setSelectedAction({ ...selectedAction, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating action status:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAction(null);
    setActionLogs([]);
  };

  const renderLogSummary = (log: LogItem) => {
    let lines: string[] = [];
    try {
      const parsed = log.changes ? JSON.parse(log.changes) : null;
      if (parsed && parsed.before && parsed.after) {
        const fields: string[] = parsed.changedFields || Object.keys(parsed.after);
        lines = fields.map((f: string) => {
          const beforeVal = parsed.before[f] ?? '';
          const afterVal = parsed.after[f] ?? '';
          return `${f}: ${beforeVal} → ${afterVal}`;
        });
      } else if (parsed && parsed.changedFields) {
        lines = parsed.changedFields as string[];
      }
    } catch {}

    const who = log.username || (log.userId ? `User ${log.userId}` : 'Unknown');
    const when = new Date(log.timestamp).toLocaleString();

    return (
      <div className="flex items-start gap-2">
        <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs text-gray-700">
            <span className="font-semibold">{who}</span> • {when}
          </div>
          {lines.length > 0 && (
            <ul className="mt-1 text-xs text-gray-800 space-y-0.5">
              {lines.map((line, idx) => {
                const arrowIndex = line.indexOf('→');
                if (arrowIndex > -1) {
                  const [left, right] = [line.slice(0, arrowIndex).trim(), line.slice(arrowIndex + 1).trim()];
                  const colonIdx = left.indexOf(':');
                  const field = colonIdx > -1 ? left.slice(0, colonIdx).trim() : '';
                  const beforeText = colonIdx > -1 ? left.slice(colonIdx + 1).trim() : left;
                  return (
                    <li key={idx} className="flex items-center gap-1">
                      <span className="text-gray-600 font-medium">{field}:</span>
                      <span className="line-through text-gray-500">{beforeText}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium text-green-700">{right}</span>
                    </li>
                  );
                }
                return <li key={idx}>{line}</li>;
              })}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-full mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="flex items-center space-x-1 sm:space-x-4">
                <img src="/1.png" alt="Future is Mine" className="h-5 sm:h-10" />
                <div className="hidden sm:block h-8 w-px bg-blue-700"></div>
                <img src="/2.png" alt="Integrated Exploratory Mines" className="h-5 sm:h-10" />
                <div className="hidden sm:block h-8 w-px bg-blue-700"></div>
                <img src="/3.png" alt="OCP SBU Mining" className="h-5 sm:h-10" />
              </div>
              <div className="hidden sm:block h-8 w-px bg-blue-700"></div>
              <div>
                <h1 className="text-sm sm:text-xl font-bold tracking-wider">Team Actions Dashboard</h1>
                <p className="text-xs sm:text-sm text-blue-200">{currentDate}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md flex items-center transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-full mx-auto">
          {/* Page Title and Stats */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Team Actions Dashboard</h1>
                <p className="text-gray-600">Track and manage all open actions by discipline</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>In Progress ({openActions.filter(a => a.status === 'In Progress').length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Delayed ({openActions.filter(a => a.status === 'Delay').length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Not Started ({openActions.filter(a => a.status === 'Not started').length})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                {disciplines.map((discipline) => (
                  <div key={discipline} className="text-center">
                    <h3 className="font-bold text-sm sm:text-base mb-1">{discipline}</h3>
                    <div className="text-xs text-blue-200">
                      {actionsByDiscipline[discipline]?.length || 0} actions
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Body - Actions Grid */}
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {disciplines.map((discipline) => (
                  <div key={discipline} className="space-y-2">
                    {actionsByDiscipline[discipline]?.map((action) => (
                      <div
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className={`
                          ${getStatusBgColor(action.status)} 
                          ${getStatusTextColor(action.status)}
                          border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 
                          transform hover:scale-105 hover:shadow-md
                        `}
                      >
                        {/* Status indicator */}
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(action.status)}`}></div>
                          <span className="text-xs font-medium">#{action.id}</span>
                        </div>
                        
                        {/* Action title */}
                        <h4 className="text-xs font-semibold mb-2 line-clamp-2 leading-tight">
                          {action.actionPlan}
                        </h4>
                        
                        {/* Action details */}
                        <div className="space-y-1 text-xs">
                          {action.assignedTo && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{action.assignedTo}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{format(new Date(action.fromDate), 'dd/MM')} - {format(new Date(action.toDate), 'dd/MM')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{action.area}</span>
                          </div>
                          {action.criticality && (
                            <div className="flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" />
                              <span className={`font-medium ${
                                action.criticality === 'Critical' ? 'text-red-700' :
                                action.criticality === 'High' ? 'text-orange-700' :
                                action.criticality === 'Medium' ? 'text-yellow-700' :
                                'text-green-700'
                              }`}>
                                {action.criticality}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Empty state for disciplines with no actions */}
                    {(!actionsByDiscipline[discipline] || actionsByDiscipline[discipline].length === 0) && (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">All actions completed!</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {openActions.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Actions Completed!</h3>
              <p className="text-gray-500">Great job! There are no open actions at the moment.</p>
            </div>
          )}
        </div>
      </main>

      {/* Action Details Modal */}
      {isModalOpen && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedAction.status)}`}></div>
                    <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded-full">
                      {selectedAction.status}
                    </span>
                    <span className="text-sm text-blue-200">Action #{selectedAction.id}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{selectedAction.actionPlan}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                    <span>{selectedAction.discipline}</span>
                    <span>•</span>
                    <span>{selectedAction.area}</span>
                    {selectedAction.criticality && (
                      <>
                        <span>•</span>
                        <span className="font-medium">{selectedAction.criticality} Priority</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-300 transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Action Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Details</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedAction.assignedTo && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Assigned to:</span>
                        <span className="text-sm font-medium">{selectedAction.assignedTo}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">
                        {format(new Date(selectedAction.fromDate), 'dd MMM yyyy')} - {format(new Date(selectedAction.toDate), 'dd MMM yyyy')}
                      </span>
                    </div>

                    {selectedAction.tags && (
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Tags:</span>
                        <span className="text-sm font-medium">{selectedAction.tags}</span>
                      </div>
                    )}

                    {selectedAction.notes && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Notes:</span>
                        <p className="text-sm text-gray-800 bg-white p-3 rounded border">
                          {selectedAction.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Update */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['In Progress', 'Delay', 'Done'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(selectedAction.id, status)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedAction.status === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Action History</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {isLoadingLogs ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Loading history...</span>
                      </div>
                    ) : actionLogs.length > 0 ? (
                      <div className="space-y-4">
                        {actionLogs.map((log) => (
                          <div key={log.id} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-start space-x-2">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                log.eventType === 'CREATED' ? 'bg-green-500' :
                                log.eventType === 'UPDATED' ? 'bg-blue-500' :
                                log.eventType === 'DELETED' ? 'bg-red-500' :
                                'bg-gray-500'
                              }`}></div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium text-gray-900">
                                    {log.eventType}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                {renderLogSummary(log)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No history available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TeamActions;