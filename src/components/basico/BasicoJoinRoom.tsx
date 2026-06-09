import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BasicoMenu.css';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';

const BasicoJoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [codeChars, setCodeChars] = useState<string[]>(['', '', '', '', '']);
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionRef = useRef<any>(null);

  // Síntesis de voz para accesibilidad
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Cargar usuario
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const user = await userService.getUserMe(token);
        setUserEmail(user.email);
        setUserName(user.nombre || user.email);
        speakText('Pantalla para unirse a una nueva sala. Di entrar seguido de tu código de cinco letras, o ingrésalo manualmente.');
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // Inicializar Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'es-ES';

      rec.onstart = () => {
        setIsListening(true);
        speakText('Escuchando.');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          speakText('No escuché nada. Inténtalo de nuevo.');
        } else if (event.error === 'network') {
          setErrorMsg('Error de conexión con el servidor de reconocimiento de voz del navegador. Por favor, escribe el código.');
          speakText('Error de conexión con el servicio de voz. Por favor, escribe el código manualmente.');
        } else if (event.error === 'not-allowed') {
          setErrorMsg('Acceso al micrófono denegado. Verifica los permisos de tu navegador.');
          speakText('Permiso de micrófono denegado. Por favor verifica tus permisos o escribe el código.');
        } else {
          setErrorMsg(`Error de voz (${event.error}). Por favor escribe el código.`);
          speakText('Error en el reconocimiento de voz. Por favor escribe el código.');
        }
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Voice transcript:', transcript);

        // Parsear "entrar [código]" o simplemente el código
        const regex = /(?:entrar|entra)\s*([a-z0-9\s]+)/i;
        const match = transcript.match(regex);
        let rawCode = '';
        if (match) {
          rawCode = match[1].replace(/\s/g, '').toUpperCase();
        } else {
          rawCode = transcript.replace(/\s/g, '').toUpperCase();
        }

        // Limpiar caracteres extraños (solo letras y números)
        const cleanCode = rawCode.replace(/[^A-Z0-9]/g, '');

        if (cleanCode.length >= 5) {
          const newChars = cleanCode.substring(0, 5).split('');
          setCodeChars(newChars);
          speakText(`Código detectado: ${newChars.join(' ')}. Pulsa Confirmar Ingreso para unirte.`);
          // Dar foco al último campo
          document.getElementById('char-input-4')?.focus();
        } else if (cleanCode.length > 0) {
          // Rellenar lo que se haya escuchado
          const newChars = ['', '', '', '', ''];
          for (let i = 0; i < Math.min(cleanCode.length, 5); i++) {
            newChars[i] = cleanCode[i];
          }
          setCodeChars(newChars);
          speakText(`Código incompleto. Detecté: ${cleanCode.split('').join(' ')}`);
        } else {
          speakText('No se reconoció un código válido. Intenta decir por ejemplo: entrar eme seis de seis dos.');
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [SpeechRecognition]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      speakText('El reconocimiento de voz no está soportado en este navegador. Por favor escribe el código.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setErrorMsg(null);
      recognitionRef.current.start();
    }
  };

  const handleCharChange = (index: number, val: string) => {
    const newVal = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const updated = [...codeChars];
    updated[index] = newVal;
    setCodeChars(updated);

    // Auto-focus al siguiente casillero
    if (newVal && index < 4) {
      const nextInput = document.getElementById(`char-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si presiona Backspace y el campo está vacío, ir al anterior
    if (e.key === 'Backspace' && !codeChars[index] && index > 0) {
      const prevInput = document.getElementById(`char-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const submitJoin = async () => {
    const code = codeChars.join('').trim();
    if (code.length < 5) {
      setErrorMsg('Por favor completa los 5 caracteres del código.');
      speakText('Error. Por favor completa los cinco caracteres del código.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    speakText('Enviando solicitud para unirse a la sala.');

    try {
      await roomService.joinWaitlist(code, userEmail);
      speakText('Te has unido a la lista de espera con éxito.');
      alert('Solicitud enviada. Deberás esperar a que el moderador acepte tu ingreso.');
      navigate('/basico/salas');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al unirse a la sala';
      setErrorMsg(msg);
      speakText(`Error al unirse. ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    speakText('Cerrando sesión');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="basico-menu-screen">
      {/* Barra de menú superior extra ancha */}
      <header className="basico-header">
        <button
          className="btn-header-large btn-header-home"
          onClick={() => {
            speakText('Volviendo a salas');
            navigate('/basico/salas');
          }}
          onFocus={() => speakText('Botón volver atrás')}
          title="Volver a Salas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Atrás</span>
        </button>

        <div className="basico-header-title">
          <h2>Unirse a Sala</h2>
          <span className="user-indicator">Bienvenido: {userName}</span>
        </div>

        <button
          className="btn-header-large btn-header-logout"
          onClick={handleLogout}
          onFocus={() => speakText('Botón cerrar sesión')}
          title="Cerrar Sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Salir</span>
        </button>
      </header>

      {/* Contenedor Principal */}
      <main className="basico-menu-content" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <div className="accessible-subview" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>

          <div className="subview-header" style={{ alignItems: 'center', textAlign: 'center', width: '100%', marginBottom: '0.5rem' }}>
            <h3 className="subview-title" style={{ width: '100%', textAlign: 'center' }}>Unirse a una nueva sala</h3>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center', minHeight: 0 }}>
            <div className="basico-modal-box" style={{ maxWidth: '100%', border: 'none', boxShadow: 'none', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '1px', textTransform: 'uppercase' }}>Di el código</span>

              <p style={{ fontSize: '1.3rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                Di "Entrar" seguido de un código <br />(ej. "Entrar M6D62")
              </p>

              {/* Casillas de Caracteres */}
              <div className="char-input-container">
                {codeChars.map((char, index) => (
                  <input
                    key={index}
                    id={`char-input-${index}`}
                    type="text"
                    value={char}
                    onChange={(e) => handleCharChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="char-input-box"
                    autoComplete="off"
                  />
                ))}
              </div>

              {/* Botón de Micrófono */}
              <button
                className={`btn-mic-giant ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                onFocus={() => speakText(isListening ? 'Micrófono escuchando' : 'Botón pulsar para dictar código por voz')}
                title="Dictar Código por Voz"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>

              <span className={`listening-text ${isListening ? 'active' : ''}`}>
                {isListening ? 'Habla ahora...' : 'Pulsa el micrófono para hablar'}
              </span>

              {errorMsg && (
                <p style={{ color: '#ef4444', fontSize: '1.1rem', margin: '0.5rem 0', fontWeight: 'bold' }}>
                  {errorMsg}
                </p>
              )}
            </div>
          </div>

          {/* Botones inferiores en paralelo */}
          <div className="subview-footer">
            <button
              className="btn-back-giant"
              onClick={() => {
                speakText('Volviendo a salas');
                navigate('/basico/salas');
              }}
              onFocus={() => speakText('Botón volver a salas')}
            >
              ← Volver a Salas
            </button>

            <button
              className="btn-join-giant"
              onClick={submitJoin}
              disabled={isSaving}
              onFocus={() => speakText('Botón confirmar ingreso')}
            >
              {isSaving ? 'Uniéndose...' : 'Confirmar Ingreso'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BasicoJoinRoom;
