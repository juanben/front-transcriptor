import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './components/logIn/Login';
import SignUp from './components/signUp/SignUp';
import About from './components/about/About';
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} /> 
        <Route path="/testRec" element={<App />} />
             
      </Routes>
    </Router>
  );
};

export default AppRouter;
