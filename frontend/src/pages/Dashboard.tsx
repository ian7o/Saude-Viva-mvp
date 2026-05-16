import React, { useEffect, useState } from 'react';
import { appointmentsService } from '../services/api';
import type { Appointment } from '../types';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [user] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  const loadTodayAppointments = async () => {
    try {
      const data = await appointmentsService.getToday();
      setTodayAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  return (
    <Layout>
      <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>
        Bem-vindo, {user?.name || 'Doctor'}
      </h1>
      
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <h3 style={{ color: '#7f8c8d', marginBottom: '10px' }}>Consultas de Hoje</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#3498db' }}>
            {todayAppointments.length}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Próximas Consultas</h2>
        {todayAppointments.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>Nenhuma consulta agendada para hoje.</p>
        ) : (
          <div style={listStyle}>
            {todayAppointments.map((apt) => (
              <div key={apt.id} style={itemStyle}>
                <div>
                  <strong>{apt.patient?.name || 'Paciente'}</strong>
                  <p style={{ color: '#7f8c8d', margin: '5px 0' }}>{apt.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={timeStyle}>
                    {new Date(apt.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={specialtyStyle}>{apt.specialty}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
};

const statCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '25px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const itemStyle: React.CSSProperties = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const timeStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2c3e50',
};

const specialtyStyle: React.CSSProperties = {
  display: 'block',
  color: '#7f8c8d',
  fontSize: '14px',
};

export default Dashboard;