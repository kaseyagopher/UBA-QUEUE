import { useEffect, useState } from 'react';
import profile from '../../assets/profile.png';
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AgentAccueil() {
    const [user, setUser] = useState(null);
    const [services, setServices] = useState([]);

    useEffect(() => {
        document.title = "Gestion-des-clients"
        fetchUser()
        fetchServices()
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/profile", { withCredentials: true });
            setUser(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur :", error);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/services");
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des services :", error);
        }
    };

    // Exemple de données pour l'histogramme
    const dataHistogramme = [
        { name: 'Présents', value: 12 },
        { name: 'Absents', value: 5 },
        { name: 'En attente', value: 8 },
        { name: 'En attente', value: 8 },
    ];

    return (
        <>
            <div className="flex items-center justify-between ml-10 mr-10 mt-10">
                <p className="text-4xl font-roboto font-bold">Accueil / <span className="text-customRed italic">{
                    user && services.length > 0
                        ? (services.find(s => s.id === Number(user.idService))?.nomService || user.idService)
                        : ""
                }</span></p>
                <div className="flex items-center">
                    {/* Affichage du nom de l'utilisateur connecté */}
                    <span className="pr-2 font-roboto font-bold">
                        <span className="text-customRed">AGENT </span> {user ? user.nom +" "+ user.postnom  : "Chargement..."}
                    </span>
                    <img src={profile} className="h-10" alt="Profile"/>
                </div>
            </div>

            {/* Histogramme des statistiques */}
            <div className="w-full flex justify-center mt-16">
                <div className="w-[600px] h-[350px] bg-white rounded-lg shadow border p-6">
                    <h2 className="text-xl font-bold mb-4 text-center">Statistiques du service</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dataHistogramme}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}
