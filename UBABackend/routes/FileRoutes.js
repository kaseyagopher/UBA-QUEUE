const express = require('express');
const router = express.Router();
const FileController = require('../controllers/FileController');

/**
 * @swagger
 * /api/supervision/en-attente:
 *   get:
 *     summary: Nombre de clients en attente par service
 *     tags:
 *       - Supervision
 *     responses:
 *       200:
 *         description: Liste des services avec le nombre de clients en attente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idService:
 *                     type: integer
 *                   nomService:
 *                     type: string
 *                   enAttente:
 *                     type: integer
 */
router.get('/supervision/en-attente', FileController.getWaitingCountByService);

/**
 * @swagger
 * /api/supervision/en-cours/{idService}:
 *   get:
 *     summary: Ticket en cours pour un service
 *     tags:
 *       - Supervision
 *     parameters:
 *       - in: path
 *         name: idService
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Ticket en cours
 *       404:
 *         description: Aucun ticket en cours
 */
router.get('/supervision/en-cours/:idService', FileController.getCurrentTicket);

/**
 * @swagger
 * /api/supervision/termines:
 *   get:
 *     summary: Tickets terminés ou annulés
 *     tags:
 *       - Supervision
 *     parameters:
 *       - in: query
 *         name: idService
 *         schema:
 *           type: integer
 *         description: Filtrer par service
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Liste des tickets terminés ou annulés
 */
router.get('/supervision/termines', FileController.getFinishedOrCancelledTickets);

module.exports = router;
