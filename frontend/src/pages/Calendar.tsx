import React, { useEffect, useState, useCallback } from 'react';
import { appointmentsService } from '../services/api';
import type { Appointment } from '../types';
import Layout from '../components/Layout';

type ViewMode = 'day' | 'week';

const Calendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPreviousDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const loadAppointments = useCallback(async () => {
    try {
      let data: Appointment[];
      if (viewMode === 'day') {
        data = await appointmentsService.getToday();
      } else {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        data = await appointmentsService.getByRange(
          startOfWeek.toISOString(),
          endOfWeek.toISOString()
        );
      }
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }, [viewMode, currentDate]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const getDaysOfWeek = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={goToPreviousDay} style={navBtnStyle}>◀</button>
          <button onClick={goToToday} style={todayBtnStyle}>Hoje</button>
          <button onClick={goToNextDay} style={navBtnStyle}>▶</button>
        </div>
        <h1 style={{ color: '#2c3e50' }}>Calendárioxxx</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setViewMode('day')} style={viewBtnStyle(viewMode === 'day')}>
            Dia
          </button>
          <button onClick={() => setViewMode('week')} style={viewBtnStyle(viewMode === 'week')}>
            Semana
          </button>
        </div>
      </div>

      {viewMode === 'day' ? (
        <div>
          <h2 style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            {currentDate.toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          {appointments.length === 0 ? (
            <div style={emptyStyle}>Nenhuma consulta para hoje</div>
          ) : (
            <div style={dayViewStyle}>
              {appointments.map((apt) => (
                <div key={apt.id} style={appointmentCardStyle}>
                  <div style={timeBlockStyle}>
                    {new Date(apt.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={detailsStyle}>
                    <strong>{apt.patient?.name || 'Paciente'}</strong>
                    <p>{apt.description}</p>
                    <span style={specialtyTagStyle}>{apt.specialty}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={weekGridStyle}>
          {getDaysOfWeek().map((day) => (
            <div key={day.toISOString()} style={dayColumnStyle(isToday(day))}>
              <div style={dayHeaderStyle(isToday(day))}>
                {day.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric' })}
              </div>
              <div style={dayContentStyle}>
                {getAppointmentsForDay(day).map((apt) => (
                  <div key={apt.id} style={weekAppointmentStyle}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                      {new Date(apt.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '12px' }}>{apt.patient?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

const viewBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  background: active ? '#3498db' : 'white',
  color: active ? 'white' : '#3498db',
  border: '1px solid #3498db',
  borderRadius: '5px',
  cursor: 'pointer',
});

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d',
  background: 'white',
  borderRadius: '10px',
};

const dayViewStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const appointmentCardStyle: React.CSSProperties = {
  display: 'flex',
  background: 'white',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const timeBlockStyle: React.CSSProperties = {
  background: '#3498db',
  color: 'white',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '100px',
  fontWeight: 'bold',
};

const detailsStyle: React.CSSProperties = {
  padding: '20px',
  flex: 1,
};

const specialtyTagStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#ecf0f1',
  color: '#7f8c8d',
  padding: '5px 10px',
  borderRadius: '15px',
  fontSize: '12px',
  marginTop: '10px',
};

const weekGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '10px',
};

const dayColumnStyle = (isToday: boolean): React.CSSProperties => ({
  background: isToday ? '#e8f4fd' : 'white',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const dayHeaderStyle = (isToday: boolean): React.CSSProperties => ({
  background: isToday ? '#3498db' : '#ecf0f1',
  color: isToday ? 'white' : '#2c3e50',
  padding: '10px',
  textAlign: 'center',
  fontWeight: 'bold',
});

const dayContentStyle: React.CSSProperties = {
  padding: '10px',
  minHeight: '200px',
};

const weekAppointmentStyle: React.CSSProperties = {
  background: '#3498db',
  color: 'white',
  padding: '8px',
  borderRadius: '5px',
  marginBottom: '8px',
  fontSize: '12px',
};

const navBtnStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#ecf0f1',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const todayBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default Calendar;