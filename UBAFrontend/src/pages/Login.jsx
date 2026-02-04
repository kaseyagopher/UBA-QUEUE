import { Input } from "../components/forms/Input";
import logoUba from '../assets/logo-uba.png'
import { Button } from "../components/forms/Button";
import { useState } from "react";

export function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
                body: JSON.stringify({ email, motDePasse: password })
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Erreur d'authentification");
                setLoading(false);
                return;
            }
            // Après connexion, récupérer le profil pour la redirection selon le rôle
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
        } catch (err) {
            setError("Erreur réseau");
        } finally {
            setLoading(false);
        }
    }

    return <div className="justify-center items-center bg-white h-screen flex">
        <div>
            <div className="flex justify-center">
                <img src={logoUba} className="h-12 "/>
            </div>
            <div className="flex justify-center text-black font-roboto font-bold text-xl">
                <p>Login</p>
            </div>
            <form action="" method="post" onSubmit={onSubmit} className="bg-white p-5 rounded-lg drop-shadow-lg lg:w-96 md:w-96">
                <Input type={"email"} placeholder={"email"} label={"Addresse mail"} value={email} onChange={e => setEmail(e.target.value)} />
                <Input type={"password"} placeholder={"Mot de passe"} label={"Mot de passe"} value={password} onChange={e => setPassword(e.target.value)} />
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <Button text={loading ? "Chargement..." : "Se connecter"} color={'bg-customRed'} disabled={loading} loading={loading} />
            </form>
        </div>
        
    </div>
}