// Script de migration : hache les mots de passe en clair présents dans la table `utilisateur`.
// Usage (local) : node scripts/hash_plain_passwords.js

const db = require('../config/db');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const [rows] = await new Promise((resolve, reject) => {
      db.query('SELECT id, motDePasse FROM utilisateur', (err, results) => {
        if (err) return reject(err);
        resolve([results]);
      });
    });

    let count = 0;
    for (const row of rows) {
      const pwd = row.motDePasse || '';
      // Si le mot de passe ne ressemble pas à un bcrypt hash ($2b$ ou $2a$), on le hash
      if (!pwd.startsWith('$2b$') && !pwd.startsWith('$2a$')) {
        const hashed = await bcrypt.hash(pwd, 10);
        await new Promise((resolve, reject) => {
          db.query('UPDATE utilisateur SET motDePasse = ? WHERE id = ?', [hashed, row.id], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
        count++;
        console.log(`User ${row.id} mot de passe hashé`);
      }
    }

    console.log(`Migration terminée. ${count} mot(s) de passe hashé(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Erreur migration:', err);
    process.exit(1);
  }
}

run();
