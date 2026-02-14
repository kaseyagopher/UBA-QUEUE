const Statistique = require("../models/Statistique");

// Récupérer toutes les données pour le dashboard
exports.getDashboardData = (req, res) => {
    let dashboardData = {};

    // ✅ Utiliser les BONS noms de fonctions du modèle
    Statistique.getGlobalStats((err, globalStats) => {
        if (err) {
            console.error("❌ Erreur stats globales:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des données"
            });
        }

        dashboardData.global = globalStats;

        Statistique.getServiceStats((err, repartition) => {
            if (err) {
                console.error("❌ Erreur répartition:", err);
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération des données"
                });
            }

            dashboardData.repartitionServices = repartition;

            Statistique.getHourlyActivity((err, activite) => {
                if (err) {
                    console.error("❌ Erreur activité horaire:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la récupération des données"
                    });
                }

                dashboardData.activiteHoraire = activite;

                Statistique.getTrends((err, tendances) => {
                    if (err) {
                        console.error("❌ Erreur tendances:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Erreur lors de la récupération des données"
                        });
                    }

                    dashboardData.tendances = tendances;

                    res.status(200).json({
                        success: true,
                        data: dashboardData
                    });
                });
            });
        });
    });
};

// Route séparée pour les stats globales
exports.getGlobalStats = (req, res) => {
    Statistique.getGlobalStats((err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.status(200).json({ success: true, data });
    });
};

// Route séparée pour la répartition
exports.getServiceStats = (req, res) => {
    Statistique.getServiceStats((err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.status(200).json({ success: true, data });
    });
};

// Route séparée pour l'activité horaire
exports.getHourlyActivity = (req, res) => {
    Statistique.getHourlyActivity((err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.status(200).json({ success: true, data });
    });
};

// Route séparée pour les tendances
exports.getTrends = (req, res) => {
    Statistique.getTrends((err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.status(200).json({ success: true, data });
    });
};

// controllers/StatistiqueController.js
exports.getPerformancesAgents = (req, res) => {
    const db = require("../config/db");

    const sql = `
        SELECT 
            u.id,
            u.nom,
            u.prenom,
            u.postnom,
            u.email,
            u.statut,
            s.nomService as service,
            COUNT(DISTINCT t.id) as ticketsTraites,
            COUNT(DISTINCT CASE WHEN DATE(t.created_at) = CURDATE() THEN t.id END) as ticketsAujourdhui,
            COALESCE(ROUND(AVG(t.tempsAttente)), 0) as tempsMoyen,
            COALESCE(ROUND(AVG(t.tempsService)), 0) as tempsServiceMoyen
        FROM utilisateur u
        LEFT JOIN service s ON s.id = u.idService
        LEFT JOIN ticket t ON t.idUtilisateur = u.id
        WHERE u.role = 'agent'
        GROUP BY u.id, u.nom, u.prenom, u.postnom, u.email, u.statut, s.nomService
        ORDER BY ticketsAujourdhui DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Erreur performances agents:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des performances"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
};