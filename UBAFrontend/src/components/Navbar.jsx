import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import logoUba from '../assets/logo-uba.png';

const Navbar = ({ collapsed = false, onToggle = () => { } }) => {
  const sizeBox = 6;

  return (
    <div className={`h-screen ${collapsed ? 'w-20 p-2 ' : 'w-96'} bg-customRed flex justify-center transition-all duration-300 ease-in-out overflow-hidden`}>
      <div className="justify-center">
        {/* Logo UBA */}
        <div className="flex justify-center items-center relative">
          <img src={logoUba} className={`${collapsed ? 'h-8' : 'h-10'} mt-8 transition-all duration-300`} alt="Logo UBA" />
          <button
            onClick={onToggle}
            className={`absolute right-2 top-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-opacity ${collapsed ? 'flex items-center justify-center' : ''}`}
            aria-label="Toggle sidebar"
          >
            <span className="material-icons text-white">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <Link
            to="/admin/dashboard"
            className={`link-style flex items-center ${collapsed ? 'justify-center' : ''} hover:bg-white/10 transition-colors`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>dashboard</span>
            {!collapsed && <span className="text-xl font-bold font-roboto">Tableau de bord</span>}
          </Link>

          <Link
            to="/admin/gestion-guichet"
            className={`link-style flex items-center ${collapsed ? 'justify-center px-2' : 'px-6'}`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>
              countertops
            </span>
            {!collapsed && <span className="text-lg font-bold font-roboto">Guichets</span>}
          </Link>

          <Link
            to="/admin/gestion-service"
            className={`link-style flex items-center ${collapsed ? 'justify-center' : ''} hover:bg-white/10 transition-colors`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>people</span>
            {!collapsed && <span className="text-xl font-bold font-roboto">Gestion des services</span>}
          </Link>

          <Link
            to="/admin/gestion-utilisateurs"
            className={`link-style flex items-center ${collapsed ? 'justify-center' : ''} hover:bg-white/10 transition-colors`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>card_membership</span>
            {!collapsed && <span className="text-xl font-bold font-roboto">Gestion des utilisateurs</span>}
          </Link>

          <Link
            to="/admin/evaluation-performance"
            className={`link-style flex items-center ${collapsed ? 'justify-center' : ''} hover:bg-white/10 transition-colors`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>assessment</span>
            {!collapsed && <span className="text-xl font-bold font-roboto">Évaluation du Système</span>}
          </Link>

          <button
            onClick={async () => {
              try {
                await fetch("http://localhost:4000/api/logout", {
                  method: "POST",
                  credentials: "include"
                });
                window.location.href = "/login";
              } catch (err) {
                console.error(err);
                alert("Erreur lors de la déconnexion");
              }
            }}
            className={`link-style w-full text-left flex items-center ${collapsed ? 'justify-center' : ''} hover:bg-white/10 transition-colors mt-4`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>logout</span>
            {!collapsed && <span className="text-xl font-bold font-roboto">Déconnexion</span>}
          </button>
        </nav>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  collapsed: PropTypes.bool,
  onToggle: PropTypes.func,
};


export default Navbar;