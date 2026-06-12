import React, { useEffect, useState } from 'react';
import { clinicsService } from '../services/api';
import type { Clinic, Doctor } from '../types';
import Layout from '../components/Layout';
import { useTheme } from '../context/useTheme';
import { getTitleStyles } from '../styles/theme';

const AdminClinics: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Clinic | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '' });
  const [tab, setTab] = useState<'info' | 'doctors'>('info');

  const { theme, colors } = useTheme();
  const titleStyles = getTitleStyles(colors);

  const loadClinics = async () => {
    try {
      const data = await clinicsService.getAll();
      setClinics(data);
    } catch (err) {
      console.error('Erro ao carregar clínicas:', err);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinicDetails = async (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setTab('info');
    try {
      const docs = await clinicsService.getDoctors(clinic.id);
      setDoctors(docs);
    } catch (err) {
      console.error('Erro ao carregar detalhes da clínica:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', email: '' });
    setError('');
    setEditItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (clinic: Clinic) => {
    setEditItem(clinic);
    setFormData({ name: clinic.name, address: clinic.address || '', phone: clinic.phone || '', email: clinic.email || '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editItem) {
        await clinicsService.update(editItem.id, formData);
      } else {
        await clinicsService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadClinics();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao salvar clínica';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta clínica?')) return;
    try {
      await clinicsService.delete(id);
      setSelectedClinic(null);
      loadClinics();
    } catch (err) {
      console.error('Erro ao eliminar clínica:', err);
    }
  };

  return (
    <Layout>
      <div style={titleStyles.header}>
        <div>
          <h1 style={titleStyles.pageTitle}>Clínicas</h1>
          <p style={titleStyles.pageSubtitle}>Gerir clínicas e profissionais associados</p>
        </div>
        <button onClick={openAddModal} className="btn-hover" style={addBtnStyle}>+ Nova Clínica</button>
      </div>

      {showModal && (
        <div style={modalOverlayStyle} onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-animate" style={{ ...modalContentStyle, background: colors.surface }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: colors.text, marginTop: 0 }}>{editItem ? 'Editar Clínica' : 'Nova Clínica'}</h3>
            {error && <div style={errorStyle}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Nome *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-focus" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Endereço</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-focus" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Telefone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-focus" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-focus" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-hover" style={submitBtnStyle}>{editItem ? 'Guardar' : 'Criar'}</button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-hover" style={{ ...cancelBtnStyle, background: colors.surfaceHover, color: colors.textSecondary, borderColor: colors.border }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: '1' }}>
          <div style={cardStyle}>
            <div style={{ ...tableHeaderStyle, background: colors.surface, borderColor: colors.border }}>
              <span style={{ ...thStyle, color: colors.textSecondary }}>Nome</span>
              <span style={{ ...thStyle, color: colors.textSecondary }}>Contacto</span>
              <span style={{ ...thStyle, color: colors.textSecondary, textAlign: 'right' }}>Ações</span>
            </div>
            {clinics.length === 0 ? (
              <div style={{ ...emptyStyle, color: colors.textSecondary, background: colors.surface, borderColor: colors.border }}>
                Nenhuma clínica registada
              </div>
            ) : (
              clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="row-hover"
                  onClick={() => loadClinicDetails(clinic)}
                  style={{
                    ...tableRowStyle, background: colors.surface, borderColor: colors.border,
                    cursor: 'pointer',
                    borderLeft: selectedClinic?.id === clinic.id ? '3px solid #3498db' : '3px solid transparent',
                  }}
                >
                  <span style={{ ...tdStyle, color: colors.text, fontWeight: 500 }}>{clinic.name}</span>
                  <span style={{ ...tdStyle, color: colors.textSecondary }}>{clinic.phone || clinic.email || '-'}</span>
                  <span style={{ ...tdStyle, textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(clinic); }} className="btn-hover" style={editBtnStyle}>Editar</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(clinic.id); }} className="btn-danger-hover" style={deleteBtnStyle}>Eliminar</button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedClinic && (
          <div style={{ flex: '1', ...detailPanelStyle, background: colors.surface, borderColor: colors.border }}>
            <h3 style={{ color: colors.text, marginTop: 0, marginBottom: '16px' }}>{selectedClinic.name}</h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button onClick={() => setTab('info')} style={tabBtnStyle(tab === 'info', theme)}>Informação</button>
              <button onClick={() => setTab('doctors')} style={tabBtnStyle(tab === 'doctors', theme)}>Médicos ({doctors.length})</button>
            </div>

            {tab === 'info' && (
              <div>
                <p style={{ color: colors.textSecondary, margin: '8px 0' }}><strong>Endereço:</strong> {selectedClinic.address || '-'}</p>
                <p style={{ color: colors.textSecondary, margin: '8px 0' }}><strong>Telefone:</strong> {selectedClinic.phone || '-'}</p>
                <p style={{ color: colors.textSecondary, margin: '8px 0' }}><strong>Email:</strong> {selectedClinic.email || '-'}</p>
              </div>
            )}

            {tab === 'doctors' && (
              <div>
                {doctors.length === 0 ? (
                  <p style={{ color: colors.textSecondary }}>Nenhum médico associado</p>
                ) : (
                  doctors.map((d) => (
                    <div key={d.id} style={{ ...personItemStyle, borderColor: colors.border }}>
                      <span style={{ color: colors.text, fontWeight: 500 }}>{d.name}</span>
                      <span style={{ color: colors.textSecondary, fontSize: '13px' }}>{d.specialty || '—'}</span>
                    </div>
                  ))
                )}
              </div>
            )}


          </div>
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
  borderRadius: '14px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  border: '1px solid #e2e8f0',
};

const detailPanelStyle: React.CSSProperties = {
  borderRadius: '14px',
  padding: '24px',
  border: '1px solid',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  alignSelf: 'flex-start',
};

const tableHeaderStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 2fr 1fr',
  padding: '16px 20px',
  borderBottom: '2px solid',
  fontWeight: 700,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
};

const thStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
};

const tableRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 2fr 1fr',
  padding: '16px 20px',
  borderBottom: '1px solid',
  alignItems: 'center',
  transition: 'all 0.2s ease',
};

const tdStyle: React.CSSProperties = {
  fontSize: '14px',
};

const editBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '12px',
  boxShadow: '0 2px 6px rgba(52, 152, 219, 0.25)',
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '12px',
  boxShadow: '0 2px 6px rgba(231, 76, 60, 0.25)',
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

const errorStyle: React.CSSProperties = {
  background: '#fef2f2',
  color: '#dc2626',
  padding: '12px 16px',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '13px',
  border: '1px solid #fecaca',
};

const tabBtnStyle = (active: boolean, theme: string): React.CSSProperties => ({
  padding: '8px 16px',
  background: active ? 'linear-gradient(135deg, #3498db, #2980b9)' : (theme === 'dark' ? '#1e293b' : '#f1f5f9'),
  color: active ? 'white' : (theme === 'dark' ? '#cbd5e1' : '#64748b'),
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '12px',
});

const personItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid',
};

export default AdminClinics;
