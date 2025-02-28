import mongoose from 'mongoose';

const vecinoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  barrio: { type: String, required: true },
  telefono: { type: String, required: true },
  m2: { type: Number, required: true },
  esDelegacion: { type: Boolean, default: false },
  delegacion: { type: String, default: '' },
  abona: { type: Boolean, default: false },
  numeroRecibo: { type: String, default: '' },
  motivoNoAbona: { type: String, default: '' },
});

const Vecino = mongoose.models.Vecino || mongoose.model('Vecino', vecinoSchema);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const vecino = new Vecino(req.body);
      const savedVecino = await vecino.save();
      res.status(201).json(savedVecino);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};