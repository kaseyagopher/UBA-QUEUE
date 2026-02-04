const db = require("../config/db");

const Ticket = {
    getNextTicketNumber: (callback) => {
        const sql = "SELECT COUNT(*) AS total FROM Ticket";
        db.query(sql, callback);
    },

    create: (ticketNumber, idService, clientId, callback) => {
        const heureArrivee = new Date();
        const statut = "en attente";
        const sql = "INSERT INTO Ticket (numero, idService, heureArrivee, statut, idClient) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [ticketNumber, idService, heureArrivee, statut, clientId], callback);
    },

    getPendingTickets: (callback) => {
        const sql = `
            SELECT Ticket.id, Ticket.numero, Ticket.statut, Ticket.heureArrivee, Client.nom, Client.postnom, Client.prenom
            FROM Ticket 
            INNER JOIN Client ON Ticket.idClient = Client.id 
            WHERE Ticket.statut = 'en attente' 
        `;
        db.query(sql, callback);
    },

    update: (id, data, callback) => {
        const fields = [];
        const values = [];
        if (data.numero) { fields.push('numero = ?'); values.push(data.numero); }
        if (data.idService) { fields.push('idService = ?'); values.push(data.idService); }
        if (data.heureArrivee) { fields.push('heureArrivee = ?'); values.push(data.heureArrivee); }
        if (data.statut) { fields.push('statut = ?'); values.push(data.statut); }
        if (data.idClient) { fields.push('idClient = ?'); values.push(data.idClient); }
        if (fields.length === 0) return callback(new Error('Aucune donnée à mettre à jour'));
        const sql = `UPDATE Ticket SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        db.query(sql, values, callback);
    }
};

module.exports = Ticket;
