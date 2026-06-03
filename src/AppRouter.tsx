import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './components/logIn/Login';
import SignUp from './components/signUp/SignUp';
import About from './components/about/About';
import Home from './components/home/Home';
import AvanzadoDashboard from './components/avanzado/AvanzadoDashboard';
import NuevaSesion from './components/avanzado/newRoom';
import RoomSessions from './components/avanzado/RoomSessions';
import JoinedRoomSessions from './components/avanzado/JoinedRoomSessions';
import Waitlist from './components/avanzado/Waitlist';
import SessionDetail from './components/avanzado/SessionDetail';
import AudioRecorder from './components/avanzado/audioRecorder/audioRecorder';
import SessionName from './components/avanzado/audioRecorder/sessionName';
import SaveAudioRecord from './components/avanzado/audioRecorder/saveAudioRecord';
import BasicoDashboard from './components/basico/BasicoDashboard';
import BasicoRoomSessions from './components/basico/BasicoRoomSessions';
import BasicoMenu from './components/basico/BasicoMenu';
import BasicoAudioRecorder from './components/basico/BasicoAudioRecorder';
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
        
        {/* Avanzado */}
        <Route path="/avanzado" element={<AuthGuard><AvanzadoDashboard /></AuthGuard>} />
        <Route path="/new-room" element={<AuthGuard><NuevaSesion /></AuthGuard>} />
        <Route path="/sala/:id" element={<AuthGuard><RoomSessions /></AuthGuard>} />
        <Route path="/sala-unida/:id" element={<AuthGuard><JoinedRoomSessions /></AuthGuard>} />
        <Route path="/sala/:id/lista-espera" element={<AuthGuard><Waitlist /></AuthGuard>} />
        <Route path="/sala/:id/sesion/:sessionId" element={<AuthGuard><SessionDetail /></AuthGuard>} />
        <Route path="/sala/:id/sesion/:code/audio" element={<AuthGuard><AudioRecorder /></AuthGuard>} />
        <Route path="/sala/:id/sesion/:code/save-audio" element={<AuthGuard><SaveAudioRecord /></AuthGuard>} />
        <Route path="/sala/:id/nombre-sesion" element={<AuthGuard><SessionName /></AuthGuard>} />
        
        {/* Basico */}
        <Route path="/basico" element={<AuthGuard><BasicoMenu /></AuthGuard>} />
        <Route path="/basico/salas" element={<AuthGuard><BasicoDashboard /></AuthGuard>} />
        <Route path="/basico/sala/:id" element={<AuthGuard><BasicoRoomSessions /></AuthGuard>} />
        <Route path="/basico/grabar/:id" element={<AuthGuard><BasicoAudioRecorder /></AuthGuard>} />
        <Route path="/basico/sala/:id/sesion/:sessionId" element={<AuthGuard><SessionDetail /></AuthGuard>} />
        
        {/* Testing */}
        <Route path="/testRec" element={<AuthGuard><App /></AuthGuard>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
