const Guichet = require("../models/Guichet");
const db = require('../config/db');

// Créer un guichet
exports.createGuichet = (req, res) => {
    const { lettre, idService, idUtilisateur, type } = req.body;

    // Validations
    if (!lettre || !lettre.trim()) {
        return res.status(400).json({
            success: false,
            message: "La lettre du guichet est requise."
        });
    }

    if (!idService) {
        return res.status(400).json({
            success: false,
            message: "Le service associé est requis."
        });
    }

    // Vérifier si la lettre est valide (A-Z)
    const lettreMaj = lettre.trim().toUpperCase();
    if (!/^[A-Z]$/.test(lettreMaj)) {
        return res.status(400).json({
            success: false,
            message: "La lettre doit être une seule lettre de A à Z."
        });
    }

    // Vérifier si le service existe
    const checkServiceSql = "SELECT id FROM service WHERE id = ?";
    db.query(checkServiceSql, [idService], (err, serviceResult) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }

        if (serviceResult.length === 0) {
            return res.status(404).json({ success: false, message: "Service non trouvé" });
        }

        // Vérifier si la lettre est déjà utilisée pour ce service
        Guichet.checkLettreExists(lettreMaj, idService, null, (err, exists) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Erreur lors de la vérification" });
            }

            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "Cette lettre est déjà utilisée pour ce service."
                });
            }

            // Créer le guichet
            Guichet.create({
                lettre: lettreMaj,
                idService: parseInt(idService),
                idUtilisateur: idUtilisateur ? parseInt(idUtilisateur) : null,
                type: type || 'standard'
            }, (err, guichet) => {
                if (err) {
                    console.error("❌ Erreur création guichet:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la création du guichet"
                    });
                }

                console.log(`✅ Guichet créé: ${guichet.lettre} (Service ID: ${guichet.idService})`);

                return res.status(201).json({
                    success: true,
                    message: "Guichet créé avec succès",
                    guichet
                });
            });
        });
    });
};

// Récupérer tous les guichets
exports.getAllGuichets = (req, res) => {
    Guichet.getAll((err, guichets) => {
        if (err) {
            console.error("❌ Erreur récupération guichets:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des guichets"
            });
        }

        res.status(200).json(guichets);
    });
};

// Récupérer un guichet par ID
exports.getGuichetById = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
    }

    Guichet.getById(parseInt(id), (err, guichet) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }

        if (!guichet) {
            return res.status(404).json({ success: false, message: "Guichet non trouvé" });
        }

        res.status(200).json(guichet);
    });
};

// Récupérer les guichets par service
exports.getGuichetsByService = (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || isNaN(serviceId)) {
        return res.status(400).json({ success: false, message: "ID de service invalide" });
    }

    Guichet.getByServiceId(parseInt(serviceId), (err, guichets) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }

        res.status(200).json(guichets);
    });
};

// Récupérer les lettres disponibles pour un service
exports.getLettresDisponibles = (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || isNaN(serviceId)) {
        return res.status(400).json({ success: false, message: "ID de service invalide" });
    }

    Guichet.getLettresDisponibles(parseInt(serviceId), (err, lettres) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }

        res.status(200).json(lettres);
    });
};

// Mettre à jour un guichet
exports.updateGuichet = (req, res) => {
    const { id } = req.params;
    const { lettre, idService, idUtilisateur, type } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
    }

    if (!lettre || !lettre.trim()) {
        return res.status(400).json({ success: false, message: "La lettre est requise" });
    }

    const lettreMaj = lettre.trim().toUpperCase();
    if (!/^[A-Z]$/.test(lettreMaj)) {
        return res.status(400).json({ message: "La lettre doit être une seule lettre de A à Z" });
    }

    // Vérifier si la lettre est déjà utilisée (excluant ce guichet)
    Guichet.checkLettreExists(lettreMaj, idService, id, (err, exists) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erreur vérification" });
        }

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Cette lettre est déjà utilisée pour ce service."
            });
        }

        Guichet.update(parseInt(id), {
            lettre: lettreMaj,
            idService: parseInt(idService),
            idUtilisateur: idUtilisateur ? parseInt(idUtilisateur) : null,
            type
        }, (err, guichet) => {
            if (err) {
                if (err.message === "Guichet non trouvé") {
                    return res.status(404).json({ success: false, message: "Guichet non trouvé" });
                }
                return res.status(500).json({ success: false, message: "Erreur mise à jour" });
            }

            res.status(200).json({
                success: true,
                message: "Guichet mis à jour avec succès",
                guichet
            });
        });
    });
};

// Supprimer un guichet
exports.deleteGuichet = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
    }

    Guichet.delete(parseInt(id), (err, result) => {
        if (err) {
            if (err.message.includes("tickets aujourd'hui")) {
                return res.status(400).json({
                    success: false,
                    message: "Impossible de supprimer : ce guichet a des tickets aujourd'hui"
                });
            }
            if (err.message === "Guichet non trouvé") {
                return res.status(404).json({ success: false, message: "Guichet non trouvé" });
            }
            return res.status(500).json({ success: false, message: "Erreur suppression" });
        }

        res.status(200).json({
            success: true,
            message: "Guichet supprimé avec succès"
        });
    });
};

// Assigner un agent à un guichet
exports.assignerAgent = (req, res) => {
    const { id } = req.params;
    const { idUtilisateur } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
    }

    // Vérifier si l'agent est déjà assigné ailleurs
    if (idUtilisateur) {
        const checkAgentSql = `
            SELECT g.id FROM guichet g
            WHERE g.idUtilisateur = ? AND g.id != ?
        `;

        db.query(checkAgentSql, [idUtilisateur, id], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Erreur vérification" });

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cet agent est déjà assigné à un autre guichet"
                });
            }

            assigner();
        });
    } else {
        assigner();
    }

    function assigner() {
        Guichet.assignerAgent(parseInt(id), idUtilisateur || null, (err, guichet) => {
            if (err) {
                if (err.message === "Guichet non trouvé") {
                    return res.status(404).json({ success: false, message: "Guichet non trouvé" });
                }
                return res.status(500).json({ success: false, message: "Erreur assignation" });
            }

            res.status(200).json({
                success: true,
                message: idUtilisateur ? "Agent assigné avec succès" : "Agent retiré du guichet",
                guichet
            });
        });
    }
};