import api from './http';

export const getHistoricalReports = async () => {
  try {
    const response = await api.get('/reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const saveReport = async (reportData: any) => {
  try {
    const response = await api.post('/reports', reportData);
    return response.data;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}; 