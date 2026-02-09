const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crée un client et son ticket
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client créé avec ticket
 */
// 🔹 Route pour créer un client et son ticket
router.post("/clients", clientController.createClientWithTicket);

/**
 * @swagger
 * /api/tickets/en-attente:
 *   get:
 *     summary: Récupère les tickets en attente
 *     tags:
 *       - Tickets
 *     responses:
 *       200:
 *         description: Liste des tickets en attente
 */
// 🔹 Route pour récupérer les tickets en attente
router.get("/tickets/en-attente", clientController.getPendingTickets);

module.exports = router;
