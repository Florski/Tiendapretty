const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
    try {
        if (global.memoryDB) {
            // Usar memoria
            const { category, featured } = req.query;
            let products = [...global.memoryDB];
            
            if (category) {
                products = products.filter(p => p.category === category);
            }
            
            if (featured === 'true') {
                products = products.filter(p => p.featured === true);
            }
            
            res.json(products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
            // Usar MongoDB
            const { category, featured } = req.query;
            let filter = {};
            
            if (category) {
                filter.category = category;
            }
            
            if (featured === 'true') {
                filter.featured = true;
            }
            
            const products = await Product.find(filter).sort({ createdAt: -1 });
            res.json(products);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET product by ID
router.get('/:id', async (req, res) => {
    try {
        if (global.memoryDB) {
            // Usar memoria
            const product = global.memoryDB.find(p => p._id === req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            res.json(product);
        } else {
            // Usar MongoDB
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            res.json(product);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new product
router.post('/', async (req, res) => {
    try {
        if (global.memoryDB) {
            // Usar memoria
            const product = {
                ...req.body,
                _id: Date.now().toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            global.memoryDB.push(product);
            res.status(201).json(product);
        } else {
            // Usar MongoDB
            const product = new Product(req.body);
            const savedProduct = await product.save();
            res.status(201).json(savedProduct);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        if (global.memoryDB) {
            // Usar memoria
            const index = global.memoryDB.findIndex(p => p._id === req.params.id);
            if (index === -1) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            
            global.memoryDB[index] = {
                ...global.memoryDB[index],
                ...req.body,
                updatedAt: new Date()
            };
            
            res.json(global.memoryDB[index]);
        } else {
            // Usar MongoDB
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            
            res.json(product);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        if (global.memoryDB) {
            // Usar memoria
            const index = global.memoryDB.findIndex(p => p._id === req.params.id);
            if (index === -1) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            
            global.memoryDB.splice(index, 1);
            res.json({ message: 'Producto eliminado correctamente' });
        } else {
            // Usar MongoDB
            const product = await Product.findByIdAndDelete(req.params.id);
            
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            
            res.json({ message: 'Producto eliminado correctamente' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
