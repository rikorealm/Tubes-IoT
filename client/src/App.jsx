import { Routes, Route, Router } from 'react-router-dom'

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AddEditDevice from './pages/AddEditDevice';
import Alert from './pages/Alerts';
import Profile from './pages/Profile';

import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

import { PreferenceProvider } from './contexts/UserContext';
import Layout from './components/Layout';

import LoginForm from './components/loginForm';
import MqttDisplay from './components/MqttDisplay';
import { DeviceDataProvider } from './contexts/deviceDataProvider';


function App() {
  return (
    <PreferenceProvider>
      <DeviceDataProvider>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/alert" element={<PrivateRoute><Alert /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Route>

          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/add-edit-device" element={<PrivateRoute><AddEditDevice /></PrivateRoute>} />
        </Routes>
      </DeviceDataProvider>
    </PreferenceProvider>
  );
}

export default App;