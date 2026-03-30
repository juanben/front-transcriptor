import { useState, useRef } from 'react'
import './App.css'

function App() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string>('')
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error al acceder al micrófono:', error)
      alert('No se pudo acceder al micrófono. Verifica los permisos.')
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
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL('')
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎙️ Grabador de Voz PWA</h1>
        <p>Graba, reproduce y descarga tus notas de voz</p>
      </header>

      <div className="recording-section">
        <div className="timer-display">
          {isRecording && <span className="recording-indicator">● Grabando</span>}
          <span className="time">{formatTime(recordingTime)}</span>
        </div>

        <div className="button-group">
          {!isRecording ? (
            <button 
              className="btn btn-record" 
              onClick={startRecording}
              disabled={isRecording}
            >
              ⏺️ Iniciar Grabación
            </button>
          ) : (
            <button 
              className="btn btn-stop" 
              onClick={stopRecording}
            >
              ⏹️ Detener
            </button>
          )}
        </div>

        {audioURL && (
          <div className="playback-section">
            <h3>Grabación guardada</h3>
            <audio 
              src={audioURL} 
              controls 
              className="audio-player"
            />
            <div className="action-buttons">
              <button className="btn btn-download" onClick={downloadRecording}>
                ⬇️ Descargar
              </button>
              <button className="btn btn-clear" onClick={clearRecording}>
                🗑️ Limpiar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
