const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión de datos: memoria -> Supabase -> MongoDB
if (process.env.MONGODB_URI === 'memory') {
    console.log('Usando almacenamiento en memoria temporal');
    // Usar almacenamiento en memoria
    global.memoryDB = [];
} else if (process.env.SUPABASE_URL) {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseKey) {
        console.error('SUPABASE_URL configurado, pero falta SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY');
        global.memoryDB = [];
        console.log('Usando almacenamiento en memoria temporal mientras se configura Supabase');
    } else {
        global.supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

        global.supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .then(({ error, count }) => {
                if (error) {
                    console.error('Supabase conectado, pero con error en tabla products:', error.message);
                    return;
                }
                console.log(`Conectado a Supabase. Registros en products: ${count ?? 0}`);
            })
            .catch(err => console.error('Error de conexión con Supabase:', err.message));
    }
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

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body || {};
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUser && password === adminPassword) {
        return res.json({ success: true });
    }

    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
