import { useEffect, useState } from 'react';
import logoUba from '../../assets/logo-uba.png';
import home from '../../assets/home.png';
import management from '../../assets/campaign-management.png';
import profile from '../../assets/profile.png';
import speak from '../../assets/speaking.png';
import {Link} from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import NavbarCommentAdmin from "../../components/NavbarCommentAdmin.jsx";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AgentAccueil() {
    const [tickets, setTickets] = useState([]);
    const [user, setUser] = useState(null);
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetchTickets();
        document.title = "Gestion-des-clients"
        fetchUser()
        fetchServices()
    }, []);

    const fetchTickets = () => {
        fetch('http://localhost:4000/api/tickets/en-attente')
            .then((response) => response.json())
            .then(data => {
                console.log("Données reçues :", data);
                setTickets(Array.isArray(data) ? data : []);
            })
            .catch((error) => console.error('Erreur chargement tickets:', error));
    };

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

    // Fonction pour appeler un client
    const appelerClient = (ticket) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(`Le client ${ticket.nom}, numéro ${ticket.numero}, est attendu`);
        utterance.lang = 'fr-FR';
        synth.speak(utterance);
        /*
        // 2️⃣ Mettre à jour le statut du ticket dans la base de données
        fetch(`http://localhost:3000/api/tickets/appeler/${ticket.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => {
            // 3️⃣ Rafraîchir la liste des tickets après l’appel
            fetchTickets();
        })
        .catch(error => console.error('Erreur lors de la mise à jour du ticket:', error));*/
    };

    // Exemple de données pour l'histogramme
    const dataHistogramme = [
        { name: 'Présents', value: 12 },
        { name: 'Absents', value: 5 },
        { name: 'En attente', value: 8 },
        { name: 'En attente', value: 8 },
    ];

    return (
        <div className="h-screen flex bg-customRed">
            {/* Sidebar */}
            <div className="h-screen w-96 bg-customRed flex justify-center">
                <NavbarCommentAdmin/>
            </div>
            {/* Contenu Principal */}
            <div className="bg-white w-full">
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

                {/* Liste des tickets */}
                <div className='ml-10 mt-14'>

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
            </div>
        </div>
    );
}
