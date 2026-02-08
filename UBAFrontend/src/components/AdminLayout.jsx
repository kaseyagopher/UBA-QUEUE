import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import profile from '../assets/profile.png';
import axios from 'axios';
import AdminContext from '../contexts/AdminContext';

export default function AdminLayout({ children }) {
  // Initialisation depuis localStorage pour éviter le 'reset' lors du changement de page
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

  // Persister la préférence de l'utilisateur pour que l'état reste entre pages
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
      setCurrentUser(res.data || null);
    } catch (err) {
      console.error('Erreur fetch profile', err);
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  return (
    <AdminContext.Provider value={{ title, setTitle }}>
      <div className="h-screen flex bg-customRed">
        <div className={`h-screen ${navCollapsed ? 'w-20' : 'w-96'} bg-customRed flex justify-center transition-all duration-300 ease-in-out`}>
          <Navbar collapsed={navCollapsed} onToggle={() => setNavCollapsed(p => !p)} />
        </div>

        <div className="bg-white w-full p-0 transition-all duration-300">
          <div className="flex items-center justify-between ml-10 mr-10 mt-10">
            <div className="justify-start">
              <p className="text-4xl font-roboto font-bold">{title}</p>
            </div>

            <div className="flex items-center min-w-[220px] justify-end gap-3">
              {/* Affichage fixe du nom/placeholder pour éviter les sauts quand on change de page */}
              {loadingUser ? (
                <div className="w-48 h-5 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className="pr-2 font-roboto font-bold truncate w-48 text-right">
                  {currentUser ? `${currentUser.nom || currentUser.name || ''} ${currentUser.postnom || ''} ${currentUser.prenom || ''}`.trim() : 'Utilisateur'}
                </span>
              )}

              <img src={currentUser && currentUser.avatar ? currentUser.avatar : profile} alt="Profil" className="h-10 rounded-full object-cover" />
            </div>
          </div>

          <div className="p-10">
            {children}
          </div>
        </div>
      </div>
    </AdminContext.Provider>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node,
};
