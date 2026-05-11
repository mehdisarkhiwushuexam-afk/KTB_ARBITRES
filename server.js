const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== CONNEXION MONGODB =====
const MONGODB_URI = 'mongodb+srv://mehdisarkhiwushuexam_db_user:IKFAUKE9fDs3sXc7@m0.mkt2okn.mongodb.net/ktb_arbitres?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// ===== SCHÉMAS =====
const arbitreSchema = new mongoose.Schema({
    nom: String,
    dob: String,
    lieuNais: String,
    cin: String,
    cinDate: String,
    cinLieu: String,
    adresse: String,
    cp: String,
    tel: String,
    nationalite: String,
    profession: String,
    club: String,
    niveau: String,
    debut: String,
    grade: String,
    gradeDate: String,
    banque: String,
    rib: String,
    photo: String,
    createdAt: String
});

const documentSchema = new mongoose.Schema({
    type: String,
    titre: String,
    saison: String,
    fileName: String,
    fileData: String,
    createdAt: String
});

const Arbitre = mongoose.model('Arbitre', arbitreSchema);
const Document = mongoose.model('Document', documentSchema);

// ===== ROUTES API =====

// ARBITRES
app.get('/api/arbitres', async (req, res) => {
    try {
        const arbitres = await Arbitre.find().sort({ _id: -1 });
        res.json(arbitres);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/arbitres', async (req, res) => {
    try {
        const arbitre = new Arbitre(req.body);
        await arbitre.save();
        res.json(arbitre);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/arbitres/:id', async (req, res) => {
    try {
        await Arbitre.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DOCUMENTS
app.get('/api/documents', async (req, res) => {
    try {
        const docs = await Document.find().sort({ _id: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/documents', async (req, res) => {
    try {
        const doc = new Document(req.body);
        await doc.save();
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/documents/:id', async (req, res) => {
    try {
        await Document.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== SERVEUR =====
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});