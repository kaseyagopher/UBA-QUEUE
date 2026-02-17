import { Input } from "../components/forms/Input";
import logoUba from '../assets/logo-uba.png'
import illustration from '../assets/business-office-remote-lifestyle.jpg'
import { Button } from "../components/forms/Button";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";

export function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("client");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Restaurer les informations sauvegardées
    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedRole = localStorage.getItem('savedRole');
        const savedRemember = localStorage.getItem('rememberMe') === 'true';

        if (savedRemember && savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
        if (savedRole) {
            setRole(savedRole);
        }
    }, []);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        // Validation basique
        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Veuillez entrer un email valide");
            toast.error("Format d'email invalide");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:4000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    motDePasse: password,
                    role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.message || "Erreur d'authentification";
                setError(errorMsg);
                toast.error(errorMsg);
                setLoading(false);
                return;
            }

            // Sauvegarder les informations si "Se souvenir de moi" est coché
            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
                localStorage.setItem('savedRole', role);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('savedRole');
                localStorage.removeItem('rememberMe');
            }

            // Afficher message de succès
            toast.success("Connexion réussie ! Redirection en cours...");

            // Redirection basée sur le rôle
            setTimeout(() => {
                if (data && data.role) {
                    switch(data.role) {
                        case "admin":
                            window.location.href = "/admin/dashboard";
                            break;
                        case "agent":
                            window.location.href = "/agent/accueil";
                            break;
                        case "client":
                            window.location.href = "/client/services";
                            break;
                        default:
                            window.location.href = "/";
                    }
                } else {
                    // Fallback: récupérer le profil
                    fetch("http://localhost:4000/api/profile", {
                        credentials: "include"
                    })
                        .then(profileRes => profileRes.json())
                        .then(profile => {
                            switch(profile.role) {
                                case "admin":
                                    window.location.href = "/admin/gestion-utilisateurs";
                                    break;
                                case "agent":
                                    window.location.href = "/agent/accueil";
                                    break;
                                case "client":
                                    window.location.href = "/client/services";
                                    break;
                                default:
                                    window.location.href = "/";
                            }
                        });
                }
            }, 1500);

        } catch (error) {
            console.error("Erreur de connexion:", error);
            const errorMsg = error.message === "Failed to fetch"
                ? "Erreur de connexion au serveur. Vérifiez votre connexion internet."
                : "Erreur réseau";
            setError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
        }
    }

    const roles = [
        { key: 'admin', label: 'Administrateur', icon: 'admin_panel_settings', description: 'Accès complet au système' },
        { key: 'agent', label: 'Agent', icon: 'support_agent', description: 'Gestion des tickets et clients' },
    ];

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                    {/* Section gauche - Illustration avec overlay */}
                    <div className="w-full md:w-1/2 relative bg-gradient-to-br from-customRed to-red-700 p-8 md:p-12 flex flex-col justify-center">
                        {/* Overlay avec pattern */}
                        <div className="absolute inset-0 bg-black/5 pattern-dots pattern-gray-100 pattern-size-2 pattern-opacity-10"></div>

                        <div className="relative z-10">
                            <div className="flex items-center mb-8">
                                <img src={logoUba} className="h-16 md:h-20" alt="logo UBA" />
                                <div className="ml-4">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">Système de Gestion</h1>

                                </div>
                            </div>

                            <img
                                src={illustration}
                                alt="Illustration système de gestion"
                                className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl"
                            />

                            <div className="mt-8 text-white/90">
                                <h3 className="text-xl font-semibold mb-3">Accédez à votre espace</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center">
                                        <span className="material-icons mr-2 text-green-300">check_circle</span>
                                        Gestion optimisée des files d'attente
                                    </li>
                                    <li className="flex items-center">
                                        <span className="material-icons mr-2 text-green-300">check_circle</span>
                                        Suivi en temps réel des demandes
                                    </li>
                                    <li className="flex items-center">
                                        <span className="material-icons mr-2 text-green-300">check_circle</span>
                                        Interface intuitive et moderne
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Section droite - Formulaire */}
                    <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h2>
                                <p className="text-gray-600">Accédez à votre compte</p>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-6">
                                {/* Sélecteur de rôle amélioré */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Je me connecte en tant que :
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {roles.map((r) => (
                                            <button
                                                type="button"
                                                key={r.key}
                                                onClick={() => setRole(r.key)}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    role === r.key
                                                        ? 'border-customRed bg-red-50 shadow-sm'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className={`material-icons text-2xl mb-2 ${
                                                        role === r.key ? 'text-customRed' : 'text-gray-500'
                                                    }`}>
                                                        {r.icon}
                                                    </span>
                                                    <span className={`font-medium ${
                                                        role === r.key ? 'text-customRed' : 'text-gray-700'
                                                    }`}>
                                                        {r.label}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-1 text-center">
                                                        {r.description}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Champ Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse Email
                                    </label>
                                    <div className="relative">
                                        <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            email
                                        </span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all"
                                            placeholder="votre@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Champ Mot de passe */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            lock
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <span className="material-icons">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>


                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="material-icons text-red-500 mr-2">error</span>
                                            <span className="text-sm text-red-700">{error}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Bouton de connexion */}
                                <Button
                                    text={loading ? "Connexion en cours..." : "Se connecter"}
                                    color={'bg-customRed hover:bg-red-700'}
                                    disabled={loading}
                                    loading={loading}
                                    fullWidth
                                    icon={loading ? null : "login"}
                                />
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ajouter des styles pour les patterns */}
            <style>{`
                .pattern-dots {
                    background-image: radial-gradient(currentColor 1px, transparent 1px);
                    background-size: calc(10 * 1px) calc(10 * 1px);
                }
                .pattern-gray-100 {
                    color: rgba(243, 244, 246, 0.1);
                }
            `}</style>
        </>
    );
}