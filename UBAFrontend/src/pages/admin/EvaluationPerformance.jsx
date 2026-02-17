import { useContext, useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/ReactToastify.css";
import AdminContext from '../../contexts/AdminContext';

export function EvaluationPerformance() {
    const { setTitle } = useContext(AdminContext);
    const [timeRange, setTimeRange] = useState('semaine');
    const [viewMode, setViewMode] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Données réelles
    const [globalStats, setGlobalStats] = useState({
        totalClients: 0,
        servis: 0,
        nonServis: 0,
        absents: 0,
        annules: 0,
        enAttente: 0,
        tempsAttenteMoyen: 0,
        tempsAttenteMin: 0,
        tempsAttenteMax: 0,
        efficaciteSysteme: 0,
        tauxOccupationAgents: 0
    });

    const [performanceAgents, setPerformanceAgents] = useState([]);
    const [performanceServices, setPerformanceServices] = useState([]);
    const [clientStatusData, setClientStatusData] = useState([]);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        setTitle("Évaluation du Système");
        fetchAllEvaluationData();

        const interval = setInterval(fetchAllEvaluationData, 60000);
        return () => clearInterval(interval);
    }, [timeRange, viewMode, selectedDate]);

    const fetchAllEvaluationData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchGlobalStats(),
                fetchAgentsPerformance(),
                fetchServicesPerformance(),
                fetchTimeSeriesData(),
                fetchAlerts()
            ]);

            generateRecommendations();

        } catch (error) {
            console.error("❌ Erreur chargement données:", error);
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalStats = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/stats/globales");
            const data = response.data.data;

            const ticketsResponse = await axios.get("http://localhost:4000/api/tickets/en-attente");
            const ticketsEnAttente = ticketsResponse.data.length;

            const agentsResponse = await axios.get("http://localhost:4000/api/users?role=agent");
            const agents = agentsResponse.data;
            const agentsDisponibles = agents.filter(a => a.statut === 'disponible').length;
            const tauxOccupation = agents.length > 0
                ? ((agents.length - agentsDisponibles) / agents.length * 100).toFixed(1)
                : 0;

            const totalTickets = data.clientsServis + ticketsEnAttente;
            const efficacite = totalTickets > 0
                ? (data.clientsServis / totalTickets * 100).toFixed(1)
                : 0;

            setGlobalStats({
                totalClients: data.totalClients || 0,
                servis: data.clientsServis || 0,
                nonServis: data.nonServis || 0,
                absents: data.absents || 0,
                annules: data.annules || 0,
                enAttente: ticketsEnAttente,
                tempsAttenteMoyen: data.tempsAttenteMoyen || 0,
                tempsAttenteMin: data.tempsAttenteMin || 0,
                tempsAttenteMax: data.tempsAttenteMax || 0,
                efficaciteSysteme: efficacite,
                tauxOccupationAgents: tauxOccupation
            });

        } catch (error) {
            console.error("❌ Erreur stats globales:", error);
        }
    };

    const fetchAgentsPerformance = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/stats/performances-agents");

            if (response.data.success) {
                const agents = response.data.data || [];
                const formattedAgents = agents.map(agent => ({
                    id: agent.id,
                    nom: `${agent.prenom || ''} ${agent.nom || ''}`.trim() || 'Agent',
                    service: agent.service || 'Non assigné',
                    clients: agent.ticketsAujourdhui || 0,
                    totalClients: agent.ticketsTraites || 0,
                    statut: agent.statut || 'inconnu',
                    tempsMoyen: agent.tempsMoyen || 0,
                    performance: agent.ticketsTraites > 0
                        ? Math.min(100, Math.round((agent.ticketsTraites / (agent.ticketsTraites + 2)) * 100))
                        : 0
                }));

                setPerformanceAgents(formattedAgents);
            }
        } catch (error) {
            console.error("❌ Erreur performances agents:", error);
            setPerformanceAgents([]);
        }
    };

    const fetchServicesPerformance = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/stats/performances-services");
            const services = response.data.data || [];

            const formattedServices = services.map(service => ({
                id: service.id,
                nom: service.nom,
                totalTickets: service.totalTickets || 0,
                servis: service.servis || 0,
                enAttente: service.enAttente || 0,
                absents: service.absents || 0,
                annules: service.annules || 0,
                tempsAttenteMoyen: service.tempsAttenteMoyen || 0,
                tempsServiceMoyen: service.tempsServiceMoyen || 0,
            }));

            setPerformanceServices(formattedServices);

            const clientStatus = [
                { name: 'Servis', value: globalStats.servis, color: '#10B981' },
                { name: 'En Attente', value: globalStats.enAttente, color: '#F59E0B' },
                { name: 'Absents', value: globalStats.absents, color: '#EF4444' },
                { name: 'Annulés', value: globalStats.annules, color: '#8B5CF6' }
            ].filter(item => item.value > 0);

            setClientStatusData(clientStatus);

        } catch (error) {
            console.error("❌ Erreur performances services:", error);
            setPerformanceServices([]);
        }
    };

    const fetchTimeSeriesData = async () => {
        try {
            let url = "http://localhost:4000/api/stats/activite-horaire";

            if (timeRange === 'semaine') {
                url = "http://localhost:4000/api/stats/activite-hebdo";
            } else if (timeRange === 'mois') {
                url = "http://localhost:4000/api/stats/activite-mensuelle";
            }

            const response = await axios.get(url);
            const data = response.data.data || [];

            let formattedData = [];

            switch(timeRange) {
                case 'jour':
                    formattedData = data.map(h => ({
                        periode: h.heure,
                        clients: h.clients
                    }));
                    break;
                case 'semaine':
                    formattedData = data.map(j => ({
                        periode: j.jour,
                        clients: j.clients
                    }));
                    break;
                case 'mois':
                    formattedData = data.map(j => ({
                        periode: j.jour,
                        clients: j.clients
                    }));
                    break;
                default:
                    formattedData = data;
            }

            setTimeSeriesData(formattedData);

        } catch (error) {
            console.error("❌ Erreur données temporelles:", error);
        }
    };

    const fetchAlerts = async () => {
        const newAlerts = [];

        if (globalStats.enAttente > 20) {
            newAlerts.push({
                type: 'warning',
                title: 'File d\'attente critique',
                message: `${globalStats.enAttente} clients en attente`
            });
        }

        if (globalStats.tempsAttenteMoyen > 20) {
            newAlerts.push({
                type: 'danger',
                title: 'Temps d\'attente élevé',
                message: `Moyenne: ${globalStats.tempsAttenteMoyen} min`
            });
        }

        try {
            const agentsResponse = await axios.get("http://localhost:4000/api/users?role=agent");
            const agents = agentsResponse.data || [];
            const absents = agents.filter(a => a.statut === 'absent').length;
            if (absents > 2) {
                newAlerts.push({
                    type: 'warning',
                    title: 'Absentéisme élevé',
                    message: `${absents} agents absents`
                });
            }
        } catch (error) {
            console.error("Erreur récupération agents:", error);
        }

        setAlerts(newAlerts.slice(0, 5));
    };

    const generateRecommendations = () => {
        const recos = [];

        if (globalStats.tempsAttenteMoyen > 20) {
            recos.push({
                type: 'warning',
                text: 'Le temps d\'attente moyen est élevé. Envisagez d\'ajouter des agents aux heures de pointe.'
            });
        }

        if (globalStats.tauxOccupationAgents > 90) {
            recos.push({
                type: 'warning',
                text: 'Les agents sont surchargés. Réorganisez les plannings.'
            });
        }

        if (performanceServices.length > 0) {
            const topService = performanceServices.reduce((max, s) => s.clients > max.clients ? s : max, performanceServices[0]);
            recos.push({
                type: 'success',
                text: `Le service "${topService.nom}" est le plus sollicité (${topService.clients} clients).`
            });
        }

        setRecommendations(recos);
    };

    const getRecommendationIcon = (type) => {
        switch(type) {
            case 'success': return 'check_circle';
            case 'warning': return 'warning';
            case 'danger': return 'error';
            default: return 'lightbulb';
        }
    };

    const getRecommendationColor = (type) => {
        switch(type) {
            case 'success': return 'text-green-500';
            case 'warning': return 'text-amber-500';
            case 'danger': return 'text-red-500';
            default: return 'text-blue-500';
        }
    };

    const totalClients = globalStats.servis + globalStats.enAttente;

    // Formater la date pour l'affichage
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <>
            <ToastContainer />

            <div className="p-6 space-y-6">
                {/* En-tête avec titre et date */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="text-gray-600 mt-1">Analyse des performances</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Filtre de date */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                            >
                                <span className="material-icons text-gray-600">calendar_today</span>
                                <span>{selectedDate}</span>
                            </button>

                            {showDatePicker && (
                                <div className="absolute right-0 mt-2 bg-white p-4 rounded-lg shadow-lg border z-10">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setShowDatePicker(false);
                                        }}
                                        className="px-3 py-2 border rounded-lg"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        {/* Filtres de période */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {['jour', 'semaine', 'mois'].map((periode) => (
                                <button
                                    key={periode}
                                    onClick={() => setTimeRange(periode)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        timeRange === periode
                                            ? 'bg-white text-customRed shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {periode === 'jour' ? 'Jour' :
                                        periode === 'semaine' ? 'Semaine' : 'Mois'}
                                </button>
                            ))}
                        </div>

                        {/* Sélecteur de vue */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {['overview', 'agents', 'services'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === mode
                                            ? 'bg-white text-customRed shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {mode === 'overview' ? 'Vue globale' :
                                        mode === 'agents' ? 'Agents' : 'Services'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Date sélectionnée */}
                <div className="text-sm text-gray-500">
                    Données du {formatDate(selectedDate)}
                </div>

                {/* Alertes */}
                {alerts.length > 0 && (
                    <div className="space-y-2">
                        {alerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg flex items-start gap-3 ${
                                    alert.type === 'danger' ? 'bg-red-50 border-l-4 border-red-500' :
                                        alert.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                                            'bg-blue-50 border-l-4 border-blue-500'
                                }`}
                            >
                                <span className={`material-icons ${
                                    alert.type === 'danger' ? 'text-red-500' :
                                        alert.type === 'warning' ? 'text-yellow-500' :
                                            'text-blue-500'
                                }`}>
                                    {alert.type === 'danger' ? 'error' : 'warning'}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{alert.title}</p>
                                    <p className="text-sm text-gray-600">{alert.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-customRed"></div>
                        <span className="ml-3 text-gray-600">Chargement...</span>
                    </div>
                ) : (
                    <>
                        {/* Métriques principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Clients Servis</p>
                                        <p className="text-3xl font-bold text-green-900 mt-2">{globalStats.servis}</p>
                                    </div>
                                    <div className="bg-green-500 p-3 rounded-full">
                                        <span className="material-icons text-white">check_circle</span>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-green-600">
                                    {totalClients > 0 ? ((globalStats.servis / totalClients) * 100).toFixed(1) : 0}% du total
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">En Attente</p>
                                        <p className="text-3xl font-bold text-blue-900 mt-2">{globalStats.enAttente}</p>
                                    </div>
                                    <div className="bg-blue-500 p-3 rounded-full">
                                        <span className="material-icons text-white">schedule</span>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-blue-600">
                                    Temps moyen: {globalStats.tempsAttenteMoyen} min
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-800">Efficacité</p>
                                        <p className="text-3xl font-bold text-orange-900 mt-2">{globalStats.efficaciteSysteme}%</p>
                                    </div>
                                    <div className="bg-orange-500 p-3 rounded-full">
                                        <span className="material-icons text-white">trending_up</span>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-orange-600">
                                    Agents: {globalStats.tauxOccupationAgents}% occupés
                                </div>
                            </div>
                        </div>

                        {/* Graphiques principaux */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Activité temporelle */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Activité - {timeRange === 'jour' ? 'Horaire' : timeRange === 'semaine' ? 'Hebdomadaire' : 'Mensuelle'}
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={timeSeriesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="periode" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="clients" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Répartition des clients */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Clients</h3>
                                {clientStatusData.length > 0 ? (
                                    <div className="flex flex-col items-center">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={clientStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {clientStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            {clientStatusData.map((item, index) => (
                                                <div key={item.name} className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-sm text-gray-600">{item.name}</span>
                                                    <span className="font-medium">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                                        Aucune donnée
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vue par agents ou services */}
                        {viewMode === 'agents' ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance des Agents</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4">Agent</th>
                                            <th className="text-left py-3 px-4">Service</th>
                                            <th className="text-center py-3 px-4">Aujourd'hui</th>
                                            <th className="text-center py-3 px-4">Total</th>
                                            <th className="text-center py-3 px-4">Temps moyen</th>
                                            <th className="text-center py-3 px-4">Statut</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {performanceAgents.map((agent, index) => (
                                            <tr key={agent.id || index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-customRed flex items-center justify-center text-white font-bold mr-3">
                                                            {agent.nom.charAt(0)}
                                                        </div>
                                                        {agent.nom}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{agent.service}</td>
                                                <td className="py-3 px-4 text-center font-medium">{agent.clients}</td>
                                                <td className="py-3 px-4 text-center">{agent.totalClients}</td>
                                                <td className="py-3 px-4 text-center">{agent.tempsMoyen} min</td>
                                                <td className="py-3 px-4 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            agent.statut === 'disponible' ? 'bg-green-100 text-green-800' :
                                                                agent.statut === 'occupe' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {agent.statut}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : viewMode === 'services' ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance des Services</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {performanceServices.map((service) => (
                                        <div key={service.id || service.nom} className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-800 mb-2">{service.nom}</h4>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Total tickets:</span>
                                                    <span className="font-medium">{service.totalTickets}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Servis:</span>
                                                    <span className="font-medium text-green-700">{service.servis}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">En attente:</span>
                                                    <span className="font-medium text-amber-700">{service.enAttente}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Absents:</span>
                                                    <span className="font-medium text-red-700">{service.absents}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Annulés:</span>
                                                    <span className="font-medium text-purple-700">{service.annules}</span>
                                                </div>
                                                <div className="flex justify-between text-sm pt-1 border-t border-dashed border-gray-200">
                                                    <span className="text-gray-600">Temps d'attente moyen:</span>
                                                    <span className="font-medium">{service.tempsAttenteMoyen} min</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Temps de service moyen:</span>
                                                    <span className="font-medium">{service.tempsServiceMoyen} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Recommandations */}
                        {recommendations.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <span className="material-icons text-blue-600 mr-3">insights</span>
                                    <h3 className="text-lg font-semibold text-gray-800">Recommandations</h3>
                                </div>
                                <div className="space-y-3">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <span className={`material-icons ${getRecommendationColor(rec.type)} text-sm`}>
                                                {getRecommendationIcon(rec.type)}
                                            </span>
                                            <p className="text-sm text-gray-700">{rec.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}