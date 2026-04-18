import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './components/logIn/Login';
import SignUp from './components/signUp/SignUp';
import About from './components/about/About';
import Home from './components/home/Home';
import OradorDashboard from './components/orador/OradorDashboard';
import NuevaSesion from './components/orador/newRoom';
import RoomSessions from './components/orador/RoomSessions';
import Waitlist from './components/orador/Waitlist';
import SessionDetail from './components/orador/SessionDetail';
import AudioRecorder from './components/orador/audioRecorder/audioRecorder';
import SessionName from './components/orador/audioRecorder/sessionName';
import SaveAudioRecord from './components/orador/audioRecorder/saveAudioRecord';
import EspectadorDashboard from './components/espectador/EspectadorDashboard';
import EspectadorRoomSessions from './components/espectador/EspectadorRoomSessions';
import AuthGuard from './components/common/AuthGuard';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} /> 
        
        {/* Rutas Protegidas */}
        <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
        
        {/* Orador */}
        <Route path="/orador" element={<AuthGuard><OradorDashboard /></AuthGuard>} />
        <Route path="/new-room" element={<AuthGuard><NuevaSesion /></AuthGuard>} />
        <Route path="/sala/:id" element={<AuthGuard><RoomSessions /></AuthGuard>} />
        <Route path="/sala/:id/lista-espera" element={<AuthGuard><Waitlist /></AuthGuard>} />
        <Route path="/sala/:id/sesion/:sessionId" element={<AuthGuard><SessionDetail /></AuthGuard>} />
        <Route path="/sala/:id/sesion/:code/audio" element={<AuthGuard><AudioRecorder /></AuthGuard>} />
        <Route path="/sala/:id/sesion/:code/save-audio" element={<AuthGuard><SaveAudioRecord /></AuthGuard>} />
        <Route path="/sala/:id/nombre-sesion" element={<AuthGuard><SessionName /></AuthGuard>} />
        
        {/* Espectador */}
        <Route path="/espectador" element={<AuthGuard><EspectadorDashboard /></AuthGuard>} />
        <Route path="/espectador/sala/:id" element={<AuthGuard><EspectadorRoomSessions /></AuthGuard>} />
        
        {/* Testing */}
        <Route path="/testRec" element={<AuthGuard><App /></AuthGuard>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
