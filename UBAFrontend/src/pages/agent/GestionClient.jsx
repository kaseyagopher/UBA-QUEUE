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

export function GestionClient() {
    const [tickets, setTickets] = useState([]);
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        fetchTickets();
        document.title = "Gestion-des-clients"
        fetchUser()
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

    // Fonction pour appeler un client
    const appelerClient = (ticket) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(`Le client ${ticket.nom + ticket.postnom}, numéro ${ticket.numero}, est attendu`);
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

    return (
        <div className="h-screen flex bg-customRed">
            {/* Sidebar */}
            <div className="h-screen w-96 bg-customRed flex justify-center">
                <NavbarCommentAdmin/>
            </div>
            {/* Contenu Principal */}
            <div className="bg-white w-full">
                <div className="flex items-center justify-between ml-10 mr-10 mt-10">
                    <p className="text-4xl font-roboto font-bold">Gestion des Services</p>
                    <div className="flex items-center">
                        {/* Affichage du nom de l'utilisateur connecté */}
                        <span className="pr-2 font-roboto font-bold">
                            {user ? (user.nom || user.name || user.email) : "Chargement..."}
                        </span>
                        <img src={profile} className="h-10" alt="Profile"/>
                    </div>
                </div>

                {/* Liste des tickets */}
                <div className='ml-10 mt-14'>
                    {tickets.length === 0 ? (
                        <p className='text-gray-500'>Aucun ticket en attente.</p>
                    ) : (
                        tickets.slice(0, 1).map((ticket, idx) => (
                            <div key={ticket.id} className='flex items-center justify-center bg-customRed w-72 justify-between rounded-md p-4 mb-4'>
                                <div>
                                    <p className='text-white font-bold font-roboto text-xl'>TICKET : {ticket.numero}</p>
                                    <p className='text-white font-bold font-roboto text-md'>{ticket.nom}</p>
                                </div>
                                <div>
                                    <div className='flex justify-center mb-1'>
                                        <img src={speak} className='h-8'/>
                                    </div>
                                    <button 
                                        className='bg-white text-customRed pl-4 pr-4 pt-1 pb-1 rounded-md font-bold' 
                                        onClick={() => appelerClient(ticket)}
                                    >
                                        Appeler
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {/* Formulaire de gestion du client en cours */}
                {tickets.length > 0 && (
                    <div className="mt-10 ml-10 bg-gray-100 rounded-lg p-6 w-1/2 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-customRed">Client en cours de traitement</h2>
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                // Ici, vous pouvez ajouter la logique pour valider/clôturer le client
                                alert('Client traité !');
                            }}
                        >
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={tickets[0].nom + ' ' + tickets[0].postnom}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2">Numéro Ticket</label>
                                <input
                                    type="text"
                                    value={tickets[0].numero}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2">État du client</label>
                                <select
                                    className="w-full px-3 py-2 border rounded"
                                    defaultValue="en_cours"
                                    name="etatClient"
                                >
                                    <option value="" disabled selected>Choisissez l'état</option>
                                    <option value="servi">Servi</option>
                                    <option value="non_servi">Non Servi</option>
                                    <option value="absent">Absent</option>

                                </select>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="bg-customRed text-white px-6 py-2 rounded hover:bg-red-700 transition"
                                >
                                    Valider le traitement
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                                    onClick={() => alert('Traitement annulé')}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
