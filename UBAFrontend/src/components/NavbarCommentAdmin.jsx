import { Link } from 'react-router-dom';
import logoUba from '../assets/logo-uba.png'; // Assure-toi que le chemin est correct
import home from '../assets/home.png';
import management from '../assets/campaign-management.png';

const Navbar = () => {
    return (
        <div className="h-screen w-96 bg-customRed flex justify-center">
            <div className="justify-center">
                {/* Logo UBA */}
                <div className="flex justify-center">
                    <img src={logoUba} className="h-10 mt-8" alt="Logo UBA" />
                </div>

                {/* Navigation */}
                <nav>
                    <Link
                        to="/agent/accueil"
                        className="link-style"
                    >
                        <span className='material-icons pr-4'>dashboard</span>
                        <span className="text-xl font-bold font-roboto">
                          Accueil
                        </span>
                    </Link>

                    <Link
                        to="/agent/gestion-clients"
                        className="link-style"
                    >
                        <span className='material-icons pr-4'>people</span>
                        <span className="text-xl font-bold  font-roboto">
                          Gestion des clients
                        </span>
                    </Link>

                    <button
                        onClick={async () => {
                            try {
                                await fetch("http://localhost:4000/api/logout", {
                                    method: "POST",
                                    credentials: "include"
                                });
                                window.location.href = "/login";
                            } catch (e) {
                                alert("Erreur lors de la déconnexion");
                            }
                        }}
                        className="link-style w-full text-left"
                    >
                        <span className='material-icons pr-4'>logout</span>
                        <span className="text-xl font-bold font-roboto">
              Déconnexion
            </span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
