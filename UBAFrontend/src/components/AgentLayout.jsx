import { Outlet } from 'react-router-dom';
import Navbar from './NavbarAgent.jsx';
import { useState, useEffect, useContext } from 'react';
import AdminContext from '../contexts/AdminContext.jsx';

const AgentLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { title } = useContext(AdminContext);

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