import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import profile from '../assets/profile.png';
import axios from 'axios';
import AdminContext from '../contexts/AdminContext';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  // Initialisation depuis localStorage
  const [navCollapsed, setNavCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem('navCollapsed');
      return raw ? JSON.parse(raw) : false;
    } catch (e) {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Persister la préférence de l'utilisateur
  useEffect(() => {
    try {
      localStorage.setItem('navCollapsed', JSON.stringify(navCollapsed));
    } catch (e) {
      // ignore
    }
  }, [navCollapsed]);

  const fetchCurrentUser = async () => {
    setLoadingUser(true);
    try {
      const res = await axios.get('http://localhost:4000/api/profile', { withCredentials: true });
      const user = res.data || null;
      if (user && user.role !== 'admin') {
        setCurrentUser(null);
        navigate('/login', { replace: true });
      } else {
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Erreur fetch profile', err);
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // Redirection vers login si non connecté
  useEffect(() => {
    if (!loadingUser && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [loadingUser, currentUser, navigate]);

  if (!loadingUser && !currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-customRed"></div>
      </div>
    );
  }

  return (
      <AdminContext.Provider value={{ title, setTitle }}>
        {/* Conteneur principal - FLEX avec hauteur pleine et overflow caché */}
        <div className="flex h-screen overflow-hidden bg-customRed">

          {/* NAVBAR - TOUJOURS FIXE, JAMAIS SCROLLABLE */}
          <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
              navCollapsed ? 'w-20' : 'w-96'
          }`}>
            <Navbar collapsed={navCollapsed} onToggle={() => setNavCollapsed(p => !p)} />
          </div>

          {/* PARTIE DROITE - SEULEMENT CELLE-CI EST SCROLLABLE */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">

            {/* HEADER FIXE (ne scroll pas) */}
            <div className="flex-shrink-0 px-10 py-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold font-roboto text-gray-800">
                  {title}
                </h1>

                <div className="flex items-center gap-4">
                  {loadingUser ? (
                      <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
                  ) : (
                      <span className="font-roboto font-bold text-gray-700 truncate max-w-[200px] text-right">
                                        {currentUser
                                            ? `${currentUser.nom || ''} ${currentUser.postnom || ''} ${currentUser.prenom || ''}`.trim()
                                            : 'Administrateur'
                                        }
                                    </span>
                  )}
                  <img
                      src={currentUser?.avatar || profile}
                      alt="Profil"
                      className="h-10 w-10 rounded-full object-cover border-2 border-customRed"
                  />
                </div>
              </div>
            </div>

            {/* CONTENU SCROLLABLE - UNIQUEMENT CECI SCROLLE */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AdminContext.Provider>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node,
};