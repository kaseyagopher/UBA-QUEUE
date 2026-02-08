import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import logoUba from '../assets/logo-uba.png'; // Assure-toi que le chemin est correct

const Navbar = ({ collapsed = false, onToggle = () => {} }) => {
    const sizeBox = 8;
    return (
        <div className={`h-screen ${collapsed ? 'w-20 p-2 ' : 'w-96'} bg-customRed flex justify-center transition-all duration-300 ease-in-out overflow-hidden`}>
            <div className="justify-center">
                {/* Logo UBA */}
                <div className="flex justify-center items-center relative">
                    <img src={logoUba} className={`${collapsed ? 'h-8' : 'h-10'} mt-8 transition-all duration-300`} alt="Logo UBA" />
                    {/* Chevron toggle placé en haut à droite de la sidebar */}
                    <button
                        onClick={onToggle}
                        className={`absolute right-2 top-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-opacity ${collapsed ? 'flex items-center justify-center' : ''}`}
                        aria-label="Toggle sidebar"
                    >
                        <span className="material-icons text-white">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav>
                    <Link
                        to="/agent/accueil"
                        className={`link-style flex items-center ${collapsed ? 'justify-center' : ''}`}
                    >
                        <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>dashboard</span>
                        {!collapsed && <span className="text-xl font-bold font-roboto">Accueil</span>}
                    </Link>

                    <Link
                        to="/agent/gestion-clients"
                        className={`link-style flex items-center ${collapsed ? 'justify-center' : ''}`}
                    >
                        <span className={`material-icons ${collapsed ? `w-${sizeBox} h-${sizeBox} flex items-center justify-center` : 'pr-4'}`}>people</span>
                        {!collapsed && <span className="text-xl font-bold  font-roboto">Gestion des clients</span>}
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
  onToggle: PropTypes.func,
};

export default Navbar;
