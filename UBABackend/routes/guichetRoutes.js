const express = require("express");
const {
    createGuichet,
    getAllGuichets,
    getGuichetById,
    getGuichetsByService,
    getLettresDisponibles,
    updateGuichet,
    deleteGuichet,
    assignerAgent
} = require("../controllers/GuichetController.js");

const router = express.Router();

// GET
router.get("/guichets", getAllGuichets);
router.get("/guichets/:id", getGuichetById);
router.get("/guichets/service/:serviceId", getGuichetsByService);
router.get("/guichets/lettres-disponibles/:serviceId", getLettresDisponibles);

// POST
router.post("/guichets", createGuichet);

// PUT
router.put("/guichets/:id", updateGuichet);

// DELETE
router.delete("/guichets/:id", deleteGuichet);

// PATCH
router.patch("/guichets/:id/assigner-agent", assignerAgent);

module.exports = router;