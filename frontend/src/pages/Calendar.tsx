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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={goToPreviousDay} style={navBtnStyle}>◀</button>
          <button onClick={goToToday} style={todayBtnStyle}>Hoje</button>
          <button onClick={goToNextDay} style={navBtnStyle}>▶</button>
        </div>
        <h1 style={{ color: '#2c3e50' }}>Calendário</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowAddModal(true)} style={addBtnStyle}>+ Nova Consulta</button>
          <button onClick={() => setViewMode('day')} style={viewBtnStyle(viewMode === 'day')}>Dia</button>
          <button onClick={() => setViewMode('week')} style={viewBtnStyle(viewMode === 'week')}>Semana</button>
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
  cursor: 'pointer',
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

const dayColumnStyle = (isToday: boolean, isWeekend: boolean): React.CSSProperties => ({
  background: isToday ? '#e8f4fd' : (isWeekend ? '#fef9e7' : 'white'),
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const dayHeaderStyle = (isToday: boolean, isWeekend: boolean): React.CSSProperties => ({
  background: isToday ? '#3498db' : (isWeekend ? '#f39c12' : '#ecf0f1'),
  color: isToday ? 'white' : (isWeekend ? 'white' : '#2c3e50'),
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
  cursor: 'pointer',
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

const addBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  maxWidth: '400px',
  width: '90%',
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '15px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  marginTop: '5px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '14px',
};

const submitBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const addSmallBtnStyle: React.CSSProperties = {
  padding: '10px 15px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const detailRowStyle: React.CSSProperties = {
  marginBottom: '12px',
  padding: '10px',
  background: '#f8f9fa',
  borderRadius: '5px',
};

export default Calendar;