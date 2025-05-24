// Cart logic for Drift's Gardeners merch store with quantity support and shipping selection

const SHIPPING_METHODS = {
    economy: { label: "Economy", price: 10 },
    standard: { label: "Standard", price: 15 },
    express: { label: "Express", price: 25 }
};

const PRODUCTS = {
    shirt: {
        name: "Drift's Gardeners T-Shirt (Black)",
        price: 30,
        tax: 3,
        sizes: ["Small", "Medium", "Large", "Extra Large"],
        image: "https://raw.githubusercontent.com/SemerauStudios/Merch-Site/main/drifts%20gardeners/shirt%20f.png",
        backImage: "https://raw.githubusercontent.com/SemerauStudios/Merch-Site/main/drifts%20gardeners/shirt%20b.PNG",
        type: "shirt"
    },
    "cap-white": {
        name: "Drift's Gardeners Cap (White)",
        price: 20,
        tax: 2,
        size: "Standard",
        image: "https://raw.githubusercontent.com/SemerauStudios/Merch-Site/main/drifts%20gardeners/hat.jfif",
        type: "cap-white"
    },
    "cap-black": {
        name: "Drift's Gardeners Cap (Black)",
        price: 20,
        tax: 2,
        size: "Standard",
        image: "https://raw.githubusercontent.com/SemerauStudios/Merch-Site/main/drifts%20gardeners/black%20hat.png",
        type: "cap-black"
    }
};

let cart = [];

function addToCart(productKey) {
    let qty = 1;
    let size = null;
    if (productKey === "shirt") {
        size = document.getElementById("shirt-size").value;
        qty = parseInt(document.getElementById("shirt-qty").value, 10);
    } else if (productKey === "cap-white") {
        qty = parseInt(document.getElementById("cap-white-qty").value, 10);
    } else if (productKey === "cap-black") {
        qty = parseInt(document.getElementById("cap-black-qty").value, 10);
    }

    let cartKey = productKey === "shirt" ? `${productKey}_${size}` : productKey;
    let itemIndex = cart.findIndex(item => item.cartKey === cartKey);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity = Math.min(cart[itemIndex].quantity + qty, 5);
    } else {
        let item = {
            ...PRODUCTS[productKey],
            quantity: qty,
            cartKey
        };
        if (productKey === "shirt") {
            item.selectedSize = size;
        }
        cart.push(item);
    }
    updateCartDisplay();
}

function getShippingSelection() {
    const ship = document.getElementById('shipping-method');
    if (!ship) return SHIPPING_METHODS.economy;
    const value = ship.value;
    return SHIPPING_METHODS[value] || SHIPPING_METHODS.economy;
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById("cart-items");
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
        document.getElementById("cart-summary").innerHTML = "";
        document.getElementById("checkout-btn").disabled = true;
        return;
    }
    let html = "<ul>";
    let subtotal = 0, totalTax = 0;
    cart.forEach((item, idx) => {
        let imgTag = "";
        if (item.type === "shirt") {
            imgTag = `<img src="${item.image}" alt="Shirt Front" class="shirt-front product-image-expandable" style="width:40px;height:auto;margin-right:6px;vertical-align:middle;border-radius:4px;border:1px solid #ccc;">` +
                     `<img src="${item.backImage}" alt="Shirt Back" class="shirt-back product-image-expandable" style="width:40px;height:auto;margin-right:6px;vertical-align:middle;border-radius:4px;border:1px solid #ccc;">`;
        } else if (item.type === "cap-white" || item.type === "cap-black") {
            imgTag = `<img src="${item.image}" alt="Cap" class="cap-image product-image-expandable" style="width:40px;height:auto;margin-right:6px;vertical-align:middle;border-radius:4px;border:1px solid #ccc;">`;
        }

        html += `<li>
            <div class="cart-item-row">
                ${imgTag}
                <div>
                    ${item.name}${item.selectedSize ? " - " + item.selectedSize : ""}
                    <div class="cart-quantity-controls">
                        <button class="cart-qty-btn" type="button" data-idx="${idx}" data-delta="-1" ${item.quantity === 1 ? "disabled" : ""}>-</button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button class="cart-qty-btn" type="button" data-idx="${idx}" data-delta="1" ${item.quantity === 5 ? "disabled" : ""}>+</button>
                    </div>
                </div>
            </div>
            <button class="remove-btn" type="button" data-remove-idx="${idx}">Remove</button>
        </li>`;

        subtotal += item.price * item.quantity;
        totalTax += item.tax * item.quantity;
    });
    html += "</ul>";
    cartItemsDiv.innerHTML = html;

    // Get shipping cost
    const shipping = getShippingSelection();

    const total = subtotal + totalTax + shipping.price;
    document.getElementById("cart-summary").innerHTML = `
        <p>Subtotal: $${subtotal}</p>
        <p>Tax: $${totalTax}</p>
        <p>Shipping (${shipping.label}): $${shipping.price}</p>
        <h3>Total: $${total}</h3>
    `;
    document.getElementById("checkout-btn").disabled = false;

    // Setup cart events again since HTML is replaced
    setupCartEvents();

    // Re-apply expander setup for any new images added to cart
    setupImageExpander();
}

function changeQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity < 1) cart[index].quantity = 1;
        if (cart[index].quantity > 5) cart[index].quantity = 5;
        updateCartDisplay();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Checkout with Square links for each product
function checkout() {
    // Check for exactly one unique product type in the cart
    if (cart.length === 1) {
        const item = cart[0];
        if (item.type === "cap-black") {
            window.location.href = "https://square.link/u/fQkXHHAY";
        } else if (item.type === "shirt") {
            window.location.href = "https://square.link/u/XcIXg56T";
        } else if (item.type === "cap-white") {
            window.location.href = "https://square.link/u/ox6wsnMT";
        } else {
            alert("Checkout is only available for T-Shirts and Caps.");
        }
    } else {
        alert("Please add only one type of item to your cart and try again. (One product per checkout is currently supported.)");
    }
}

// Setup cart event listeners
function setupCartEvents() {
    // Quantity change
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            const delta = parseInt(btn.getAttribute('data-delta'), 10);
            changeQuantity(idx, delta);
        });
    });
    // Remove item
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const idx = parseInt(btn.getAttribute('data-remove-idx'), 10);
            removeFromCart(idx);
        });
    });
}

// Image expand/zoom feature for product images
function setupImageExpander() {
    document.querySelectorAll('.product-image-expandable').forEach(img => {
        if (img.dataset.expanderBound) return;
        img.dataset.expanderBound = "1";
        img.setAttribute('tabindex', 0);

        img.addEventListener('click', function(e) {
            openImageModal(img.src, img.alt);
        });
        img.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                openImageModal(img.src, img.alt);
                e.preventDefault();
            }
        });
    });

    const overlay = document.getElementById('image-modal-overlay');
    if (overlay && !overlay.dataset.expanderBound) {
        overlay.dataset.expanderBound = "1";
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target.classList.contains('image-modal-close')) {
                closeImageModal();
            }
        });
        window.addEventListener('keydown', function(e) {
            if (overlay.classList.contains('active') && e.key === 'Escape') {
                closeImageModal();
            }
        });
    }
}

function openImageModal(src, alt) {
    const overlay = document.getElementById('image-modal-overlay');
    const modalImg = document.getElementById('image-modal-img');
    if (overlay && modalImg) {
        modalImg.src = src;
        modalImg.alt = alt;
        overlay.classList.add('active');
        setTimeout(() => {
            document.querySelector('.image-modal-close')?.focus();
        }, 100);
    }
}
function closeImageModal() {
    const overlay = document.getElementById('image-modal-overlay');
    if (overlay) overlay.classList.remove('active');
}

// Setup product "Add to Cart" buttons and shipping change event
function setupProductEvents() {
    // Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productKey = btn.getAttribute('data-product');
            addToCart(productKey);
        });
    });
    // Shipping change event
    const shippingSelect = document.getElementById('shipping-method');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', function() {
            updateCartDisplay();
        });
    }
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            checkout();
        });
    }
}

// On DOM loaded
window.addEventListener('DOMContentLoaded', function() {
    setupProductEvents();
    updateCartDisplay();
    setupImageExpander();
});
