const db = require("../config/db");

const User = {
    getAllUsers: (callback) => {
        db.query("SELECT * FROM utilisateur", callback);
    },

    getUserById: (id, callback) => {
        db.query("SELECT * FROM utilisateur WHERE id = ?", [id], callback);
    },

    createUser: (userData, callback) => {
        // Attente : motDePasse doit être déjà hashé côté controller
        db.query("INSERT INTO utilisateur (nom, postnom, prenom, email, role, idService, motDePasse) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userData.nom, userData.postnom, userData.prenom, userData.email, userData.role, userData.idService, userData.motDePasse],
            callback);
    },

    updateUser: (id, userData, callback) => {
        // Si motDePasse est fourni, on met à jour également le mot de passe (attendu hashé)
        if (userData.motDePasse) {
            db.query("UPDATE utilisateur SET nom = ?, postnom = ?, prenom = ?, email = ?, role = ?, idService = ?, motDePasse = ? WHERE id = ?",
                [userData.nom, userData.postnom, userData.prenom, userData.email, userData.role, userData.idService, userData.motDePasse, id],
                callback);
        } else {
            db.query("UPDATE utilisateur SET nom = ?, postnom = ?, prenom = ?, email = ?, role = ?, idService = ? WHERE id = ?",
                [userData.nom, userData.postnom, userData.prenom, userData.email, userData.role, userData.idService, id],
                callback);
        }
    },

    deleteUser: (id, callback) => {
        db.query("DELETE FROM utilisateur WHERE id = ?", [id], callback);
    },

    getUserByEmail: (email, callback) => {
        db.query("SELECT * FROM utilisateur WHERE email = ?", [email], callback);
    }
};

module.exports = User;
