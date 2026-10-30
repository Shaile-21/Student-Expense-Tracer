import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check current session on mount
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('<head')) {
        throw new Error(`API server returned HTML instead of JSON (${res.status}). Please ensure backend is running or Vercel serverless function is configured.`);
      }
      throw new Error(`Invalid response format from server (${res.status}): ${text.slice(0, 80)}`);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await safeJson(res);
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await safeJson(res);
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast('Registration successful! Welcome aboard.', 'success');
      return data.user;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Convenient 1-click Demo Login for students/evaluators
  const loginAsDemo = async () => {
    try {
      setLoading(true);
      const demoEmail = 'student.demo@college.edu';
      const demoPassword = 'DemoStudent@2024';

      // Try login first
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });
      let data = await safeJson(res);

      // If user doesn't exist, create demo account and seed sample data
      if (!data.success) {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Aarav Patel',
            email: demoEmail,
            password: demoPassword,
            college: 'BITS Pilani / IIT Delhi',
            monthlyAllowance: 10000,
            pocketMoneyDay: 1
          })
        });
        data = await safeJson(res);

        if (data.token) {
          // Auto-seed demo data immediately
          const seedRes = await fetch('/api/auth/seed-demo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({ clearExisting: true })
          });
          await safeJson(seedRes);
        }
      }

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('Logged in as Demo Student with sample data!', 'success');
        return data.user;
      } else {
        throw new Error(data.message || 'Demo login failed');
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const updateUser = (updated) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  const seedDemo = async (clearExisting = true) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/seed-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clearExisting })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Sample student data seeded successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to seed demo data', 'error');
      }
      return data;
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginAsDemo,
        logout,
        updateUser,
        seedDemo,
        showToast,
        toast
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div
            className={`px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium text-white transition-all ${
              toast.type === 'error'
                ? 'bg-rose-600 shadow-rose-900/30'
                : toast.type === 'info'
                ? 'bg-blue-600 shadow-blue-900/30'
                : 'bg-emerald-600 shadow-emerald-900/30'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/80 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
