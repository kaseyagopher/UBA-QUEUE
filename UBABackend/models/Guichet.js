const db = require('../config/db');

const Guichet = {
    // Créer un guichet
    create: (data, callback) => {
        const { lettre, idService, idUtilisateur } = data;

        const sql = `INSERT INTO guichet
                         (lettre, idService, idUtilisateur)
                     VALUES (?, ?, ?)`;

        db.query(sql, [lettre, idService, idUtilisateur || null], (err, result) => {
            if (err) return callback(err, null);

            // Récupérer le guichet créé
            const selectSql = `
                SELECT g.*,
                       s.nomService as serviceNom,
                       CONCAT(u.nom, ' ', u.prenom) as agentNom
                FROM guichet g
                         LEFT JOIN service s ON s.id = g.idService
                         LEFT JOIN utilisateur u ON u.id = g.idUtilisateur
                WHERE g.id = ?
            `;
            db.query(selectSql, [result.insertId], (err, rows) => {
                if (err) return callback(err, null);
                callback(null, rows[0]);
            });
        });
    },

    // Récupérer tous les guichets
    getAll: (callback) => {
        const sql = `
            SELECT g.*,
                   s.nomService as serviceNom,
                   CONCAT(u.nom, ' ', u.prenom) as agentNom,
                   (SELECT COUNT(*) FROM ticket t WHERE t.idGuichet = g.id AND DATE(t.created_at) = CURDATE()) as ticketsAujourdhui,
                (SELECT COUNT(*) FROM ticket t WHERE t.idGuichet = g.id AND t.statut = 'en_attente') as ticketsEnAttente
            FROM guichet g
                LEFT JOIN service s ON s.id = g.idService
                LEFT JOIN utilisateur u ON u.id = g.idUtilisateur
            ORDER BY g.lettre ASC
        `;
        db.query(sql, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Récupérer un guichet par ID
    getById: (id, callback) => {
        const sql = `
            SELECT g.*,
                   s.nomService as serviceNom,
                   CONCAT(u.nom, ' ', u.prenom) as agentNom
            FROM guichet g
                     LEFT JOIN service s ON s.id = g.idService
                     LEFT JOIN utilisateur u ON u.id = g.idUtilisateur
            WHERE g.id = ?
        `;
        db.query(sql, [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0] || null);
        });
    },

    // Récupérer les guichets par service
    getByServiceId: (serviceId, callback) => {
        const sql = `
            SELECT g.*,
                   CONCAT(u.nom, ' ', u.prenom) as agentNom
            FROM guichet g
                     LEFT JOIN utilisateur u ON u.id = g.idUtilisateur
            WHERE g.idService = ?
            ORDER BY g.lettre ASC
        `;
        db.query(sql, [serviceId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Récupérer les guichets par agent (ID utilisateur)
    getByAgentId: (agentId, callback) => {
        const sql = `
        SELECT g.*,
               s.nomService as serviceNom,
               CONCAT(u.nom, ' ', u.prenom) as agentNom
        FROM guichet g
                 LEFT JOIN service s ON s.id = g.idService
                 LEFT JOIN utilisateur u ON u.id = g.idUtilisateur
        WHERE g.idUtilisateur = ?
        ORDER BY g.lettre ASC
    `;
        db.query(sql, [agentId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Mettre à jour un guichet
    update: (id, data, callback) => {
        const { lettre, idService, idUtilisateur } = data;

        const sql = `UPDATE guichet
                     SET lettre = ?, idService = ?, idUtilisateur = ?, updated_at = NOW()
                     WHERE id = ?`;

        db.query(sql, [lettre, idService, idUtilisateur || null, id], (err, result) => {
            if (err) return callback(err, null);

            if (result.affectedRows === 0) {
                return callback(new Error("Guichet non trouvé"), null);
            }

            Guichet.getById(id, callback);
        });
    },

    // Supprimer un guichet
    delete: (id, callback) => {
        const checkSql = `SELECT COUNT(*) as count FROM ticket WHERE idGuichet = ? AND DATE(created_at) = CURDATE()`;

        db.query(checkSql, [id], (err, results) => {
            if (err) return callback(err, null);

            if (results[0].count > 0) {
                return callback(new Error("Impossible de supprimer : ce guichet a des tickets aujourd'hui"), null);
            }

            const deleteSql = "DELETE FROM guichet WHERE id = ?";
            db.query(deleteSql, [id], (err, result) => {
                if (err) return callback(err, null);

                if (result.affectedRows === 0) {
                    return callback(new Error("Guichet non trouvé"), null);
                }

                callback(null, { message: "Guichet supprimé avec succès", id });
            });
        });
    },

    // Assigner un agent à un guichet
    assignerAgent: (id, idUtilisateur, callback) => {
        const sql = "UPDATE guichet SET idUtilisateur = ?, updated_at = NOW() WHERE id = ?";

        db.query(sql, [idUtilisateur || null, id], (err, result) => {
            if (err) return callback(err, null);

            if (result.affectedRows === 0) {
                return callback(new Error("Guichet non trouvé"), null);
            }

            Guichet.getById(id, callback);
        });
    },

    // Vérifier si une lettre est déjà utilisée pour un service
    checkLettreExists: (lettre, idService, excludeId = null, callback) => {
        let sql = "SELECT id FROM guichet WHERE lettre = ? AND idService = ?";
        const params = [lettre, idService];

        if (excludeId) {
            sql += " AND id != ?";
            params.push(excludeId);
        }

        db.query(sql, params, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results.length > 0);
        });
    },

    // Récupérer les lettres disponibles pour un service
    getLettresDisponibles: (idService, callback) => {
        const sql = "SELECT lettre FROM guichet WHERE idService = ?";

        db.query(sql, [idService], (err, results) => {
            if (err) return callback(err, null);

            const lettresUtilisees = results.map(r => r.lettre);
            const toutesLettres = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
            const disponibles = toutesLettres.filter(l => !lettresUtilisees.includes(l));

            callback(null, disponibles);
        });
    }
};

module.exports = Guichet;