const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Datos temporales en memoria (simulación de base de datos)
let products = [
    {
        _id: '1',
        name: 'Laptop Gamer Pro',
        description: 'Laptop de alto rendimiento para gaming y trabajo profesional',
        price: 1299.99,
        category: 'electronics',
        stock: 15,
        imageUrl: 'https://via.placeholder.com/300x200/purple/white?text=Laptop',
        featured: true,
        colors: [
            { name: 'Negro', code: '#000000', stock: 8 },
            { name: 'Plateado', code: '#C0C0C0', stock: 5 },
            { name: 'Azul', code: '#0066CC', stock: 2 }
        ],
        sizes: [],
        shippingOptions: [
            { type: 'standard', days: 5, price: 0 },
            { type: 'express', days: 2, price: 25 },
            { type: 'overnight', days: 1, price: 50 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '2',
        name: 'Camiseta Elegant',
        description: 'Camiseta de algodón orgánico con diseño moderno',
        price: 29.99,
        category: 'clothing',
        stock: 50,
        imageUrl: 'https://via.placeholder.com/300x200/pink/white?text=Camiseta',
        featured: true,
        colors: [
            { name: 'Blanco', code: '#FFFFFF', stock: 15 },
            { name: 'Negro', code: '#000000', stock: 20 },
            { name: 'Rosa', code: '#FFC0CB', stock: 10 },
            { name: 'Azul', code: '#0066CC', stock: 5 }
        ],
        sizes: [
            { name: 'XS', stock: 5 },
            { name: 'S', stock: 15 },
            { name: 'M', stock: 20 },
            { name: 'L', stock: 8 },
            { name: 'XL', stock: 2 }
        ],
        shippingOptions: [
            { type: 'standard', days: 3, price: 0 },
            { type: 'express', days: 1, price: 15 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '3',
        name: 'Smartphone Ultra',
        description: 'Teléfono inteligente con cámara de alta resolución',
        price: 899.99,
        category: 'electronics',
        stock: 25,
        imageUrl: 'https://via.placeholder.com/300x200/blue/white?text=Smartphone',
        featured: false,
        colors: [
            { name: 'Negro', code: '#000000', stock: 10 },
            { name: 'Blanco', code: '#FFFFFF', stock: 8 },
            { name: 'Azul', code: '#0066CC', stock: 7 }
        ],
        sizes: [],
        shippingOptions: [
            { type: 'standard', days: 4, price: 0 },
            { type: 'express', days: 2, price: 20 },
            { type: 'overnight', days: 1, price: 35 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '4',
        name: 'Vestido de Verano',
        description: 'Vestido ligero y fresco perfecto para el verano',
        price: 49.99,
        category: 'clothing',
        stock: 30,
        imageUrl: 'https://via.placeholder.com/300x200/yellow/white?text=Vestido',
        featured: false,
        colors: [
            { name: 'Amarillo', code: '#FFFF00', stock: 12 },
            { name: 'Rosa', code: '#FFC0CB', stock: 10 },
            { name: 'Azul', code: '#0066CC', stock: 8 }
        ],
        sizes: [
            { name: 'XS', stock: 3 },
            { name: 'S', stock: 10 },
            { name: 'M', stock: 12 },
            { name: 'L', stock: 5 }
        ],
        shippingOptions: [
            { type: 'standard', days: 3, price: 0 },
            { type: 'express', days: 1, price: 15 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '5',
        name: 'Juego de Sartenes',
        description: 'Set de 3 sartenes antiadherentes de alta calidad',
        price: 89.99,
        category: 'home',
        stock: 20,
        imageUrl: 'https://via.placeholder.com/300x200/green/white?text=Sartenes',
        featured: true,
        colors: [
            { name: 'Negro', code: '#000000', stock: 20 }
        ],
        sizes: [],
        shippingOptions: [
            { type: 'standard', days: 7, price: 0 },
            { type: 'express', days: 3, price: 30 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// API endpoints temporales
app.get('/api/products', (req, res) => {
    const { category, featured } = req.query;
    let filteredProducts = products;
    
    if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (featured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.featured);
    }
    
    res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p._id === req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
});

app.post('/api/products', (req, res) => {
    const newProduct = {
        _id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    products[index] = {
        ...products[index],
        ...req.body,
        updatedAt: new Date()
    };
    res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    products.splice(index, 1);
    res.json({ message: 'Producto eliminado correctamente' });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para página de detalles del producto
app.get('/product.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Modo temporal con datos en memoria');
});
