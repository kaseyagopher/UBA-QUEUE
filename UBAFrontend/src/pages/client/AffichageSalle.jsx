import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:4000/api";

export function AffichageSalle() {
    const [appels, setAppels] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppels = async () => {
        try {
            const response = await axios.get(`${API_BASE}/tickets/affichage-salle?limit=8`);
            setAppels(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erreur chargement appels:", error);
            setAppels([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppels();
        const interval = setInterval(fetchAppels, 4000); // Rafraîchissement toutes les 4 secondes
        return () => clearInterval(interval);
    }, []);

    const dernier = appels[0];
    const suivants = appels.slice(1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8 text-white overflow-hidden">
            {/* Titre */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white/90 mb-2">
                    Salle d'attente
                </h1>
                <p className="text-white/60 text-lg">Derniers appels</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-customRed border-t-transparent"></div>
                </div>
            ) : dernier ? (
                <>
                    {/* Appel en cours - TRÈS VISIBLE */}
                    <div className="w-full max-w-4xl mb-12">
                        <div className="bg-gradient-to-r from-customRed to-red-600 rounded-3xl p-12 md:p-16 shadow-2xl text-center animate-pulse-slow border-4 border-red-400/30">
                            <p className="text-2xl md:text-3xl font-semibold text-white/90 mb-4">
                                Prochain client
                            </p>
                            <p className="text-8xl md:text-9xl font-black tracking-tight mb-4">
                                #{dernier.numero}
                            </p>
                            <p className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-4">
                                <span className="material-icons text-5xl md:text-6xl">countertops</span>
                                Guichet {dernier.guichetLettre || '?'}
                            </p>
                            {dernier.nomService && (
                                <p className="text-xl md:text-2xl text-white/80 mt-4">
                                    {dernier.nomService}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Liste des appels précédents */}
                    {suivants.length > 0 && (
                        <div className="w-full max-w-4xl">
                            <p className="text-lg text-white/70 mb-4 text-center">Appels récents</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {suivants.map((appel, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center border border-white/20"
                                    >
                                        <p className="text-4xl md:text-5xl font-bold text-customRed">
                                            #{appel.numero}
                                        </p>
                                        <p className="text-xl font-semibold mt-2">
                                            Guichet {appel.guichetLettre || '?'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-32">
                    <span className="material-icons text-9xl text-white/30 mb-6">hourglass_empty</span>
                    <p className="text-3xl font-medium text-white/70">Aucun appel en cours</p>
                    <p className="text-xl text-white/50 mt-2">En attente des prochains clients</p>
                </div>
            )}

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.9; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
