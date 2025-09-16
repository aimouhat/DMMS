import React, { useEffect, useState } from 'react';
import api from '../api/http';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load users');
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/users', { username, password, role });
      setUsername('');
      setPassword('');
      setRole('user');
      load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to add user');
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to delete user');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-4">Access denied</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <form onSubmit={addUser} className="bg-white p-4 rounded border mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="border rounded p-2" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded p-2" />
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="border rounded p-2">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button className="bg-green-600 text-white rounded p-2">Add</button>
        </div>
      </form>
      <table className="w-full bg-white border">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">{u.username}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">
                <button onClick={() => deleteUser(u.id)} className="bg-red-600 text-white rounded px-2 py-1">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin; 