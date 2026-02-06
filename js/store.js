(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/js/store.js b/js/store.js
--- a/js/store.js
+++ b/js/store.js
@@ -0,0 +1,522 @@
+// Store functionality for bultimore.com
+document.addEventListener('DOMContentLoaded', function() {
+    loadProducts();
+    updateCartModal();
+    initializeStoreFeatures();
+});
+
+let currentProducts = [];
+let filteredProducts = [];
+
+function loadProducts() {
+    showLoading(true);
+    
+    // Simulate API call delay
+    setTimeout(() => {
+        currentProducts = window.contentManager.getProducts();
+        filteredProducts = [...currentProducts];
+        displayProducts(filteredProducts);
+        showLoading(false);
+    }, 500);
+}
+
+function displayProducts(products) {
+    const container = document.getElementById('products-grid');
+    const noResults = document.getElementById('no-results');
+    
+    if (!container) return;
+
+    if (products.length === 0) {
+        container.innerHTML = '';
+        if (noResults) noResults.style.display = 'block';
+        return;
+    }
+
+    if (noResults) noResults.style.display = 'none';
+
+    container.innerHTML = products.map(product => `
+        <div class="product-card ${product.featured ? 'featured' : ''}" onclick="viewProduct(${product.id})">
+            <div class="product-image">
+                <img src="${product.image}" alt="${product.title}" onerror="handleImageError(this)">
+                <div class="product-overlay">
+                    <button class="quick-view-btn" onclick="event.stopPropagation(); viewProduct(${product.id})">
+                        Quick View
+                    </button>
+                </div>
+                <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
+                    <i class="far fa-heart"></i>
+                </button>
+            </div>
+            <div class="product-info">
+                <div class="category-badge">${product.category}</div>
+                <h3 class="product-title">${product.title}</h3>
+                <p class="product-description">${product.description}</p>
+                <div class="product-price">$${product.price}</div>
+                <div class="product-actions">
+                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id}, '${product.title}', ${product.price}, '${product.image}')">
+                        Add to Cart
+                    </button>
+                    <button class="view-details-btn" onclick="event.stopPropagation(); viewProduct(${product.id})">
+                        Details
+                    </button>
+                </div>
+            </div>
+        </div>
+    `).join('');
+}
+
+function searchProducts() {
+    const query = document.getElementById('search-input').value.toLowerCase();
+    
+    if (!query.trim()) {
+        filteredProducts = [...currentProducts];
+    } else {
+        filteredProducts = currentProducts.filter(product =>
+            product.title.toLowerCase().includes(query) ||
+            product.description.toLowerCase().includes(query) ||
+            product.category.toLowerCase().includes(query)
+        );
+    }
+    
+    displayProducts(filteredProducts);
+}
+
+function filterProducts() {
+    const categoryFilter = document.getElementById('category-filter').value;
+    
+    filteredProducts = currentProducts.filter(product => {
+        return !categoryFilter || product.category === categoryFilter;
+    });
+    
+    // Apply search if there's a query
+    const searchQuery = document.getElementById('search-input').value;
+    if (searchQuery.trim()) {
+        searchProducts();
+    } else {
+        displayProducts(filteredProducts);
+    }
+}
+
+function sortProducts() {
+    const sortBy = document.getElementById('sort-select').value;
+    
+    switch (sortBy) {
+        case 'newest':
+            filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
+            break;
+        case 'oldest':
+            filteredProducts.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
+            break;
+        case 'price-low':
+            filteredProducts.sort((a, b) => a.price - b.price);
+            break;
+        case 'price-high':
+            filteredProducts.sort((a, b) => b.price - a.price);
+            break;
+        case 'name':
+            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
+            break;
+    }
+    
+    displayProducts(filteredProducts);
+}
+
+function viewProduct(productId) {
+    const product = window.contentManager.getProduct(productId);
+    if (!product) return;
+
+    const productDetail = document.getElementById('product-detail');
+    productDetail.innerHTML = `
+        <div class="product-detail-grid">
+            <div>
+                <img src="${product.image}" alt="${product.title}" class="product-detail-image" onerror="handleImageError(this)">
+            </div>
+            <div class="product-detail-info">
+                <div class="category-badge">${product.category}</div>
+                <h2>${product.title}</h2>
+                <div class="product-detail-price">$${product.price}</div>
+                <div class="product-detail-description">
+                    ${product.description}
+                </div>
+                <div class="stock-status">
+                    <span class="in-stock">In Stock</span>
+                </div>
+                <div class="product-detail-actions">
+                    <button class="btn btn-primary" onclick="addToCart(${product.id}, '${product.title}', ${product.price}, '${product.image}'); closeModal('product-modal');">
+                        Add to Cart
+                    </button>
+                    <button class="btn btn-secondary" onclick="toggleWishlist(${product.id})">
+                        <i class="far fa-heart"></i> Wishlist
+                    </button>
+                </div>
+            </div>
+        </div>
+    `;
+
+    openModal('product-modal');
+}
+
+function updateCartModal() {
+    const cartItems = document.getElementById('cart-items');
+    const cartTotal = document.getElementById('cart-total');
+    
+    if (!cartItems || !cartTotal) return;
+
+    if (window.cart.length === 0) {
+        cartItems.innerHTML = `
+            <div class="empty-cart">
+                <i class="fas fa-shopping-cart"></i>
+                <h3>Your cart is empty</h3>
+                <p>Add some amazing artworks to get started!</p>
+                <a href="store.html" class="btn btn-primary continue-shopping">Continue Shopping</a>
+            </div>
+        `;
+        cartTotal.textContent = '$0.00';
+        return;
+    }
+
+    const total = window.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
+    
+    cartItems.innerHTML = window.cart.map(item => `
+        <div class="cart-item">
+            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="handleImageError(this)">
+            <div class="cart-item-info">
+                <div class="cart-item-title">${item.name}</div>
+                <div class="cart-item-price">$${item.price}</div>
+            </div>
+            <div class="cart-item-controls">
+                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
+                <input type="number" value="${item.quantity}" min="1" class="quantity-input" 
+                       onchange="updateQuantity(${item.id}, parseInt(this.value))">
+                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
+                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
+            </div>
+        </div>
+    `).join('');
+    
+    cartTotal.textContent = formatCurrency(total);
+}
+
+function proceedToCheckout() {
+    if (window.cart.length === 0) {
+        showMessage('Your cart is empty!', 'error');
+        return;
+    }
+
+    updateCheckoutSummary();
+    closeModal('cart-modal');
+    openModal('checkout-modal');
+}
+
+function updateCheckoutSummary() {
+    const checkoutItems = document.getElementById('checkout-items');
+    const checkoutTotal = document.getElementById('checkout-total');
+    
+    if (!checkoutItems || !checkoutTotal) return;
+
+    const total = window.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
+    
+    checkoutItems.innerHTML = window.cart.map(item => `
+        <div class="checkout-item">
+            <span>${item.name} × ${item.quantity}</span>
+            <span>$${(item.price * item.quantity).toFixed(2)}</span>
+        </div>
+    `).join('');
+    
+    checkoutTotal.textContent = formatCurrency(total);
+}
+
+function processPayment(event) {
+    event.preventDefault();
+    
+    const form = event.target;
+    if (!validateForm(form)) {
+        showMessage('Please fill in all required fields', 'error');
+        return;
+    }
+
+    const formData = new FormData(form);
+    const paymentData = {
+        fullName: formData.get('fullName'),
+        email: formData.get('email'),
+        phone: formData.get('phone'),
+        address: formData.get('address'),
+        paymentMethod: formData.get('paymentMethod'),
+        items: window.cart,
+        total: window.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
+    };
+
+    // Simulate payment processing
+    showLoading(true, 'Processing payment...');
+    
+    setTimeout(() => {
+        showLoading(false);
+        
+        if (paymentData.paymentMethod === 'mobile_money' || paymentData.paymentMethod === 'bank_transfer') {
+            // Integrate with Flutterwave/Paystack
+            initiateFlutterwavePayment(paymentData);
+        } else {
+            // Handle card payments
+            processCardPayment(paymentData);
+        }
+    }, 1000);
+}
+
+function initiateFlutterwavePayment(paymentData) {
+    // Flutterwave integration
+    FlutterwaveCheckout({
+        public_key: "FLWPUBK_TEST-XXXXX", // Replace with actual public key
+        tx_ref: "bult-" + Date.now(),
+        amount: paymentData.total,
+        currency: "USD",
+        payment_options: "mobilemoney,banktransfer",
+        customer: {
+            email: paymentData.email,
+            phone_number: paymentData.phone,
+            name: paymentData.fullName,
+        },
+        customizations: {
+            title: "bultimore Art Purchase",
+            description: "Payment for artwork",
+            logo: "https://your-logo-url.com/logo.png",
+        },
+        callback: function (data) {
+            console.log(data);
+            if (data.status === "successful") {
+                handleSuccessfulPayment(data, paymentData);
+            } else {
+                handleFailedPayment(data);
+            }
+        },
+        onclose: function() {
+            console.log("Payment modal closed");
+        }
+    });
+}
+
+function processCardPayment(paymentData) {
+    // For demo purposes, simulate successful payment
+    setTimeout(() => {
+        const mockResponse = {
+            status: "successful",
+            transaction_id: "mock-" + Date.now(),
+            amount: paymentData.total
+        };
+        handleSuccessfulPayment(mockResponse, paymentData);
+    }, 2000);
+}
+
+function handleSuccessfulPayment(response, paymentData) {
+    // Save order to local storage
+    const order = {
+        id: response.transaction_id,
+        ...paymentData,
+        status: 'completed',
+        date: new Date().toISOString()
+    };
+    
+    const orders = JSON.parse(localStorage.getItem('bultimore_orders')) || [];
+    orders.push(order);
+    localStorage.setItem('bultimore_orders', JSON.stringify(orders));
+    
+    // Clear cart
+    clearCart();
+    
+    // Show success message
+    closeModal('checkout-modal');
+    showSuccessModal(order);
+    
+    // Send confirmation email (would be handled by backend in real app)
+    console.log('Order completed:', order);
+}
+
+function handleFailedPayment(response) {
+    showMessage('Payment failed. Please try again.', 'error');
+    console.error('Payment failed:', response);
+}
+
+function showSuccessModal(order) {
+    const modal = document.createElement('div');
+    modal.className = 'modal';
+    modal.style.display = 'block';
+    modal.innerHTML = `
+        <div class="modal-content">
+            <div class="purchase-success">
+                <i class="fas fa-check-circle"></i>
+                <h3>Purchase Successful!</h3>
+                <p>Thank you for your order. You will receive a confirmation email shortly.</p>
+                <p><strong>Order ID:</strong> ${order.id}</p>
+                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Continue Shopping</button>
+            </div>
+        </div>
+    `;
+    
+    document.body.appendChild(modal);
+    
+    // Auto-remove after 10 seconds
+    setTimeout(() => {
+        if (modal.parentNode) {
+            modal.parentNode.removeChild(modal);
+        }
+    }, 10000);
+}
+
+function toggleWishlist(productId) {
+    const wishlist = JSON.parse(localStorage.getItem('bultimore_wishlist')) || [];
+    const index = wishlist.indexOf(productId);
+    
+    if (index === -1) {
+        wishlist.push(productId);
+        showMessage('Added to wishlist!', 'success');
+    } else {
+        wishlist.splice(index, 1);
+        showMessage('Removed from wishlist', 'success');
+    }
+    
+    localStorage.setItem('bultimore_wishlist', JSON.stringify(wishlist));
+    updateWishlistDisplay();
+}
+
+function updateWishlistDisplay() {
+    const wishlist = JSON.parse(localStorage.getItem('bultimore_wishlist')) || [];
+    
+    document.querySelectorAll('.wishlist-btn').forEach((btn, index) => {
+        const productId = parseInt(btn.getAttribute('data-product-id'));
+        if (wishlist.includes(productId)) {
+            btn.classList.add('active');
+            btn.querySelector('i').className = 'fas fa-heart';
+        } else {
+            btn.classList.remove('active');
+            btn.querySelector('i').className = 'far fa-heart';
+        }
+    });
+}
+
+function initializeStoreFeatures() {
+    // Search functionality
+    const searchInput = document.getElementById('search-input');
+    if (searchInput) {
+        searchInput.addEventListener('input', debounce(searchProducts, 300));
+        searchInput.addEventListener('keypress', function(e) {
+            if (e.key === 'Enter') {
+                searchProducts();
+            }
+        });
+    }
+
+    // Update cart modal when cart changes
+    const originalAddToCart = window.addToCart;
+    window.addToCart = function(...args) {
+        originalAddToCart.apply(this, args);
+        updateCartModal();
+    };
+
+    const originalRemoveFromCart = window.removeFromCart;
+    window.removeFromCart = function(...args) {
+        originalRemoveFromCart.apply(this, args);
+        updateCartModal();
+    };
+
+    const originalUpdateQuantity = window.updateQuantity;
+    window.updateQuantity = function(...args) {
+        originalUpdateQuantity.apply(this, args);
+        updateCartModal();
+    };
+
+    const originalClearCart = window.clearCart;
+    window.clearCart = function(...args) {
+        originalClearCart.apply(this, args);
+        updateCartModal();
+    };
+}
+
+function showLoading(show, message = 'Loading...') {
+    const loading = document.getElementById('products-loading');
+    if (loading) {
+        loading.style.display = show ? 'flex' : 'none';
+        if (show && message !== 'Loading...') {
+            loading.innerHTML = `<div class="spinner"></div><p>${message}</p>`;
+        }
+    }
+}
+
+// Price range filtering
+function filterByPriceRange(min, max) {
+    const minPrice = parseFloat(min) || 0;
+    const maxPrice = parseFloat(max) || Infinity;
+    
+    filteredProducts = currentProducts.filter(product => 
+        product.price >= minPrice && product.price <= maxPrice
+    );
+    
+    displayProducts(filteredProducts);
+}
+
+// Sort by rating (if reviews are implemented)
+function sortByRating() {
+    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
+    displayProducts(filteredProducts);
+}
+
+// Quick add to cart with animation
+function quickAddToCart(productId) {
+    const product = window.contentManager.getProduct(productId);
+    if (!product) return;
+
+    addToCart(productId, product.title, product.price, product.image);
+    
+    // Add visual feedback
+    const productCard = event.target.closest('.product-card');
+    if (productCard) {
+        productCard.style.transform = 'scale(0.95)';
+        setTimeout(() => {
+            productCard.style.transform = '';
+        }, 200);
+    }
+}
+
+// Share product functionality
+function shareProduct(productId) {
+    const product = window.contentManager.getProduct(productId);
+    if (!product) return;
+
+    if (navigator.share) {
+        navigator.share({
+            title: product.title,
+            text: product.description,
+            url: `${window.location.origin}/store.html?product=${productId}`
+        });
+    } else {
+        // Fallback: copy to clipboard
+        const url = `${window.location.origin}/store.html?product=${productId}`;
+        navigator.clipboard.writeText(url).then(() => {
+            showMessage('Product link copied to clipboard!', 'success');
+        });
+    }
+}
+
+// Handle URL parameters for direct product links
+function handleUrlParams() {
+    const urlParams = new URLSearchParams(window.location.search);
+    const productId = urlParams.get('product');
+    
+    if (productId) {
+        setTimeout(() => {
+            viewProduct(parseInt(productId));
+        }, 1000); // Wait for products to load
+    }
+}
+
+// Initialize URL parameter handling
+document.addEventListener('DOMContentLoaded', handleUrlParams);
+
+// Export functions for admin use
+window.storeManager = {
+    loadProducts,
+    displayProducts,
+    searchProducts,
+    filterProducts,
+    sortProducts,
+    viewProduct,
+    updateCartModal
+};
EOF
)