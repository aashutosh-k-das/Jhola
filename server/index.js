const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('../config/env');
const connectDB = require('../config/db');
const { notFound, errorHandler } = require('./middleware/error');
const { securityHeaders, apiLimiter } = require('./middleware/security');

const app = express();
app.disable('x-powered-by');
if (env.trustProxy) app.set('trust proxy', Number(env.trustProxy) || env.trustProxy);

app.use(securityHeaders);

app.use(cors({ origin: env.isProd ? env.clientUrl : true }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', apiLimiter);
if (!env.isProd) app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Jhola API' }));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/miscRoutes'));
app.use('/api', notFound);

// In production, serve the built React app.
const dist = path.join(__dirname, '..', 'client', 'dist');
if (env.isProd && fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => (req.method === 'GET' ? res.sendFile(path.join(dist, 'index.html')) : next()));
}

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.port, () => console.log(`Jhola API running on http://localhost:${env.port}`));
});
