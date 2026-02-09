const express = require("express");
const { createService, getAllServices } = require("../controllers/ServiceController.js");

const router = express.Router();

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Crée un service
 *     tags:
 *       - Services
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Service créé
 */
router.post("/services", createService);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Récupère tous les services
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: Liste des services
 */
router.get("/services", getAllServices);

module.exports = router;
