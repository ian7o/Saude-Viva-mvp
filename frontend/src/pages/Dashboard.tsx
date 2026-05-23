import React, { useEffect, useState } from 'react';
import { appointmentsService, documentsService } from '../services/api';
import type { Appointment } from '../types';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
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
      <div style={headerStyle}>
        <div>
          <h1 style={greetingStyle}>{getGreeting()}, {userName}!</h1>
          <p style={subtitleStyle}>Aqui está o resumo do seu dia</p>
        </div>
        <div style={dateDisplayStyle}>
          <span style={dateIconStyle}>📅</span>
          <span>{new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>
      
      <div style={statsGridStyle}>
          <div className="card-hover" style={statCardStyle}>
            <div style={statIconStyle}>📅</div>
            <div>
              <h3 style={statLabelStyle}>Consultas de Hoje</h3>
              <p style={statValueStyle}>{todayAppointments.length}</p>
            </div>
          </div>
          <div className="card-hover" style={statCardStyle}>
            <div style={statIconStyle}>👥</div>
            <div>
              <h3 style={statLabelStyle}>Pacientes Atendidos</h3>
              <p style={statValueStyle}>0</p>
            </div>
          </div>
          <div className="card-hover" style={statCardStyle}>
            <div style={statIconStyle}>📄</div>
            <div>
              <h3 style={statLabelStyle}>Documentos</h3>
              <p style={statValueStyle}>{documentsCount}</p>
            </div>
          </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Próximas Consultas</h2>
        {todayAppointments.length === 0 ? (
          <div style={emptyStateStyle}>
            <span style={emptyIconStyle}>📭</span>
            <p>Nenhuma consulta agendada para hoje</p>
          </div>
        ) : (
          <div style={listStyle}>
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="card-hover" style={itemStyle}>
                <div style={itemLeftStyle}>
                  <div style={patientAvatarStyle}>{apt.patient?.name?.[0] || 'P'}</div>
                  <div>
                    <strong style={patientNameStyle}>{apt.patient?.name || 'Paciente'}</strong>
                    <p style={descriptionStyle}>{apt.description}</p>
                  </div>
                </div>
                <div style={itemRightStyle}>
                  <span style={timeStyle}>
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

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid #e2e8f0',
  flexWrap: 'wrap',
  gap: '16px',
};

const greetingStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 700,
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  color: '#fffff',
  fontSize: '15px',
  margin: '8px 0 0 0',
};

const dateDisplayStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 20px',
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  color: '#475569',
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const dateIconStyle: React.CSSProperties = {
  fontSize: '18px',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '32px',
};

const statCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  border: '1px solid #e2e8f0',
};

const statIconStyle: React.CSSProperties = {
  fontSize: '28px',
  width: '56px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
  borderRadius: '14px',
};

const statLabelStyle: React.CSSProperties = {
  color: '#64748b',
  marginBottom: '4px',
  fontSize: '13px',
  fontWeight: 500,
};

const statValueStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 700,
  color: '#1e293b',
  margin: 0,
  lineHeight: 1.2,
};

const sectionStyle: React.CSSProperties = {
  marginTop: '32px',
};

const sectionTitleStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 600,
  marginBottom: '20px',
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 40px',
  color: '#94a3b8',
  background: 'white',
  borderRadius: '16px',
  border: '2px dashed #e2e8f0',
};

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

const itemStyle: React.CSSProperties = {
  background: 'white',
  padding: '20px 24px',
  borderRadius: '14px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid #e2e8f0',
};

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

const patientNameStyle: React.CSSProperties = {
  color: '#1e293b',
  fontSize: '15px',
  fontWeight: 600,
  display: 'block',
};

const descriptionStyle: React.CSSProperties = {
  color: '#64748b',
  margin: '4px 0 0 0',
  fontSize: '13px',
};

const itemRightStyle: React.CSSProperties = {
  textAlign: 'right',
};

const timeStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '18px',
  fontWeight: 700,
  color: '#1e293b',
};

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