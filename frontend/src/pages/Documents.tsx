import React, { useEffect, useState, useRef } from 'react';
import { documentsService, patientsService, clinicsService } from '../services/api';
import type { ClinicalDocument, Patient, Clinic } from '../types';
import Layout from '../components/Layout';
import { useTheme } from '../context/useTheme';
import { ThemeColorPalette } from '../context/themeTypes';
import { getTitleStyles } from '../styles/theme';

const Documents: React.FC = () => {
  const { colors } = useTheme();
  const titleStyles = getTitleStyles(colors);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isPatient = user.role === 'patient';
  const userRole = user.role;

  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ClinicalDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadData, setUploadData] = useState({
    description: '',
    room: '',
    location: '',
    patientId: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPatientId, setFilterPatientId] = useState('');
  const [filterClinicId, setFilterClinicId] = useState('');

  const filteredDocuments = documents.filter((doc) => {
    if (filterPatientId && doc.patientId !== parseInt(filterPatientId)) return false;
    if (filterClinicId && doc.location !== filterClinicId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.originalName.toLowerCase().includes(q);
      const matchDesc = (doc.description || '').toLowerCase().includes(q);
      const matchRoom = (doc.room || '').toLowerCase().includes(q);
      const matchLocation = (doc.location || '').toLowerCase().includes(q);
      const matchPatient = (doc.patient?.name || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchRoom && !matchLocation && !matchPatient) return false;
    }
    return true;
  });

  useEffect(() => {
    loadDocuments();
    if (!isPatient) {
      loadPatients();
      loadClinics();
    }
  }, [isPatient]);

  const loadDocuments = async () => {
    try {
      const data = await documentsService.getAll();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await patientsService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadClinics = async () => {
    try {
      const data = await clinicsService.getAll();
      setClinics(data);
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', uploadData.description);
    formData.append('room', uploadData.room);
    formData.append('location', uploadData.location);
    if (uploadData.patientId) {
      formData.append('patientId', uploadData.patientId);
    }

    try {
      await documentsService.upload(formData);
      setShowUpload(false);
      loadDocuments();
      setUploadData({ description: '', room: '', location: '', patientId: '' });
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleView = (doc: ClinicalDocument) => {
    setSelectedDoc(doc);
  };

  const handleDownload = (doc: ClinicalDocument) => {
    documentsService.download(doc.id);
  };

  const handleDelete = async (doc: ClinicalDocument) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o documento "${doc.originalName}"?`)) {
      return;
    }
    try {
      await documentsService.delete(doc.id);
      setSelectedDoc(null);
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const canView = (doc: ClinicalDocument) => {
    const type = doc.mimetype.toLowerCase();
    return type.includes('pdf') || type.includes('image') || type.startsWith('text/');
  };

  return (
    <Layout>
      <div style={titleStyles.header}>
        <div>
          <h1 style={titleStyles.pageTitle}>Documentos Clínicos</h1>
          <p style={titleStyles.pageSubtitle}>Gerencie arquivos e documentos dos pacientes</p>
        </div>
        {!isPatient && <button onClick={() => setShowUpload(!showUpload)} className="btn-hover" style={uploadBtnStyle}>
          {showUpload ? '✕ Cancelar' : '+ Novo Documento'}
        </button>}
      </div>

      {showUpload && (
        <div style={uploadFormStyle(colors)}>
          <h3 style={{ marginBottom: '20px', color: colors.text }}>Carregar Documento</h3>
          <form onSubmit={handleUpload}>
            <div style={formColumnStyle}>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Arquivo</label>
                <input type="file" ref={fileInputRef} required style={inputStyle(colors)} />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Descrição</label>
                <input
                  type="text"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  style={inputStyle(colors)}
                  placeholder="Ex: Relatório médico"
                />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Sala</label>
                <input
                  type="text"
                  value={uploadData.room}
                  onChange={(e) => setUploadData({ ...uploadData, room: e.target.value })}
                  style={inputStyle(colors)}
                  placeholder="Ex: Sala 101"
                />
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Localização (Clínica)</label>
                <select
                  value={uploadData.location}
                  onChange={(e) => setUploadData({ ...uploadData, location: e.target.value })}
                  style={inputStyle(colors)}
                >
                  <option value="">Selecione uma clínica...</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}{c.address ? ` - ${c.address}` : ''}</option>
                  ))}
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={{ color: colors.textSecondary }}>Paciente</label>
                <select
                  value={uploadData.patientId}
                  onChange={(e) => setUploadData({ ...uploadData, patientId: e.target.value })}
                  style={inputStyle(colors)}
                >
                  <option value="">Selecione...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-hover" style={submitBtnStyle}>Carregar</button>
          </form>
        </div>
      )}

      {!isPatient && (
        <div style={filterBarStyle(colors)}>
          <input
            type="text"
            placeholder="Pesquisar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={filterInputStyle(colors)}
          />
          <select
            value={filterPatientId}
            onChange={(e) => setFilterPatientId(e.target.value)}
            style={filterSelectStyle(colors)}
          >
            <option value="">Todos os Pacientes</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {userRole === 'admin' && (
            <select
              value={filterClinicId}
              onChange={(e) => setFilterClinicId(e.target.value)}
              style={filterSelectStyle(colors)}
            >
              <option value="">Todas as Clínicas</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {selectedDoc && (
        <div style={modalOverlayStyle} onClick={() => setSelectedDoc(null)}>
          <div className="modal-animate" style={modalContentStyle(colors)} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: colors.text, margin: 0 }}>{selectedDoc.originalName}</h3>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', color: colors.text }}>
              <p style={{ margin: 0 }}><strong>Descrição:</strong> {selectedDoc.description || 'N/A'}</p>
              <p style={{ margin: 0 }}><strong>Sala:</strong> {selectedDoc.room || 'N/A'}</p>
              <p style={{ margin: 0 }}><strong>Localização:</strong> {selectedDoc.location || 'N/A'}</p>
              <p style={{ margin: 0 }}><strong>Paciente:</strong> {selectedDoc.patient?.name || 'N/A'}</p>
              <p style={{ margin: 0 }}><strong>Data:</strong> {new Date(selectedDoc.uploadDate).toLocaleDateString('pt-PT')}</p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              {canView(selectedDoc) && (
                <a href={documentsService.view(selectedDoc.id)} target="_blank" rel="noopener noreferrer" className="btn-hover" style={actionBtnStyle('#27ae60')}>
                  Visualizar
                </a>
              )}
              <button onClick={() => handleDownload(selectedDoc)} className="btn-hover" style={actionBtnStyle('#3498db')}>
                Baixar
              </button>
              <button onClick={() => setSelectedDoc(null)} className="btn-hover" style={actionBtnStyle('#95a5a6')}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredDocuments.length === 0 ? (
        <div style={emptyStyle(colors)}>Nenhum documento disponível</div>
      ) : (
        <div style={gridStyle}>
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="card-hover" style={docCardStyle(colors)}>
              <div style={docIconStyle}>
                {doc.mimetype.includes('pdf') ? '📄' : '📎'}
              </div>
              <div style={docInfoStyle}>
                <strong style={{ color: colors.text }}>{doc.originalName}</strong>
                <p style={{ color: colors.textSecondary, margin: '6px 0 0 0', fontSize: '13px' }}>{doc.description || 'Sem descrição'}</p>
                <div style={docMetaStyle(colors)}>
                  <span>{doc.room || 'N/A'}</span>
                  <span>{new Date(doc.uploadDate).toLocaleDateString('pt-PT')}</span>
                </div>
                {doc.patient && <p style={patientStyle}>Paciente: {doc.patient.name}</p>}
              </div>
              <div style={docActionsStyle}>
                {canView(doc) && (
                  <button onClick={() => handleView(doc)} className="btn-hover" style={smallBtnStyle}>Ver</button>
                )}
                <button onClick={() => handleDownload(doc)} className="btn-hover" style={smallBtnStyle}>Baixar</button>
                <button onClick={() => handleDelete(doc)} className="btn-danger-hover" style={smallDeleteBtnStyle}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

const uploadBtnStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const uploadFormStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  background: colors.surface,
  padding: '28px',
  borderRadius: '16px',
  marginBottom: '28px',
  boxShadow: `0 1px 3px ${colors.shadow}, 0 1px 2px ${colors.shadow}`,
  border: `1px solid ${colors.border}`,
});

const formColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const formGroupStyle: React.CSSProperties = {};

const inputStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  width: '100%',
  padding: '12px 14px',
  marginTop: '8px',
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  fontSize: '14px',
  color: colors.text,
  background: colors.surfaceHover,
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
});

const submitBtnStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #27ae60, #1e8449)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
};

const filterBarStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  gap: '12px',
  padding: '16px',
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  marginBottom: '24px',
  alignItems: 'center',
  background: colors.surface,
});

const filterInputStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  flex: 1,
  padding: '10px 14px',
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  fontSize: '14px',
  color: colors.text,
  background: colors.surfaceHover,
  outline: 'none',
});

const filterSelectStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  padding: '10px 14px',
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  fontSize: '14px',
  color: colors.text,
  background: colors.surfaceHover,
  minWidth: '200px',
  outline: 'none',
});

const emptyStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  textAlign: 'center',
  padding: '60px 40px',
  color: colors.textSecondary,
  background: colors.surface,
  borderRadius: '12px',
  border: `2px dashed ${colors.border}`,
  fontSize: '15px',
});

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '20px',
};

const docCardStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  background: colors.surface,
  padding: '24px',
  borderRadius: '14px',
  boxShadow: `0 1px 3px ${colors.shadow}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  border: `1px solid ${colors.border}`,
});

const docIconStyle: React.CSSProperties = {
  fontSize: '36px',
  textAlign: 'center',
  padding: '12px',
  background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
  borderRadius: '12px',
};

const docInfoStyle: React.CSSProperties = {
  flex: 1,
};

const docMetaStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  color: colors.textSecondary,
  fontSize: '13px',
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: `1px solid ${colors.border}`,
});

const patientStyle: React.CSSProperties = {
  color: '#3498db',
  fontSize: '14px',
  marginTop: '10px',
  fontWeight: 500,
};

const docActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const smallBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
};

const smallDeleteBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
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

const modalContentStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  background: colors.surface,
  padding: '32px',
  borderRadius: '16px',
  maxWidth: '520px',
  width: '90%',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
});

const actionBtnStyle = (color: string): React.CSSProperties => ({
  padding: '12px 24px',
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: 500,
  fontSize: '14px',
});

export default Documents;
