import { Input } from "../components/forms/Input";
import logoUba from '../assets/logo-uba.png'
import illustration from '../assets/business-office-remote-lifestyle.jpg'
import { Button } from "../components/forms/Button";
import { useState } from "react";

export function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("client"); // Ajout de l'état role

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simule un chargement de 2s
            const response = await fetch("http://localhost:4000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email, motDePasse: password, role }) // Envoi du role
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Erreur d'authentification");
                setLoading(false);
                return;
            }

            // Si le backend renvoie déjà le rôle, on l'utilise pour rediriger immédiatement
            if (data && data.role) {
                if (data.role === "admin") {
                    window.location.href = "/admin/gestion-utilisateurs";
                } else if (data.role === "agent") {
                    window.location.href = "/agent/accueil";
                } else if (data.role === "client") {
                    window.location.href = "/client/services";
                } else {
                    window.location.href = "/";
                }
                return;
            }

            // Fallback : récupérer le profil pour la redirection selon le rôle
            const profileRes = await fetch("http://localhost:4000/api/profile", {
                credentials: "include"
            });
            const profile = await profileRes.json();
            if (profile.role === "admin") {
                window.location.href = "/admin/gestion-utilisateurs";
            } else if (profile.role === "agent") {
                window.location.href = "/agent/accueil";
            } else if (profile.role === "client") {
                window.location.href = "/client/services";
            } else {
                window.location.href = "/";
            }
        } catch (error) {
            console.error(error);
            setError("Erreur réseau");
        } finally {
            setLoading(false);
        }
    }

    const roles = [
        { key: 'admin', label: 'Admin' },
        { key: 'agent', label: 'Agent' },
    ];

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-transparent rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
                {/* Left: illustration */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-white/6 to-white/3 flex items-center justify-center p-6">
                    <img src={illustration} alt="illustration" className="w-full h-auto max-h-[560px] object-contain" />
                </div>

                {/* Right: form */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
                    <div className="w-full max-w-md">
                        <div className="flex justify-center mb-4">
                            <img src={logoUba} className="h-12" alt="logo UBA" />
                        </div>
                        <h2 className="text-center text-black font-roboto font-bold text-2xl mb-4">Login</h2>
                        <form onSubmit={onSubmit} className="bg-white p-5 rounded-lg drop-shadow-lg">
                            {/* Role selector: liste déroulante */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">Rôle</label>
                                <div>
                                    <select
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg bg-white text-gray-700 transition-colors duration-200 focus:border-customRed focus:ring-1 focus:ring-customRed"
                                    >
                                        {roles.map(r => (
                                            <option key={r.key} value={r.key}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Input type={"email"} placeholder={"email"} label={"Email"} value={email} onChange={e => setEmail(e.target.value)} />
                            <Input type={"password"} placeholder={"Mot de passe"} label={"Mot de passe"} value={password} onChange={e => setPassword(e.target.value)} />
                            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                            <Button text={loading ? "Chargement..." : "Se connecter"} color={'bg-customRed'} disabled={loading} loading={loading} />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}