import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

/**
 * Main App Component
 * Handles routing and layout for the BizNova application
 * Ready for Phase 2-6 development
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            {/* Future routes will be added here in Phase 2 */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
