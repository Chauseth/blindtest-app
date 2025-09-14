import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HostDashboard from './host/HostDashboard';
import PlayerLobby from './player/PlayerLobby';
import theme from './common/AppTheme.module.css';

const Home = () => (
    <div className={theme.root}>
        <div className={theme.centeredContainer}>
            <h1 className={theme.title}>🎵 Blindtest App</h1>
            <p className={theme.subtitle}>
                Défie tes amis sur la musique !<br />
                <span style={{ color: '#F76E4F' }}>Qui sera le plus rapide ?</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Link to="/host" className={theme.buttonPrimary}>👑 Je suis l'animateur</Link>
                <Link to="/player" className={theme.buttonSecondary}>🎤 Je suis un joueur</Link>
            </div>
            <div style={{ marginTop: 32, color: '#888', fontSize: 13 }}>
                <span>Développé avec ❤️ pour vos soirées</span>
            </div>
        </div>
    </div>
);

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/host" element={<HostDashboard />} />
                <Route path="/player" element={<PlayerLobby />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default App;