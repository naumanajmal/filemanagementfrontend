import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthenticationPage from './pages/AuthenticationPage';
import FileManagementPage from './pages/FileManagementPage';
import PublicFileViewer from './pages/PublicFileViewer';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

// ProtectedRoute component
const ProtectedRoute = ({ element }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // Show a loading spinner or message while auth state is being determined
    return <div>Loading...</div>;
  }

  return user ? element : <Navigate to="/auth" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Authentication Route */}
          <Route path="/auth" element={<AuthenticationPage />} />
          {/* Protected File Management Route */}
          <Route
            path="/file-management"
            element={<ProtectedRoute element={<FileManagementPage />} />}
          />

          {/* Public File Viewer Route */}
          <Route path="/view/:sharedId" element={<PublicFileViewer />} />

          {/* Redirect unknown routes to authentication */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
