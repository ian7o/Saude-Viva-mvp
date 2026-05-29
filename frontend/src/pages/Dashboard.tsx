import React, { useEffect, useState } from 'react';
import { appointmentsService, documentsService } from '../services/api';
import type { Appointment } from '../types';
import Layout from '../components/Layout';
import { useTheme, ThemeColorPalette } from '../context/ThemeContext';

const Dashboard: React.FC = () => {
  const { colors } = useTheme();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [userName, setUserName] = useState('Dr. Admin');

  const loadDocumentsCount = async () => {
    try {
      const data = await documentsService.getAll();
      setDocumentsCount(data.length);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadTodayAppointments = async () => {
    try {
      const data = await appointmentsService.getToday();
      setTodayAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      if (userData?.name) {
        setUserName(userData.name.split(' ')[0]);
      }
    }
    loadTodayAppointments();
    loadDocumentsCount();
  }, []);

  return (
    <Layout>
      <div style={headerStyle(colors)}>
        <div>
          <h1 style={greetingStyle(colors)}>{getGreeting()}, {userName}!</h1>
          <p style={subtitleStyle(colors)}>Aqui está o resumo do seu dia</p>
        </div>
        <div style={dateDisplayStyle(colors)}>
          <span style={dateIconStyle}>📅</span>
          <span>{new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>
      
      <div style={statsGridStyle}>
          <div className="card-hover" style={statCardStyle(colors)}>
            <div style={statIconStyle}>📅</div>
            <div>
              <h3 style={statLabelStyle(colors)}>Consultas de Hoje</h3>
              <p style={statValueStyle(colors)}>{todayAppointments.length}</p>
            </div>
          </div>
          <div className="card-hover" style={statCardStyle(colors)}>
            <div style={statIconStyle}>👥</div>
            <div>
              <h3 style={statLabelStyle(colors)}>Pacientes Atendidos</h3>
              <p style={statValueStyle(colors)}>0</p>
            </div>
          </div>
          <div className="card-hover" style={statCardStyle(colors)}>
            <div style={statIconStyle}>📄</div>
            <div>
              <h3 style={statLabelStyle(colors)}>Documentos</h3>
              <p style={statValueStyle(colors)}>{documentsCount}</p>
            </div>
          </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle(colors)}>Próximas Consultas</h2>
        {todayAppointments.length === 0 ? (
          <div style={emptyStateStyle(colors)}>
            <span style={emptyIconStyle}>📭</span>
            <p>Nenhuma consulta agendada para hoje</p>
          </div>
        ) : (
          <div style={listStyle}>
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="card-hover" style={itemStyle(colors)}>
                <div style={itemLeftStyle}>
                  <div style={patientAvatarStyle}>{apt.patient?.name?.[0] || 'P'}</div>
                  <div>
                    <strong style={patientNameStyle(colors)}>{apt.patient?.name || 'Paciente'}</strong>
                    <p style={descriptionStyle(colors)}>{apt.description}</p>
                  </div>
                </div>
                <div style={itemRightStyle}>
                  <span style={timeStyle(colors)}>
                    {new Date(apt.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={specialtyTagStyle}>{apt.specialty}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

const headerStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: `1px solid ${colors.border}`,
  flexWrap: 'wrap',
  gap: '16px',
});

const greetingStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.text,
  fontSize: '32px',
  fontWeight: 700,
  margin: 0,
});

const subtitleStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.textSecondary,
  fontSize: '15px',
  margin: '8px 0 0 0',
});

const dateDisplayStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 20px',
  background: colors.surface,
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  color: colors.text,
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: `0 1px 3px ${colors.shadow}`,
});

const dateIconStyle: React.CSSProperties = {
  fontSize: '18px',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '32px',
};

const statCardStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  background: colors.surface,
  padding: '24px',
  borderRadius: '16px',
  boxShadow: `0 1px 3px ${colors.shadow}, 0 1px 2px ${colors.shadow}`,
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  border: `1px solid ${colors.border}`,
});

const statIconStyle: React.CSSProperties = {
  fontSize: '28px',
  width: '56px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #4b6677, #205572)',
  borderRadius: '14px',
};

const statLabelStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.textSecondary,
  marginBottom: '4px',
  fontSize: '13px',
  fontWeight: 500,
});

const statValueStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  fontSize: '32px',
  fontWeight: 700,
  color: colors.text,
  margin: 0,
  lineHeight: 1.2,
});

const sectionStyle: React.CSSProperties = {
  marginTop: '32px',
};

const sectionTitleStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.text,
  fontSize: '20px',
  fontWeight: 600,
  marginBottom: '20px',
});

const emptyStateStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  textAlign: 'center',
  padding: '60px 40px',
  color: colors.textSecondary,
  background: colors.surface,
  borderRadius: '16px',
  border: `2px dashed ${colors.border}`,
});

const emptyIconStyle: React.CSSProperties = {
  fontSize: '40px',
  display: 'block',
  marginBottom: '12px',
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const itemStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  background: colors.surface,
  padding: '20px 24px',
  borderRadius: '14px',
  boxShadow: `0 1px 3px ${colors.shadow}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: `1px solid ${colors.border}`,
});

const itemLeftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const patientAvatarStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: 600,
};

const patientNameStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.text,
  fontSize: '15px',
  fontWeight: 600,
  display: 'block',
});

const descriptionStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.textSecondary,
  margin: '4px 0 0 0',
  fontSize: '13px',
});

const itemRightStyle: React.CSSProperties = {
  textAlign: 'right',
};

const timeStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'block',
  fontSize: '18px',
  fontWeight: 700,
  color: colors.text,
});

const specialtyTagStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '6px',
  padding: '4px 12px',
  background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
  color: '#0284c7',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 500,
};

export default Dashboard;
