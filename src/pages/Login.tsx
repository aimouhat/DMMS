import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white shadow p-6 rounded">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <label className="block text-sm mb-1">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded p-2 mb-3" />
        <label className="block text-sm mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded p-2 mb-4" />
        <button disabled={isLoading} className="w-full bg-blue-600 text-white rounded p-2 disabled:opacity-60">
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default Login; 