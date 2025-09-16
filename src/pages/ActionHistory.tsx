import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getActionHistory, getAuditLogs } from '../api/actions';
import { useAuth } from '../context/AuthContext';

interface LogItem {
  id: number;
  actionId: number;
  userId: number | null;
  username: string | null;
  eventType: string;
  timestamp: string;
  changes: string | null;
}

const ActionHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const actionIdParam = params.get('actionId');
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        if (actionIdParam) {
          const items = await getActionHistory(Number(actionIdParam));
          setLogs(items);
        } else {
          const items = await getAuditLogs();
          setLogs(items);
        }
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load history');
      }
    };
    load();
  }, [actionIdParam]);

  if (!user) return null;
  if (!actionIdParam && user.role !== 'admin') return <div className="p-4">Access denied</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{actionIdParam ? `History for Action #${actionIdParam}` : 'Audit Logs'}</h1>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div className="bg-white rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Action ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Event</th>
              <th className="p-2 border">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              let detail = '';
              try {
                const parsed = log.changes ? JSON.parse(log.changes) : null;
                detail = parsed ? JSON.stringify(parsed.changedFields ? parsed.changedFields : parsed) : '';
              } catch {}
              return (
                <tr key={log.id}>
                  <td className="p-2 border whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-2 border">{log.actionId}</td>
                  <td className="p-2 border">{log.username || log.userId || '-'}</td>
                  <td className="p-2 border">{log.eventType}</td>
                  <td className="p-2 border font-mono text-xs break-all">{detail}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActionHistoryPage; 