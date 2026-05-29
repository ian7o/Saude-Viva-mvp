import React, { useEffect, useState, useMemo } from 'react';
import { messagesService, patientsService } from '../services/api';
import type { Patient } from '../types';
import Layout from '../components/Layout';
import { useTheme, ThemeColorPalette } from '../context/ThemeContext';
import { getTitleStyles } from '../styles/theme';

interface Contact {
  id: number;
  name: string;
  type: 'patient' | 'professional';
  lastMessage: string | null;
  lastMessageDate: Date | null;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderType: string;
  createdAt: Date;
  isOwn: boolean;
}

const Messages: React.FC = () => {
  const { theme, colors } = useTheme();
  const titleStyles = getTitleStyles(colors);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isPatient = user.role === 'patient';
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'patient' | 'professional'>(isPatient ? 'professional' : 'patient');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isPatient) loadPatients();
    loadContacts();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientsService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const data = await messagesService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadHistory = async (contact: Contact) => {
    setSelectedContact(contact);
    try {
      const data = await messagesService.getHistory(contact.id, contact.type);
      setMessages(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    try {
      await messagesService.send({
        content: newMessage,
        receiverId: selectedContact.id,
        receiverType: selectedContact.type,
      });
      setNewMessage('');
      loadHistory(selectedContact);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getAllContacts = useMemo(() => {
    if (isPatient || activeTab === 'professional') {
      return contacts.filter(c => c.type === 'professional');
    }
    
    const patientContacts = contacts.filter(c => c.type === 'patient');
    const patientIds = new Set(patientContacts.map(p => p.id));
    const patientsWithoutMessages = patients
      .filter(p => !patientIds.has(p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        type: 'patient' as const,
        lastMessage: null,
        lastMessageDate: null,
      }));
    
    return [...patientContacts, ...patientsWithoutMessages];
  }, [activeTab, contacts, patients, isPatient]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return getAllContacts;
    return getAllContacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [getAllContacts, searchTerm]);

  const getTimeAgo = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    loadHistory(contact);
  };

  const isContactSelected = (contact: Contact) =>
    selectedContact?.id === contact.id && selectedContact?.type === contact.type;

  return (
    <Layout>
      <div style={titleStyles.header}>
        <div>
          <h1 style={titleStyles.pageTitle}>Mensagens</h1>
          <p style={titleStyles.pageSubtitle}>Comunique-se com pacientes e profissionais</p>
        </div>
      </div>

      <div style={containerStyle(colors)}>
        <div style={sidebarStyle(colors)}>
          {!isPatient && (
            <div style={tabContainerStyle(colors)}>
              <button 
                className="btn-hover"
                style={tabStyle(colors, activeTab === 'patient')} 
                onClick={() => { setActiveTab('patient'); setSelectedContact(null); }}
              >
                👥 Pacientes
              </button>
              <button 
                className="btn-hover"
                style={tabStyle(colors, activeTab === 'professional')} 
                onClick={() => { setActiveTab('professional'); setSelectedContact(null); }}
              >
                👨‍⚕️ Profissionais
              </button>
            </div>
          )}

          <div style={searchWrapperStyle(colors)}>
            <div style={searchBarStyle(colors)}>
              <span style={searchIconStyle}>🔍</span>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-focus"
                style={searchInputStyle(colors)}
              />
              {searchTerm && (
                <button 
                  style={clearSearchStyle(colors)}
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div style={contactListStyle}>
            {filteredContacts.length === 0 ? (
              <div style={emptyListStyle(colors)}>
                <span style={{ fontSize: '40px' }}>🔍</span>
                <p>Nenhum contacto encontrado</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={`${contact.type}-${contact.id}`}
                  style={contactItemStyle(colors, isContactSelected(contact))}
                  onClick={() => handleContactClick(contact)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isContactSelected(contact)
                      ? colors.surfaceHover : colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isContactSelected(contact)
                      ? colors.surfaceHover : 'transparent';
                  }}
                >
                  <div style={contactAvatarLargeStyle(contact.type)}>
                    {getInitials(contact.name)}
                  </div>
                  <div style={contactInfoFullStyle}>
                    <div style={contactNameRowStyle}>
                      <strong style={{ color: colors.text }}>{contact.name}</strong>
                      {contact.lastMessageDate && (
                        <span style={timeBadgeStyle(colors)}>{getTimeAgo(contact.lastMessageDate)}</span>
                      )}
                    </div>
                    <p style={previewTextStyle(colors)}>
                      {contact.lastMessage || (activeTab === 'patient' ? 'Paciente' : 'Profissional')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={chatAreaStyle(colors)}>
          {selectedContact ? (
            <>
              <div style={chatHeaderStyle(colors)}>
                <div style={contactAvatarLargeStyle(selectedContact.type)}>
                  {getInitials(selectedContact.name)}
                </div>
                <div>
                  <strong style={chatContactNameStyle(colors)}>{selectedContact.name}</strong>
                  <p style={chatContactTypeStyle(colors)}>
                    {selectedContact.type === 'patient' ? 'Paciente' : 'Profissional'}
                  </p>
                </div>
              </div>

              <div style={messagesContainerStyle}>
                {messages.length === 0 ? (
                  <div style={emptyChatStyle(colors)}>
                    <span style={{ fontSize: '50px' }}>💬</span>
                    <p>Sem mensagens ainda</p>
                    <small>Envie uma mensagem para iniciar a conversa</small>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} style={messageWrapperStyle(msg.isOwn)}>
                      <div style={messageBubbleStyle(colors, msg.isOwn)}>
                        {!msg.isOwn && <span style={senderLabelStyle}>{msg.senderName}</span>}
                        <p style={messageTextStyle(colors, msg.isOwn)}>{msg.content}</p>
                        <span style={messageTimeStyle(colors, msg.isOwn)}>
                          {new Date(msg.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} style={inputAreaStyle(colors)}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  style={messageInputStyle(colors)}
                />
                <button 
                  type="submit" 
                  className={newMessage.trim() ? 'btn-hover' : ''}
                  style={newMessage ? sendButtonActiveStyle : sendButtonStyle(colors)}
                  disabled={!newMessage.trim()}
                >
                  ➤
                </button>
              </form>
            </>
          ) : (
            <div style={noChatSelectedStyle(colors)}>
              <div style={noChatIconStyle}>💬</div>
              <h2 style={noChatTitleStyle(colors)}>Selecione um contacto</h2>
              <p style={noChatSubtitleStyle(colors)}>Escolha um paciente ou profissional para iniciar uma conversa</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const containerStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  height: 'calc(100vh - 200px)',
  background: colors.surface,
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
  boxShadow: `0 1px 3px ${colors.shadow}, 0 1px 2px ${colors.shadow}`,
});

const sidebarStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  width: '360px',
  borderRight: `1px solid ${colors.border}`,
  display: 'flex',
  flexDirection: 'column',
  background: colors.surface,
});

const tabContainerStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  padding: '16px',
  gap: '10px',
  background: colors.surface,
  borderBottom: `1px solid ${colors.border}`,
});

const tabStyle = (colors: ThemeColorPalette, active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '12px 16px',
  background: active ? colors.primaryGradient : 'transparent',
  color: active ? 'white' : colors.textSecondary,
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '13px',
  transition: 'all 0.2s ease',
  boxShadow: active ? `0 4px 12px ${colors.primary}4D` : 'none',
});

const searchWrapperStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  padding: '12px 16px',
  background: colors.surface,
  borderBottom: `1px solid ${colors.border}`,
});

const searchBarStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  background: colors.surfaceHover,
  borderRadius: '12px',
  padding: '0 12px',
  border: '1px solid transparent',
});

