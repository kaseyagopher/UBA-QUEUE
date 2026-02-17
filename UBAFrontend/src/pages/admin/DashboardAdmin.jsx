import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import AdminContext from '../../contexts/AdminContext';

export function Dashboard() {
    const { setTitle } = useContext(AdminContext);

    useEffect(() => {
        setTitle('Tableau de Bord ');
    }, [setTitle]);

    const [dashboardData, setDashboardData] = useState({
        clientsServis: { value: 0, change: "+0%", trend: "neutral" },
        clientsEnAttente: { value: 0, trend: "neutral" },
        tempsAttenteMoyen: { value: "0 min", change: "-0%", trend: "neutral" },
        agentsActifs: { value: 0, total: 0, disponibles: 0, enPause: 0, indisponibles: 0 },
        performanceMoyenne: { value: "0%", trend: "neutral" },
        repartitionServices: [],
        activiteHoraire: [],
        totalClients: 0,
        tendances: {
            aujourdhui: 0,
            hier: 0,
            evolutionJour: "0%",
            cetteSemaine: 0,
            semaineDerniere: 0,
            evolutionSemaine: "0%"
        }
    });

    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Mettre à jour l'heure actuelle
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Charger les vraies données
    useEffect(() => {
        fetchDashboardData();

        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:4000/api/admin/dashboard");

            if (response.data.success) {
                const data = response.data.data;

                // ✅ CORRECTION : data.global est un tableau, on prend le premier élément
                const globalData = data.global && data.global.length > 0 ? data.global[0] : {};

                // ✅ Calcul des indisponibles
                const totalAgents = globalData.totalAgents || 0;
                const disponibles = globalData.agentsDisponibles || 0;
                const enPause = globalData.agentsPause || 0;
                const occupes = globalData.agentsOccupes || 0;
                const indisponibles = totalAgents - disponibles - enPause - occupes;

                // Mettre à jour toutes les données
                setDashboardData(prev => ({
                    ...prev,
                    clientsServis: {
                        value: globalData.clientsServis || 0,
                        change: calculateChange(globalData.clientsServis, data.tendances?.hier),
                        trend: getTrendFromValue(globalData.clientsServis, data.tendances?.hier)
                    },
                    clientsEnAttente: {
                        value: globalData.clientsEnAttente || 0,
                        trend: (globalData.clientsEnAttente || 0) > 5 ? "up" : "down"
                    },
                    tempsAttenteMoyen: {
                        value: (globalData.tempsAttenteMoyen || 0) + " min",
                        change: (globalData.tempsAttenteMoyen || 0) < 10 ? "-8%" : "+5%",
                        trend: (globalData.tempsAttenteMoyen || 0) < 10 ? "up" : "down"
                    },
                    agentsActifs: {
                        value: disponibles,
                        total: totalAgents,
                        disponibles: disponibles,
                        enPause: enPause,
                        indisponibles: indisponibles
                    },
                    performanceMoyenne: {
                        value: (globalData.performanceMoyenne || 85) + "%",
                        trend: (globalData.performanceMoyenne || 85) > 80 ? "up" : "down"
                    },
                    repartitionServices: data.repartitionServices || [],
                    activiteHoraire: data.activiteHoraire || [],
                    totalClients: globalData.totalClients || 0,
                    tendances: data.tendances || {
                        aujourdhui: 0,
                        hier: 0,
                        evolutionJour: "0%",
                        cetteSemaine: 0,
                        semaineDerniere: 0,
                        evolutionSemaine: "0%"
                    }
                }));

               // toast.success("Données mises à jour");
            }
        } catch (error) {
            console.error("❌ Erreur chargement données:", error);
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour calculer le pourcentage de changement
    const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return "+0%";
        const change = ((current - previous) / previous * 100).toFixed(1);
        return change > 0 ? `+${change}%` : `${change}%`;
    };

    // Fonction pour déterminer la tendance
    const getTrendFromValue = (current, previous) => {
        if (!previous || previous === 0) return "neutral";
        return current > previous ? "up" : "down";
    };

    const handleRefresh = () => {
        fetchDashboardData();
    };

    const getTrendColor = (trend) => {
        switch(trend) {
            case 'up': return 'bg-green-100 text-green-800';
            case 'down': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTrendIcon = (trend) => {
        switch(trend) {
            case 'up': return 'trending_up';
            case 'down': return 'trending_down';
            default: return 'trending_flat';
        }
    };

    // Calcul du total des clients pour l'activité horaire
    const totalActivite = dashboardData.activiteHoraire.reduce((sum, hour) => sum + hour.clients, 0);

    return (
        <>
            <ToastContainer />

            <div className="p-4">
                {/* En-tête avec tendances */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 ">
                    <div>
                        <div className="flex items-center mt-2 text-gray-600">
                            <span className="material-icons text-gray-500 mr-2">calendar_today</span>
                            <div>
                                <div className="text-sm">
                                    {currentTime.toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="text-xs">
                                    Dernière mise à jour: {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Indicateur de chargement */}
                {loading && (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-customRed"></div>
                        <span className="ml-3 text-gray-600">Chargement des données...</span>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Grille des métriques principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Carte Clients Servis */}
                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Clients Servis</p>
                                        <h3 className="text-3xl font-bold text-gray-800 mt-2">
                                            {dashboardData.clientsServis.value}
                                        </h3>
                                    </div>

                                </div>

                            </div>

                            {/* Carte Clients en Attente */}
                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Clients en Attente</p>
                                        <h3 className="text-3xl font-bold text-gray-800 mt-2">
                                            {dashboardData.clientsEnAttente.value}
                                        </h3>
                                    </div>

                                </div>

                            </div>

                            {/* Carte Temps d'Attente Moyen */}
                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Temps d'Attente Moyen</p>
                                        <h3 className="text-3xl font-bold text-gray-800 mt-2">
                                            {dashboardData.tempsAttenteMoyen.value}
                                        </h3>
                                    </div>

                                </div>
                                
                            </div>

                        </div>

                        {/* Deuxième ligne - Graphiques */}
                        <div className=" gap-6 mb-8">
                            {/* Activité horaire */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Activité Horaire</h3>
                                    <div className="text-sm text-gray-500">
                                        {totalActivite} clients aujourd'hui
                                    </div>
                                </div>
                                <div className="h-64 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-end justify-between p-4">
                                    {dashboardData.activiteHoraire.map((hour, index) => {
                                        const maxClients = Math.max(...dashboardData.activiteHoraire.map(h => h.clients), 1);
                                        return (
                                            <div key={index} className="flex flex-col items-center flex-1 mx-1">
                                                <div
                                                    className="w-full max-w-[30px] bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all hover:opacity-90"
                                                    style={{
                                                        height: `${Math.max(10, (hour.clients / maxClients) * 100)}%`,
                                                        minHeight: '10px'
                                                    }}
                                                    title={`${hour.heure}: ${hour.clients} clients`}
                                                ></div>
                                                <span className="text-xs text-gray-600 mt-2">{hour.heure}</span>
                                                <span className="text-xs font-medium text-gray-800 mt-1">{hour.clients}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 text-center text-sm text-gray-500">
                                    Heures d'ouverture: 8h - 18h
                                </div>
                            </div>
                        </div>

                        {/* Répartition par service */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Répartition par Service</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {dashboardData.repartitionServices.length > 0 ? (
                                    dashboardData.repartitionServices.map((service, index) => {
                                        const totalClients = dashboardData.repartitionServices.reduce((sum, s) => sum + s.value, 0);
                                        const percentage = totalClients > 0 ? Math.round((service.value / totalClients) * 100) : 0;
                                        const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];
                                        const icons = ['account_balance', 'desk', 'support', 'business'];

                                        return (
                                            <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className={`p-3 rounded-lg ${colors[index % colors.length].replace('bg-', 'bg-').replace('500', '100')} inline-block mb-3`}>
                                                            <span className={`material-icons ${colors[index % colors.length].replace('bg-', 'text-')}`}>{icons[index % icons.length]}</span>
                                                        </div>
                                                        <h4 className="font-semibold text-gray-800">{service.name}</h4>
                                                    </div>
                                                    <span className="text-2xl font-bold text-gray-900">{service.value}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-sm text-gray-500">{percentage}% du total</span>
                                                    <span className="text-sm font-medium text-gray-700">{service.value} clients</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-4 text-center py-8 text-gray-500">
                                        Aucune donnée disponible
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="mt-8 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                <span className="material-icons text-green-500 text-sm mr-1">info</span>
                                Données mises à jour en temps réel
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleRefresh}
                                    className="bg-customRed hover:bg-red-700 text-white px-6 py-2 rounded-lg items-center flex transition-colors"
                                >
                                    <span className="material-icons pr-2">refresh</span>
                                    Actualiser
                                </button>
                                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg items-center flex transition-colors">
                                    <span className="material-icons pr-2">download</span>
                                    Exporter
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Indicateurs */}
                <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center">
                            <span className="material-icons text-green-500 mr-2">check_circle</span>
                            <span className="text-sm text-gray-700">Système opérationnel</span>
                        </div>
                        <div className="flex items-center">
                            <span className="material-icons text-blue-500 mr-2">schedule</span>
                            <span className="text-sm text-gray-700">
                                Temps restant: {Math.max(0, 18 - currentTime.getHours())}h
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className="material-icons text-purple-500 mr-2">trending_up</span>
                            <span className="text-sm text-gray-700">
                                Performance: {dashboardData.performanceMoyenne.value}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}