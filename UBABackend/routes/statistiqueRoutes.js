const express = require("express");
const router = express.Router();
const statistiqueController = require("../controllers/StatistiqueController");

// Vérification que le controller est bien chargé
console.log("✅ Controller chargé, méthodes disponibles:",
    Object.keys(statistiqueController).join(', '));

// Route principale pour le dashboard (UNE SEULE REQUÊTE)
router.get("/admin/dashboard", statistiqueController.getDashboardData);

// Routes séparées (optionnelles)
router.get("/stats/globales", statistiqueController.getGlobalStats);
router.get("/stats/repartition-services", statistiqueController.getServiceStats);
router.get("/stats/activite-horaire", statistiqueController.getHourlyActivity);
router.get("/stats/tendances", statistiqueController.getTrends);

router.get("/stats/performances-agents", statistiqueController.getPerformancesAgents);
module.exports = router;