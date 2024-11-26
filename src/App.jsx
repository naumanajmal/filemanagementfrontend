import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AuthenticationPage from './pages/AuthenticationPage';
import FileManagementPage from './pages/FileManagementPage';

const App = () => {
    return (
        <Router>
            <nav>
                <Link to="/auth">Authentication</Link>
                <Link to="/file-management">File Management</Link>
            </nav>
            <Routes>
                <Route path="/auth" element={<AuthenticationPage />} />
                <Route path="/file-management" element={<FileManagementPage />} />
            </Routes>
        </Router>
    );
};

export default App;
