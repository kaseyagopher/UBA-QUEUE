const Client = require("../models/Client");
const Ticket = require("../models/Ticket");

exports.createClientWithTicket = (req, res) => {
    const { nom, postnom, prenom, idService } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ message: "Nom et prénom sont obligatoires" });
    }

    if (!idService) {
        return res.status(400).json({ message: "Le service est obligatoire" });
    }

    // 1. Insérer le client
    Client.create(nom, postnom, prenom, (err, result) => {
        if (err) {
            console.error("❌ Erreur insertion client:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        const clientId = result.insertId;
        console.log("✅ Client créé avec ID:", clientId);

        // 2. Récupérer le prochain numéro de ticket
        Ticket.getNextTicketNumber((err, nextNumber) => { // ← 'nextNumber' est un nombre
            if (err) {
                console.error("❌ Erreur récupération numéro ticket:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            // ✅ CORRECTION: nextNumber est déjà le numéro suivant (total + 1)
            const ticketNumber = nextNumber; // ← Plus de [0].total
            console.log("🎫 Numéro du ticket:", ticketNumber);

            // 3. Créer le ticket
            Ticket.create(ticketNumber, idService, clientId, (err, ticket) => {
                if (err) {
                    console.error("❌ Erreur insertion ticket:", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }

                console.log("✅ Ticket créé avec numéro:", ticketNumber);

                return res.status(201).json({
                    message: "Client et ticket créés avec succès",
                    ticketNumber,
                    clientId
                });
            });
        });
    });
};

exports.getPendingTickets = (req, res) => {
    Ticket.getPendingTickets((err, results) => {
        if (err) {
            console.error("❌ Erreur SQL:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        console.log(`📋 ${results.length} tickets en attente`);
        res.json(results);
    });
};