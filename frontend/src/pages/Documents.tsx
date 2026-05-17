import React, { useEffect, useState, useRef } from 'react';
import { documentsService, patientsService } from '../services/api';
import type { ClinicalDocument, Patient } from '../types';
import Layout from '../components/Layout';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ClinicalDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadData, setUploadData] = useState({
    description: '',
    room: '',
    location: '',
    patientId: '',
  });

  useEffect(() => {
    loadDocuments();
    loadPatients();
  }, []);

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
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <h1 style={pageTitleStyle}>Documentos Clínicos</h1>
          <p style={pageSubtitleStyle}>Gerencie arquivos e documentos dos pacientes</p>
        </div>
        <button onClick={() => setShowUpload(!showUpload)} style={uploadBtnStyle}>
          {showUpload ? '✕ Cancelar' : '+ Novo Documento'}
        </button>
      </div>

      {showUpload && (
        <div style={uploadFormStyle}>
          <h3 style={{ marginBottom: '20px' }}>Carregar Documento</h3>
          <form onSubmit={handleUpload}>
            <div style={formColumnStyle}>
              <div style={formGroupStyle}>
                <label>Arquivo</label>
                <input type="file" ref={fileInputRef} required style={inputStyle} />
              </div>
              <div style={formGroupStyle}>
                <label>Descrição</label>
                <input
                  type="text"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  style={inputStyle}
                  placeholder="Ex: Relatório médico"
                />
              </div>
              <div style={formGroupStyle}>
                <label>Sala</label>
                <input
                  type="text"
                  value={uploadData.room}
                  onChange={(e) => setUploadData({ ...uploadData, room: e.target.value })}
                  style={inputStyle}
                  placeholder="Ex: Sala 101"
                />
              </div>
              <div style={formGroupStyle}>
                <label>Localização</label>
                <input
                  type="text"
                  value={uploadData.location}
                  onChange={(e) => setUploadData({ ...uploadData, location: e.target.value })}
                  style={inputStyle}
                  placeholder="Ex: Lisboa"
                />
              </div>
              <div style={formGroupStyle}>
                <label>Paciente</label>
                <select
                  value={uploadData.patientId}
                  onChange={(e) => setUploadData({ ...uploadData, patientId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Selecione...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" style={submitBtnStyle}>Carregar</button>
          </form>
        </div>
      )}

      {selectedDoc && (
        <div style={modalOverlayStyle} onClick={() => setSelectedDoc(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedDoc.originalName}</h3>
            <p><strong>Descrição:</strong> {selectedDoc.description || 'N/A'}</p>
            <p><strong>Sala:</strong> {selectedDoc.room || 'N/A'}</p>
            <p><strong>Localização:</strong> {selectedDoc.location || 'N/A'}</p>
            <p><strong>Paciente:</strong> {selectedDoc.patient?.name || 'N/A'}</p>
            <p><strong>Data:</strong> {new Date(selectedDoc.uploadDate).toLocaleDateString('pt-PT')}</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              {canView(selectedDoc) && (
                <a href={documentsService.view(selectedDoc.id)} target="_blank" rel="noopener noreferrer" style={actionBtnStyle('#27ae60')}>
                  Visualizar
                </a>
              )}
              <button onClick={() => handleDownload(selectedDoc)} style={actionBtnStyle('#3498db')}>
                Baixar
              </button>
              <button onClick={() => setSelectedDoc(null)} style={actionBtnStyle('#95a5a6')}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div style={emptyStyle}>Nenhum documento disponível</div>
      ) : (
        <div style={gridStyle}>
          {documents.map((doc) => (
            <div key={doc.id} style={docCardStyle}>
              <div style={docIconStyle}>
                {doc.mimetype.includes('pdf') ? '📄' : '📎'}
              </div>
              <div style={docInfoStyle}>
                <strong>{doc.originalName}</strong>
                <p>{doc.description || 'Sem descrição'}</p>
                <div style={docMetaStyle}>
                  <span>{doc.room || 'N/A'}</span>
                  <span>{new Date(doc.uploadDate).toLocaleDateString('pt-PT')}</span>
                </div>
                {doc.patient && <p style={patientStyle}>Paciente: {doc.patient.name}</p>}
              </div>
              <div style={docActionsStyle}>
                {canView(doc) && (
                  <button onClick={() => handleView(doc)} style={smallBtnStyle}>Ver</button>
                )}
                <button onClick={() => handleDownload(doc)} style={smallBtnStyle}>Baixar</button>
                <button onClick={() => handleDelete(doc)} style={smallDeleteBtnStyle}>Eliminar</button>
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

const uploadFormStyle: React.CSSProperties = {
  background: 'white',
  padding: '28px',
  borderRadius: '16px',
  marginBottom: '30px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #e2e8f0',
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
};

const formColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const formGroupStyle: React.CSSProperties = {};

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

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 40px',
  color: '#94a3b8',
  background: 'white',
  borderRadius: '12px',
  border: '2px dashed #e2e8f0',
  fontSize: '15px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '20px',
};

const docCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '14px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  border: '1px solid #e2e8f0',
  transition: 'all 0.2s ease',
};

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

const docMetaStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#64748b',
  fontSize: '13px',
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '1px solid #f1f5f9',
};

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

const modalContentStyle: React.CSSProperties = {
  background: 'white',
  padding: '32px',
  borderRadius: '16px',
  maxWidth: '520px',
  width: '90%',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
};

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

export default Documents;