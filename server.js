const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB o memoria
if (process.env.MONGODB_URI === 'memory') {
    console.log('Usando almacenamiento en memoria temporal');
    // Usar almacenamiento en memoria
    global.memoryDB = [];
} else {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión:', err));
}

// Importar rutas
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
