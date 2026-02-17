import { useEffect, useState, useCallback } from 'react';
import speak from '../../assets/speaking.png';
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/ReactToastify.css";
import AgentHeader from '../../components/AgentHeader.jsx';

const API_BASE = "http://localhost:4000/api";

export function GestionClient() {
    const [user, setUser] = useState(null);
    const [service, setService] = useState(null);
    const [guichet, setGuichet] = useState(null);
    const [ticketActuel, setTicketActuel] = useState(null);
    const [prochainTicket, setProchainTicket] = useState(null);
    const [etatClient, setEtatClient] = useState('servi');
    const [loading, setLoading] = useState(true);
    const [modePrononciation, setModePrononciation] = useState('adapte');
    const [voixDisponibles, setVoixDisponibles] = useState([]);
    const [voixSelectionnee, setVoixSelectionnee] = useState(null);
    const [stats, setStats] = useState({
        aujourdhui: { total: 0, servis: 0, enAttente: 0, absents: 0, annules: 0 }
    });

    const fetchUser = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE}/profile`, { withCredentials: true });
            setUser(response.data);
        } catch (error) {
            console.error("Erreur utilisateur:", error);
            toast.error("Erreur de chargement du profil");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchService = useCallback(async (serviceId) => {
        if (!serviceId) return;
        try {
            const response = await axios.get(`${API_BASE}/services/${serviceId}`);
            setService(response.data);
        } catch (error) {
            console.error("Erreur service:", error);
        }
    }, []);

    const fetchGuichet = useCallback(async (agentId) => {
        if (!agentId) return;
        try {
            const response = await axios.get(`${API_BASE}/guichets/agent/${agentId}`);
            setGuichet(Array.isArray(response.data) ? response.data[0] || null : null);
        } catch (error) {
            console.error("Erreur guichet:", error);
        }
    }, []);

    const fetchTicketEnCours = useCallback(async (agentId) => {
        if (!agentId) return;
        try {
            const response = await axios.get(`${API_BASE}/tickets/en-cours/agent/${agentId}`);
            setTicketActuel(response.data ?? null);
        } catch (error) {
            console.error("Erreur chargement ticket en cours:", error);
            setTicketActuel(null);
        }
    }, []);

    const fetchProchainTicket = useCallback(async (idService) => {
        if (!idService) return;
        try {
            const response = await axios.get(`${API_BASE}/tickets/suivant/${idService}`);
            setProchainTicket(response.data ?? null);
        } catch (error) {
            console.error("Erreur chargement prochain ticket:", error);
            setProchainTicket(null);
        }
    }, []);

    const fetchStats = useCallback(async (idService) => {
        if (!idService) return;
        try {
            const response = await axios.get(`${API_BASE}/tickets/stats/service/${idService}`);
            setStats(response.data || { aujourdhui: { total: 0, servis: 0, enAttente: 0 } });
        } catch (error) {
            console.error("Erreur stats:", error);
        }
    }, []);

    // Charger les voix (Chrome charge "Google français" de façon asynchrone via voiceschanged)
    useEffect(() => {
        const meilleureVoixFR = (voix) => {
            const google = voix.find(v => /google/i.test(v.name) && v.lang.startsWith('fr'));
            const microsoft = voix.find(v => /microsoft/i.test(v.name) && v.lang.startsWith('fr'));
            return google || microsoft || voix[0];
        };

        const chargerVoix = () => {
            const voices = window.speechSynthesis.getVoices();
            const voixFR = voices.filter(v => v.lang.startsWith('fr'));
            const liste = voixFR.length ? voixFR : voices;
            setVoixDisponibles(liste);

            if (liste.length > 0) {
                const sauvegarde = localStorage.getItem('tts-voix-agent');
                const trouve = sauvegarde && liste.find(v => v.name === sauvegarde);
                setVoixSelectionnee(trouve || meilleureVoixFR(voixFR.length ? voixFR : voices));
            }
        };

        chargerVoix();
        window.speechSynthesis.onvoiceschanged = chargerVoix;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    useEffect(() => {
        if (voixSelectionnee) {
            localStorage.setItem('tts-voix-agent', voixSelectionnee.name);
        }
    }, [voixSelectionnee]);

    // Chargement initial
    useEffect(() => {
        document.title = "Agent - Gestion des clients";
        fetchUser();
    }, [fetchUser]);

    // Charger service, guichet, ticket en cours, prochain ticket et stats quand l'utilisateur est prêt
    useEffect(() => {
        if (!user?.id) return;

        fetchGuichet(user.id);
        fetchTicketEnCours(user.id);

        if (user.idService) {
            fetchService(user.idService);
            fetchProchainTicket(user.idService);
            fetchStats(user.idService);
        }
    }, [user?.id, user?.idService, fetchService, fetchGuichet, fetchTicketEnCours, fetchProchainTicket, fetchStats]);

    // Polling du prochain ticket toutes les 5s quand aucun client en cours
    useEffect(() => {
        if (!user?.idService || ticketActuel) return;

        const interval = setInterval(() => {
            fetchProchainTicket(user.idService);
        }, 5000);

        return () => clearInterval(interval);
    }, [user?.idService, ticketActuel, fetchProchainTicket]);

    // ✅ Dictionnaire de prononciation pour noms africains
    const prononciationMap = {
        // Préfixes et noms courants
        'Mukendi': 'Mou-kèn-di',
        'Mukuna': 'Mou-kou-na',
        'Nkulu': 'Nkou-lou',
        'Tshibangu': 'Tchi-bang-ou',
        'Kalonji': 'Ka-lon-dji',
        'Ilunga': 'I-loun-ga',
        'Mbuyi': 'Mbou-yi',
        'Kabongo': 'Ka-bong-o',
        'Mutombo': 'Mou-tom-bo',
        'Lubamba': 'Lou-bam-ba',
        'Ntumba': 'Ntoum-ba',
        'Mpoyi': 'Mpo-yi',
        'Kazadi': 'Ka-za-di',
        'Banza': 'Ban-za',
        'Kimbangu': 'Kim-bang-ou',
        'Makiese': 'Ma-kié-sé',
        'Ngoy': 'Ngo-yi',
        'Tshiala': 'Tchia-la',
        'Lubaki': 'Lou-ba-ki',
        'Mavinga': 'Ma-vin-ga',
        'Kibangu': 'Ki-bang-ou',
        'Nsimba': 'Nssim-ba',
        'Mputu': 'Mpou-tou',
        'Kanku': 'Kan-kou',
        'Lusamba': 'Lou-sam-ba',
        'Matala': 'Ma-ta-la',
        'Ndombasi': 'Ndom-ba-si',
    };

    // ✅ Fonction pour normaliser la prononciation
    const getPrononciation = (nom) => {
        if (!nom) return '';

        // Chercher dans le dictionnaire
        const nomLower = nom.toLowerCase();
        for (const [key, value] of Object.entries(prononciationMap)) {
            if (nomLower.includes(key.toLowerCase())) {
                return value;
            }
        }

        // Règles de prononciation générales pour les noms africains
        let prononce = nom;

        // Remplacer les combinaisons de lettres
        const regles = [
            { from: /nk/gi, to: 'nk' }, // Garder 'nk' mais le prononcer clairement
            { from: /ng/gi, to: 'ng' },
            { from: /mb/gi, to: 'mb' },
            { from: /mp/gi, to: 'mp' },
            { from: /tsh/gi, to: 'tch' },
            { from: /lub/gi, to: 'loub' },
            { from: /kis/gi, to: 'kiss' },
            { from: /muk/gi, to: 'mouk' },
        ];

        regles.forEach(regle => {
            prononce = prononce.replace(regle.from, regle.to);
        });

        return prononce;
    };

    // Message d'appel : Nom du Service — Ticket numéro X — Nom et Prénom — Pour le guichet [lettre]
    const construireMessageAppel = (ticket, isRappel = false) => {
        const prefix = isRappel ? 'Rappel. ' : '';
        const nomService = service?.nomService || 'Service';
        const guichetLettre = guichet?.lettre || 'A';

        let nomClient = '';
        if (modePrononciation === 'adapte') {
            const prenom = ticket.prenom ? getPrononciation(ticket.prenom) : '';
            const nom = ticket.nom ? getPrononciation(ticket.nom) : '';
            const postnom = ticket.postnom ? getPrononciation(ticket.postnom) : '';
            nomClient = [prenom, nom, postnom].filter(Boolean).join(' ');
        } else {
            nomClient = [ticket.prenom, ticket.nom, ticket.postnom].filter(Boolean).join(' ');
        }

        return `${prefix}${nomService}. Ticket numéro ${ticket.numero}. ${nomClient}. Pour le guichet ${guichetLettre}.`;
    };

    // Synthèse vocale avec la voix sélectionnée (Google, Microsoft ou autre)
    const parler = (message, vitesse = 0.9) => {
        const synth = window.speechSynthesis;
        if (synth.speaking) synth.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'fr-FR';
        utterance.rate = modePrononciation === 'lent' ? 0.7 : vitesse;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (voixSelectionnee) {
            utterance.voice = voixSelectionnee;
        } else {
            const voices = synth.getVoices();
            const fallback = voices.find(v => v.lang.startsWith('fr')) || voices[0];
            if (fallback) utterance.voice = fallback;
        }

        utterance.onerror = () => toast.error("Erreur de synthèse vocale");
        synth.speak(utterance);
    };

    // Fonction pour appeler le client
    const appelerClient = async () => {
        if (!prochainTicket) {
            toast.warning("Aucun ticket en attente");
            return;
        }

        try {
            // Mettre à jour le ticket actuel
            setTicketActuel(prochainTicket);

            // Construire et prononcer le message
            const message = construireMessageAppel(prochainTicket, false);
            parler(message);

            // Marquer comme appelé
            await axios.patch(`http://localhost:4000/api/tickets/${prochainTicket.id}/appeler`, {
                idUtilisateur: user.id,
                idGuichet: guichet?.id
            });

            toast.info(`Ticket #${prochainTicket.numero} appelé`);
            setProchainTicket(null);
            if (user?.idService) fetchStats(user.idService);

        } catch (error) {
            console.error("Erreur appel:", error);
            toast.error("Erreur lors de l'appel du client");
        }
    };

    // Fonction pour rappeler le client actuel
    const rappelerClient = () => {
        if (!ticketActuel) return;

        const message = construireMessageAppel(ticketActuel, true);
        parler(message, 0.85); // Plus lent pour le rappel

        toast.info(`Rappel ticket #${ticketActuel.numero}`);
    };

    // ✅ Fonction pour tester la prononciation (optionnel)
    const testerPrononciation = () => {
        if (!ticketActuel && !prochainTicket) {
            toast.warning("Aucun ticket disponible pour tester");
            return;
        }

        const ticket = ticketActuel || prochainTicket;
        const message = construireMessageAppel(ticket, false);
        parler(message, 0.8);

        toast.info("Test de prononciation en cours...");
    };

    const traiterTicket = async () => {
        if (!ticketActuel) {
            toast.warning("Aucun ticket sélectionné");
            return;
        }

        try {
            let endpoint = '';
            let message = '';

            switch(etatClient) {
                case 'servi':
                    endpoint = 'terminer';
                    message = 'Client marqué comme servi';
                    break;
                case 'absent':
                    endpoint = 'absent';
                    message = 'Client marqué comme absent';
                    break;
                case 'annule':
                    endpoint = 'annuler';
                    message = 'Ticket annulé';
                    break;
            }

            await axios.patch(`http://localhost:4000/api/tickets/${ticketActuel.id}/${endpoint}`);

            toast.success(message);
            setTicketActuel(null);
            setEtatClient('servi');
            if (user?.idService) {
                fetchProchainTicket(user.idService);
                fetchStats(user.idService);
            }

        } catch (error) {
            console.error("Erreur traitement:", error);
            toast.error("Erreur lors du traitement du ticket");
        }
    };

    const annulerTraitement = () => {
        setTicketActuel(null);
        setEtatClient('servi');
        if (user?.idService) fetchProchainTicket(user.idService);
        toast.info("Traitement annulé");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-customRed"></div>
            </div>
        );
    }

    // Agent sans service assigné
    if (user && !user.idService) {
        return (
            <>
                <ToastContainer position="top-right" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                    <AgentHeader
                        title="Gestion des clients"
                        serviceName={null}
                        agentName={`${user?.prenom || ''} ${user?.nom || ''} ${user?.postnom || ''}`.trim() || user?.email}
                        guichetLetter={guichet?.lettre || 'N/A'}
                    />
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                        <span className="material-icons text-5xl text-amber-500 mb-4">warning</span>
                        <p className="text-xl font-medium text-amber-800">Aucun service assigné</p>
                        <p className="text-amber-700 mt-2">Contactez l'administrateur pour vous assigner un service et un guichet.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <AgentHeader
                    title="Gestion des clients"
                    serviceName={service?.nomService}
                    agentName={`${user?.prenom || ''} ${user?.nom || ''} ${user?.postnom || ''}`.trim() || user?.email}
                    guichetLetter={guichet?.lettre || 'N/A'}
                />

                {/* Contrôles de prononciation, voix et guichet */}
                <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setModePrononciation('standard')}
                                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                    modePrononciation === 'standard'
                                        ? 'bg-white text-customRed shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Prononciation standard"
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setModePrononciation('lent')}
                                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                    modePrononciation === 'lent'
                                        ? 'bg-white text-customRed shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Prononciation lente"
                            >
                                Lent
                            </button>
                            <button
                                onClick={() => setModePrononciation('adapte')}
                                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                    modePrononciation === 'adapte'
                                        ? 'bg-white text-customRed shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Prononciation adaptée aux noms africains"
                            >
                                Adapté
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <span className="material-icons text-base">record_voice_over</span>
                                Voix
                            </span>
                            <select
                                value={voixSelectionnee?.name || (voixDisponibles[0]?.name ?? '')}
                                onChange={(e) => {
                                    const v = voixDisponibles.find(x => x.name === e.target.value);
                                    if (v) setVoixSelectionnee(v);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[200px] focus:ring-2 focus:ring-customRed focus:border-transparent"
                            >
                                {voixDisponibles.length === 0 && (
                                    <option value="">Chargement...</option>
                                )}
                                {voixDisponibles.map((v) => (
                                    <option key={v.name + v.lang} value={v.name}>
                                        {v.name} {v.lang ? `(${v.lang})` : ''}
                                    </option>
                                ))}
                            </select>
                            {voixSelectionnee?.name?.toLowerCase().includes('google') && (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Style Google</span>
                            )}
                        </div>

                        <div className="bg-gradient-to-r from-customRed to-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-3">
                            <span className="text-sm">Guichet</span>
                            <span className="text-2xl font-bold">{guichet?.lettre || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-sm text-gray-500">Clients servis aujourd'hui</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.aujourdhui?.servis || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-sm text-gray-500">En attente</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.aujourdhui?.enAttente || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-sm text-gray-500">Prochain ticket</p>
                        <p className="text-2xl font-bold text-customRed">
                            {prochainTicket ? `#${prochainTicket.numero}` : 'Aucun'}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-sm text-gray-500">Mode prononciation</p>
                        <p className="text-lg font-semibold text-purple-600">
                            {modePrononciation === 'adapte' ? '🎤 Adapté' :
                                modePrononciation === 'lent' ? '🐢 Lent' : '📢 Standard'}
                        </p>
                    </div>
                </div>

                {/* Zone principale - Ticket en cours */}
                <div className="bg-white rounded-2xl shadow-md p-8 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center border-b pb-4">
                        {ticketActuel ? 'Client en cours' : 'En attente de client'}
                    </h2>

                    {ticketActuel ? (
                        <div className="space-y-8">
                            {/* Ticket info - GRAND */}
                            <div className="bg-gradient-to-br from-customRed to-red-600 text-white p-10 rounded-2xl text-center shadow-xl">
                                <p className="text-lg opacity-90">Ticket en cours</p>
                                <p className="text-8xl font-bold mt-4 mb-6">#{ticketActuel.numero}</p>
                                {ticketActuel.heureArrivee && (
                                    <div className="flex justify-center gap-6">
                                        <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
                                            Arrivé: {new Date(ticketActuel.heureArrivee).toLocaleTimeString('fr-FR')}
                                        </span>
                                        <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
                                            Attente: {Math.max(0, Math.floor((new Date() - new Date(ticketActuel.heureArrivee)) / 60000))} min
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Client info */}
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <p className="text-sm text-gray-500 mb-2">Nom du client</p>
                                <p className="text-3xl font-bold text-gray-800 mb-2">
                                    {[ticketActuel.prenom, ticketActuel.nom].filter(Boolean).join(' ')}
                                </p>
                                {ticketActuel.postnom && (
                                    <p className="text-xl text-gray-600">{ticketActuel.postnom}</p>
                                )}
                                {modePrononciation === 'adapte' && (
                                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                        <p className="text-sm text-purple-700">
                                            <span className="font-semibold">Prononciation:</span>{' '}
                                            {[getPrononciation(ticketActuel.prenom), getPrononciation(ticketActuel.nom), getPrononciation(ticketActuel.postnom)]
                                                .filter(Boolean).join(' ')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Boutons d'action */}
                            <div className="space-y-4">
                                {/* Bouton Rappeler (peut être utilisé plusieurs fois) */}
                                <button
                                    onClick={rappelerClient}
                                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-3 text-lg font-semibold"
                                >
                                    <img src={speak} className="h-6 w-6" alt="Rappeler" />
                                    Rappeler le client
                                </button>

                                {/* Sélection état client */}
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setEtatClient('servi')}
                                        className={`py-4 rounded-xl text-lg font-semibold transition ${
                                            etatClient === 'servi'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        ✅ Servi
                                    </button>
                                    <button
                                        onClick={() => setEtatClient('absent')}
                                        className={`py-4 rounded-xl text-lg font-semibold transition ${
                                            etatClient === 'absent'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        ❌ Absent
                                    </button>
                                    <button
                                        onClick={() => setEtatClient('annule')}
                                        className={`py-4 rounded-xl text-lg font-semibold transition ${
                                            etatClient === 'annule'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        🚫 Annuler
                                    </button>
                                </div>

                                {/* Boutons Valider/Annuler */}
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button
                                        onClick={traiterTicket}
                                        className="bg-customRed text-white py-4 px-6 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 text-lg font-semibold"
                                    >
                                        <span className="material-icons">check</span>
                                        Valider le traitement
                                    </button>
                                    <button
                                        onClick={annulerTraitement}
                                        className="bg-gray-500 text-white py-4 px-6 rounded-xl hover:bg-gray-600 transition flex items-center justify-center gap-2 text-lg font-semibold"
                                    >
                                        <span className="material-icons">close</span>
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                                <span className="material-icons text-5xl text-gray-400">person_off</span>
                            </div>
                            <p className="text-2xl text-gray-700 font-medium mb-4">Aucun client en cours</p>

                            {/* Prochain ticket */}
                            {prochainTicket ? (
                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-xl max-w-md mx-auto">
                                    <p className="text-sm text-green-600 mb-2">Prochain ticket en attente</p>
                                    <p className="text-4xl font-bold text-green-700 mb-4">#{prochainTicket.numero}</p>
                                    <div className="space-y-3">
                                        <button
                                            onClick={appelerClient}
                                            className="bg-customRed text-white px-8 py-4 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-3 text-lg font-semibold w-full"
                                        >
                                            <img src={speak} className="h-6 w-6" alt="Appeler" />
                                            Appeler le client
                                        </button>
                                        <button
                                            onClick={testerPrononciation}
                                            className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-3 text-base w-full"
                                        >
                                            <span className="material-icons">volume_up</span>
                                            Tester la prononciation
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <span className="material-icons text-5xl mb-4">hourglass_empty</span>
                                    <p className="text-xl">Aucun ticket en attente</p>
                                    <p className="text-sm mt-2">La file d'attente est vide</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}