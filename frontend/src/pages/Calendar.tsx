import React, { useEffect, useState, useCallback } from 'react';
import { appointmentsService, patientsService, doctorsService } from '../services/api';
import type { Appointment, Patient } from '../types';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { getTitleStyles } from '../styles/theme';
import api from '../services/api';

type ViewMode = 'day' | 'week';

const Calendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newAppointment, setNewAppointment] = useState({ description: '', specialty: '', date: '', time: '', patientId: '', doctorId: '' });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editAppointment, setEditAppointment] = useState({ description: '', specialty: '', date: '', time: '', patientId: '', status: '' });
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
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filterDoctorId, setFilterDoctorId] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSecretary = user.role === 'secretary';

  const { theme, colors } = useTheme();
  const titleStyles = getTitleStyles(colors);

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
      const docId = filterDoctorId ? parseInt(filterDoctorId) : undefined;
      const spec = filterSpecialty || undefined;

      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      if (viewMode === 'day') {
        data = await appointmentsService.getByRange(
          startOfDay.toISOString(),
          endOfDay.toISOString(),
          docId,
          spec
        );
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
          endOfWeek.toISOString(),
          docId,
          spec
        );
      }
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    }
  }, [viewMode, currentDate, filterDoctorId, filterSpecialty]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const loadPatients = async () => {
    try {
      const data = await patientsService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await doctorsService.getAll();
        setDoctors(data);
      } catch (err) {
        console.error('Erro ao carregar médicos:', err);
      }
    };
    loadDoctors();
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
    setCreateError('');
    try {
      const dateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const docId = isSecretary ? parseInt(newAppointment.doctorId) : user.id;
      await api.post('/appointments', {
        description: newAppointment.description,
        specialty: newAppointment.specialty,
        date: dateTime.toISOString(),
        doctorId: docId,
        patientId: parseInt(newAppointment.patientId)
      });
      setShowAddModal(false);
      setNewAppointment({ description: '', specialty: '', date: '', time: '', patientId: '', doctorId: '' });
      loadAppointments();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao criar consulta';
      setCreateError(Array.isArray(msg) ? msg.join(', ') : msg);
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
      console.error('Erro ao eliminar consulta:', error);
    }
  };

  const startEditAppointment = () => {
    if (!selectedAppointment) return;
    const d = new Date(selectedAppointment.date);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().split(':').slice(0, 2).join(':');
    setEditAppointment({
      description: selectedAppointment.description || '',
      specialty: selectedAppointment.specialty || '',
      date: dateStr,
      time: timeStr,
      patientId: String(selectedAppointment.patientId),
      status: selectedAppointment.status || 'scheduled',
    });
    setEditMode(true);
    setCreateError('');
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setCreateError('');
    try {
      const dateTime = new Date(`${editAppointment.date}T${editAppointment.time}`);
      const body: any = {
        description: editAppointment.description,
        specialty: editAppointment.specialty,
        patientId: parseInt(editAppointment.patientId),
        status: editAppointment.status,
      };
      if (editAppointment.date && editAppointment.time) {
        body.date = dateTime.toISOString();
      }
      await api.put(`/appointments/${selectedAppointment.id}`, body);
      setEditMode(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao atualizar consulta';
      setCreateError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <Layout>
      <div style={titleStyles.header}>
        <div>
          <h1 style={titleStyles.pageTitle}>Calendário</h1>
          <p style={titleStyles.pageSubtitle}>Gerencie suas consultas e horários</p>
        </div>
        <div style={headerRightStyle}>
          <div style={{ ...navControlsStyle, background: colors.surface, borderColor: colors.border }}>
            <button onClick={goToPreviousDay} style={{ ...navBtnStyle, color: colors.textSecondary, borderColor: colors.border, background: colors.surface }}>◀</button>
            <button onClick={goToToday} style={todayBtnStyle}>Hoje</button>
            <button onClick={goToNextDay} style={{ ...navBtnStyle, color: colors.textSecondary, borderColor: colors.border, background: colors.surface }}>▶</button>
          </div>
          <div style={{ ...viewToggleStyle, background: colors.surface }}>
            <button onClick={() => setViewMode('day')} style={viewBtnStyle(viewMode === 'day', theme)}>Dia</button>
            <button onClick={() => setViewMode('week')} style={viewBtnStyle(viewMode === 'week', theme)}>Semana</button>
          </div>
          <button onClick={() => setShowAddModal(true)} style={addBtnStyle}>+ Nova Consulta</button>
        </div>
      </div>

      <div style={{ ...filterBarStyle, background: colors.surface, borderColor: colors.border }}>
        {isSecretary && (
          <select value={filterDoctorId} onChange={(e) => setFilterDoctorId(e.target.value)} style={{ ...filterSelectStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }}>
            <option value="">Todos os Médicos</option>
            {doctors.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name} {d.specialty ? `- ${d.specialty}` : ''}</option>
            ))}
          </select>
        )}
        <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} style={{ ...filterSelectStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }}>
          <option value="">Todas as Especialidades</option>
          {specialties.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {showAddModal && (
        <div style={modalOverlayStyle} onClick={() => { setShowAddModal(false); setCreateError(''); }}>
          <div style={{ ...modalContentStyle, background: colors.surface }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: colors.text, marginTop: 0 }}>Nova Consulta</h3>
            {createError && <div style={errorStyle}>{createError}</div>}
            <form onSubmit={handleCreateAppointment}>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Descrição</label>
                <input type="text" value={newAppointment.description} onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Especialidade</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={newAppointment.specialty} onChange={(e) => setNewAppointment({ ...newAppointment, specialty: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border, flex: 1 }} required>
                    <option value="">Selecione...</option>
                    {specialties.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowSpecialtyInput(!showSpecialtyInput)} style={addSmallBtnStyle}>+</button>
                </div>
                {showSpecialtyInput && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input type="text" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} placeholder="Nova especialidade" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
                    <button type="button" onClick={handleAddSpecialty} style={submitBtnStyle}>Adicionar</button>
                  </div>
                )}
              </div>
              {isSecretary && (
                <div style={formGroupStyle}>
                  <label style={{ color: colors.textSecondary }}>Médico</label>
                  <select value={newAppointment.doctorId} onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required>
                    <option value="">Selecione...</option>
                    {doctors.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Paciente</label>
                <select value={newAppointment.patientId} onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required>
                  <option value="">Selecione...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Data</label>
                <input type="date" value={newAppointment.date} onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Hora</label>
                <input type="time" value={newAppointment.time} onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={submitBtnStyle}>Criar</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ ...cancelBtnStyle, background: colors.surfaceHover, color: colors.textSecondary, borderColor: colors.border }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAppointment && !editMode && (
        <div style={modalOverlayStyle} onClick={() => setSelectedAppointment(null)}>
          <div style={{ ...modalContentStyle, background: colors.surface }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: colors.text, marginTop: 0 }}>Detalhes da Consulta</h3>
            <div style={{ marginTop: '20px' }}>
              <p style={{ ...detailRowStyle, color: colors.text, background: colors.surfaceHover, borderColor: colors.border }}><strong>Descrição:</strong> {selectedAppointment.description}</p>
              <p style={{ ...detailRowStyle, color: colors.text, background: colors.surfaceHover, borderColor: colors.border }}><strong>Especialidade:</strong> {selectedAppointment.specialty}</p>
              <p style={{ ...detailRowStyle, color: colors.text, background: colors.surfaceHover, borderColor: colors.border }}>
                <strong>Data:</strong> {new Date(selectedAppointment.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p style={{ ...detailRowStyle, color: colors.text, background: colors.surfaceHover, borderColor: colors.border }}>
                <strong>Hora:</strong> {new Date(selectedAppointment.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style={{ ...detailRowStyle, color: colors.text, background: colors.surfaceHover, borderColor: colors.border }}><strong>Paciente:</strong> {selectedAppointment.patient?.name || 'N/A'}</p>
              <p style={{ ...detailRowStyle, color: colors.text, background: colors.surfaceHover, borderColor: colors.border }}><strong>Estado:</strong> <span style={statusBadgeStyle(selectedAppointment.status || 'scheduled')}>{statusLabel(selectedAppointment.status || 'scheduled')}</span></p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => startEditAppointment()} style={editBtnStyle}>Editar</button>
              <button onClick={handleDeleteAppointment} style={deleteBtnStyle}>Eliminar</button>
              <button onClick={() => setSelectedAppointment(null)} style={{ ...cancelBtnStyle, background: colors.surfaceHover, color: colors.textSecondary, borderColor: colors.border }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {selectedAppointment && editMode && (
        <div style={modalOverlayStyle} onClick={() => { setEditMode(false); setSelectedAppointment(null); }}>
          <div style={{ ...modalContentStyle, background: colors.surface }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: colors.text, marginTop: 0 }}>Editar Consulta</h3>
            {createError && <div style={errorStyle}>{createError}</div>}
            <form onSubmit={handleUpdateAppointment}>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Descrição</label>
                <input type="text" value={editAppointment.description} onChange={(e) => setEditAppointment({ ...editAppointment, description: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Especialidade</label>
                <select value={editAppointment.specialty} onChange={(e) => setEditAppointment({ ...editAppointment, specialty: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }}>
                  <option value="">Selecione...</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Paciente</label>
                <select value={editAppointment.patientId} onChange={(e) => setEditAppointment({ ...editAppointment, patientId: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }}>
                  <option value="">Selecione...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Data</label>
                <input type="date" value={editAppointment.date} onChange={(e) => setEditAppointment({ ...editAppointment, date: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Hora</label>
                <input type="time" value={editAppointment.time} onChange={(e) => setEditAppointment({ ...editAppointment, time: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Estado</label>
                <select value={editAppointment.status} onChange={(e) => setEditAppointment({ ...editAppointment, status: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }}>
                  <option value="scheduled">Agendada</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="rescheduled">Reagendada</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={submitBtnStyle}>Guardar</button>
                <button type="button" onClick={() => { setEditMode(false); setCreateError(''); }} style={{ ...cancelBtnStyle, background: colors.surfaceHover, color: colors.textSecondary, borderColor: colors.border }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMode === 'day' ? (
        <div>
          <h2 style={{ color: colors.textSecondary, marginBottom: '20px' }}>
            {currentDate.toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          {appointments.length === 0 ? (
            <div style={{ ...emptyStyle, color: colors.textSecondary, background: colors.surface, borderColor: colors.border }}>Nenhuma consulta para hoje</div>
          ) : (
            <div style={dayViewStyle}>
              {appointments.map((apt) => (
                <div key={apt.id} style={{ ...appointmentCardStyle, background: colors.surface, borderColor: colors.border }} onClick={() => setSelectedAppointment(apt)}>
                  <div style={timeBlockStyle}>
                    {new Date(apt.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ ...detailsStyle, color: colors.text }}>
                    <strong>{apt.patient?.name || 'Paciente'}</strong>
                    <p style={{ color: colors.textSecondary }}>{apt.description}</p>
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
            <div key={day.toISOString()} style={dayColumnStyle(isToday(day), isWeekend(day), theme)}>
              <div style={dayHeaderStyle(isToday(day), isWeekend(day))}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'white' }}>
                  {day.toLocaleDateString('pt-PT', { weekday: 'long' })}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                  {day.getDate()}
                </div>
              </div>
              <div style={{ 
                ...dayContentStyle, 
                background: isWeekend(day) 
                  ? (theme === 'dark' ? '#1c2a1c' : '#fef9e7') 
                  : (theme === 'dark' ? '#1e293b' : 'white')
              }}>
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

const viewBtnStyle = (active: boolean, theme: string): React.CSSProperties => ({
  padding: '10px 20px',
  background: active ? '#3498db' : (theme === 'dark' ? '#1e293b' : '#f8fafc'),
  color: active ? 'white' : (theme === 'dark' ? '#cbd5e1' : '#64748b'),
  border: `1px solid ${active ? '#3498db' : (theme === 'dark' ? '#334155' : '#e2e8f0')}`,
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '13px',
  transition: 'all 0.2s ease',
});

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 40px',
  borderRadius: '12px',
  border: '2px dashed',
  fontSize: '15px',
};

const dayViewStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const appointmentCardStyle: React.CSSProperties = {
  display: 'flex',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  cursor: 'pointer',
  border: '1px solid',
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

const dayColumnStyle = (isToday: boolean, isWeekend: boolean, theme: string): React.CSSProperties => ({
  background: isToday ? (theme === 'dark' ? '#1e3a5f' : '#eff6ff') : (isWeekend ? (theme === 'dark' ? '#1c2a1c' : '#fffbeb') : (theme === 'dark' ? '#1e293b' : 'white')),
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: `1px solid ${isToday ? (theme === 'dark' ? '#3b82f6' : '#bfdbfe') : (isWeekend ? (theme === 'dark' ? '#475569' : '#fef3c7') : (theme === 'dark' ? '#334155' : '#e2e8f0'))}`,
});

const dayHeaderStyle = (isToday: boolean, isWeekend: boolean): React.CSSProperties => ({
  background: isToday ? 'linear-gradient(135deg, #3498db, #2980b9)' : (isWeekend ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #64748b, #475569)'),
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
  border: '1px solid',
  borderRadius: '8px',
  cursor: 'pointer',
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
  border: '1px solid',
  borderRadius: '10px',
  fontSize: '14px',
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
  border: '1px solid',
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
  borderRadius: '10px',
  border: '1px solid',
  fontSize: '14px',
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
  borderRadius: '10px',
  border: '1px solid',
};

const filterBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid',
  marginBottom: '24px',
  alignItems: 'center',
};

const filterSelectStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid',
  borderRadius: '10px',
  fontSize: '14px',
  minWidth: '200px',
  outline: 'none',
};

const viewToggleStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  padding: '4px',
  borderRadius: '10px',
};

const editBtnStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
};

const errorStyle: React.CSSProperties = {
  background: '#fef2f2',
  color: '#dc2626',
  padding: '12px 16px',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '13px',
  border: '1px solid #fecaca',
};

const statusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    scheduled: 'Agendada',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    rescheduled: 'Reagendada',
  };
  return labels[status] || status;
};

const statusBadgeStyle = (status: string): React.CSSProperties => {
  const colors: Record<string, string> = {
    scheduled: '#3498db',
    completed: '#27ae60',
    cancelled: '#e74c3c',
    rescheduled: '#f39c12',
  };
  return {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'white',
    background: colors[status] || '#3498db',
    textTransform: 'capitalize',
  };
};

export default Calendar;