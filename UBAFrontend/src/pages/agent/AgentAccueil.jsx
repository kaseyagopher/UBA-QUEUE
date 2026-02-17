import { useEffect, useState } from 'react';
import axios from "axios";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/ReactToastify.css";
import AgentHeader from '../../components/AgentHeader.jsx';

export function AgentAccueil() {
    const [user, setUser] = useState(null);
    const [service, setService] = useState(null);
    const [guichet, setGuichet] = useState(null);
    const [stats, setStats] = useState({
        aujourdhui: { total: 0, servis: 0, enAttente: 0, absents: 0 },
        tempsMoyen: 0,
        fileAttente: 0,
        activiteHoraire: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Agent - Accueil";
        fetchUser();

        const interval = setInterval(() => {
            if (user?.idService) fetchStats();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user?.idService) {
            fetchService(user.idService);
            fetchGuichet(user.id);
            fetchStats();
        }
    }, [user]);

    const fetchUser = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/profile", {
                withCredentials: true
            });
            setUser(response.data);
        } catch (error) {
            console.error("Erreur utilisateur:", error);
            toast.error("Erreur de chargement du profil");
        }
    };

    const fetchService = async (serviceId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/services/${serviceId}`);
            setService(response.data);
        } catch (error) {
            console.error("Erreur service:", error);
        }
    };

    const fetchGuichet = async (agentId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/guichets/agent/${agentId}`);
            setGuichet(response.data[0] || null);
        } catch (error) {
            console.error("Erreur guichet:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!user?.idService) return;
        try {
            // Statistiques du jour pour le service (inclut déjà activiteHoraire côté backend)
            const statsResponse = await axios.get(
                `http://localhost:4000/api/tickets/stats/service/${user.idService}`
            );

            setStats(statsResponse.data || {
                aujourdhui: { total: 0, servis: 0, enAttente: 0, absents: 0 },
                tempsMoyen: 0,
                fileAttente: 0,
                activiteHoraire: []
            });
        } catch (error) {
            console.error("Erreur stats:", error);
        }
    };

    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

    const pieData = [
        { name: 'Servis', value: stats.aujourdhui?.servis || 0, color: '#10B981' },
        { name: 'En attente', value: stats.aujourdhui?.enAttente || 0, color: '#F59E0B' },
        { name: 'Absents', value: stats.aujourdhui?.absents || 0, color: '#EF4444' }
    ].filter(item => item.value > 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-customRed"></div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <AgentHeader
                    title="Tableau de bord"
                    serviceName={service?.nomService}
                    agentName={`${user?.nom || ''} ${user?.postnom || ''}`.trim()}
                    guichetLetter={guichet?.lettre || 'Non assigné'}
                />

                {/* KPIs principaux */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">Clients servis</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.aujourdhui?.servis || 0}</h3>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <span className="material-icons text-green-600">check_circle</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Aujourd'hui</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">En attente</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.aujourdhui?.enAttente || 0}</h3>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <span className="material-icons text-orange-600">hourglass_top</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Actuellement</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">Temps moyen</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.tempsMoyen || 0} min</h3>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <span className="material-icons text-blue-600">schedule</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Par client</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">Total clients</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.aujourdhui?.total || 0}</h3>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <span className="material-icons text-purple-600">people</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Aujourd'hui</p>
                    </div>
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Activité horaire */}
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Activité horaire</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.activiteHoraire}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="heure" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="clients" fill="#E31F26" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Répartition des tickets */}
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des tickets</h3>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>
                </div>

                {/* File d'attente (aperçu sans détails clients) */}
                <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">File d'attente en temps réel</h3>
                        <span className="px-4 py-2 bg-customRed text-white rounded-lg text-sm font-semibold">
                            {stats.aujourdhui?.enAttente || 0} en attente
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                            <p className="text-sm text-blue-600">Temps d'attente moyen</p>
                            <p className="text-2xl font-bold text-blue-800">{stats.tempsMoyen || 0} min</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                            <p className="text-sm text-green-600">Clients servis/heure</p>
                            <p className="text-2xl font-bold text-green-800">
                                {Math.round((stats.aujourdhui?.servis || 0) / 8)} /h
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                            <p className="text-sm text-purple-600">Taux de satisfaction</p>
                            <p className="text-2xl font-bold text-purple-800">
                                {stats.aujourdhui?.total > 0
                                    ? Math.round((stats.aujourdhui?.servis / stats.aujourdhui?.total) * 100)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}