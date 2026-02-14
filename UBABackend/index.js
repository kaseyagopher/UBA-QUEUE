require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("bcrypt")
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const clientRoutes = require("./routes/clientRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const guichetRoutes = require('./routes/guichetRoutes');
const userRoutes = require("./routes/userRoutes");
const statistiqueRoutes = require("./routes/statistiqueRoutes");
const fileRoutes = require("./routes/FileRoutes");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');


const app = express();
const port = 4000;

app.use(cors({
    origin : "http://localhost:5173",
    credentials: true// Remplacez par l'URL de votre frontend
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Monte la documentation Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", clientRoutes);
app.use("/api", ticketRoutes);
app.use("/api", serviceRoutes);
app.use("/api", userRoutes);
app.use("/api", fileRoutes);
app.use("/api", guichetRoutes);
app.use("/api", statistiqueRoutes);

app.get("/", (req, res) => {
    res.send("Bienvenue sur mon API Node.js avec MySQL !");
});

const server = app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

// Gestion des arrêts pour libérer le port
process.on("SIGINT", () => {
    console.log("Arrêt du serveur...");
    server.close(() => {
        console.log("Serveur fermé proprement.");
        process.exit(0);
    });
});

process.on("SIGTERM", () => {
    console.log("Arrêt du serveur (SIGTERM)...");
    server.close(() => {
        console.log("Serveur fermé proprement.");
        process.exit(0);
    });
});
