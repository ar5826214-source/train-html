// Cart Management Functions
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch (e) {
    console.error('Error reading cart:', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  } catch (e) {
    console.error('Error saving cart:', e);
    alert('Could not save to cart. Please try again.');
  }
}

function addToCart(name, price, size, qty) {
  // Validation
  if (!size || size === '') {
    alert('Please select a size');
    return;
  }

  const quantityNum = parseInt(qty);
  if (isNaN(quantityNum) || quantityNum < 1) {
    alert('Please enter a valid quantity');
    return;
  }

  const cart = getCart();
  cart.push({
    id: Date.now(),
    name: name,
    price: price,
    size: size,
    qty: quantityNum,
    timestamp: new Date().toISOString()
  });

  saveCart(cart);
  alert(`${name} (Size: ${size}, Qty: ${quantityNum}) added to cart!`);
}

function removeFromCart(itemId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== itemId);
  saveCart(filtered);
  renderCart();
}

function updateQty(itemId, newQty) {
  const quantityNum = parseInt(newQty);
  if (isNaN(quantityNum) || quantityNum < 1) {
    alert('Please enter a valid quantity');
    return;
  }

  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  if (item) {
    item.qty = quantityNum;
    saveCart(cart);
    renderCart();
  }
}

function updateCartCount() {
  const badges = document.querySelectorAll('#cartCount');
  const cart = getCart();
  badges.forEach(badge => {
    badge.textContent = cart.length;
  });
}

function renderCart() {
  const cartItemsDiv = document.getElementById('cartItems');
  const cart = getCart();

  if (!cartItemsDiv) return;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p style="text-align: center; padding: 40px 20px; color: #aaa;">Your cart is empty</p>';
    return;
  }

  cartItemsDiv.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p><strong>Size:</strong> ${item.size}</p>
        <p><strong>Price:</strong> PKR ${item.price}</p>
      </div>
      <div class="cart-item-controls">
        <label>Qty: <input type="number" value="${item.qty}" min="1" max="10" onchange="updateQty(${item.id}, this.value)"></label>
        <p><strong>Subtotal:</strong> PKR ${item.price * item.qty}</p>
        <button class="btn-remove" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    </div>
  `).join('');
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function proceedToCheckout() {
  const cart = getCart();
  
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  localStorage.setItem('cartOrder', JSON.stringify(cart));
  window.location.href = 'checkout.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  
  // Render cart if on cart page
  if (document.getElementById('cartItems')) {
    renderCart();
    
    // Display total
    const total = getCartTotal();
    const totalDiv = document.getElementById('cartTotal');
    if (totalDiv) {
      totalDiv.innerHTML = `<h2>Total: PKR ${total}</h2>`;
    }
  }
});
