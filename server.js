const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers statiques (le frontend)
app.use(express.static(path.join(__dirname, '.')));

// ===== Base de données SQLite =====
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

// Modèle Arbitre
const Arbitre = sequelize.define('Arbitre', {
    nom: { type: DataTypes.STRING, allowNull: false },
    dob: DataTypes.STRING,
    lieuNais: DataTypes.STRING,
    cin: DataTypes.STRING,
    cinDate: DataTypes.STRING,
    cinLieu: DataTypes.STRING,
    adresse: DataTypes.STRING,
    cp: DataTypes.STRING,
    tel: DataTypes.STRING,
    nationalite: DataTypes.STRING,
    profession: DataTypes.STRING,
    club: DataTypes.STRING,
    niveau: DataTypes.STRING,
    debut: DataTypes.STRING,
    grade: DataTypes.STRING,
    gradeDate: DataTypes.STRING,
    banque: DataTypes.STRING,
    rib: DataTypes.STRING,
    photo: DataTypes.TEXT,
    stats: DataTypes.TEXT,
    docsJoints: DataTypes.TEXT,
    createdAt: DataTypes.STRING
});

// Modèle Document
const Document = sequelize.define('Document', {
    type: DataTypes.STRING,
    titre: DataTypes.STRING,
    saison: DataTypes.STRING,
    files: DataTypes.TEXT,
    createdAt: DataTypes.STRING
});

// ===== API Routes =====

// --- ARBITRES ---
app.get('/api/arbitres', async (req, res) => {
    try {
        const arbitres = await Arbitre.findAll({ order: [['id', 'DESC']] });
        res.json(arbitres);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/arbitres', async (req, res) => {
    try {
        const arbitre = await Arbitre.create({
            ...req.body,
            stats: JSON.stringify(req.body.stats || []),
            docsJoints: JSON.stringify(req.body.docsJoints || [])
        });
        res.json(arbitre);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/arbitres/:id', async (req, res) => {
    try {
        await Arbitre.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DOCUMENTS ---
app.get('/api/documents', async (req, res) => {
    try {
        const docs = await Document.findAll({ order: [['id', 'DESC']] });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/documents', async (req, res) => {
    try {
        const doc = await Document.create({
            ...req.body,
            files: JSON.stringify(req.body.files || [])
        });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/documents/:id', async (req, res) => {
    try {
        await Document.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== Démarrage =====
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Serveur KTB Arbitres démarré sur le port ${PORT}`);
        console.log(`📋 API disponible sur http://localhost:${PORT}/api`);
    });
});