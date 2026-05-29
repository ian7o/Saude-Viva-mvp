import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useTheme, ThemeColorPalette } from '../context/ThemeContext';

type LoginTab = 'staff' | 'patient';

const Login: React.FC = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<LoginTab>('staff');
  const [email, setEmail] = useState('admin@saudeviva.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (tab: LoginTab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'staff') {
      setEmail('admin@saudeviva.com');
      setPassword('admin123');
    } else {
      setEmail('joao.silva@example.com');
      setPassword('paciente123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user.role === 'patient' ? '/calendar' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={loginBoxStyle(colors)}>
        <div style={logoSectionStyle}>
          <div style={logoIconStyle}>+</div>
          <h1 style={logoTitleStyle}>Saude Viva</h1>
          <p style={logoSubtitleStyle}>Gestão Clínica</p>
        </div>
        
        <div style={formSectionStyle}>
          <div style={tabBarStyle}>
            <button
              style={loginTabStyle(activeTab === 'staff', colors)}
              onClick={() => handleTabChange('staff')}
            >
              👨‍⚕️ Médico / Secretária
            </button>
            <button
              style={loginTabStyle(activeTab === 'patient', colors)}
              onClick={() => handleTabChange('patient')}
            >
              🤒 Paciente
            </button>
          </div>

          <h2 style={formTitleStyle(colors)}>Entrar</h2>
          <p style={formSubtitleStyle(colors)}>
            {activeTab === 'staff' ? 'Aceda à sua conta' : 'Aceda à sua conta de paciente'}
          </p>
          
          {error && <div style={errorStyle}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle(colors)}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-focus"
                style={inputStyle(colors)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle(colors)}>Palavra-passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-focus"
                style={inputStyle(colors)}
                required
              />
            </div>
            <button type="submit" className="btn-hover" style={buttonStyle}>Entrar</button>
          </form>
          
          <p style={hintStyle(colors)}>
            {activeTab === 'staff'
              ? 'Médico: admin@saudeviva.com / admin123  |  Secretária: secretaria@saudeviva.com / admin123'
              : 'Use o email do paciente e palavra-passe: paciente123'}
          </p>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0d2137 0%, #1a3a5c 50%, #0d2137 100%)',
  padding: '24px',
};

const loginBoxStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  background: colors.surface,
  borderRadius: '24px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
  width: '100%',
  maxWidth: '440px',
  overflow: 'hidden',
});

const logoSectionStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a3a5c 0%, #0d2137 100%)',
  padding: '40px 40px 30px',
  textAlign: 'center',
};

const logoIconStyle: React.CSSProperties = {
  width: '60px',
  height: '60px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  fontWeight: 'bold',
  color: 'white',
  margin: '0 auto 16px',
};

const logoTitleStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '24px',
  fontWeight: 700,
  margin: 0,
  letterSpacing: '0.5px',
};

const logoSubtitleStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '13px',
  margin: '8px 0 0 0',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const formSectionStyle: React.CSSProperties = {
  padding: '40px',
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  marginBottom: '24px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
};

const loginTabStyle = (active: boolean, colors: ThemeColorPalette): React.CSSProperties => ({
  flex: 1,
  padding: '12px 16px',
  background: active ? colors.primaryGradient : 'transparent',
  color: active ? 'white' : colors.textSecondary,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '13px',
  textAlign: 'center',
  transition: 'all 0.2s ease',
});

const formTitleStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.text,
  fontSize: '22px',
  fontWeight: 700,
  margin: '0 0 8px 0',
  textAlign: 'center',
});

const formSubtitleStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.textSecondary,
  fontSize: '14px',
  margin: '0 0 28px 0',
  textAlign: 'center',
});

const formGroupStyle: React.CSSProperties = {
  marginBottom: '20px',
};

const labelStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'block',
  color: colors.textSecondary,
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '8px',
});

const inputStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  width: '100%',
  padding: '14px 16px',
  border: `1.5px solid ${colors.border}`,
  borderRadius: '12px',
  fontSize: '15px',
  color: colors.text,
  background: colors.surfaceHover,
  outline: 'none',
  boxSizing: 'border-box',
});

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '12px',
  letterSpacing: '0.5px',
  boxShadow: '0 4px 16px rgba(52, 152, 219, 0.35)',
};

const errorStyle: React.CSSProperties = {
  color: '#dc2626',
  marginBottom: '20px',
  padding: '14px 16px',
  background: '#fef2f2',
  borderRadius: '10px',
  fontSize: '14px',
  border: '1px solid #fecaca',
};

const hintStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.textSecondary,
  fontSize: '12px',
  textAlign: 'center',
  marginTop: '20px',
});

export default Login;
