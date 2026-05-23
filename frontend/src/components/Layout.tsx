import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { theme, toggleTheme, colors } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={containerStyle}>
      <aside style={sidebarStyle}>
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>+</div>
          <div>
            <h2 style={logoTitleStyle}>Saude Viva</h2>
            <p style={logoSubtitleStyle}>Gestão Clínica</p>
          </div>
        </div>
        
        <nav style={navStyle}>
          {user.role !== 'secretary' && (
            <>
              <NavLink to="/dashboard" className="nav-hover" style={({ isActive }) => navLinkStyle(isActive, colors)}>
                <span style={navIconStyle}>📊</span>
                Dashboard
              </NavLink>
              <NavLink to="/calendar" className="nav-hover" style={({ isActive }) => navLinkStyle(isActive, colors)}>
                <span style={navIconStyle}>📅</span>
                Calendário
              </NavLink>
              <NavLink to="/documents" className="nav-hover" style={({ isActive }) => navLinkStyle(isActive, colors)}>
                <span style={navIconStyle}>📁</span>
                Documentos
              </NavLink>
              <NavLink to="/messages" className="nav-hover" style={({ isActive }) => navLinkStyle(isActive, colors)}>
                <span style={navIconStyle}>💬</span>
                Mensagens
              </NavLink>
            </>
          )}
          {user.role === 'secretary' && (
            <>
              <NavLink to="/patients" className="nav-hover" style={({ isActive }) => navLinkStyle(isActive, colors)}>
                <span style={navIconStyle}>👤</span>
                Pacientes
              </NavLink>
              <NavLink to="/calendar" className="nav-hover" style={({ isActive }) => navLinkStyle(isActive, colors)}>
                <span style={navIconStyle}>📅</span>
                Calendário
              </NavLink>
              <NavLink to="/messages" className="nav-hover" style={({ isActive }) => navLinkStyle(isActive, colors)}>
                <span style={navIconStyle}>💬</span>
                Mensagens
              </NavLink>
            </>
          )}
        </nav>

        <div style={sidebarFooterStyle}>
          <div style={userInfoStyle}>
            <div style={userAvatarStyle}>{user.name?.[0] || 'U'}</div>
            <div>
              <p style={userNameStyle}>{user.name || 'Usuário'}</p>
              <p style={userRoleStyle}>{user.role === 'secretary' ? 'Secretária' : 'Médico'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-hover" style={logoutBtnStyle}>
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>
      
      <main style={{ ...mainStyle, background: colors.background }}>
        <div style={{ ...themeToggleContainer, background: colors.surface }}>
          <button onClick={toggleTheme} className="btn-hover" style={themeToggleStyle(theme)}>
            {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Claro' : 'Escuro'}
          </button>
        </div>
        {children}
      </main>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
};

const sidebarStyle: React.CSSProperties = {
  width: '260px',
  background: 'linear-gradient(180deg, #1a3a5c 0%, #0d2137 100%)',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
  position: 'fixed',
  height: '100vh',
  zIndex: 100,
};

const logoContainerStyle: React.CSSProperties = {
  padding: '28px 24px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const logoIconStyle: React.CSSProperties = {
  width: '42px',
  height: '42px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
};

const logoTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  letterSpacing: '0.5px',
};

const logoSubtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '11px',
  opacity: 0.7,
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const navStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const navLinkStyle = (isActive: boolean, colors: any): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '10px',
  textDecoration: 'none',
  color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
  background: isActive ? 'linear-gradient(135deg, rgba(52, 152, 219, 0.25), rgba(52, 152, 219, 0.15))' : 'transparent',
  fontSize: '14px',
  fontWeight: isActive ? 600 : 400,
  border: isActive ? '1px solid rgba(52, 152, 219, 0.25)' : '1px solid transparent',
});

const navIconStyle: React.CSSProperties = {
  fontSize: '16px',
  width: '20px',
  textAlign: 'center',
};

const sidebarFooterStyle: React.CSSProperties = {
  padding: '16px',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(0,0,0,0.2)',
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
  padding: '12px',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '10px',
};

const userAvatarStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  background: 'linear-gradient(135deg, #27ae60, #1e8449)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 600,
};

const userNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  fontWeight: 600,
};

const userRoleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '11px',
  opacity: 0.6,
};

const logoutBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: 'rgba(231, 76, 60, 0.15)',
  color: '#e74c3c',
  border: '1px solid rgba(231, 76, 60, 0.2)',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  letterSpacing: '0.3px',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  marginLeft: '260px',
  padding: '32px 40px',
  minHeight: '100vh',
};

const themeToggleContainer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: '20px',
  padding: '10px 16px',
  borderRadius: '12px',
};

const themeToggleStyle = (theme: string): React.CSSProperties => ({
  padding: '10px 18px',
  background: theme === 'dark' ? 'rgba(52, 152, 219, 0.2)' : '#f1f5f9',
  color: theme === 'dark' ? '#e2e8f0' : '#334155',
  border: '1px solid',
  borderColor: theme === 'dark' ? 'rgba(52, 152, 219, 0.3)' : '#e2e8f0',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
});

export default Layout;