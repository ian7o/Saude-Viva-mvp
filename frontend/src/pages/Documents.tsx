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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50' }}>Documentos Clínicos</h1>
        <button onClick={() => setShowUpload(!showUpload)} style={uploadBtnStyle}>
          {showUpload ? 'Cancelar' : 'Novo Documento'}
        </button>
      </div>

      {showUpload && (
        <div style={uploadFormStyle}>
          <h3 style={{ marginBottom: '20px' }}>Carregar Documento</h3>
          <form onSubmit={handleUpload}>
            <div style={formGridStyle}>
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
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
};

const uploadFormStyle: React.CSSProperties = {
  background: 'white',
  padding: '25px',
  borderRadius: '10px',
  marginBottom: '30px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
};

const formGroupStyle: React.CSSProperties = {};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  marginTop: '5px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '14px',
};

const submitBtnStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '12px 24px',
  background: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d',
  background: 'white',
  borderRadius: '10px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
};

const docCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const docIconStyle: React.CSSProperties = {
  fontSize: '40px',
  textAlign: 'center',
};

const docInfoStyle: React.CSSProperties = {
  flex: 1,
};

const docMetaStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#7f8c8d',
  fontSize: '12px',
  marginTop: '10px',
};

const patientStyle: React.CSSProperties = {
  color: '#3498db',
  fontSize: '14px',
  marginTop: '10px',
};

const docActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
};

const smallBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
};

const smallDeleteBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
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
  maxWidth: '500px',
  width: '90%',
};

const actionBtnStyle = (color: string): React.CSSProperties => ({
  padding: '10px 20px',
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
});

export default Documents;