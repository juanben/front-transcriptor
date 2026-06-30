import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { roomService } from '../../services/room/roomService';
import { userService } from '../../services/user/userService';
import { speakText } from '../../utils/speak';
import { useBasicoLogout } from '../../hooks/useBasicoLogout';
import BasicoTopMenu from '../common/BasicoTopBar/BasicoTopMenu';
import MessageModal from '../common/MessageModal';
import './BasicoMenu.css';
import './BasicoOwnRecords.css';

interface WaitingUser {
  id: string;
  name: string;
  email: string;
}

const BasicoWaitlist: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useBasicoLogout();

  // Intentar obtener roomId desde el estado de navegación
  const stateRoomId = (location.state as any)?.roomId;

  const [roomId, setRoomId] = useState<string>(stateRoomId || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const showModal = (msg: string, title?: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setModalTitle(title || '');
    setModalMessage(msg);
    setModalType(type);
    setModalOpen(true);
  };
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const user = await userService.getUserMe(token);
        setUserName(user.name);
        setOwnerEmail(user.email);
        speakText('Cargando lista de espera.');

        let activeRoomId = roomId;
        if (!activeRoomId) {
          // Obtener la sala por defecto del usuario
          let defaultRoomData;
          try {
            defaultRoomData = await roomService.getDefaultRoom(user.email);
          } catch (error) {
            console.log('Creando sala por defecto ya que no existe...', error);
            defaultRoomData = await roomService.createDefaultRoom(user.email);
          }
          activeRoomId = defaultRoomData?.room?._id || defaultRoomData?._id;
          if (activeRoomId) {
            setRoomId(activeRoomId);
          }
        }

        if (!activeRoomId) {
          setErrorMsg('No se encontró la sala por defecto.');
          speakText('Error. No se encontró la sala por defecto.');
          setIsLoading(false);
          return;
        }

        const data = await roomService.getWaitlist(activeRoomId, user.email) as any;
        const waitlistData = data.waitlist || data;
        const mappedUsers: WaitingUser[] = Array.isArray(waitlistData)
          ? waitlistData.map((item: any, index: number) => {
              if (typeof item === 'string') {
                return { id: String(index), name: item.split('@')[0], email: item };
              }
              return {
                id: item.id || item._id || String(index),
                name: item.name || item.email?.split('@')[0] || 'Usuario',
                email: item.email || ''
              };
            }).filter(u => u.email)
          : [];

        setWaitingUsers(mappedUsers);
        speakText(`Cargadas ${mappedUsers.length} personas en lista de espera.`);
      } catch (error) {
        console.error('Error al cargar lista de espera:', error);
        setErrorMsg('Error al cargar la lista de espera.');
        speakText('Error al cargar la lista de espera.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomId, navigate]);

  const handleAdmitAll = async () => {
    if (!roomId || !ownerEmail) return;
    try {
      speakText('Admitiendo a todos los usuarios.');
      await roomService.acceptAllWaitlist(roomId, ownerEmail);
      setWaitingUsers([]);
      speakText('Todos los usuarios han sido admitidos.');
      showModal('Todos los usuarios han sido admitidos.', 'Éxito', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al admitir a todos';
      speakText(`Error. ${msg}`);
      showModal(msg, 'Error', 'error');
    }
  };

  const handleAdmitUser = async (userId: string, userEmail: string, userNameStr: string) => {
    if (!roomId || !ownerEmail) return;
    try {
      speakText(`Admitiendo a ${userNameStr}`);
      await roomService.acceptWaitlistUser(roomId, ownerEmail, userEmail);
      setWaitingUsers(prev => prev.filter(user => user.id !== userId));
      speakText(`${userNameStr} ha sido admitido.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al admitir al usuario';
      speakText(`Error. ${msg}`);
      showModal(msg, 'Error', 'error');
    }
  };

  return (
    <div className="basico-menu-screen">
      <BasicoTopMenu
        title="Lista de Espera"
        subtitle={`Usuario: ${userName}`}
        onBackClick={() => {
          speakText('Regresando a mis grabaciones');
          navigate('/basico/ownRecords');
        }}
        backText="Volver"
        backTitle="Volver a mis grabaciones"
        backSpeakText="Volver a mis grabaciones"
        backIcon="arrow-left"
        onLogoutClick={handleLogout}
      />

      <main className="basico-menu-content" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <div className="accessible-subview basico-own-records-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
          <div className="subview-header basico-own-records-header" style={{ alignItems: 'center', textAlign: 'center', width: '100%', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 className="subview-title basico-own-records-title" style={{ width: '100%', textAlign: 'center' }}>Personas Esperando Ingresar</h3>
            {waitingUsers.length > 0 && !isLoading && !errorMsg && (
              <button 
                className="btn-join-giant" 
                style={{ padding: '1rem 1.5rem', fontSize: '1.1rem', maxWidth: '280px', marginTop: '0.5rem' }} 
                onClick={handleAdmitAll}
                onFocus={() => speakText('Botón admitir a todos')}
              >
                Admitir a Todos
              </button>
            )}
          </div>

          <div className="basico-own-records-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center', minHeight: 0 }}>
            {isLoading ? (
              <div className="subview-message">Cargando lista de espera...</div>
            ) : errorMsg ? (
              <div className="subview-message error">{errorMsg}</div>
            ) : waitingUsers.length > 0 ? (
              <div className="accessible-list-grid basico-own-records-list" style={{ maxHeight: '100%', flex: 1 }}>
                {waitingUsers.map(user => (
                  <button
                    key={user.id}
                    className="btn-item-giant recording-item"
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => handleAdmitUser(user.id, user.email, user.name)}
                    onFocus={() => {
                      speakText(`Usuario ${user.name}, correo ${user.email}. Pulsa para admitir.`);
                    }}
                  >
                    <div className="recording-details">
                      <span className="recording-name">{user.name}</span>
                      <span className="recording-date">{user.email}</span>
                    </div>
                    <div className="recording-action-icon" style={{ color: '#10b981' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span className="recording-status" style={{ color: '#10b981', fontWeight: 'bold' }}>Admitir</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="subview-message">
                No hay personas esperando en la lista de espera.
              </div>
            )}
          </div>

          {/* Botón Volver al Menú abajo y centrado */}
          <div className="subview-footer" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%' }}>
            <button
              className="btn-back-giant"
              onClick={() => {
                speakText('Volviendo a mis grabaciones');
                navigate('/basico/ownRecords');
              }}
              onFocus={() => speakText('Botón Volver')}
            >
              ← Volver
            </button>
          </div>
        </div>
      </main>

      <MessageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        isBasicMode={true}
      />
    </div>
  );
};

export default BasicoWaitlist;
