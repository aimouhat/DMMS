import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download, FileText } from 'lucide-react';
import { useActions } from '../context/ActionContext';
import { format, isSameDay, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getHistoricalReports, saveReport as saveReportApi } from '../api/reports';
import api from '../api/http';

interface Report {
  id: string;
  date: string;
  fileName: string;
  filePath: string;
}

const Reports: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { actions, statusStats } = useActions();
  const [historicalReports, setHistoricalReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isOpening, setIsOpening] = useState<string | null>(null);
  
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const todayActions = actions.filter(action => {
    const actionDate = new Date(action.fromDate);
    return actionDate.toDateString() === new Date().toDateString();
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadHistoricalReports = async () => {
      try {
        setIsLoading(true);
        const reports = await getHistoricalReports();
        setHistoricalReports(reports);
      } catch (error) {
        console.error('Error loading historical reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistoricalReports();
  }, []);

  const generateDirectPDF = async (actions: any[], fileName: string) => {
    try {
      console.log('Starting direct PDF generation...');
      const doc = new jsPDF('p', 'mm', 'a4'); // A4 format: 210 x 297 mm
      
      // A4 dimensions
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const footerHeight = 20;

      // Function to load and convert image to base64
      const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
        try {
          const response = await fetch(imagePath);
          if (!response.ok) {
            console.warn(`Failed to load image: ${imagePath}`);
            return '';
          }
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => {
              console.warn(`Error reading image: ${imagePath}`);
              resolve('');
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn(`Error loading image ${imagePath}:`, error);
          return '';
        }
      };

      // Load logos
      const [logo1Base64, logo2Base64, logo3Base64] = await Promise.all([
        loadImageAsBase64('/1.png'),
        loadImageAsBase64('/2.png'),
        loadImageAsBase64('/3.png')
      ]);

      // Header Background (ONLY on first page)
      doc.setFillColor(30, 60, 114); // Dark blue
      doc.rect(0, 0, pageWidth, 60, 'F');

      // Add logos with better positioning (ONLY on first page)
      try {
        if (logo1Base64) doc.addImage(logo1Base64, 'PNG', margin, 10, 40, 20);
        if (logo2Base64) doc.addImage(logo2Base64, 'PNG', (pageWidth/2) - 20, 10, 40, 20);
        if (logo3Base64) doc.addImage(logo3Base64, 'PNG', pageWidth - margin - 40, 10, 40, 20);
      } catch (imageError) {
        console.warn('Error adding images to PDF:', imageError);
      }

      // Title (ONLY on first page)
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('DAILY MEETING REPORT', pageWidth/2, 45, { align: 'center' });

      // Subtitle (ONLY on first page)
      doc.setFontSize(12);
      doc.setTextColor(200, 220, 255);
      doc.text('INTEGRATED EXPLORATORY MINES', pageWidth/2, 52, { align: 'center' });

      // Date (ONLY on first page)
      doc.setFontSize(10);
      doc.text(format(new Date(), 'EEEE, MMMM do, yyyy'), pageWidth/2, 57, { align: 'center' });

      let yPosition = 75;

      // KPIs Section (ONLY on first page)
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, yPosition, contentWidth, 50, 'F');
      doc.setDrawColor(30, 60, 114);
      doc.setLineWidth(1);
      doc.rect(margin, yPosition, contentWidth, 50);

      // KPIs Title
      doc.setFontSize(16);
      doc.setTextColor(30, 60, 114);
      doc.setFont('helvetica', 'bold');
      doc.text('ACTION STATUS ANALYTICS', pageWidth/2, yPosition + 10, { align: 'center' });

      // Ensure all 4 status types are shown
      const allStatusTypes = ['Not started', 'In Progress', 'Delay', 'Done'];
      const statusColors = {
        'Done': [16, 185, 129],
        'In Progress': [59, 130, 246],
        'Delay': [245, 158, 11],
        'Not started': [239, 68, 68]
      };

      const completeStatusStats = allStatusTypes.map(status => {
        const existingStat = statusStats.find(s => s.status === status);
        return existingStat || {
          status,
          count: 0,
          percentage: 0,
          color: `rgb(${statusColors[status as keyof typeof statusColors].join(',')})`
        };
      });

      // Total Actions Card (centered)
      const totalActions = actions.length;
      doc.setFillColor(30, 60, 114);
      doc.rect(pageWidth/2 - 30, yPosition + 15, 60, 25, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(2);
      doc.rect(pageWidth/2 - 30, yPosition + 15, 60, 25);

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL ACTIONS', pageWidth/2, yPosition + 25, { align: 'center' });
      
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129);
      doc.text(totalActions.toString(), pageWidth/2, yPosition + 35, { align: 'center' });

      yPosition += 60;

      // Status KPI Cards in a row
      const cardWidth = (contentWidth - 30) / 4; // 4 cards with spacing
      const cardHeight = 30;
      const cardSpacing = 10;

      completeStatusStats.forEach((stat, index) => {
        const cardX = margin + (index * (cardWidth + cardSpacing));
        
        // Card background
        doc.setFillColor(248, 250, 252);
        doc.rect(cardX, yPosition, cardWidth, cardHeight, 'F');
        
        // Card border with status color
        const statusColor = statusColors[stat.status as keyof typeof statusColors];
        doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.setLineWidth(1.5);
        doc.rect(cardX, yPosition, cardWidth, cardHeight);
        
        // Status indicator bar
        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.rect(cardX, yPosition, cardWidth, 3, 'F');
        
        // Status name
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.status.toUpperCase(), cardX + cardWidth/2, yPosition + 12, { align: 'center' });
        
        // Percentage
        doc.setFontSize(14);
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`${stat.percentage.toFixed(1)}%`, cardX + cardWidth/2, yPosition + 20, { align: 'center' });
        
        // Count
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(`${stat.count} ACTIONS`, cardX + cardWidth/2, yPosition + 26, { align: 'center' });
      });

      yPosition += cardHeight + 20;

      // Filter actions for today
      const todayActionsForReport = actions.filter(action => {
        const actionDate = new Date(action.fromDate);
        const today = new Date();
        return actionDate.toDateString() === today.toDateString();
      });

      // Today's Actions Header
      doc.setFillColor(30, 60, 114);
      doc.rect(margin, yPosition, contentWidth, 15, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition, contentWidth, 15);

      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(`TODAY'S MISSION BRIEFING (${todayActionsForReport.length} ACTIONS)`, pageWidth/2, yPosition + 10, { align: 'center' });

      yPosition += 20;

      if (todayActionsForReport.length === 0) {
        // No actions message
        doc.setFillColor(248, 250, 252);
        doc.rect(margin + 20, yPosition, contentWidth - 40, 25, 'F');
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1);
        doc.rect(margin + 20, yPosition, contentWidth - 40, 25);

        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'italic');
        doc.text('NO ACTIVE MISSIONS TODAY', pageWidth/2, yPosition + 12, { align: 'center' });
        doc.setFontSize(10);
        doc.text('ALL SYSTEMS OPERATIONAL', pageWidth/2, yPosition + 20, { align: 'center' });
      } else {
        // Actions table with proper A4 formatting and footer spacing
        const tableColumn = ['ACTION PLAN', 'TAGS', 'ASSIGNED TO', 'FROM', 'TO'];
        const tableRows = todayActionsForReport.map(action => [
          action.actionPlan || '',
          action.tags || '-',
          action.assignedTo || 'UNASSIGNED',
          format(new Date(action.fromDate), 'dd/MM/yyyy'),
          format(new Date(action.toDate), 'dd/MM/yyyy'),
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: [51, 65, 85],
            lineWidth: 0.5,
            lineColor: [203, 213, 225],
            overflow: 'linebreak',
            cellWidth: 'wrap',
            valign: 'top'
          },
          headStyles: {
            fillColor: [30, 60, 114],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            lineWidth: 1,
            lineColor: [16, 185, 129]
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          columnStyles: {
            0: { cellWidth: 70, halign: 'left' }, // Action Plan
            1: { cellWidth: 25, halign: 'center' }, // Tags
            2: { cellWidth: 40, halign: 'center' }, // Assigned To
            3: { cellWidth: 25, halign: 'center' }, // From Date
            4: { cellWidth: 25, halign: 'center' }, // To Date
          },
          margin: { 
            left: margin, 
            right: margin, 
            bottom: footerHeight + 5 // Add space for footer
          },
          pageBreak: 'auto',
          showHead: 'everyPage',
          tableWidth: 'auto',
          didParseCell: function(data) {
            if (data.column.index === 0) {
              data.cell.styles.minCellHeight = 10;
            }
          },
          didDrawPage: function(data) {
            // NO HEADER on continuation pages - just table content
            if (data.pageNumber > 1) {
              // Add minimal border for continuation pages
              doc.setDrawColor(203, 213, 225);
              doc.setLineWidth(0.5);
              doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
            }
          }
        });
      }

      // Simplified Footer on all pages (removed CLASSIFICATION and ONLINE)
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer background
        doc.setFillColor(30, 60, 114);
        doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
        
        // Footer border
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
        
        // Simplified footer text - only generation date and page number
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.text(`GENERATED: ${format(new Date(), 'dd/MM/yyyy HH:mm')} UTC`, margin, pageHeight - 12);
        doc.text(`PAGE ${i} OF ${pageCount}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
      }

      // Save the PDF directly
      doc.save(fileName);
      
      // Save to backend
      const pdfData = doc.output('datauristring');
      await saveReportApi({ fileName, pdfData });
      
      return true;
    } catch (error) {
      console.error('Error generating direct PDF:', error);
      throw error;
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      const today = new Date();
      const fileName = `Daily Meeting Report ${format(today, 'yyyy-MM-dd')}.pdf`;

      const existingReportIndex = historicalReports.findIndex(report =>
        isSameDay(parseISO(report.date), today)
      );

      const success = await generateDirectPDF(actions, fileName);

      if (success) {
        const newReport: Report = {
          id: fileName,
          date: format(today, 'yyyy-MM-dd'),
          fileName,
          filePath: `dailyrepport/${fileName}`,
        };

        let updatedReports;
        if (existingReportIndex !== -1) {
          updatedReports = [...historicalReports];
          updatedReports[existingReportIndex] = newReport;
        } else {
          updatedReports = [newReport, ...historicalReports];
        }
        setHistoricalReports(updatedReports);
      }
    } catch (error) {
      console.error('Error in generateReport:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openReport = async (report: Report) => {
    try {
      setIsOpening(report.fileName);
      const response = await api.get(`/reports/${encodeURIComponent(report.fileName)}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error('Error opening report:', error);
      alert('Failed to open the report. Please try again.');
    } finally {
      setIsOpening(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Download className="w-5 h-5 mr-2" />
        Reports
        {isOpen ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
      </button>

      {isOpen && (
        <div className={`absolute ${isMobileView ? 'left-0 right-0' : 'right-0'} mt-2 ${isMobileView ? 'w-full' : 'w-[500px]'} bg-white rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto`}>
          <div className="p-3 sm:p-6 bg-slate-50 rounded-xl">
            <div className="space-y-3 sm:space-y-5">
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Generate New Report</h3>
                <p className="text-gray-500 mb-3 text-sm sm:text-base">{today}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3">
                  <div>
                    <p className="text-gray-700 text-sm sm:text-base">
                      <span className="font-medium">Total Actions:</span> {actions.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm sm:text-base">
                      <span className="font-medium">Today's Actions:</span> {todayActions.length}
                    </p>
                  </div>
                </div>
                <div className="h-24 sm:h-32 overflow-y-auto border rounded-lg p-2 sm:p-3 mt-2 bg-slate-100">
                  {todayActions.length > 0 ? (
                    todayActions.map((action, index) => (
                      <div key={index} className="text-xs sm:text-sm text-gray-600 mb-2">
                        • {action.actionPlan}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-500 italic text-center py-4">
                      No actions scheduled for today
                    </div>
                  )}
                </div>
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className={`w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm sm:text-base ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isGenerating ? 'Generating PDF...' : 'Generate PDF Report'}</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-3 sm:p-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Daily Reports</h3>
                <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-green-500"></div>
                      <span className="ml-2 text-xs sm:text-sm text-gray-500">Loading reports...</span>
                    </div>
                  ) : historicalReports.length > 0 ? (
                    historicalReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{report.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {format(parseISO(report.date), 'MMMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openReport(report)}
                          className="text-green-500 hover:text-green-600 flex-shrink-0 ml-2"
                          disabled={isOpening === report.fileName}
                        >
                          {isOpening === report.fileName ? (
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-green-500" />
                          ) : (
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No historical reports found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;