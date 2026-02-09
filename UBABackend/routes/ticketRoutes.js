const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/TicketController');

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
router.get('/tickets/en-attente', ticketController.getPendingTickets);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Crée un ticket
 *     tags:
 *       - Tickets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Ticket créé
 */
router.post('/tickets', ticketController.createClientWithTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Met à jour un ticket
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ticket mis à jour
 */
router.put('/tickets/:id', ticketController.updateTicket);

module.exports = router;
