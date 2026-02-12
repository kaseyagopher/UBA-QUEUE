const db = require('../config/db');

const Service = {
    // Créer un service
    create: (nomservice, descriptionService, callback) => {
        const sql = "INSERT INTO Service (nomService, description) VALUES (?, ?)";
        db.query(sql, [nomservice, descriptionService], (err, result) => {
            if (err) return callback(err, null);

            // Récupérer le service créé
            const selectSql = "SELECT * FROM Service WHERE id = ?";
            db.query(selectSql, [result.insertId], (err, rows) => {
                if (err) return callback(err, null);
                callback(null, rows[0]);
            });
        });
    },

    // Récupérer tous les services
    getAll: (callback) => {
        const sql = "SELECT * FROM Service ORDER BY created_at DESC";
        db.query(sql, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Récupérer un service par ID
    getById: (id, callback) => {
        const sql = "SELECT * FROM Service WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]);
        });
    },

    // Mettre à jour un service
    update: (id, nomservice, descriptionService, callback) => {
        const sql = "UPDATE Service SET nomService = ?, description = ?, updated_at = NOW() WHERE id = ?";
        db.query(sql, [nomservice, descriptionService, id], (err, result) => {
            if (err) return callback(err, null);

            if (result.affectedRows === 0) {
                return callback(new Error("Service non trouvé"), null);
            }

            // Récupérer le service mis à jour
            const selectSql = "SELECT * FROM Service WHERE id = ?";
            db.query(selectSql, [id], (err, rows) => {
                if (err) return callback(err, null);
                callback(null, rows[0]);
            });
        });
    },

    // Supprimer un service
    delete: (id, callback) => {
        // Vérifier d'abord si le service a des agents associés
        const checkSql = "SELECT COUNT(*) as count FROM utilisateur WHERE idService = ?";
        db.query(checkSql, [id], (err, results) => {
            if (err) return callback(err, null);

            if (results[0].count > 0) {
                return callback(new Error("Impossible de supprimer : ce service a des agents associés"), null);
            }

            // Vérifier si le service a des tickets
            const checkTicketSql = "SELECT COUNT(*) as count FROM ticket WHERE idService = ?";
            db.query(checkTicketSql, [id], (err, ticketResults) => {
                if (err) return callback(err, null);

                if (ticketResults[0].count > 0) {
                    return callback(new Error("Impossible de supprimer : ce service a des tickets associés"), null);
                }

                // Supprimer le service
                const deleteSql = "DELETE FROM Service WHERE id = ?";
                db.query(deleteSql, [id], (err, result) => {
                    if (err) return callback(err, null);

                    if (result.affectedRows === 0) {
                        return callback(new Error("Service non trouvé"), null);
                    }

                    callback(null, { message: "Service supprimé avec succès", id });
                });
            });
        });
    },

    // Récupérer les statistiques d'un service
    getStats: (id, callback) => {
        const sql = `
            SELECT 
                s.*,
                COUNT(DISTINCT u.id) as nombreAgents,
                COUNT(DISTINCT t.id) as nombreTickets,
                SUM(CASE WHEN t.statut = 'en_attente' THEN 1 ELSE 0 END) as ticketsEnAttente,
                SUM(CASE WHEN t.statut = 'servi' THEN 1 ELSE 0 END) as ticketsServis,
                AVG(t.tempsAttente) as tempsAttenteMoyen
            FROM Service s
            LEFT JOIN utilisateur u ON u.idService = s.id
            LEFT JOIN ticket t ON t.idService = s.id AND DATE(t.created_at) = CURDATE()
            WHERE s.id = ?
            GROUP BY s.id
        `;
        db.query(sql, [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0] || null);
        });
    },

    // Récupérer tous les services avec leurs statistiques
    getAllWithStats: (callback) => {
        const sql = `
            SELECT 
                s.*,
                COUNT(DISTINCT u.id) as nombreAgents,
                COUNT(DISTINCT t.id) as nombreTickets,
                SUM(CASE WHEN t.statut = 'en_attente' THEN 1 ELSE 0 END) as ticketsEnAttente
            FROM Service s
            LEFT JOIN utilisateur u ON u.idService = s.id
            LEFT JOIN ticket t ON t.idService = s.id AND DATE(t.created_at) = CURDATE()
            GROUP BY s.id
            ORDER BY s.created_at DESC
        `;
        db.query(sql, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Rechercher des services
    search: (term, callback) => {
        const sql = `
            SELECT * FROM Service 
            WHERE nomService LIKE ? OR description LIKE ?
            ORDER BY nomService ASC
        `;
        const searchTerm = `%${term}%`;
        db.query(sql, [searchTerm, searchTerm], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }
};

module.exports = Service;