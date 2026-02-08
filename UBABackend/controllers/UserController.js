const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getAllUsers = (req, res) => {
    User.getAllUsers((err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(results);
        }
    });
};

exports.getUserById = (req, res) => {
    const id = req.params.id;
    User.getUserById(id, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.length === 0) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        } else {
            res.status(200).json(result[0]);
        }
    });
};

exports.createUser = async (req, res) => {
    try {
        const newUser = req.body;
        // Si un mot de passe est fourni (création par admin), on le hash avant d'enregistrer
        if (newUser.motDePasse) {
            newUser.motDePasse = await bcrypt.hash(newUser.motDePasse, 10);
        }
        User.createUser(newUser, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ message: "Utilisateur créé avec succès", userId: result.insertId });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;
    try {
        // Si un nouveau mot de passe est fourni, le hasher avant la mise à jour
        if (updatedUser.motDePasse && typeof updatedUser.motDePasse === 'string' && updatedUser.motDePasse.trim() !== '') {
            updatedUser.motDePasse = await bcrypt.hash(updatedUser.motDePasse, 10);
        } else {
            // S'assurer qu'on ne transmet pas une chaîne vide comme motDePasse
            delete updatedUser.motDePasse;
        }

        User.updateUser(id, updatedUser, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (result.affectedRows === 0) {
                res.status(404).json({ message: "Utilisateur non trouvé" });
            } else {
                res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    User.deleteUser(id, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        } else {
            res.status(200).json({ message: "Utilisateur supprimé avec succès" });
        }
    });
};

exports.register = async (req, res) => {
    console.log('Tentative d’inscription avec les données:', req.body);
    try {
        const { nom, postnom, prenom, email, role, idService, motDePasse } = req.body;
        if (!nom || !postnom || !prenom || !email || !role || !idService || !motDePasse) {
            return res.status(400).json({ message: "Tous les champs sont requis : nom, postnom, prenom, email, role, idService, motDePasse" });
        }
        const hashedPassword = await bcrypt.hash(motDePasse, 10);
        const newUser = { nom, postnom, prenom, email, role, idService, motDePasse: hashedPassword };
        User.createUser(newUser, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "Utilisateur inscrit avec succès", userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = (req, res) => {
    const { email, motDePasse, role } = req.body;
    console.log('Tentative de connexion avec:', { email, motDePasse, role });
    if (!email || !motDePasse) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }
    User.getUserByEmail(email, async (err, users) => {
        if (err) {
            console.log('Erreur lors de la recherche utilisateur:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!users || users.length === 0) {
            console.log('Aucun utilisateur trouvé pour cet email');
            return res.status(401).json({ message: "Utilisateur ou mot de passe incorrect" });
        }
        const user = users[0];
        console.log('Utilisateur trouvé:', user);

        // Si le client a envoyé un role dans le formulaire, vérifier qu'il correspond au role en DB
        if (role && user.role && role !== user.role) {
            console.log('Role fourni ne correspond pas au role de l\'utilisateur en base:', { provided: role, actual: user.role });
            return res.status(403).json({ message: "Rôle incorrect pour cet utilisateur" });
        }

        if (!user.motDePasse || typeof user.motDePasse !== 'string' || !user.motDePasse.startsWith('$2b$') || user.motDePasse.length < 59) {
            console.log('Mot de passe stocké non valide ou non hashé !');
            return res.status(500).json({ message: "Mot de passe stocké non valide. Contactez l'administrateur." });
        }
        try {
            const match = await bcrypt.compare(motDePasse, user.motDePasse);
            console.log('Résultat comparaison mot de passe:', match);
            if (!match) {
                return res.status(401).json({ message: "Utilisateur ou mot de passe incorrect" });
            }
        } catch (compareErr) {
            console.error('Erreur lors de la comparaison des mots de passe:', compareErr);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        // Inclure le role dans le token pour les usages côté client si nécessaire
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
        res
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({ message: "Connexion réussie", role: user.role, id: user.id });
    });
};

exports.logout = (req, res) => {
    res
        .clearCookie('token')
        .status(200)
        .json({ message: "Déconnexion réussie" });
};

exports.profile = (req, res) => {
    // req.user est ajouté par le middleware d'authentification
    if (!req.user) {
        return res.status(401).json({ message: "Non authentifié" });
    }
    // On peut retourner tout ou partie des infos utilisateur
    User.getUserById(req.user.id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        // On retire le mot de passe du résultat
        const { motDePasse, ...userSansMotDePasse } = result[0];
        res.status(200).json(userSansMotDePasse);
    });
};
