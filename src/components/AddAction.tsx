import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActions } from '../context/ActionContext';
import { Action } from '../types/action';

const AddAction: React.FC = () => {
  const navigate = useNavigate();
  const { addAction } = useActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Action, 'id'>>({
    actionPlan: '',
    tags: '',
    area: '',
    discipline: '',
    assignedTo: '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    duration: 1,
    status: 'Not started',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addAction(formData);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Add New Action</h1>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Action Plan */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Action Plan
                </label>
                <input
                  type="text"
                  name="actionPlan"
                  value={formData.actionPlan}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter action plan"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter tags"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Area
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Area</option>
                  <option value="Storage and handling">Storage and handling</option>
                  <option value="Civil">Civil</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Instrumentation">Instrumentation</option>
                  <option value="Piping">Piping</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Firefighting">Firefighting</option>
                  <option value="Telecom">Telecom</option>
                  <option value="Architectural">Architectural</option>
                  <option value="Painting">Painting</option>
                  <option value="Insulation">Insulation</option>
                  <option value="Scaffolding">Scaffolding</option>
                  <option value="IROC">IROC</option>
                  <option value="MSL">MSL</option>
                  <option value="DEA">DEA</option>
                </select>
              </div>

              {/* Discipline */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discipline
                </label>
                <select
                  name="discipline"
                  value={formData.discipline}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Discipline</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Civil">Civil</option>
                  <option value="Instrumentation">Instrumentation</option>
                  <option value="Piping">Piping</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Firefighting">Firefighting</option>
                  <option value="Telecom">Telecom</option>
                  <option value="Architectural">Architectural</option>
                  <option value="Painting">Painting</option>
                  <option value="Insulation">Insulation</option>
                  <option value="Scaffolding">Scaffolding</option>
                  <option value="HSE">HSE</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter assignee"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Not started">Not started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter any additional notes"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add Action</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAction; 