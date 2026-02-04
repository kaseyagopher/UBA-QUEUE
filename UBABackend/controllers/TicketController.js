module.exports = {
    createClientWithTicket: (req, res) => {
        res.json({ message: "Créer un ticket" });
    },
    getPendingTickets: (req, res) => {
        res.json({ message: "Récupérer les tickets en attente" });
    },
    updateTicket: (req, res) => {
        const id = req.params.id;
        const data = req.body;
        const Ticket = require('../models/Ticket');
        Ticket.update(id, data, (err, result) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.json({ message: 'Ticket modifié avec succès', result });
        });
    }
};
