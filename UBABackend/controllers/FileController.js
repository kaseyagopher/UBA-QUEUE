const db = require('../config/db');

// Retourne le nombre de clients en attente par service
exports.getWaitingCountByService = (req, res) => {
  const sql = `
    SELECT s.id AS idService, s.nomService, COUNT(t.id) AS enAttente
    FROM Service s
    LEFT JOIN Ticket t ON t.idService = s.id AND t.statut = 'en attente'
    GROUP BY s.id, s.nomService
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// Retourne le ticket en cours par service (si plusieurs, renvoie le plus ancien en cours)
exports.getCurrentTicket = (req, res) => {
  const idService = req.params.idService;
  const sql = `
    SELECT t.*
    FROM Ticket t
    WHERE t.idService = ? AND t.statut = 'EN_COURS'
    ORDER BY t.heureArrivee ASC
    LIMIT 1
  `;

  db.query(sql, [idService], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Aucun ticket en cours pour ce service' });
    res.status(200).json(results[0]);
  });
};

// Retourne les tickets terminés ou annulés, filtrable par service et période
exports.getFinishedOrCancelledTickets = (req, res) => {
  const { idService } = req.query;
  const { from, to } = req.query; // dates optionnelles au format YYYY-MM-DD

  let sql = `SELECT t.* FROM Ticket t WHERE t.statut IN ('TERMINE', 'ANNULE')`;
  const params = [];
  if (idService) {
    sql += ` AND t.idService = ?`;
    params.push(idService);
  }
  if (from) {
    sql += ` AND t.updated_at >= ?`;
    params.push(from);
  }
  if (to) {
    sql += ` AND t.updated_at <= ?`;
    params.push(to);
  }
  sql += ` ORDER BY t.updated_at DESC LIMIT 100`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};
