import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './components/logIn/Login';
import SignUp from './components/signUp/SignUp';
import About from './components/about/About';
import Home from './components/home/Home';
import OradorDashboard from './components/orador/OradorDashboard';
import NuevaSesion from './components/orador/NuevaSesion';
import RoomSessions from './components/orador/RoomSessions';
import Waitlist from './components/orador/Waitlist';
import SessionDetail from './components/orador/SessionDetail';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} /> 
        <Route path="/home" element={<Home />} />
        <Route path="/orador" element={<OradorDashboard />} />
        <Route path="/nueva-sesion" element={<NuevaSesion />} />
        <Route path="/sala/:id" element={<RoomSessions />} />
        <Route path="/sala/:id/lista-espera" element={<Waitlist />} />
        <Route path="/sala/:id/sesion/:sessionId" element={<SessionDetail />} />
        <Route path="/testRec" element={<App />} />
             
      </Routes>
    </Router>
  );
};

export default AppRouter;
