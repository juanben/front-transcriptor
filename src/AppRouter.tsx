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

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} /> 
        <Route path="/home" element={<Home />} />
        
        {/* Orador */}
        <Route path="/orador" element={<OradorDashboard />} />
        <Route path="/new-room" element={<NuevaSesion />} />
        <Route path="/sala/:id" element={<RoomSessions />} />
        <Route path="/sala/:id/lista-espera" element={<Waitlist />} />
        <Route path="/sala/:id/sesion/:sessionId" element={<SessionDetail />} />
        <Route path="/sala/:id/sesion/:code/audio" element={<AudioRecorder />} />
        <Route path="/sala/:id/sesion/:code/save-audio" element={<SaveAudioRecord />} />
        <Route path="/sala/:id/nombre-sesion" element={<SessionName />} />
        
        {/* Espectador */}
        <Route path="/espectador" element={<EspectadorDashboard />} />
        <Route path="/espectador/sala/:id" element={<EspectadorRoomSessions />} />
        
        <Route path="/testRec" element={<App />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
