const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require('../middleware/authMiddleware');

router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get('/profile', auth, userController.profile);

module.exports = router;
