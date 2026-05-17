import React, { useEffect, useState, useCallback } from 'react';
import { appointmentsService, patientsService } from '../services/api';
import type { Appointment, Patient } from '../types';
import Layout from '../components/Layout';

type ViewMode = 'day' | 'week';

const Calendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({ description: '', specialty: '', date: '', time: '', patientId: '' });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [specialties, setSpecialties] = useState([
    'Medicina Geral',
    'Cardiologia',
    'Dermatologia',
    'Neurologia',
    'Ortopedia',
    'Pediatria',
    'Ginecologia',
    'Oftalmologia',
    'Otorrinolaringologia',
    'Psiquiatria'
  ]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [showSpecialtyInput, setShowSpecialtyInput] = useState(false);

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
        const day = currentDate.getDay();
        startOfWeek.setDate(currentDate.getDate() - day);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
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

  const loadPatients = async () => {
    try {
      const data = await patientsService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const getDaysOfWeek = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    startOfWeek.setDate(currentDate.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      day.setHours(0, 0, 0, 0);
      days.push(day);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await fetch('http://localhost:4000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          description: newAppointment.description,
          specialty: newAppointment.specialty,
          date: dateTime.toISOString(),
          doctorId: user.id,
          patientId: parseInt(newAppointment.patientId)
        })
      });
      setShowAddModal(false);
      setNewAppointment({ description: '', specialty: '', date: '', time: '', patientId: '' });
      loadAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
      setShowSpecialtyInput(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    if (!window.confirm('Tem certeza que deseja eliminar esta consulta?')) return;
    try {
      await fetch(`http://localhost:4000/api/appointments/${selectedAppointment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  return (
    <Layout>
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <h1 style={pageTitleStyle}>Calendário</h1>
          <p style={pageSubtitleStyle}>Gerencie suas consultas e horários</p>
        </div>
        <div style={headerRightStyle}>
          <div style={navControlsStyle}>
            <button onClick={goToPreviousDay} style={navBtnStyle}>◀</button>
            <button onClick={goToToday} style={todayBtnStyle}>Hoje</button>
            <button onClick={goToNextDay} style={navBtnStyle}>▶</button>
          </div>
          <div style={viewToggleStyle}>
            <button onClick={() => setViewMode('day')} style={viewBtnStyle(viewMode === 'day')}>Dia</button>
            <button onClick={() => setViewMode('week')} style={viewBtnStyle(viewMode === 'week')}>Semana</button>
          </div>
          <button onClick={() => setShowAddModal(true)} style={addBtnStyle}>+ Nova Consulta</button>
        </div>
      </div>

      {showAddModal && (
        <div style={modalOverlayStyle} onClick={() => setShowAddModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3>Nova Consulta</h3>
            <form onSubmit={handleCreateAppointment}>
              <div style={formGroupStyle}>
                <label>Descrição</label>
                <input type="text" value={newAppointment.description} onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })} style={inputStyle} required />
              </div>
              <div style={formGroupStyle}>
                <label>Especialidade</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={newAppointment.specialty} onChange={(e) => setNewAppointment({ ...newAppointment, specialty: e.target.value })} style={{ ...inputStyle, flex: 1 }} required>
                    <option value="">Selecione...</option>
                    {specialties.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowSpecialtyInput(!showSpecialtyInput)} style={addSmallBtnStyle}>+</button>
                </div>
                {showSpecialtyInput && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input type="text" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} placeholder="Nova especialidade" style={inputStyle} />
                    <button type="button" onClick={handleAddSpecialty} style={submitBtnStyle}>Adicionar</button>
                  </div>
                )}
              </div>
              <div style={formGroupStyle}>
                <label>Paciente</label>
                <select value={newAppointment.patientId} onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })} style={inputStyle} required>
                  <option value="">Selecione...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={formGroupStyle}>
                <label>Data</label>
                <input type="date" value={newAppointment.date} onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })} style={inputStyle} required />
              </div>
              <div style={formGroupStyle}>
                <label>Hora</label>
                <input type="time" value={newAppointment.time} onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })} style={inputStyle} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={submitBtnStyle}>Criar</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={cancelBtnStyle}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAppointment && (
        <div style={modalOverlayStyle} onClick={() => setSelectedAppointment(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3>Detalhes da Consulta</h3>
            <div style={{ marginTop: '20px' }}>
              <p style={detailRowStyle}><strong>Descrição:</strong> {selectedAppointment.description}</p>
              <p style={detailRowStyle}><strong>Especialidade:</strong> {selectedAppointment.specialty}</p>
              <p style={detailRowStyle}>
                <strong>Data:</strong> {new Date(selectedAppointment.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p style={detailRowStyle}>
                <strong>Hora:</strong> {new Date(selectedAppointment.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style={detailRowStyle}><strong>Paciente:</strong> {selectedAppointment.patient?.name || 'N/A'}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleDeleteAppointment} style={deleteBtnStyle}>Eliminar</button>
              <button onClick={() => setSelectedAppointment(null)} style={cancelBtnStyle}>Fechar</button>
            </div>
          </div>
        </div>
      )}

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
                <div key={apt.id} style={appointmentCardStyle} onClick={() => setSelectedAppointment(apt)}>
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
            <div key={day.toISOString()} style={dayColumnStyle(isToday(day), isWeekend(day))}>
              <div style={dayHeaderStyle(isToday(day), isWeekend(day))}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                  {day.toLocaleDateString('pt-PT', { weekday: 'long' })}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {day.getDate()}
                </div>
              </div>
              <div style={{ ...dayContentStyle, background: isWeekend(day) ? '#fef9e7' : 'white' }}>
                {getAppointmentsForDay(day).map((apt) => (
                  <div key={apt.id} style={weekAppointmentStyle} onClick={() => setSelectedAppointment(apt)}>
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
  background: active ? '#3498db' : '#f8fafc',
  color: active ? 'white' : '#64748b',
  border: `1px solid ${active ? '#3498db' : '#e2e8f0'}`,
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '13px',
  transition: 'all 0.2s ease',
});

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 40px',
  color: '#94a3b8',
  background: 'white',
  borderRadius: '12px',
  border: '2px dashed #e2e8f0',
  fontSize: '15px',
};

const dayViewStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const appointmentCardStyle: React.CSSProperties = {
  display: 'flex',
  background: 'white',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  cursor: 'pointer',
  border: '1px solid #e2e8f0',
  transition: 'all 0.2s ease',
};

const timeBlockStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  padding: '24px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '120px',
  fontWeight: 600,
  fontSize: '15px',
};

const detailsStyle: React.CSSProperties = {
  padding: '20px 24px',
  flex: 1,
};

const specialtyTagStyle: React.CSSProperties = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
  color: '#0284c7',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 500,
  marginTop: '10px',
};

const weekGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '12px',
};

const dayColumnStyle = (isToday: boolean, isWeekend: boolean): React.CSSProperties => ({
  background: isToday ? '#eff6ff' : (isWeekend ? '#fffbeb' : 'white'),
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  border: `1px solid ${isToday ? '#bfdbfe' : (isWeekend ? '#fef3c7' : '#e2e8f0')}`,
});

const dayHeaderStyle = (isToday: boolean, isWeekend: boolean): React.CSSProperties => ({
  background: isToday ? 'linear-gradient(135deg, #3498db, #2980b9)' : (isWeekend ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'),
  color: 'white',
  padding: '14px 10px',
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '13px',
});

const dayContentStyle: React.CSSProperties = {
  padding: '12px',
  minHeight: '180px',
};

const weekAppointmentStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  padding: '10px',
  borderRadius: '8px',
  marginBottom: '8px',
  fontSize: '12px',
  boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)',
};

const navBtnStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#64748b',
  fontSize: '14px',
  transition: 'all 0.2s ease',
};

const todayBtnStyle: React.CSSProperties = {
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '13px',
  boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
};

const addBtnStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #27ae60, #1e8449)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  background: 'white',
  padding: '32px',
  borderRadius: '16px',
  maxWidth: '480px',
  width: '90%',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '20px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  marginTop: '8px',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  fontSize: '14px',
  color: '#334155',
  background: '#f8fafc',
  transition: 'all 0.2s ease',
};

const submitBtnStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #27ae60, #1e8449)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: '#f1f5f9',
  color: '#64748b',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
};

const addSmallBtnStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 600,
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
};

const detailRowStyle: React.CSSProperties = {
  marginBottom: '14px',
  padding: '14px 16px',
  background: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
};

// Header styles
const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid #e2e8f0',
};

const headerLeftStyle: React.CSSProperties = {};

const pageTitleStyle: React.CSSProperties = {
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: 700,
  margin: 0,
};

const pageSubtitleStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: '14px',
  margin: '4px 0 0 0',
};

const headerRightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const navControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px',
  background: 'white',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
};

const viewToggleStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  padding: '4px',
  background: '#f1f5f9',
  borderRadius: '10px',
};

export default Calendar;