const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/TicketController");

// Routes pour les tickets
router.post("/tickets", ticketController.createTicket);
router.get("/tickets/en-attente", ticketController.getPendingTickets);
router.get("/tickets/en-cours/agent/:agentId", ticketController.getTicketEnCoursByAgent);
router.get("/tickets/suivant/:serviceId", ticketController.getNextPendingTicket);
router.get("/tickets/service/:serviceId/en-attente", ticketController.getPendingTicketsByService);
router.get("/tickets/stats/service/:serviceId", ticketController.getStatsByService);
router.get("/tickets/affichage-salle", ticketController.getDerniersAppels);

// Actions sur un ticket spécifique
router.patch("/tickets/:id/appeler", ticketController.appelerTicket);
router.patch("/tickets/:id/terminer", ticketController.terminerTicket);
router.patch("/tickets/:id/absent", ticketController.absentTicket);
router.patch("/tickets/:id/annuler", ticketController.annulerTicket);
router.put("/tickets/:id", ticketController.updateTicket);

module.exports = router;