const Ticket = require("../models/Ticket");
const db = require("../config/db");

// Créer un ticket (client)
exports.createTicket = (req, res) => {
    const { idService, idClient, nom, prenom, postnom } = req.body;

    if (!idService || !idClient) {
        return res.status(400).json({
            success: false,
            message: "Service et client requis"
        });
    }

    Ticket.getNextTicketNumber((err, ticketNumber) => {
        if (err) {
            console.error("❌ Erreur récupération numéro ticket:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur"
            });
        }

        Ticket.create(ticketNumber, idService, idClient, (err, ticket) => {
            if (err) {
                console.error("❌ Erreur création ticket:", err);
                return res.status(500).json({
                    success: false,
                    message: "Erreur création ticket"
                });
            }

            console.log(`✅ Ticket #${ticket.numero} créé`);

            res.status(201).json({
                success: true,
                message: "Ticket créé avec succès",
                ticket
            });
        });
    });
};

// Récupérer tous les tickets en attente
exports.getPendingTickets = (req, res) => {
    Ticket.getPendingTickets((err, tickets) => {
        if (err) {
            console.error("❌ Erreur récupération tickets:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur"
            });
        }

        res.status(200).json(tickets);
    });
};

// Récupérer le ticket en cours (appelé) pour un agent
exports.getTicketEnCoursByAgent = (req, res) => {
    const { agentId } = req.params;

    if (!agentId || isNaN(agentId)) {
        return res.status(400).json({
            success: false,
            message: "ID agent invalide"
        });
    }

    Ticket.getTicketEnCoursByAgent(parseInt(agentId), (err, ticket) => {
        if (err) {
            console.error("❌ Erreur récupération ticket en cours:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur"
            });
        }

        res.status(200).json(ticket);
    });
};

// Récupérer le prochain ticket en attente pour un service
exports.getNextPendingTicket = (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || isNaN(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "ID service invalide"
        });
    }

    Ticket.getNextPendingTicket(parseInt(serviceId), (err, ticket) => {
        if (err) {
            console.error("❌ Erreur récupération prochain ticket:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur"
            });
        }

        res.status(200).json(ticket);
    });
};

// Récupérer les tickets en attente pour un service
exports.getPendingTicketsByService = (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || isNaN(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "ID service invalide"
        });
    }

    Ticket.getPendingTicketsByService(parseInt(serviceId), (err, tickets) => {
        if (err) {
            console.error("❌ Erreur récupération tickets:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur"
            });
        }

        res.status(200).json(tickets);
    });
};

// Appeler un ticket
exports.appelerTicket = (req, res) => {
    const { id } = req.params;
    const { idUtilisateur, idGuichet } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID ticket invalide"
        });
    }

    Ticket.appeler(parseInt(id), idUtilisateur, idGuichet, (err, ticket) => {
        if (err) {
            console.error(`❌ Erreur appel ticket ${id}:`, err);

            if (err.message === "Ticket non trouvé") {
                return res.status(404).json({
                    success: false,
                    message: "Ticket non trouvé"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'appel du ticket"
            });
        }

        console.log(`📢 Ticket #${ticket.numero} appelé`);

        res.status(200).json({
            success: true,
            message: "Ticket appelé avec succès",
            ticket
        });
    });
};

// Terminer un ticket
exports.terminerTicket = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID ticket invalide"
        });
    }

    Ticket.terminer(parseInt(id), (err, ticket) => {
        if (err) {
            console.error(`❌ Erreur fin ticket ${id}:`, err);

            if (err.message === "Ticket non trouvé") {
                return res.status(404).json({
                    success: false,
                    message: "Ticket non trouvé"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Erreur lors de la fin du ticket"
            });
        }

        console.log(`✅ Ticket #${ticket.numero} terminé`);

        res.status(200).json({
            success: true,
            message: "Ticket terminé avec succès",
            ticket
        });
    });
};

// Marquer un ticket comme absent
exports.absentTicket = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID ticket invalide"
        });
    }

    Ticket.absent(parseInt(id), (err, ticket) => {
        if (err) {
            console.error(`❌ Erreur marquage absent ticket ${id}:`, err);

            if (err.message === "Ticket non trouvé") {
                return res.status(404).json({
                    success: false,
                    message: "Ticket non trouvé"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Erreur lors du marquage absent"
            });
        }

        console.log(`❌ Ticket #${ticket.numero} marqué absent`);

        res.status(200).json({
            success: true,
            message: "Ticket marqué comme absent",
            ticket
        });
    });
};

// Annuler un ticket
exports.annulerTicket = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID ticket invalide"
        });
    }

    Ticket.annuler(parseInt(id), (err, ticket) => {
        if (err) {
            console.error(`❌ Erreur annulation ticket ${id}:`, err);

            if (err.message === "Ticket non trouvé") {
                return res.status(404).json({
                    success: false,
                    message: "Ticket non trouvé"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'annulation"
            });
        }

        console.log(`🚫 Ticket #${ticket.numero} annulé`);

        res.status(200).json({
            success: true,
            message: "Ticket annulé avec succès",
            ticket
        });
    });
};

// Obtenir les statistiques d'un service
exports.getStatsByService = (req, res) => {
    const { serviceId } = req.params;
    const { date } = req.query; // Optionnel: format YYYY-MM-DD

    if (!serviceId || isNaN(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "ID service invalide"
        });
    }

    Ticket.getStatsByService(parseInt(serviceId), date, (err, stats) => {
        if (err) {
            console.error(`❌ Erreur stats service ${serviceId}:`, err);
            return res.status(500).json({
                success: false,
                message: "Erreur récupération statistiques"
            });
        }

        // Ajouter l'activité horaire
        Ticket.getActiviteHoraire(parseInt(serviceId), (err, activite) => {
            if (err) {
                console.error(`❌ Erreur activité horaire:`, err);
                stats.activiteHoraire = [];
            } else {
                stats.activiteHoraire = activite;
            }

            res.status(200).json(stats);
        });
    });
};

// Mettre à jour un ticket (générique)
exports.updateTicket = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID ticket invalide"
        });
    }

    Ticket.update(parseInt(id), data, (err, result) => {
        if (err) {
            console.error(`❌ Erreur mise à jour ticket ${id}:`, err);

            if (err.message === "Ticket non trouvé") {
                return res.status(404).json({
                    success: false,
                    message: "Ticket non trouvé"
                });
            }

            return res.status(500).json({
                success: false,
                message: err.message || "Erreur mise à jour"
            });
        }

        res.status(200).json({
            success: true,
            message: "Ticket modifié avec succès",
            ticket: result
        });
    });
};