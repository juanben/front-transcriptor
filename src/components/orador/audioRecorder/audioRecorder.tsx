import { useState, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import QRCode from 'react-qr-code'
import UserMenu from '../../common/UserMenu'
import './audioRecorder.css'

const AudioRecorder: React.FC = () => {
  const navigate = useNavigate()
  const { id, code } = useParams<{ id: string; code: string }>()
  const location = useLocation()
  const sessionName = (location.state as any)?.sessionName || 'Grabación'
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string>('')
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const accessCode = code || id || ''

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new window.AudioContext()
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      const utterance = new SpeechSynthesisUtterance('Grabación Iniciada')
      utterance.lang = 'es-ES'
      window.speechSynthesis.speak(utterance)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error al acceder al micrófono:', error)
      setShowErrorModal(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const downloadRecording = () => {
    if (audioURL) {
      const a = document.createElement('a')
      a.href = audioURL
      a.download = `grabacion-${new Date().getTime()}.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const clearRecording = () => {
    setShowClearModal(true)
  }

  const confirmClearRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL('')
    setRecordingTime(0)
    setShowClearModal(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="dashboard-screen">
      <header className="room-sessions-header">
        <div className="header-top-row">
          <button 
            className="btn-back-text" 
            onClick={() => navigate(-1)} 
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <UserMenu />
            <button 
              className="btn-home-icon" 
              onClick={() => navigate('/home')} 
              title="Ir a Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="room-title-row" style={{ marginTop: '1rem' }}>
          <h2 className="room-title-text">Nueva Grabación</h2>
        </div>
      </header>

      <main className="dashboard-content recorder-main-content">
        <div className="access-code-container">
          {!showQR ? (
            <div className="access-code-box">
              <span className="access-code-label">Código de Acceso:</span>
              <span className="access-code-value">{accessCode}</span>
              <button className="btn-qr-toggle" onClick={() => setShowQR(true)}>
                Ver código QR
              </button>
            </div>
          ) : (
            <div className="qr-code-box">
              <div className="qr-wrapper">
                <QRCode value={accessCode} size={150} />
              </div>
              <button className="btn-qr-toggle" onClick={() => setShowQR(false)}>
                Ocultar código QR
              </button>
            </div>
          )}
        </div>

        {!isRecording && audioURL === '' && (
          <div className="mic-check-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mic-icon">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
            <p>Para iniciar necesitas comprobar que tu micrófono está conectado y funcionando</p>
          </div>
        )}

        <div className="recording-timer-container">
          {isRecording && (
            <div className="recording-indicator">
              <span className="recording-dot"></span>
              Grabando
            </div>
          )}
          <div className={`time-display ${isRecording ? 'recording' : ''}`}>
            {formatTime(recordingTime)}
          </div>
        </div>

        <div className="button-group">
          {!isRecording ? (
            <button 
              className="btn-record-start" 
              onClick={startRecording}
              disabled={isRecording}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              Iniciar Grabación
            </button>
          ) : (
            <button 
              className="btn-record-stop"
              onClick={stopRecording}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
              Detener Grabación
            </button>
          )}
        </div>

        {audioURL && (
          <div className="playback-container">
            <h3 className="playback-title">Grabación Guardada</h3>
            <audio 
              src={audioURL} 
              controls 
              className="audio-player"
            />
            <div className="playback-actions">
              <button className="btn-action" onClick={() => navigate(`/sala/${id}/sesion/${code}/save-audio`, { state: { audioURL, recordingTime, sessionName } })}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                Continuar
              </button>
              <button className="btn-action" onClick={downloadRecording}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Descargar
              </button>
              <button className="btn-action btn-action-danger" onClick={clearRecording}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Descartar
              </button>
            </div>
          </div>
        )}
      </main>

      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Error de Micrófono</h3>
            <p className="modal-text">No se pudo acceder al micrófono. Por favor, verifica que esté conectado y que hayas concedido los permisos necesarios en tu navegador.</p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-modal-submit" onClick={() => setShowErrorModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Descartar grabación</h3>
            <p className="modal-text">¿Estás seguro de que deseas descartar esta grabación? El audio se perderá de forma permanente.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowClearModal(false)}>Cancelar</button>
              <button className="btn-modal-submit" style={{ background: '#ef4444', boxShadow: 'none' }} onClick={confirmClearRecording}>Descartar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
