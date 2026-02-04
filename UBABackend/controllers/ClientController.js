const Client = require("../models/Client");
const Ticket = require("../models/Ticket");

exports.createClientWithTicket = (req, res) => {
    const { nom, postnom, prenom, idService } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ message: "Nom et prénom sont obligatoires" });
    }

    //  Insérer le client
    Client.create(nom, postnom, prenom, (err, result) => {
        if (err) {
            console.error("Erreur lors de l’insertion du client :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        const clientId = result.insertId;
        console.log("Client créé avec ID:", clientId);

        //  Récupérer le dernier numéro de ticket + 1
        Ticket.getNextTicketNumber((err, result) => {
            if (err) {
                console.error("Erreur lors de la récupération du dernier numéro de ticket :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            const ticketNumber = result[0].total + 1;

            //  Insérer le ticket
            Ticket.create(ticketNumber, idService, clientId, (err, result) => {
                if (err) {
                    console.error("Erreur lors de l’insertion du ticket :", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }

                console.log("Ticket créé avec numéro:", ticketNumber);
                return res.status(201).json({ message: "Client et ticket créés avec succès", ticketNumber });
            });
        });
    });
};

exports.getPendingTickets = (req, res) => {
    Ticket.getPendingTickets((err, results) => {
        if (err) {
            console.error("Erreur SQL:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        console.log("Tickets en attente envoyés:", results);
        res.json(results);
    });
};
