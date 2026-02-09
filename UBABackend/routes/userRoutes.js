const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère tous les utilisateurs
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get("/users", userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 */
router.get("/users/:id", userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crée un utilisateur
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               postnom:
 *                  type: string
 *               prenom:
 *                  type: string
 *               email:
 *                  type: string
 *               role:
 *                  type: string
 *               statut:
 *                  type: string
 *               password:
 *                  type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 */
router.post("/users", userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Met à jour un utilisateur
 *     tags:
 *       - Users
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
 *         description: Utilisateur mis à jour
 */
router.put("/users/:id", userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.delete("/users/:id", userController.deleteUser);

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Enregistrement d'un utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enregistré
 */
router.post("/register", userController.register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Connexion
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connecté
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Déconnexion
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Déconnecté
 */
router.post("/logout", userController.logout);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Profile de l'utilisateur connecté
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 */
router.get('/profile', auth, userController.profile);

module.exports = router;
