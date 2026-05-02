let products = [];
let currentCategory = 'all';
let cart = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount(); // Initialize cart count from localStorage
    
    // Product form submission
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
});

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts();
        displayAdminProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Error al cargar los productos');
    }
}

// Display products in store view
function displayProducts() {
    const featuredContainer = document.getElementById('featuredProducts');
    const allContainer = document.getElementById('allProducts');
    
    // Filter products
    let filteredProducts = currentCategory === 'all' 
        ? products 
        : products.filter(p => p.category === currentCategory);
    
    // Display featured products (only when showing all)
    if (currentCategory === 'all') {
        const featuredProducts = products.filter(p => p.featured);
        featuredContainer.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
        featuredContainer.parentElement.style.display = 'block';
    } else {
        featuredContainer.innerHTML = '';
        featuredContainer.parentElement.style.display = 'none';
    }
    
    // Display all filtered products
    allContainer.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    
    // Show category title when filtered
    const allProductsSection = document.getElementById('allProducts').parentElement;
    const categoryTitle = allProductsSection.querySelector('h2');
    if (currentCategory !== 'all') {
        categoryTitle.textContent = `${getCategoryName(currentCategory)} - ${filteredProducts.length} productos`;
    } else {
        categoryTitle.textContent = 'Todos los Productos';
    }
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="bg-purple-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div class="h-48 bg-purple-100 flex items-center justify-center">
                ${product.imageUrl 
                    ? `<img src="${product.imageUrl}" alt="${product.name}" class="w-full h-full object-cover">`
                    : `<i class="fas fa-image text-4xl text-purple-300"></i>`
                }
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description}</p>
                <div class="flex justify-between items-center mb-3">
                    <span class="text-2xl font-bold text-purple-600">$${product.price.toFixed(2)}</span>
                    <span class="text-sm ${product.stock > 0 ? 'text-green-500' : 'text-pink-500'}">
                        ${product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                    </span>
                </div>
                <div class="flex gap-2">
                    <button onclick="viewProduct('${product._id}')" class="flex-1 bg-purple-400 text-white px-3 py-2 rounded hover:bg-purple-500 transition">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button onclick="addToCart('${product._id}')" class="flex-1 bg-pink-400 text-white px-3 py-2 rounded hover:bg-pink-500 transition ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Display products in admin view
function displayAdminProducts() {
    const container = document.getElementById('adminProducts');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No hay productos registrados</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-4 py-2 text-left">Imagen</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Categoría</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Precio</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Stock</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Destacado</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr class="hover:bg-gray-50">
                        <td class="border border-gray-300 px-4 py-2">
                            ${product.imageUrl 
                                ? `<img src="${product.imageUrl}" alt="${product.name}" class="w-12 h-12 object-cover rounded">`
                                : '<i class="fas fa-image text-gray-400"></i>'
                            }
                        </td>
                        <td class="border border-gray-300 px-4 py-2 font-medium">${product.name}</td>
                        <td class="border border-gray-300 px-4 py-2">${getCategoryName(product.category)}</td>
                        <td class="border border-gray-300 px-4 py-2">$${product.price.toFixed(2)}</td>
                        <td class="border border-gray-300 px-4 py-2">${product.stock}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            ${product.featured 
                                ? '<i class="fas fa-star text-yellow-500"></i>' 
                                : '<i class="far fa-star text-gray-300"></i>'
                            }
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <button onclick="editProduct('${product._id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Add new product
async function addProduct() {
    const product = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        imageUrl: document.getElementById('productImage').value,
        featured: document.getElementById('productFeatured').checked,
        colors: getColorsData(),
        sizes: getSizesData(),
        shippingOptions: getShippingData()
    };
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        if (response.ok) {
            showSuccess('Producto agregado correctamente');
            document.getElementById('productForm').reset();
            resetDynamicFields();
            loadProducts();
        } else {
            const error = await response.json();
            showError('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showError('Error al agregar el producto');
    }
}

// Get colors data from form
function getColorsData() {
    const colors = [];
    const colorRows = document.querySelectorAll('#colorsContainer > div');
    
    colorRows.forEach(row => {
        const name = row.querySelector('.color-name')?.value;
        const code = row.querySelector('.color-code')?.value;
        const stock = row.querySelector('.color-stock')?.value;
        
        if (name && code && stock) {
            colors.push({ name, code, stock: parseInt(stock) });
        }
    });
    
    return colors;
}

// Get sizes data from form
function getSizesData() {
    const sizes = [];
    const sizeRows = document.querySelectorAll('#sizesContainer > div');
    
    sizeRows.forEach(row => {
        const name = row.querySelector('.size-name')?.value;
        const stock = row.querySelector('.size-stock')?.value;
        
        if (name && stock) {
            sizes.push({ name, stock: parseInt(stock) });
        }
    });
    
    return sizes;
}

// Get shipping options data from form
function getShippingData() {
    const shippingOptions = [];
    const shippingRows = document.querySelectorAll('#shippingContainer > div');
    
    shippingRows.forEach(row => {
        const type = row.querySelector('.shipping-type')?.value;
        const days = row.querySelector('.shipping-days')?.value;
        const price = row.querySelector('.shipping-price')?.value;
        
        if (type && days && price) {
            shippingOptions.push({ type, days: parseInt(days), price: parseFloat(price) });
        }
    });
    
    return shippingOptions;
}

// Add color field
function addColorField() {
    const container = document.getElementById('colorsContainer');
    const newField = document.createElement('div');
    newField.className = 'flex gap-2 items-center';
    newField.innerHTML = `
        <input type="text" placeholder="Nombre del color" class="color-name flex-1 px-3 py-2 border border-purple-200 rounded-lg">
        <input type="color" class="color-code w-16 h-10 border border-purple-200 rounded">
        <input type="number" placeholder="Stock" class="color-stock w-20 px-3 py-2 border border-purple-200 rounded-lg">
        <button type="button" onclick="this.parentElement.remove()" class="bg-pink-400 text-white px-3 py-2 rounded hover:bg-pink-500">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(newField);
}

// Add size field
function addSizeField() {
    const container = document.getElementById('sizesContainer');
    const newField = document.createElement('div');
    newField.className = 'flex gap-2 items-center';
    newField.innerHTML = `
        <input type="text" placeholder="Talla (XS, S, M, L, XL)" class="size-name flex-1 px-3 py-2 border border-purple-200 rounded-lg">
        <input type="number" placeholder="Stock" class="size-stock w-20 px-3 py-2 border border-purple-200 rounded-lg">
        <button type="button" onclick="this.parentElement.remove()" class="bg-pink-400 text-white px-3 py-2 rounded hover:bg-pink-500">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(newField);
}

// Add shipping field
function addShippingField() {
    const container = document.getElementById('shippingContainer');
    const newField = document.createElement('div');
    newField.className = 'grid grid-cols-4 gap-2 items-center';
    newField.innerHTML = `
        <select class="shipping-type px-3 py-2 border border-purple-200 rounded-lg">
            <option value="standard">Estándar</option>
            <option value="express">Express</option>
            <option value="overnight">Overnight</option>
        </select>
        <input type="number" placeholder="Días" class="shipping-days px-3 py-2 border border-purple-200 rounded-lg">
        <input type="number" placeholder="Precio" step="0.01" class="shipping-price px-3 py-2 border border-purple-200 rounded-lg">
        <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-pink-400 text-white px-3 py-2 rounded hover:bg-pink-500">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(newField);
}

// Reset dynamic fields
function resetDynamicFields() {
    document.getElementById('colorsContainer').innerHTML = `
        <div class="flex gap-2 items-center">
            <input type="text" placeholder="Nombre del color" class="color-name flex-1 px-3 py-2 border border-purple-200 rounded-lg">
            <input type="color" class="color-code w-16 h-10 border border-purple-200 rounded">
            <input type="number" placeholder="Stock" class="color-stock w-20 px-3 py-2 border border-purple-200 rounded-lg">
            <button type="button" onclick="addColorField()" class="bg-purple-400 text-white px-3 py-2 rounded hover:bg-purple-500">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    document.getElementById('sizesContainer').innerHTML = `
        <div class="flex gap-2 items-center">
            <input type="text" placeholder="Talla (XS, S, M, L, XL)" class="size-name flex-1 px-3 py-2 border border-purple-200 rounded-lg">
            <input type="number" placeholder="Stock" class="size-stock w-20 px-3 py-2 border border-purple-200 rounded-lg">
            <button type="button" onclick="addSizeField()" class="bg-purple-400 text-white px-3 py-2 rounded hover:bg-purple-500">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    document.getElementById('shippingContainer').innerHTML = `
        <div class="grid grid-cols-4 gap-2 items-center">
            <select class="shipping-type px-3 py-2 border border-purple-200 rounded-lg">
                <option value="standard">Estándar</option>
                <option value="express">Express</option>
                <option value="overnight">Overnight</option>
            </select>
            <input type="number" placeholder="Días" class="shipping-days px-3 py-2 border border-purple-200 rounded-lg">
            <input type="number" placeholder="Precio" step="0.01" class="shipping-price px-3 py-2 border border-purple-200 rounded-lg">
            <button type="button" onclick="addShippingField()" class="bg-purple-400 text-white px-3 py-2 rounded hover:bg-purple-500">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
}

// Edit product
async function editProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        const product = await response.json();
        
        // Fill form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.imageUrl || '';
        document.getElementById('productFeatured').checked = product.featured;
        
        // Change form to update mode
        const form = document.getElementById('productForm');
        form.onsubmit = function(e) {
            e.preventDefault();
            updateProduct(id);
        };
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
        submitBtn.classList.remove('bg-purple-400', 'hover:bg-purple-500');
        submitBtn.classList.add('bg-pink-400', 'hover:bg-pink-500');
        
        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Error al cargar el producto');
    }
}

