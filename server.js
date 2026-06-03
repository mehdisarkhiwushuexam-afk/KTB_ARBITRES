const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI est manquant dans les variables d\'environnement.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  });

// ─── Arbitre Schema ───────────────────────────────────────────────────────────
const arbitreSchema = new mongoose.Schema({
  nom:         { type: String, required: true },
  dob:         String,
  lieuNais:    String,
  cin:         String,
  cinDate:     String,
  cinLieu:     String,
  adresse:     String,
  cp:          String,
  tel:         String,
  nationalite: String,
  profession:  String,
  club:        String,
  niveau:      String,
  debut:       String,
  grade:       String,
  gradeDate:   String,
  banque:      String,
  rib:         String,
  photo:       { type: String, default: '' },
  stats:       { type: Array,  default: [] },
  createdAt:   { type: String, default: () => new Date().toLocaleDateString('fr-TN') }
});

const Arbitre = mongoose.model('Arbitre', arbitreSchema);

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return next();
  }
  return res.status(403).json({ error: 'Accès refusé' });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET tous les arbitres
app.get('/api/arbitres', async (req, res) => {
  try {
    const arbitres = await Arbitre.find().sort({ createdAt: -1 });
    res.json(arbitres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET un arbitre par ID
app.get('/api/arbitres/:id', async (req, res) => {
  try {
    const arbitre = await Arbitre.findById(req.params.id);
    if (!arbitre) return res.status(404).json({ error: 'Arbitre non trouvé' });
    res.json(arbitre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un arbitre (protégé)
app.post('/api/arbitres', authMiddleware, async (req, res) => {
  try {
    const arbitre = new Arbitre(req.body);
    await arbitre.save();
    res.status(201).json(arbitre);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT modifier un arbitre (protégé)
app.put('/api/arbitres/:id', authMiddleware, async (req, res) => {
  try {
    const arbitre = await Arbitre.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!arbitre) return res.status(404).json({ error: 'Arbitre non trouvé' });
    res.json(arbitre);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE supprimer un arbitre (protégé)
app.delete('/api/arbitres/:id', authMiddleware, async (req, res) => {
  try {
    const arbitre = await Arbitre.findByIdAndDelete(req.params.id);
    if (!arbitre) return res.status(404).json({ error: 'Arbitre non trouvé' });
    res.json({ message: 'Arbitre supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir le frontend (dossier public)
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
