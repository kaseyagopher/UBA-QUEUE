import { useContext, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminContext from '../../contexts/AdminContext';

export function EvaluationPerformance() {
    const { setTitle } = useContext(AdminContext);

    useEffect(() => {
        setTitle('Évaluation du Système');
    }, [setTitle]);

    const stats = {
        servi: 120,
        nonServi: 30,
        absent: 20,
        enAttente: 50
    };

    const data = [
        { name: 'Servi', valeur: stats.servi, fill: '#4CAF50' },
        { name: 'Non Servi', valeur: stats.nonServi, fill: '#FF5733' },
        { name: 'Absent', valeur: stats.absent, fill: '#FFC107' },
        { name: 'En Attente', valeur: stats.enAttente, fill: '#2196F3' }
    ];

    return (
        <>
            <div className="grid grid-cols-4 gap-4 mt-10">
                <div className="p-4 bg-green-500 text-white text-center rounded-lg">
                    <h3 className="text-xl font-bold">Clients Servis</h3>
                    <p className="text-3xl font-bold">{stats.servi}</p>
                </div>
                <div className="p-4 bg-customRed text-white text-center rounded-lg">
                    <h3 className="text-xl font-bold">Non Servis</h3>
                    <p className="text-3xl font-bold">{stats.nonServi}</p>
                </div>
                <div className="p-4 bg-yellow-500 text-white text-center rounded-lg">
                    <h3 className="text-xl font-bold">Absents</h3>
                    <p className="text-3xl font-bold">{stats.absent}</p>
                </div>
                <div className="p-4 bg-blue-500 text-white text-center rounded-lg">
                    <h3 className="text-xl font-bold">En Attente</h3>
                    <p className="text-3xl font-bold">{stats.enAttente}</p>
                </div>
            </div>

            {/* Histogramme */}
            <div className="mt-10 bg-gray-100 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-5">Histogramme des Statistiques</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="valeur" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}