// Update product
async function updateProduct(id) {
    const product = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        imageUrl: document.getElementById('productImage').value,
        featured: document.getElementById('productFeatured').checked
    };
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        if (response.ok) {
            showSuccess('Producto actualizado correctamente');
            resetForm();
            loadProducts();
        } else {
            const error = await response.json();
            showError('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showError('Error al actualizar el producto');
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Producto eliminado correctamente');
            loadProducts();
        } else {
            const error = await response.json();
            showError('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Error al eliminar el producto');
    }
}

// View product details
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// Add to cart
function addToCart(productId, quantity = 1) {
    if (typeof productId === 'object') {
        // Legacy support for old addToCart calls
        productId = productId;
        quantity = 1;
    }
    
    const product = products.find(p => p._id === productId);
    if (!product || product.stock === 0) return;
    
    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('prettyCart') || '[]');
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += quantity;
            showSuccess('Producto agregado al carrito');
        } else {
            showError('No hay suficiente stock');
        }
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: quantity,
            maxStock: product.stock
        });
        showSuccess('Producto agregado al carrito');
    }
    
    localStorage.setItem('prettyCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('prettyCart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Filter by category
function filterByCategory(category) {
    currentCategory = category;
    
    // Update category card styles
    document.querySelectorAll('[onclick^="filterByCategory"]').forEach(card => {
        const innerDiv = card.querySelector('div');
        innerDiv.classList.remove('bg-purple-400', 'bg-pink-400');
        innerDiv.classList.add('bg-purple-100', 'bg-pink-100');
    });
    
    // Highlight selected category
    event.currentTarget.querySelector('div').classList.remove('bg-purple-100', 'bg-pink-100');
    if (category === 'all') {
        event.currentTarget.querySelector('div').classList.add('bg-pink-400');
    } else {
        event.currentTarget.querySelector('div').classList.add('bg-purple-400');
    }
    
    // Scroll to products section when selecting a category
    if (category !== 'all') {
        setTimeout(() => {
            document.getElementById('allProducts').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
    displayProducts();
}

// Cart functions
function showCart() {
    displayCart();
    document.getElementById('cartModal').classList.remove('hidden');
}

function closeCart() {
    document.getElementById('cartModal').classList.add('hidden');
}

function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    const cart = JSON.parse(localStorage.getItem('prettyCart') || '[]');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-shopping-cart text-6xl text-purple-300 mb-4"></i>
                <p class="text-gray-500">Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center gap-4 bg-white rounded-lg p-4 mb-4">
            <div class="w-20 h-20 bg-purple-100 rounded flex items-center justify-center">
                ${item.imageUrl 
                    ? `<img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-cover rounded">`
                    : '<i class="fas fa-image text-2xl text-purple-300"></i>'
                }
            </div>
            <div class="flex-1">
                <h4 class="font-semibold">${item.name}</h4>
                <p class="text-purple-600 font-semibold">$${item.price.toFixed(2)}</p>
                ${item.selectedColor ? `<p class="text-sm text-gray-600">Color: ${item.selectedColor}</p>` : ''}
                ${item.selectedSize ? `<p class="text-sm text-gray-600">Talla: ${item.selectedSize}</p>` : ''}
                ${item.selectedShipping ? `<p class="text-sm text-gray-600">Envío: ${item.selectedShipping.type} (${item.selectedShipping.days} días)</p>` : ''}
            </div>
            <div class="flex items-center gap-2">
                <button onclick="updateCartItemQuantity('${item.productId}', ${item.quantity - 1})" class="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded">
                    <i class="fas fa-minus text-xs"></i>
                </button>
                <span class="w-8 text-center">${item.quantity}</span>
                <button onclick="updateCartItemQuantity('${item.productId}', ${item.quantity + 1})" class="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded">
                    <i class="fas fa-plus text-xs"></i>
                </button>
            </div>
            <div class="text-right">
                <p class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart('${item.productId}')" class="text-pink-500 hover:text-pink-700 text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('prettyCart') || '[]');
    cart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('prettyCart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
    showSuccess('Producto eliminado del carrito');
}

function updateCartItemQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('prettyCart') || '[]');
    const item = cart.find(item => item.productId === productId);
    if (item) {
        if (newQuantity > 0) {
            item.quantity = newQuantity;
            localStorage.setItem('prettyCart', JSON.stringify(cart));
            updateCartCount();
            displayCart();
        }
    }
}

function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        localStorage.setItem('prettyCart', JSON.stringify([]));
        updateCartCount();
        displayCart();
        showSuccess('Carrito vaciado');
    }
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('prettyCart') || '[]');
    if (cart.length === 0) {
        showError('Tu carrito está vacío');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (confirm(`Confirmar pedido: ${itemCount} productos por $${total.toFixed(2)}`)) {
        localStorage.setItem('prettyCart', JSON.stringify([]));
        closeCart();
        updateCartCount();
        showSuccess('¡Pedido realizado con éxito! Gracias por tu compra.');
    }
}

// Show/hide views
function showStore() {
    document.getElementById('storeView').classList.remove('hidden');
    document.getElementById('adminView').classList.add('hidden');
}

function showAdmin() {
    document.getElementById('storeView').classList.add('hidden');
    document.getElementById('adminView').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('productModal').classList.add('hidden');
}

// Reset form
function resetForm() {
    document.getElementById('productForm').reset();
    const form = document.getElementById('productForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        addProduct();
    };
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar Producto';
    submitBtn.classList.remove('bg-pink-400', 'hover:bg-pink-500');
    submitBtn.classList.add('bg-purple-400', 'hover:bg-purple-500');
}

// Utility functions
function getCategoryName(category) {
    const categories = {
        'electronics': 'Electrónica',
        'clothing': 'Ropa',
        'home': 'Hogar',
        'books': 'Libros',
        'other': 'Otros'
    };
    return categories[category] || category;
}

function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-400 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-pink-400 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