const searchIconStyle: React.CSSProperties = {
  fontSize: '14px',
  marginRight: '8px',
  opacity: 0.6,
};

const searchInputStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  flex: 1,
  padding: '12px 0',
  border: 'none',
  background: 'transparent',
  fontSize: '14px',
  outline: 'none',
  color: colors.text,
});

const clearSearchStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  background: 'none',
  border: 'none',
  color: colors.textSecondary,
  cursor: 'pointer',
  padding: '4px 8px',
  fontSize: '12px',
});

const contactListStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
};

const emptyListStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: colors.textSecondary,
  gap: '12px',
});

const contactItemStyle = (colors: ThemeColorPalette, isSelected: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '14px 16px',
  cursor: 'pointer',
  background: isSelected ? colors.surfaceHover : 'transparent',
  borderLeft: isSelected ? '4px solid #3498db' : '4px solid transparent',
  transition: 'all 0.15s ease',
});

const contactAvatarLargeStyle = (type: string): React.CSSProperties => ({
  width: '48px',
  height: '48px',
  minWidth: '48px',
  borderRadius: '14px',
  background: type === 'patient' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 700,
});

const contactInfoFullStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
};

const contactNameRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px',
};

const timeBadgeStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  fontSize: '11px',
  color: colors.textSecondary,
  fontWeight: 500,
});

const previewTextStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.textSecondary,
  fontSize: '13px',
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const chatAreaStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  background: colors.background,
});

const chatHeaderStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '20px 24px',
  background: colors.surface,
  borderBottom: `1px solid ${colors.border}`,
});

const chatContactNameStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  fontSize: '16px',
  fontWeight: 600,
  color: colors.text,
  margin: 0,
});

const chatContactTypeStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.textSecondary,
  fontSize: '12px',
  margin: '4px 0 0 0',
});

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  padding: '24px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const emptyChatStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: colors.textSecondary,
  gap: '12px',
});

const messageWrapperStyle = (isOwn: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: isOwn ? 'flex-end' : 'flex-start',
});

const messageBubbleStyle = (colors: ThemeColorPalette, isOwn: boolean): React.CSSProperties => ({
  maxWidth: '65%',
  padding: '14px 18px',
  borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  background: isOwn ? colors.primaryGradient : colors.surface,
  boxShadow: isOwn ? `0 4px 12px ${colors.primary}4D` : `0 2px 8px ${colors.shadow}`,
});

const senderLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#3498db',
  fontWeight: 600,
  marginBottom: '6px',
};

const messageTextStyle = (colors: ThemeColorPalette, isOwn: boolean): React.CSSProperties => ({
  color: isOwn ? 'white' : colors.text,
  fontSize: '14px',
  lineHeight: 1.5,
  margin: 0,
});

const messageTimeStyle = (colors: ThemeColorPalette, isOwn: boolean): React.CSSProperties => ({
  display: 'block',
  fontSize: '10px',
  color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textSecondary,
  marginTop: '8px',
  textAlign: 'right',
});

const inputAreaStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  display: 'flex',
  gap: '12px',
  padding: '16px 24px',
  background: colors.surface,
  borderTop: `1px solid ${colors.border}`,
});

const messageInputStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  flex: 1,
  padding: '14px 18px',
  border: `1px solid ${colors.border}`,
  borderRadius: '14px',
  fontSize: '14px',
  outline: 'none',
  background: colors.surfaceHover,
  color: colors.text,
  transition: 'all 0.2s ease',
});

const sendButtonStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  width: '50px',
  height: '50px',
  background: colors.border,
  color: colors.textSecondary,
  border: 'none',
  borderRadius: '14px',
  cursor: 'not-allowed',
  fontSize: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
});

const sendButtonActiveStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '14px',
  cursor: 'pointer',
  fontSize: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
};

const noChatSelectedStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textSecondary,
  gap: '16px',
});

const noChatIconStyle: React.CSSProperties = {
  fontSize: '70px',
  opacity: 0.5,
};

const noChatTitleStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.text,
  fontSize: '20px',
  fontWeight: 600,
  margin: 0,
});

const noChatSubtitleStyle = (colors: ThemeColorPalette): React.CSSProperties => ({
  color: colors.textSecondary,
  fontSize: '14px',
  margin: 0,
});

export default Messages;
