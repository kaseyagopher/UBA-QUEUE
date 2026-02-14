const db = require("../config/db");

const Statistique = {
    // ⚠️ Attention : Ne pas appeler cette fonction "getDashboardData" !
    // Renommons-la pour éviter la confusion avec le contrôleur
    getGlobalStats: (callback) => {
        const sql = `
            SELECT 
                -- Clients servis aujourd'hui
                (SELECT COUNT(*) FROM Ticket WHERE DATE(created_at) = CURDATE() AND statut = 'servi') as clientsServis,
                
                -- Clients en attente
                (SELECT COUNT(*) FROM Ticket WHERE statut = 'en_attente') as clientsEnAttente,
                
                -- Temps d'attente moyen aujourd'hui
                (SELECT COALESCE(ROUND(AVG(tempsAttente)), 0) FROM Ticket 
                 WHERE DATE(created_at) = CURDATE() AND tempsAttente IS NOT NULL) as tempsAttenteMoyen,
                
                -- Taux de satisfaction (simulé)
                85 as tauxSatisfaction,
                
                -- Agents
                (SELECT COUNT(*) FROM utilisateur WHERE role = 'agent') as totalAgents,
                (SELECT COUNT(*) FROM utilisateur WHERE role = 'agent' AND statut = 'disponible') as agentsDisponibles,
                (SELECT COUNT(*) FROM utilisateur WHERE role = 'agent' AND statut = 'pause') as agentsPause,
                (SELECT COUNT(*) FROM utilisateur WHERE role = 'agent' AND statut = 'occupe') as agentsOccupes,
                
                -- Performance moyenne
                (SELECT COALESCE(ROUND(AVG(perf)), 85) FROM (
                    SELECT COUNT(*) * 10 as perf 
                    FROM ticket 
                    WHERE idUtilisateur IS NOT NULL AND DATE(created_at) = CURDATE()
                    GROUP BY idUtilisateur
                ) as p) as performanceMoyenne,
                
                -- Total clients
                (SELECT COUNT(*) FROM client) as totalClients
        `;

        db.query(sql, callback);
    },

    // Récupérer la répartition par service
    getServiceStats: (callback) => {
        const sql = `
            SELECT 
                s.nomService as name,
                COUNT(DISTINCT t.id) as value
            FROM service s
            LEFT JOIN ticket t ON t.idService = s.id AND DATE(t.created_at) = CURDATE()
            GROUP BY s.id, s.nomService
            ORDER BY value DESC
        `;

        db.query(sql, callback);
    },

    // Récupérer l'activité horaire
    getHourlyActivity: (callback) => {
        const sql = `
            SELECT 
                HOUR(heureArrivee) as heure,
                COUNT(*) as clients
            FROM ticket
            WHERE DATE(created_at) = CURDATE()
            GROUP BY HOUR(heureArrivee)
            ORDER BY heure ASC
        `;

        db.query(sql, (err, results) => {
            if (err) return callback(err, null);

            // Formater pour les heures d'ouverture (8h-18h)
            const activite = [];
            for (let h = 8; h <= 17; h++) {
                const found = results.find(r => r.heure === h);
                activite.push({
                    heure: `${h}h-${h+1}h`,
                    clients: found ? found.clients : 0
                });
            }

            callback(null, activite);
        });
    },

    // Récupérer les tendances
    getTrends: (callback) => {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM ticket WHERE DATE(created_at) = CURDATE()) as aujourdhui,
                (SELECT COUNT(*) FROM ticket WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) as hier,
                (SELECT COUNT(*) FROM ticket WHERE YEARWEEK(created_at) = YEARWEEK(CURDATE())) as cetteSemaine,
                (SELECT COUNT(*) FROM ticket WHERE YEARWEEK(created_at) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY))) as semaineDerniere
        `;

        db.query(sql, (err, results) => {
            if (err) return callback(err, null);

            const data = results[0];

            // Calculer les évolutions
            const evolutionJour = data.hier > 0
                ? ((data.aujourdhui - data.hier) / data.hier * 100).toFixed(1)
                : 0;
            const evolutionSemaine = data.semaineDerniere > 0
                ? ((data.cetteSemaine - data.semaineDerniere) / data.semaineDerniere * 100).toFixed(1)
                : 0;

            callback(null, {
                ...data,
                evolutionJour: evolutionJour + '%',
                evolutionSemaine: evolutionSemaine + '%'
            });
        });
    }
};

module.exports = Statistique;