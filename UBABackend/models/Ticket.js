const db = require("../config/db");

const Ticket = {
    // Récupérer le prochain numéro de ticket
    getNextTicketNumber: (callback) => {
        const sql = "SELECT COUNT(*) AS total FROM Ticket";
        db.query(sql, (err, results) => {
            if (err) return callback(err, null);

            // Sécurité : si results[0] n'existe pas, retourner 0
            const total = results && results[0] ? results[0].total : 0;
            callback(null, total + 1);
        });
    },

    // Créer un nouveau ticket
    create: (ticketNumber, idService, clientId, callback) => {
        const heureArrivee = new Date();
        const statut = "en_attente"; // Changé : sans espace
        const sql = "INSERT INTO Ticket (numero, idService, heureArrivee, statut, idClient) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [ticketNumber, idService, heureArrivee, statut, clientId], (err, result) => {
            if (err) return callback(err, null);

            const selectSql = `
                SELECT t.*, c.nom, c.postnom, c.prenom
                FROM Ticket t
                         INNER JOIN Client c ON t.idClient = c.id
                WHERE t.id = ?
            `;
            db.query(selectSql, [result.insertId], (err, rows) => {
                if (err) return callback(err, null);
                callback(null, rows[0]);
            });
        });
    },

    // Récupérer tous les tickets en attente
    getPendingTickets: (callback) => {
        const sql = `
            SELECT t.*, c.nom, c.postnom, c.prenom
            FROM Ticket t
                     INNER JOIN Client c ON t.idClient = c.id
            WHERE t.statut = 'en_attente'
            ORDER BY t.heureArrivee ASC
        `;
        db.query(sql, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Récupérer le ticket en cours (appelé) pour un agent (après refresh)
    getTicketEnCoursByAgent: (agentId, callback) => {
        const sql = `
            SELECT t.*, c.nom, c.postnom, c.prenom
            FROM Ticket t
            INNER JOIN Client c ON t.idClient = c.id
            WHERE t.statut = 'appele' AND t.idUtilisateur = ?
            ORDER BY t.heureAppel DESC
            LIMIT 1
        `;
        db.query(sql, [agentId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0] || null);
        });
    },

    // Récupérer le prochain ticket en attente pour un service
    getNextPendingTicket: (serviceId, callback) => {
        const sql = `
            SELECT t.*, c.nom, c.postnom, c.prenom
            FROM Ticket t
                     INNER JOIN Client c ON t.idClient = c.id
            WHERE t.statut = 'en_attente' AND t.idService = ?
            ORDER BY t.heureArrivee ASC
                LIMIT 1
        `;
        db.query(sql, [serviceId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0] || null);
        });
    },

    // Récupérer les tickets en attente pour un service spécifique
    getPendingTicketsByService: (serviceId, callback) => {
        const sql = `
            SELECT t.*, c.nom, c.postnom, c.prenom
            FROM Ticket t
                     INNER JOIN Client c ON t.idClient = c.id
            WHERE t.statut = 'en_attente' AND t.idService = ?
            ORDER BY t.heureArrivee ASC
        `;
        db.query(sql, [serviceId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Récupérer un ticket par ID
    getById: (id, callback) => {
        const sql = `
            SELECT t.*, c.nom, c.postnom, c.prenom
            FROM Ticket t
                     INNER JOIN Client c ON t.idClient = c.id
            WHERE t.id = ?
        `;
        db.query(sql, [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0] || null);
        });
    },

    // Mettre à jour un ticket
    update: (id, data, callback) => {
        const fields = [];
        const values = [];

        if (data.statut) {
            fields.push('statut = ?');
            values.push(data.statut);
        }
        if (data.idUtilisateur) {
            fields.push('idUtilisateur = ?');
            values.push(data.idUtilisateur);
        }
        if (data.idGuichet) {
            fields.push('idGuichet = ?');
            values.push(data.idGuichet);
        }
        if (data.heureAppel) {
            fields.push('heureAppel = ?');
            values.push(data.heureAppel);
        }
        if (data.heureServi) {
            fields.push('heureServi = ?');
            values.push(data.heureServi);
        }
        if (data.tempsAttente) {
            fields.push('tempsAttente = ?');
            values.push(data.tempsAttente);
        }

        fields.push('updated_at = NOW()');

        if (fields.length === 0) return callback(new Error('Aucune donnée à mettre à jour'));

        const sql = `UPDATE Ticket SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);

        db.query(sql, values, (err, result) => {
            if (err) return callback(err, null);

            if (result.affectedRows === 0) {
                return callback(new Error("Ticket non trouvé"), null);
            }

            Ticket.getById(id, callback);
        });
    },

    // Marquer un ticket comme appelé
    appeler: (id, idUtilisateur, idGuichet, callback) => {
        const heureAppel = new Date();
        const data = {
            statut: 'appele',
            idUtilisateur,
            idGuichet,
            heureAppel
        };
        Ticket.update(id, data, callback);
    },

    // Marquer un ticket comme terminé
    terminer: (id, callback) => {
        Ticket.getById(id, (err, ticket) => {
            if (err) return callback(err, null);
            if (!ticket) return callback(new Error("Ticket non trouvé"), null);

            const heureServi = new Date();
            const tempsAttente = Math.floor((heureServi - new Date(ticket.heureArrivee)) / 60000);

            const data = {
                statut: 'servi',
                heureServi,
                tempsAttente
            };
            Ticket.update(id, data, callback);
        });
    },

    // Marquer un ticket comme absent
    absent: (id, callback) => {
        const data = { statut: 'absent' };
        Ticket.update(id, data, callback);
    },

    // Annuler un ticket
    annuler: (id, callback) => {
        const data = { statut: 'annule' };
        Ticket.update(id, data, callback);
    },

    // ✅ VERSION CORRIGÉE : Obtenir les statistiques pour un service
    getStatsByService: (serviceId, date, callback) => {
        const dateFilter = date || new Date().toISOString().split('T')[0];

        const sql = `
            SELECT
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN statut = 'servi' THEN 1 ELSE 0 END), 0) as servis,
                COALESCE(SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END), 0) as enAttente,
                COALESCE(SUM(CASE WHEN statut = 'absent' THEN 1 ELSE 0 END), 0) as absents,
                COALESCE(SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END), 0) as annules,
                COALESCE(ROUND(AVG(tempsAttente)), 0) as tempsMoyen
            FROM Ticket
            WHERE idService = ? AND DATE(created_at) = ?
        `;

        db.query(sql, [parseInt(serviceId), dateFilter], (err, results) => {
            if (err) return callback(err, null);

            const stats = results[0] || {
                total: 0, servis: 0, enAttente: 0, absents: 0, annules: 0, tempsMoyen: 0
            };

            callback(null, {
                aujourdhui: stats,
                tempsMoyen: stats.tempsMoyen || 0
            });
        });
    },

    // Derniers tickets appelés pour affichage salle d'attente (hall)
    getDerniersAppels: (limit, callback) => {
        const nb = limit || 10;
        const sql = `
            SELECT t.numero, t.heureAppel, g.lettre as guichetLettre, s.nomService
            FROM ticket t
            LEFT JOIN guichet g ON t.idGuichet = g.id
            LEFT JOIN service s ON t.idService = s.id
            WHERE t.statut = 'appele' AND DATE(t.created_at) = CURDATE() AND t.heureAppel IS NOT NULL
            ORDER BY t.heureAppel DESC
            LIMIT ?
        `;
        db.query(sql, [nb], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results || []);
        });
    },

    // Obtenir l'activité horaire pour un service
    getActiviteHoraire: (serviceId, callback) => {
        const sql = `
            SELECT
                HOUR(heureArrivee) as heure,
                COUNT(*) as clients
            FROM Ticket
            WHERE idService = ? AND DATE(created_at) = CURDATE()
            GROUP BY HOUR(heureArrivee)
            ORDER BY heure ASC
        `;

        db.query(sql, [parseInt(serviceId)], (err, results) => {
            if (err) return callback(err, null);

            const heures = ['8h','9h','10h','11h','12h','13h','14h','15h','16h','17h'];
            const activite = heures.map(heure => {
                const h = parseInt(heure);
                const found = results.find(r => r.heure === h);
                return {
                    heure,
                    clients: found ? found.clients : 0
                };
            });

            callback(null, activite);
        });
    }
};

module.exports = Ticket;