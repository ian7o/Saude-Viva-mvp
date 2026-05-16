import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>Saude Viva</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <NavLink to="/dashboard" style={navLinkStyle}>Dashboard</NavLink>
          <NavLink to="/calendar" style={navLinkStyle}>Calendário</NavLink>
          <NavLink to="/documents" style={navLinkStyle}>Documentos</NavLink>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 'auto', ...logoutBtnStyle }}>
          Logout
        </button>
      </aside>
      <main style={{ flex: 1, padding: '30px', background: '#f5f5f5' }}>
        {children}
      </main>
    </div>
  );
};

const navLinkStyle: React.CSSProperties = {
  color: 'white',
  textDecoration: 'none',
  padding: '12px',
  borderRadius: '5px',
  transition: 'background 0.3s',
};

const logoutBtnStyle: React.CSSProperties = {
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  padding: '12px',
  borderRadius: '5px',
  cursor: 'pointer',
  width: '100%',
  marginTop: '20px',
};

export default Layout;