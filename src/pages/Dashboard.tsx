import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useActions } from '../context/ActionContext';
import ActionTable from '../components/ActionTable';
import StatusKPIs from '../components/StatusKPIs';
import FilterBar from '../components/FilterBar';
// import VideoPlayer from '../components/VideoPlayer';
import ActionTimeline from '../components/ActionTimeline';
import FloatingVideoPlayer from '../components/FloatingVideoPlayer';
import NetworkInfo from '../components/NetworkInfo';
import Footer from '../components/Footer';
import { PlusCircle, Menu, X, FileText, TrendingUp, Eye, EyeOff, Download, Users } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { getHistoricalReports, saveReport as saveReportApi } from '../api/reports';
import PdfViewerOverlay from '../components/PdfViewerOverlay';

const Dashboard: React.FC = () => {
  const { 
    filteredActions, 
    isLoading, 
    error, 
    statusStats,
    actions,
    filterActions,
    lastUpdated,
    currentFilters
  } = useActions();
  
  const [uniqueAreas, setUniqueAreas] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(() => {
    const saved = localStorage.getItem('showTimeline');
    return saved !== null ? saved === 'true' : true;
  });
  const [showVideo, setShowVideo] = useState(() => {
    const saved = localStorage.getItem('showVideo');
    return saved !== null ? saved === 'true' : true;
  });
  const [showTimeManager, setShowTimeManager] = useState(() => {
    const saved = localStorage.getItem('showTimeManager');
    return saved !== null ? saved === 'true' : true;
  });
  const [latestReportFileName, setLatestReportFileName] = useState<string | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const currentDate = format(new Date(), 'dd MMM yyyy');

  useEffect(() => {
    if (actions.length > 0) {
      const areas = [...new Set(actions.map(action => action.area))];
      setUniqueAreas(areas);
    }
  }, [actions]);

  useEffect(() => {
    localStorage.setItem('showTimeline', String(showTimeline));
  }, [showTimeline]);

  useEffect(() => {
    localStorage.setItem('showVideo', String(showVideo));
  }, [showVideo]);

  useEffect(() => {
    localStorage.setItem('showTimeManager', String(showTimeManager));
  }, [showTimeManager]);

  useEffect(() => {
    // Load latest report for opening in viewer
    (async () => {
      try {
        const reports = await getHistoricalReports();
        if (Array.isArray(reports) && reports.length > 0) {
          // Prefer lastModified (file mtime) if available; fallback to parsed date in filename
          const sorted = [...reports].sort((a: any, b: any) => {
            const aM = a.lastModified ? new Date(a.lastModified).getTime() : 0;
            const bM = b.lastModified ? new Date(b.lastModified).getTime() : 0;
            const byMtime = bM - aM;
            if (byMtime !== 0) return byMtime;
            const aD = a.date ? new Date(a.date).getTime() : 0;
            const bD = b.date ? new Date(b.date).getTime() : 0;
            return bD - aD;
          });
          setLatestReportFileName(sorted[0].fileName);
        } else {
          setLatestReportFileName(null);
        }
      } catch {
        setLatestReportFileName(null);
      }
    })();
  }, []);

  const handleAddReportClick = () => {
    fileInputRef.current?.click();
  };

  const handleReportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      e.target.value = '';
      return;
    }
    setIsUploadingReport(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string; // data:application/pdf;base64,...
          await saveReportApi({ fileName: file.name, pdfData: dataUrl });
          setLatestReportFileName(file.name);
          setIsPdfOpen(true);
        } catch (err: any) {
          alert(err?.response?.data?.error || 'Failed to upload report');
        } finally {
          setIsUploadingReport(false);
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingReport(false);
      alert('Failed to read file');
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showTimeManager && <FloatingVideoPlayer />}
      <PdfViewerOverlay fileName={latestReportFileName} isOpen={isPdfOpen} onClose={() => setIsPdfOpen(false)} />
      {/* Hidden input for uploading report PDFs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleReportFileChange}
      />
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

            {/* QR Code and Last Updated - Mobile */}
            <div className="flex items-center space-x-2 mr-2">
              <div className="text-xs text-blue-200 text-right">
                <div>Last update:</div>
                <div>{lastUpdated.toLocaleTimeString()}</div>
              </div>
              <NetworkInfo />
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-blue-800 flex-shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

            {/* QR Code and Last Updated - Desktop Center */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-blue-200">Last updated:</div>
                <div className="text-sm font-medium text-white">{lastUpdated.toLocaleTimeString()}</div>
              </div>
              <div className="h-8 w-px bg-blue-700"></div>
              <NetworkInfo />
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Toggle Buttons */}
              <div className="flex items-center space-x-2 bg-blue-950/50 rounded-lg p-1">
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                    showVideo 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-blue-200 hover:text-white hover:bg-blue-800'
                  }`}
                  title={showVideo ? 'Hide Report' : 'Show Report'}
                >
                  {showVideo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Daily Report PDF</span>
                </button>
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                    showTimeline 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-blue-200 hover:text-white hover:bg-blue-800'
                  }`}
                  title={showTimeline ? 'Hide Timeline' : 'Show Timeline'}
                >
                  {showTimeline ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Timeline</span>
                </button>
                <button
                  onClick={() => setShowTimeManager(!showTimeManager)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                    showTimeManager 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-blue-200 hover:text-white hover:bg-blue-800'
                  }`}
                  title={showTimeManager ? 'Hide Time Manager' : 'Show Time Manager'}
                >
                  {showTimeManager ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Time Manager</span>
                </button>
              </div>
              
              <button
                onClick={() => {
                  // Filter actions for In Progress, Delay, Not started
                  const filtered = actions.filter(a => ['In Progress', 'Delay', 'Not started'].includes(a.status));
                  // Prepare data for Excel
                  const data = filtered.map(a => ({
                    'Action Plan': a.actionPlan,
                    'Tags': a.tags,
                    'Area': a.area,
                    'Discipline': a.discipline,
                    'Criticality': a.criticality,
                    'Assigned To': a.assignedTo,
                    'From': a.fromDate,
                    'To': a.toDate,
                    'Status': a.status,
                    'Notes': a.notes,
                  }));
                  const ws = XLSX.utils.json_to_sheet(data);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Actions');
                  // Format date for filename as (DD-MM-YYYY)
                  const today = new Date();
                  const day = String(today.getDate()).padStart(2, '0');
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const year = today.getFullYear();
                  const fileName = `Daily-Meeting-Actions-(${day}-${month}-${year}).xlsx`;
                  XLSX.writeFile(wb, fileName);
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-all duration-300 shadow-lg hover:shadow-xl"
                title="Export actions to Excel"
              >
                <Download className="w-5 h-5 mr-2" />
                Generate Excel
              </button>
              <button
                onClick={handleAddReportClick}
                disabled={isUploadingReport}
                className={`bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-all duration-300 shadow-lg hover:shadow-xl ${isUploadingReport ? 'opacity-60 cursor-not-allowed' : ''}`}
                title="Upload PDF report"
              >
                <FileText className="w-5 h-5 mr-2" />
                {isUploadingReport ? 'Uploading...' : 'Add Report'}
              </button>
              <Link 
                to="/team-actions" 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Users className="w-5 h-5 mr-2" />
                Team Actions
              </Link>
              <Link 
                to="/form" 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Action
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-blue-700 py-4 space-y-3">
              {/* Mobile View Toggles */}
              <div className="flex justify-center space-x-2 mb-3">
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    showTimeline 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-blue-950/50 text-blue-200 hover:text-white hover:bg-blue-800'
                  }`}
                >
                  {showTimeline ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>Timeline</span>
                </button>
                <button
                  onClick={() => setShowTimeManager(!showTimeManager)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    showTimeManager 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-blue-950/50 text-blue-200 hover:text-white hover:bg-blue-800'
                  }`}
                >
                  {showTimeManager ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>Time Manager</span>
                </button>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleAddReportClick(); }}
                  disabled={isUploadingReport}
                  className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-all duration-300 ${isUploadingReport ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {isUploadingReport ? 'Uploading...' : 'Add Report'}
                </button>
                <Link 
                  to="/team-actions" 
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Team Actions
                </Link>
                <Link 
                  to="/form" 
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add Action
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex-grow">

        {/* Mobile Layout - Stack vertically */}
        <div className="lg:hidden space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {/* Status KPIs - Full width on mobile */}
          <div className="w-full">
            <StatusKPIs stats={statusStats} />
          </div>
          
          {/* Timeline Section - Full width on mobile (conditionally shown) */}
          {showTimeline && (
            <div className="w-full">
              <div className="bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base sm:text-lg font-semibold">Actions Timeline</h2>
                  </div>
                  <button
                    onClick={() => setShowTimeline(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Hide Timeline"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 sm:p-4">
                  <ActionTimeline actions={actions} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout - Conditional sections */}
        <div className="hidden lg:block mb-8 space-y-6">
          {/* Status KPIs - Full width */}
          <div className="w-full">
            <StatusKPIs stats={statusStats} />
          </div>
          
          {/* Meeting Video and Timeline - Conditional display */}
          {(showVideo || showTimeline) && (
            <div className={`grid gap-6 ${
              showVideo && showTimeline 
                ? 'grid-cols-12' 
                : 'grid-cols-1'
            }`}>
              {/* Report PDF Section - Conditional */}
              {showVideo && (
                <div className={showTimeline ? 'col-span-5' : 'col-span-12'}>
                  <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold">Daily Report PDF</h2>
                      </div>
                      <button
                        onClick={() => setShowVideo(false)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Hide Report"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => latestReportFileName && setIsPdfOpen(true)}
                      disabled={!latestReportFileName}
                      className={`p-4 flex-1 flex flex-col items-center justify-center ${latestReportFileName ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                    >
                      <div className="text-center">
                        <FileText className="w-10 h-10 mx-auto text-blue-500" />
                        <div className="mt-2 text-sm text-gray-700">
                          {latestReportFileName ? 'Open latest report in fullscreen' : 'No report available yet'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Timeline Section - Conditional */}
              {showTimeline && (
                <div className={showVideo ? 'col-span-7' : 'col-span-12'}>
                  <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold">Actions Timeline</h2>
                      </div>
                      <button
                        onClick={() => setShowTimeline(false)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Hide Timeline"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 overflow-hidden">
                      <div className="h-full overflow-y-auto">
                        <ActionTimeline actions={actions} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Bar - Full width */}
        <div className="mb-4 sm:mb-6">
          <FilterBar 
            onFilter={filterActions} 
            areas={uniqueAreas}
          />
        </div>

        {/* Action List - Full width */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Action List</h2>
            <div className="text-sm text-gray-600">
              Showing {filteredActions.length} of {actions.length} actions
              {currentFilters.status === 'auto-filter' && (
                <span className="ml-2 text-blue-600 font-medium">(Active Only)</span>
              )}
            </div>
          </div>
          <ActionTable actions={filteredActions} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;