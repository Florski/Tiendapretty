const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['electronics', 'clothing', 'home', 'books', 'other']
    },
    imageUrl: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    // New fields for variants
    colors: [{
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true // Hex color code
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    }],
    sizes: [{
        name: {
            type: String,
            required: true // XS, S, M, L, XL, etc.
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    }],
    shippingOptions: [{
        type: {
            type: String,
            required: true,
            enum: ['standard', 'express', 'overnight']
        },
        days: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
