const express = require("express");
const {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
    searchServices,
    getServicesStats
} = require("../controllers/ServiceController.js");

const router = express.Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Récupère tous les services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Liste des services
 */
router.get("/services", getAllServices);

/**
 * @swagger
 * /api/services/stats:
 *   get:
 *     summary: Récupère les statistiques des services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Statistiques des services
 */
router.get("/services/stats", getServicesStats);

/**
 * @swagger
 * /api/services/search:
 *   get:
 *     summary: Recherche des services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 */
router.get("/services/search", searchServices);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Récupère un service par ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du service
 */
router.get("/services/:id", getServiceById);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Crée un nouveau service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomservice
 *               - descriptionService
 *             properties:
 *               nomservice:
 *                 type: string
 *               descriptionService:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service créé avec succès
 */
router.post("/services", createService);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Met à jour un service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomservice:
 *                 type: string
 *               descriptionService:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service mis à jour
 */
router.put("/services/:id", updateService);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Supprime un service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service supprimé
 */
router.delete("/services/:id", deleteService);

module.exports = router;