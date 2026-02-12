const Service = require("../models/Service");

// Créer un service
exports.createService = (req, res) => {
    const { nomservice, descriptionService } = req.body;

    // Validation
    if (!nomservice || !nomservice.trim()) {
        return res.status(400).json({
            success: false,
            message: "Le nom du service est requis."
        });
    }

    if (!descriptionService || !descriptionService.trim()) {
        return res.status(400).json({
            success: false,
            message: "La description du service est requise."
        });
    }

    Service.create(nomservice.trim(), descriptionService.trim(), (err, service) => {
        if (err) {
            console.error("❌ Erreur création service:", err);

            // Gestion des erreurs MySQL
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: "Un service avec ce nom existe déjà."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Erreur lors de la création du service"
            });
        }

        console.log(`✅ Service créé avec succès: ${service.nomService} (ID: ${service.id})`);

        return res.status(201).json({
            success: true,
            message: "Service ajouté avec succès",
            id: service.id,
            nomService: service.nomService,
            description: service.description,
            created_at: service.created_at
        });
    });
};

// Récupérer tous les services
exports.getAllServices = (req, res) => {
    Service.getAllWithStats((err, services) => {
        if (err) {
            console.error("❌ Erreur récupération services:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des services"
            });
        }

        console.log(`📋 ${services.length} services récupérés`);
        res.status(200).json(services);
    });
};

// Récupérer un service par ID
exports.getServiceById = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID de service invalide"
        });
    }

    Service.getStats(id, (err, service) => {
        if (err) {
            console.error(`❌ Erreur récupération service ${id}:`, err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du service"
            });
        }

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service non trouvé"
            });
        }

        res.status(200).json(service);
    });
};

// Mettre à jour un service
exports.updateService = (req, res) => {
    const { id } = req.params;
    const { nomservice, descriptionService } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID de service invalide"
        });
    }

    // Validation
    if (!nomservice || !nomservice.trim()) {
        return res.status(400).json({
            success: false,
            message: "Le nom du service est requis."
        });
    }

    if (!descriptionService || !descriptionService.trim()) {
        return res.status(400).json({
            success: false,
            message: "La description du service est requise."
        });
    }

    Service.update(id, nomservice.trim(), descriptionService.trim(), (err, service) => {
        if (err) {
            console.error(`❌ Erreur mise à jour service ${id}:`, err);

            if (err.message === "Service non trouvé") {
                return res.status(404).json({
                    success: false,
                    message: "Service non trouvé"
                });
            }

            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: "Un service avec ce nom existe déjà."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour du service"
            });
        }

        console.log(`✅ Service mis à jour: ${service.nomService} (ID: ${service.id})`);

        res.status(200).json({
            success: true,
            message: "Service mis à jour avec succès",
            service
        });
    });
};

// Supprimer un service
exports.deleteService = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID de service invalide"
        });
    }

    Service.delete(id, (err, result) => {
        if (err) {
            console.error(`❌ Erreur suppression service ${id}:`, err);

            if (err.message.includes("agents associés")) {
                return res.status(400).json({
                    success: false,
                    message: "Impossible de supprimer ce service car il a des agents associés."
                });
            }

            if (err.message.includes("tickets associés")) {
                return res.status(400).json({
                    success: false,
                    message: "Impossible de supprimer ce service car il a des tickets associés."
                });
            }

            if (err.message === "Service non trouvé") {
                return res.status(404).json({
                    success: false,
                    message: "Service non trouvé"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression du service"
            });
        }

        console.log(`🗑️ Service supprimé: ID ${id}`);

        res.status(200).json({
            success: true,
            message: "Service supprimé avec succès",
            id: parseInt(id)
        });
    });
};

// Rechercher des services
exports.searchServices = (req, res) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.status(400).json({
            success: false,
            message: "Terme de recherche requis"
        });
    }

    Service.search(q.trim(), (err, services) => {
        if (err) {
            console.error("❌ Erreur recherche services:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la recherche des services"
            });
        }

        res.status(200).json(services);
    });
};

// Obtenir les statistiques globales des services
exports.getServicesStats = (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as totalServices,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as nouveauxAujourdhui,
            SUM(CASE WHEN WEEK(created_at) = WEEK(CURDATE()) THEN 1 ELSE 0 END) as nouveauxCetteSemaine,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) THEN 1 ELSE 0 END) as nouveauxCeMois,
            (
                SELECT COUNT(DISTINCT idService) 
                FROM ticket 
                WHERE DATE(created_at) = CURDATE()
            ) as servicesActifsAujourdhui
        FROM Service
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Erreur stats services:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des statistiques"
            });
        }

        res.status(200).json(results[0]);
    });
};