import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './NavbarAgent.jsx';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AdminContext from '../contexts/AdminContext.jsx';

const AgentLayout = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { title } = useContext(AdminContext);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('http://localhost:4000/api/profile', { withCredentials: true });
                if (res.data && res.data.role === 'agent') {
                    setIsAuthenticated(true);
                } else {
                    navigate('/login', { replace: true });
                }
            } catch {
                navigate('/login', { replace: true });
            } finally {
                setLoadingAuth(false);
            }
        };
        checkAuth();
    }, [navigate]);

    if (loadingAuth) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-customRed"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Navbar - TOUJOURS FIXE, JAMAIS SCROLLABLE */}
            <div className="flex-shrink-0">
                <Navbar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                />
            </div>

            {/* Partie droite - SEULEMENT CELLE-CI EST SCROLLABLE */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Contenu principal - UNIQUEMENT CECI SCROLLE */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        <Outlet /> {/* Ici s'affichent les pages (Accueil, Gestion clients, etc.) */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AgentLayout;