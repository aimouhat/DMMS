import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActions } from '../context/ActionContext';
import { Action } from '../types/action';
import { PlusCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Footer from '../components/Footer';

const ActionForm: React.FC = () => {
  const navigate = useNavigate();
  const { addAction } = useActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const currentDate = format(new Date(), 'dd MMM yyyy');
  const [formData, setFormData] = useState<Omit<Action, 'id'>>({
    actionPlan: '',
    tags: '',
    area: '',
    discipline: '',
    assignedTo: '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    duration: 1,
    status: 'In Progress',
    notes: '',
    criticality: 'Medium'
  });

  // Add useEffect to handle success message timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await addAction(formData);
      setSuccessMessage('Action added successfully!');
      // Reset form data after successful submission
      setFormData({
        actionPlan: '',
        tags: '',
        area: '',
        discipline: '',
        assignedTo: '',
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        duration: 1,
        status: 'In Progress',
        notes: '',
        criticality: 'Medium'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Calculate duration when fromDate or toDate changes
      if (name === 'fromDate' || name === 'toDate') {
        if (updated.fromDate && updated.toDate) {
          const fromDate = new Date(updated.fromDate);
          const toDate = new Date(updated.toDate);
          const timeDiff = toDate.getTime() - fromDate.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          updated.duration = Math.max(1, daysDiff); // Ensure minimum 1 day
        }
      }
      
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-full mx-auto px-2 sm:px-4">
          {/* Mobile Header */}
          <div className="flex justify-between items-center h-14 sm:h-16 lg:hidden">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {/* Logos */}
              <div className="flex items-center space-x-1">
                <img src="/1.png" alt="Future is Mine" className="h-5" />
                <img src="/2.png" alt="Integrated Exploratory Mines" className="h-5" />
                <img src="/3.png" alt="OCP SBU Mining" className="h-5" />
              </div>
              
              {/* Title and Date */}
              <div className="ml-2 min-w-0 flex-1">
                <h1 className="text-sm font-bold text-white truncate">Daily Meeting Manager</h1>
                <p className="text-xs text-blue-200">{currentDate}</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-md hover:bg-blue-800 flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <img src="/1.png" alt="Future is Mine" className="h-10" />
                <div className="h-8 w-px bg-blue-700"></div>
                <img src="/2.png" alt="Integrated Exploratory Mines" className="h-10" />
                <div className="h-8 w-px bg-blue-700"></div>
                <img src="/3.png" alt="OCP SBU Mining" className="h-10" />
              </div>
              <div className="h-8 w-px bg-blue-700"></div>
              <div>
                <h1 className="text-xl font-bold tracking-wider">Daily Meeting Manager</h1>
                <p className="text-sm text-blue-200">{currentDate}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title - Simplified */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Add New Action</h1>
            <p className="text-gray-600">Create a new action item for the daily meeting</p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6">
              {successMessage && (
                <div className="mb-4 sm:mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-700 font-medium">{successMessage}</span>
                </div>
              )}
              
              {error && (
                <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Action Plan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Plan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="actionPlan"
                    value={formData.actionPlan}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Describe the action to be taken..."
                  />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                    >
                      <option value="">Select Area</option>
                      <option value="Storage and handling">Storage and handling</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Flotation">Flotation</option>
                      <option value="Tailing Management">Tailing Management</option>
                      <option value="Washing">Washing</option>
                      <option value="Coarse Reject">Coarse Reject</option>
                      <option value="Reagent">Reagent</option>
                      <option value="Mobile hopper">Mobile hopper</option>
                      <option value="Migration linking conveyors">Migration linking conveyors</option>
                      <option value="BWP">BWP</option>
                      <option value="IROC">IROC</option>
                      <option value="MSL">MSL</option>
                      <option value="DEA">DEA</option>
                      <option value="Corse Reject">Corse Reject</option>
                    </select>
                  </div>

                  {/* Discipline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discipline <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="discipline"
                      value={formData.discipline}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                    >
                      <option value="">Select Discipline</option>
                      <option value="Asset Management">Asset Management</option>                      
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Automation">Automation</option>
                      <option value="Process">Process</option>
                      <option value="Digitization">Digitization</option>
                      <option value="Operation">Operation</option>
                      <option value="HSE">HSE</option>
                      <option value="ALL">ALL</option>
                    </select>
                  </div>

                  {/* Criticality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order of Criticality <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="criticality"
                      value={formData.criticality}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter assignee name..."
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter tags (comma separated)..."
                    />
                  </div>

                  {/* From Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  {/* Duration (Calculated) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Days)
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                      {formData.duration} day{formData.duration !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Enter any additional notes or comments..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                          <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding Action...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-5 w-5" />
                        <span>Add Action</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ActionForm;