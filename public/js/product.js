let products = [];
let cart = [];
let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
let selectedShipping = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetails(productId);
    } else {
        window.location.href = 'index.html';
    }
});

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Error al cargar los productos');
    }
}

// Load specific product details
async function loadProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        
        if (product) {
            currentProduct = product;
            displayProductDetails(product);
        } else {
            showError('Producto no encontrado');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Error al cargar el producto');
    }
}

// Display product details
function displayProductDetails(product) {
    const container = document.getElementById('productDetails');
    
    container.innerHTML = `
        <div class="grid md:grid-cols-2 gap-8">
            <!-- Product Image -->
            <div class="space-y-4">
                <div class="bg-purple-100 rounded-lg p-8 flex items-center justify-center h-96">
                    ${product.imageUrl 
                        ? `<img src="${product.imageUrl}" alt="${product.name}" class="max-w-full max-h-full object-contain rounded-lg">`
                        : '<i class="fas fa-image text-6xl text-purple-300"></i>'
                    }
                </div>
                ${product.imageUrl ? `
                    <div class="grid grid-cols-4 gap-2">
                        ${[1,2,3,4].map(i => `
                            <div class="bg-purple-100 rounded p-2 flex items-center justify-center h-20 cursor-pointer hover:bg-purple-200 transition">
                                <img src="${product.imageUrl}" alt="${product.name} ${i}" class="max-w-full max-h-full object-contain">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <!-- Product Info -->
            <div class="space-y-6">
                <div>
                    <h1 class="text-3xl font-bold text-purple-800 mb-2">${product.name}</h1>
                    <div class="flex items-center gap-4 mb-4">
                        <span class="text-3xl font-bold text-purple-600">$${product.price.toFixed(2)}</span>
                        <span class="${product.stock > 0 ? 'text-green-500' : 'text-pink-500'} font-semibold">
                            ${product.stock > 0 ? `${product.stock} unidades disponibles` : 'Agotado'}
                        </span>
                    </div>
                    ${product.featured ? '<div class="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm mb-4"><i class="fas fa-star mr-1"></i> Producto Destacado</div>' : ''}
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold mb-2">Descripción</h3>
                    <p class="text-gray-600 leading-relaxed">${product.description}</p>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold mb-2">Detalles</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between py-2 border-b">
                            <span class="text-gray-600">Categoría:</span>
                            <span class="font-medium">${getCategoryName(product.category)}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b">
                            <span class="text-gray-600">SKU:</span>
                            <span class="font-medium">#${product._id}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b">
                            <span class="text-gray-600">Estado:</span>
                            <span class="font-medium ${product.stock > 0 ? 'text-green-500' : 'text-pink-500'}">
                                ${product.stock > 0 ? 'En Stock' : 'Agotado'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <label class="text-gray-700 font-medium">Cantidad:</label>
                        <div class="flex items-center border border-purple-200 rounded-lg">
                            <button onclick="decreaseQuantity()" class="px-3 py-2 hover:bg-purple-100 transition">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" id="quantity" value="1" min="1" max="${product.stock}" class="w-16 text-center border-0 focus:outline-none">
                            <button onclick="increaseQuantity()" class="px-3 py-2 hover:bg-purple-100 transition">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${product.colors && product.colors.length > 0 ? `
                    <div>
                        <label class="text-gray-700 font-medium block mb-2">Color:</label>
                        <div class="flex gap-2">
                            ${product.colors.map(color => `
                                <button onclick="selectColor('${color.name}', '${color.code}')" class="color-option border-2 rounded-lg p-2 hover:border-purple-400 transition" data-color="${color.name}">
                                    <div class="w-8 h-8 rounded" style="background-color: ${color.code}"></div>
                                    <span class="text-xs">${color.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${product.sizes && product.sizes.length > 0 ? `
                    <div>
                        <label class="text-gray-700 font-medium block mb-2">Talla:</label>
                        <div class="flex gap-2">
                            ${product.sizes.map(size => `
                                <button onclick="selectSize('${size.name}')" class="size-option border-2 border-purple-200 rounded-lg px-4 py-2 hover:border-purple-400 transition" data-size="${size.name}">
                                    ${size.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${product.shippingOptions && product.shippingOptions.length > 0 ? `
                    <div>
                        <label class="text-gray-700 font-medium block mb-2">Opción de Envío:</label>
                        <div class="space-y-2">
                            ${product.shippingOptions.map(shipping => `
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="shipping" value="${JSON.stringify(shipping)}" onchange="selectShipping(${JSON.stringify(shipping)})" class="text-purple-600">
                                    <span>${getShippingName(shipping.type)} - ${shipping.days} días ${shipping.price > 0 ? `(+$${shipping.price.toFixed(2)})` : '(Gratis)'}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <button onclick="addToCart()" class="w-full bg-purple-400 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition font-semibold ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> Agregar al Carrito
                    </button>
                    
                    <button onclick="buyNow()" class="w-full bg-pink-400 text-white px-6 py-3 rounded-lg hover:bg-pink-500 transition font-semibold ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-bolt"></i> Comprar Ahora
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Related Products -->
        <div class="mt-16">
            <h2 class="text-2xl font-bold mb-6">Productos Relacionados</h2>
            <div id="relatedProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Related products will be loaded here -->
            </div>
        </div>
    `;
    
    loadRelatedProducts(product.category);
}

// Load related products
function loadRelatedProducts(category) {
    const relatedContainer = document.getElementById('relatedProducts');
    const relatedProducts = products.filter(p => p.category === category && p._id !== currentProduct._id).slice(0, 4);
    
    relatedContainer.innerHTML = relatedProducts.map(product => `
        <div class="bg-purple-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer" onclick="goToProduct('${product._id}')">
            <div class="h-48 bg-purple-100 flex items-center justify-center">
                ${product.imageUrl 
                    ? `<img src="${product.imageUrl}" alt="${product.name}" class="w-full h-full object-cover">`
                    : `<i class="fas fa-image text-4xl text-purple-300"></i>`
                }
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                <p class="text-2xl font-bold text-purple-600">$${product.price.toFixed(2)}</p>
                <p class="text-sm ${product.stock > 0 ? 'text-green-500' : 'text-pink-500'}">
                    ${product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                </p>
            </div>
        </div>
    `).join('');
}

// Quantity controls
function increaseQuantity() {
    const input = document.getElementById('quantity');
    const max = parseInt(input.max);
    if (parseInt(input.value) < max) {
        input.value = parseInt(input.value) + 1;
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Selection functions
function selectColor(colorName, colorCode) {
    selectedColor = colorName;
    
    // Update UI
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('border-purple-400', 'bg-purple-50');
        btn.classList.add('border-gray-200');
    });
    
    const selectedBtn = document.querySelector(`[data-color="${colorName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-gray-200');
        selectedBtn.classList.add('border-purple-400', 'bg-purple-50');
    }
}

function selectSize(sizeName) {
    selectedSize = sizeName;
    
    // Update UI
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('border-purple-400', 'bg-purple-50');
        btn.classList.add('border-purple-200');
    });
    
    const selectedBtn = document.querySelector(`[data-size="${sizeName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-purple-200');
        selectedBtn.classList.add('border-purple-400', 'bg-purple-50');
    }
}

function selectShipping(shipping) {
    selectedShipping = shipping;
}

function getShippingName(type) {
    const names = {
        'standard': 'Estándar',
        'express': 'Express',
        'overnight': 'Overnight'
    };
    return names[type] || type;
}

// Cart functions
function loadCart() {
    const savedCart = localStorage.getItem('prettyCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem('prettyCart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart() {
    if (!currentProduct || currentProduct.stock === 0) return;
    
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Validate selections
    if (currentProduct.colors && currentProduct.colors.length > 0 && !selectedColor) {
        showError('Por favor selecciona un color');
        return;
    }
    
    if (currentProduct.sizes && currentProduct.sizes.length > 0 && !selectedSize) {
        showError('Por favor selecciona una talla');
        return;
    }
    
    if (currentProduct.shippingOptions && currentProduct.shippingOptions.length > 0 && !selectedShipping) {
        showError('Por favor selecciona una opción de envío');
        return;
    }
    
    const existingItem = cart.find(item => 
        item.productId === currentProduct._id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
    );
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= currentProduct.stock) {
            existingItem.quantity = newQuantity;
            showSuccess('Producto actualizado en el carrito');
        } else {
            showError('No hay suficiente stock disponible');
        }
    } else {
        cart.push({
            productId: currentProduct._id,
            name: currentProduct.name,
            price: currentProduct.price + (selectedShipping ? selectedShipping.price : 0),
            imageUrl: currentProduct.imageUrl,
            quantity: quantity,
            maxStock: currentProduct.stock,
            selectedColor: selectedColor,
            selectedSize: selectedSize,
            selectedShipping: selectedShipping
        });
        showSuccess('Producto agregado al carrito');
    }
    
    saveCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    displayCart();
    showSuccess('Producto eliminado del carrito');
}

function updateCartItemQuantity(productId, newQuantity) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        if (newQuantity <= item.maxStock && newQuantity > 0) {
            item.quantity = newQuantity;
            saveCart();
            displayCart();
        } else {
            showError('Cantidad no válida');
        }
    }
}

function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        saveCart();
        displayCart();
        showSuccess('Carrito vaciado');
    }
}

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

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function buyNow() {
    addToCart();
    showCart();
}

function checkout() {
    if (cart.length === 0) {
        showError('Tu carrito está vacío');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (confirm(`Confirmar pedido: ${itemCount} productos por $${total.toFixed(2)}`)) {
        cart = [];
        saveCart();
        closeCart();
        showSuccess('¡Pedido realizado con éxito! Gracias por tu compra.');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
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
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-400 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-pink-400 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
