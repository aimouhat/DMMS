import api from './http';

export const getAllActions = async () => {
  try {
    const response = await api.get('/actions');
    return response.data;
  } catch (error) {
    console.error('Error fetching actions:', error);
    throw error;
  }
};

export const addAction = async (actionData: any) => {
  try {
    const response = await api.post('/actions', actionData);
    return response.data;
  } catch (error) {
    console.error('Error adding action:', error);
    throw error;
  }
};

export const updateAction = async (id: number, updates: any) => {
  try {
    const response = await api.put(`/actions/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating action:', error);
    throw error;
  }
};

export const deleteAction = async (id: number) => {
  try {
    const response = await api.delete(`/actions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting action:', error);
    throw error;
  }
};

export const getActionHistory = async (id: number) => {
  try {
    const response = await api.get(`/actions/${id}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching action history:', error);
    throw error;
  }
};

export const getAuditLogs = async () => {
  try {
    const response = await api.get('/audit-logs');
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}; 