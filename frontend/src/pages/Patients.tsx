import React, { useEffect, useState } from 'react';
import { patientsService } from '../services/api';
import type { Patient } from '../types';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { getTitleStyles } from '../styles/theme';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', identificationNumber: '', birthDate: '', phone: '', email: '' });
  const [error, setError] = useState('');

  const { theme, colors } = useTheme();
  const titleStyles = getTitleStyles(colors);

  const loadPatients = async () => {
    try {
      const data = await patientsService.getAll();
      setPatients(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await patientsService.create({
        name: newPatient.name,
        identificationNumber: newPatient.identificationNumber,
        birthDate: newPatient.birthDate || undefined,
        phone: newPatient.phone || undefined,
        email: newPatient.email || undefined,
      });
      setShowAddModal(false);
      setNewPatient({ name: '', identificationNumber: '', birthDate: '', phone: '', email: '' });
      loadPatients();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao criar paciente';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleDeletePatient = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar este paciente?')) return;
    try {
      await patientsService.delete(id);
      loadPatients();
    } catch (err) {
      console.error('Erro ao eliminar paciente:', err);
    }
  };

  return (
    <Layout>
      <div style={titleStyles.header}>
        <div>
          <h1 style={titleStyles.pageTitle}>Pacientes</h1>
          <p style={titleStyles.pageSubtitle}>Registe e gerencie os dados dos pacientes</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={addBtnStyle}>+ Novo Paciente</button>
      </div>

      {showAddModal && (
        <div style={modalOverlayStyle} onClick={() => { setShowAddModal(false); setError(''); }}>
          <div style={{ ...modalContentStyle, background: colors.surface }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: colors.text, marginTop: 0 }}>Registar Novo Paciente</h3>
            {error && <div style={errorStyle}>{error}</div>}
            <form onSubmit={handleCreatePatient}>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Nome *</label>
                <input type="text" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Nº de Identificação *</label>
                <input type="text" value={newPatient.identificationNumber} onChange={(e) => setNewPatient({ ...newPatient, identificationNumber: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Data de Nascimento</label>
                <input type="date" value={newPatient.birthDate} onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Telefone</label>
                <input type="text" value={newPatient.phone} onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Email</label>
                <input type="email" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={submitBtnStyle}>Registar</button>
                <button type="button" onClick={() => { setShowAddModal(false); setError(''); }} style={{ ...cancelBtnStyle, background: colors.surfaceHover, color: colors.textSecondary, borderColor: colors.border }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ ...tableHeaderStyle, background: colors.surface, borderColor: colors.border }}>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Nome</span>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Nº Identificação</span>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Data Nascimento</span>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Contacto</span>
          <span style={{ ...thStyle, color: colors.textSecondary, textAlign: 'right' }}>Ações</span>
        </div>
        {patients.length === 0 ? (
          <div style={{ ...emptyStyle, color: colors.textSecondary, background: colors.surface, borderColor: colors.border }}>Nenhum paciente registado</div>
        ) : (
          patients.map((patient) => (
            <div key={patient.id} style={{ ...tableRowStyle, background: colors.surface, borderColor: colors.border }}>
              <span style={{ ...tdStyle, color: colors.text, fontWeight: 500 }}>{patient.name}</span>
              <span style={{ ...tdStyle, color: colors.textSecondary }}>{patient.identificationNumber || '-'}</span>
              <span style={{ ...tdStyle, color: colors.textSecondary }}>{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-PT') : '-'}</span>
              <span style={{ ...tdStyle, color: colors.textSecondary }}>{patient.phone || patient.email || '-'}</span>
              <span style={{ ...tdStyle, textAlign: 'right' }}>
                <button onClick={() => handleDeletePatient(patient.id)} style={deleteBtnStyle}>Eliminar</button>
              </span>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
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

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  overflow: 'hidden',
};

const tableHeaderStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr',
  padding: '16px 20px',
  borderBottom: '2px solid',
  fontWeight: 600,
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const thStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
};

const tableRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr',
  padding: '16px 20px',
  borderBottom: '1px solid',
  alignItems: 'center',
  transition: 'all 0.2s ease',
};

const tdStyle: React.CSSProperties = {
  fontSize: '14px',
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '12px',
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

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 40px',
  borderRadius: '12px',
  border: '2px dashed',
  fontSize: '15px',
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
  boxSizing: 'border-box',
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
  flex: 1,
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '12px 24px',
  border: '1px solid',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
  flex: 1,
};

export default Patients;
