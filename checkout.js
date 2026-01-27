// Checkout Page JavaScript with Payment Gateway Integration

// Shipping cost (flat rate for now)
const SHIPPING_COST = 250;

// Promo codes
const PROMO_CODES = {
    'NYXEN10': 0.10,    // 10% off
    'FIRST20': 0.20,    // 20% off for first order
    'WELCOME15': 0.15   // 15% off
};

let appliedDiscount = 0;

// Initialize Stripe (Replace with your actual Stripe Publishable Key)
// Get your key from: https://dashboard.stripe.com/apikeys
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
const elements = stripe.elements();

// Create card element
const cardElement = elements.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#eaeaea',
            backgroundColor: '#1a1a1a',
            '::placeholder': {
                color: '#888',
            },
        },
        invalid: {
            color: '#ff4081',
        },
    },
});

// Mount card element
document.addEventListener('DOMContentLoaded', function() {
    const cardElementDiv = document.getElementById('card-element');
    if (cardElementDiv) {
        cardElement.mount('#card-element');
    }

    // Handle card errors
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    // Load order summary
    loadOrderSummary();

    // Payment method toggle
    setupPaymentMethodToggle();

    // Setup PayPal button
    setupPayPalButton();

    // Promo code
    document.getElementById('applyPromoBtn')?.addEventListener('click', applyPromoCode);

    // Place order button
    document.getElementById('placeOrderBtn')?.addEventListener('click', handlePlaceOrder);
});

// Load and display order summary
function loadOrderSummary() {
    const cart = getCart();
    const orderItemsDiv = document.getElementById('orderItems');
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    // Display items
    orderItemsDiv.innerHTML = cart.map(item => `
        <div class="summary-item">
            <div class="summary-item-info">
                <p class="item-name">${item.name}</p>
                <p class="item-details">Size: ${item.size} | Qty: ${item.qty}</p>
            </div>
            <div class="summary-item-price">PKR ${item.price * item.qty}</div>
        </div>
    `).join('');

    updateOrderTotals();
}

// Update order totals
function updateOrderTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = Math.round(subtotal * appliedDiscount);
    const total = subtotal + SHIPPING_COST - discount;

    document.getElementById('summarySubtotal').textContent = `PKR ${subtotal}`;
    document.getElementById('summaryShipping').textContent = `PKR ${SHIPPING_COST}`;
    document.getElementById('summaryTotal').textContent = `PKR ${total}`;
    
    const orderTotalBtn = document.querySelector('.order-total-btn');
    if (orderTotalBtn) {
        orderTotalBtn.textContent = `PKR ${total}`;
    }

    // Show/hide discount row
    if (discount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('summaryDiscount').textContent = `- PKR ${discount}`;
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }
}

// Payment method toggle
function setupPaymentMethodToggle() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');

    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            const method = this.dataset.method;
            
            // Update radio button
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            // Hide all payment forms
            paymentForms.forEach(form => form.classList.remove('active'));

            // Show selected payment form
            const selectedForm = document.getElementById(`${method}PaymentForm`);
            if (selectedForm) {
                selectedForm.classList.add('active');
            }
        });
    });
}

// Setup PayPal Button
function setupPayPalButton() {
    if (typeof paypal !== 'undefined') {
        const cart = getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const total = ((subtotal + SHIPPING_COST - (subtotal * appliedDiscount)) / 280).toFixed(2); // Convert PKR to USD (approx rate)

        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total
                        },
                        description: 'Nyxen Wears Order'
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Payment successful
                    processOrder('paypal', details);
                });
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                alert('Payment failed. Please try again or choose another payment method.');
            }
        }).render('#paypal-button-container');
    }
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.getElementById('promoInput');
    const code = promoInput.value.trim().toUpperCase();

    if (PROMO_CODES[code]) {
        appliedDiscount = PROMO_CODES[code];
        updateOrderTotals();
        alert(`Promo code applied! You saved ${(appliedDiscount * 100)}%`);
        promoInput.value = '';
        promoInput.disabled = true;
        document.getElementById('applyPromoBtn').disabled = true;
    } else {
        alert('Invalid promo code');
    }
}

// Handle Place Order
async function handlePlaceOrder() {
    // Validate shipping form
    const shippingForm = document.getElementById('shippingForm');
    if (!shippingForm.checkValidity()) {
        shippingForm.reportValidity();
        return;
    }

    // Get selected payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Show loading state
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '<span>Processing...</span>';
    placeOrderBtn.disabled = true;

    try {
        if (paymentMethod === 'card') {
            await processCardPayment();
        } else if (paymentMethod === 'paypal') {
            // PayPal handles its own flow
            alert('Please click the PayPal button above to complete payment');
            placeOrderBtn.innerHTML = originalText;
            placeOrderBtn.disabled = false;
        } else if (paymentMethod === 'cod') {
            processOrder('cod', null);
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
        placeOrderBtn.innerHTML = originalText;
        placeOrderBtn.disabled = false;
    }
}

// Process Card Payment via Stripe
async function processCardPayment() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal + SHIPPING_COST - (subtotal * appliedDiscount);

    // Get shipping information
    const shippingInfo = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        notes: document.getElementById('notes').value
    };

    // Create payment intent on your server
    // This is a placeholder - you need to implement your server endpoint
    const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: total,
            cart: cart,
            shipping: shippingInfo
        }),
    });

    const { clientSecret } = await response.json();

    // Confirm the payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: cardElement,
            billing_details: {
                name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                email: shippingInfo.email,
                phone: shippingInfo.phone,
                address: {
                    line1: shippingInfo.address,
                    city: shippingInfo.city,
                    postal_code: shippingInfo.postalCode,
                    country: 'PK'
                }
            }
        }
    });

    if (error) {
        throw error;
    } else {
        processOrder('card', paymentIntent);
    }
}

// Process order after successful payment
function processOrder(paymentMethod, paymentDetails) {
    const cart = getCart();
    const shippingInfo = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        notes: document.getElementById('notes').value
    };

    const orderData = {
        orderId: 'NYX' + Date.now(),
        items: cart,
        shipping: shippingInfo,
        payment: {
            method: paymentMethod,
            details: paymentDetails
        },
        totals: {
            subtotal: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
            shipping: SHIPPING_COST,
            discount: appliedDiscount,
            total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + SHIPPING_COST
        },
        timestamp: new Date().toISOString()
    };

    // Save order
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Send order confirmation email (implement your backend endpoint)
    sendOrderConfirmation(orderData);

    // Clear cart
    localStorage.removeItem('cart');

    // Redirect to success page
    window.location.href = 'success.html';
}

// Send order confirmation (placeholder - implement your backend)
async function sendOrderConfirmation(orderData) {
    try {
        await fetch('https://formspree.io/f/mqargqlv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: `New Order #${orderData.orderId}`,
                email: orderData.shipping.email,
                order: JSON.stringify(orderData, null, 2)
            })
        });
    } catch (error) {
        console.error('Failed to send confirmation:', error);
    }
}
