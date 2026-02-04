import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import logoUba from '../assets/logo-uba.png'; // Assure-toi que le chemin est correct

const Navbar = ({ collapsed = false }) => {
  const sizeBox = 8
  return (
    <div className={`h-screen ${collapsed ? 'w-20 p-2 ' : 'w-96'} bg-customRed flex justify-center transition-all duration-300 ease-in-out overflow-hidden`}>
      <div className="justify-center">
        {/* Logo UBA */}
        <div className="flex justify-center">
          <img src={logoUba} className={`${collapsed ? 'h-8' : 'h-10'} mt-8 transition-all duration-300`} alt="Logo UBA" />
        </div>

        {/* Navigation */}
        <nav>
          <Link
            to="/"
            className={`link-style flex items-center ${collapsed ? 'justify-center' : ''}`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>dashboard</span>
            {!collapsed && <span className="text-xl font-bold font-roboto">Accueil</span>}
          </Link>

          <Link
            to="/admin/gestion-service"
            className={`link-style flex items-center ${collapsed ? 'justify-center' : ''}`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>people</span>
            {!collapsed && <span className="text-xl font-bold  font-roboto">Gestion des services</span>}
          </Link>

          <Link
            to="/admin/gestion-utilisateurs"
            className={`link-style flex items-center ${collapsed ? 'justify-center' : ''}`}
          >
            <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>card_membership</span>

            {!collapsed && <span className="text-xl font-bold font-roboto">Gestion des users</span>}
          </Link>

          <Link 
            to="/admin/evaluation-performance" 
            className={`link-style flex items-center ${collapsed ? 'justify-center' : ''}`}
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
            className={`link-style w-full text-left flex items-center ${collapsed ? 'justify-center' : ''}`}
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
};

export default Navbar;
