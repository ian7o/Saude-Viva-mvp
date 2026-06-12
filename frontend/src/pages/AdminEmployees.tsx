import React, { useEffect, useState } from 'react';
import { usersService, doctorsService, clinicsService } from '../services/api';
import type { Clinic } from '../types';
import Layout from '../components/Layout';
import { useTheme } from '../context/useTheme';
import { getTitleStyles } from '../styles/theme';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  clinicId?: number;
}

const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctorSpecialties, setDoctorSpecialties] = useState<Record<string, string>>({});
  const [filterClinicId, setFilterClinicId] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'doctor', clinicId: '' });

  const { theme, colors } = useTheme();
  const titleStyles = getTitleStyles(colors);

  const loadEmployees = async () => {
    try {
      const data = await usersService.getAll();
      setEmployees(data.filter((u: any) => u.role !== 'patient'));
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
    }
  };

  useEffect(() => {
    loadEmployees();
    clinicsService.getAll().then(setClinics).catch(() => {});
    doctorsService.getAll().then((docs: any[]) => {
      const map: Record<string, string> = {};
      docs.forEach((d: any) => { if (d.email) map[d.email] = d.specialty || ''; });
      setDoctorSpecialties(map);
    }).catch(() => {});
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    if (filterClinicId && emp.clinicId !== parseInt(filterClinicId)) return false;
    if (filterSpecialty && emp.role === 'doctor') {
      const spec = doctorSpecialties[emp.email] || '';
      if (spec !== filterSpecialty) return false;
    }
    return true;
  });

  const specialties = [...new Set(Object.values(doctorSpecialties).filter(Boolean))] as string[];

  const clinicName = (id?: number) => {
    if (!id) return '-';
    const c = clinics.find((c) => c.id === id);
    return c ? c.name : '-';
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'doctor', clinicId: '' });
    setError('');
    setEditItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditItem(emp);
    setFormData({ name: emp.name, email: emp.email, password: '', role: emp.role, clinicId: String(emp.clinicId || '') });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editItem) {
        await usersService.update(editItem.id, { name: formData.name, email: formData.email, role: formData.role });
      } else {
        await usersService.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      }
      setShowModal(false);
      resetForm();
      loadEmployees();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao salvar funcionário';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar este funcionário?')) return;
    try {
      await usersService.delete(id);
      loadEmployees();
    } catch (err) {
      console.error('Erro ao eliminar funcionário:', err);
    }
  };

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = { admin: 'Administrador', doctor: 'Médico', secretary: 'Secretária', patient: 'Paciente' };
    return labels[role] || role;
  };

  const statusBadge = (status?: string) => {
    const s = status || 'ACTIVE';
    return (
      <span style={{
        display: 'inline-block', padding: '4px 10px', borderRadius: '8px',
        fontSize: '11px', fontWeight: 600, color: 'white',
        background: s === 'ACTIVE' ? '#27ae60' : '#e74c3c',
      }}>
        {s === 'ACTIVE' ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  return (
    <Layout>
      <div style={titleStyles.header}>
        <div>
          <h1 style={titleStyles.pageTitle}>Funcionários</h1>
          <p style={titleStyles.pageSubtitle}>Gerir médicos, secretárias e administradores</p>
        </div>
        <button onClick={openAddModal} className="btn-hover" style={addBtnStyle}>+ Novo Funcionário</button>
      </div>

      {showModal && (
        <div style={modalOverlayStyle} onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-animate" style={{ ...modalContentStyle, background: colors.surface }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: colors.text, marginTop: 0 }}>{editItem ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
            {error && <div style={errorStyle}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Nome *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-focus" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-focus" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
              </div>
              {!editItem && (
                <div style={formGroupStyle}>
                  <label style={{ color: colors.textSecondary }}>Password *</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-focus" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }} required />
                </div>
              )}
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Função *</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input-focus" style={{ ...inputStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }}>
                  <option value="doctor">Médico</option>
                  <option value="secretary">Secretária</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-hover" style={submitBtnStyle}>{editItem ? 'Guardar' : 'Criar'}</button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-hover" style={{ ...cancelBtnStyle, background: colors.surfaceHover, color: colors.textSecondary, borderColor: colors.border }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ ...filterBarStyle, background: colors.surface, borderColor: colors.border }}>
        <select value={filterClinicId} onChange={(e) => setFilterClinicId(e.target.value)} style={{ ...filterSelectStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }}>
          <option value="">Todas as Clínicas</option>
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} style={{ ...filterSelectStyle, color: colors.text, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderColor: colors.border }}>
          <option value="">Todas as Especialidades</option>
          {specialties.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={cardStyle}>
        <div style={{ ...tableHeaderStyle, background: colors.surface, borderColor: colors.border }}>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Nome</span>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Email</span>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Função</span>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Clínica</span>
          <span style={{ ...thStyle, color: colors.textSecondary }}>Estado</span>
          <span style={{ ...thStyle, color: colors.textSecondary, textAlign: 'right' }}>Ações</span>
        </div>
        {filteredEmployees.length === 0 ? (
          <div style={{ ...emptyStyle, color: colors.textSecondary, background: colors.surface, borderColor: colors.border }}>
            Nenhum funcionário encontrado
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="row-hover" style={{ ...tableRowStyle, background: colors.surface, borderColor: colors.border }}>
              <span style={{ ...tdStyle, color: colors.text, fontWeight: 500 }}>{emp.name}</span>
              <span style={{ ...tdStyle, color: colors.textSecondary }}>{emp.email}</span>
              <span style={{ ...tdStyle, color: colors.textSecondary }}>{roleLabel(emp.role)}{emp.role === 'doctor' && doctorSpecialties[emp.email] ? ` (${doctorSpecialties[emp.email]})` : ''}</span>
              <span style={{ ...tdStyle, color: colors.textSecondary }}>{clinicName(emp.clinicId)}</span>
              <span style={{ ...tdStyle }}>{statusBadge(emp.status)}</span>
              <span style={{ ...tdStyle, textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => openEditModal(emp)} className="btn-hover" style={editBtnStyle}>Editar</button>
                <button onClick={() => handleDelete(emp.id)} className="btn-danger-hover" style={deleteBtnStyle}>Eliminar</button>
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
  borderRadius: '14px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  border: '1px solid #e2e8f0',
};

const tableHeaderStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 0.8fr 1fr',
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
  gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 0.8fr 1fr',
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
  minWidth: '220px',
  outline: 'none',
};

export default AdminEmployees;
