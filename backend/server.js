import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import router from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(json({
  limit: '50mb',
  verify: (req, res, buf) => {
    if (buf.length > 50 * 1024 * 1024) {
      return res.status(413).send('Payload too large');
    }
  }
}));

app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas
app.use('/api/', router);

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend de autenticação está rodando');
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erro no servidor!');
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});