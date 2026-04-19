import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FeedbackForm } from './components/FeedbackForm';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
        <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">FB</span>
        </div>
        <h1 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
          Customer Feedback
        </h1>
      </div>
      
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <FeedbackForm />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<FeedbackPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
