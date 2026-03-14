const STORAGE_KEY = 'finetech-marketplace-state-v2';

const products = [
  { id: 1, title: 'KYC Automator', category: 'compliance', price: 149, rating: 4.8, featured: true },
  { id: 2, title: 'Fraud Shield AI', category: 'security', price: 289, rating: 4.9, featured: true },
  { id: 3, title: 'Ledger Insights', category: 'analytics', price: 99, rating: 4.5, featured: false },
  { id: 4, title: 'Invoice Flow Pro', category: 'automation', price: 179, rating: 4.4, featured: false },
  { id: 5, title: 'Risk Radar', category: 'analytics', price: 239, rating: 4.7, featured: true }
];

const defaultState = {
  cart: [],
  wishlist: [],
  orders: [],
  messages: [{ from: 'SellerBot', text: 'Welcome! Ask anything about listings.', at: Date.now() }]
};

const state = loadState();

const dom = {
  productsGrid: document.getElementById('productsGrid'),
  cartList: document.getElementById('cartList'),
  wishlist: document.getElementById('wishlist'),
  cartTotal: document.getElementById('cartTotal'),
  orders: document.getElementById('orders'),
  messages: document.getElementById('messages'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  maxPrice: document.getElementById('maxPrice'),
  maxPriceValue: document.getElementById('maxPriceValue'),
  sortBy: document.getElementById('sortBy'),
  productForm: document.getElementById('productForm'),
  placeOrderBtn: document.getElementById('placeOrderBtn'),
  messageForm: document.getElementById('messageForm'),
  messageInput: document.getElementById('messageInput'),
  statListings: document.getElementById('statListings'),
  statOrders: document.getElementById('statOrders'),
  statRevenue: document.getElementById('statRevenue'),
  headerListings: document.getElementById('headerListings'),
  headerOrders: document.getElementById('headerOrders'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  resultsCount: document.getElementById('resultsCount'),
  toast: document.getElementById('toast')
};

const productTemplate = document.getElementById('productCardTemplate');

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(raw);
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      messages: Array.isArray(parsed.messages) && parsed.messages.length ? parsed.messages : defaultState.messages
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('visible');
  window.clearTimeout(toast.timeout);
  toast.timeout = window.setTimeout(() => dom.toast.classList.remove('visible'), 1600);
}

function groupedCartItems() {
  const grouped = new Map();
  state.cart.forEach((item) => {
    const found = grouped.get(item.id);
    if (found) {
      found.quantity += 1;
    } else {
      grouped.set(item.id, { ...item, quantity: 1 });
    }
  });
  return Array.from(grouped.values());
}

function filteredProducts() {
  const search = dom.searchInput.value.trim().toLowerCase();
  const category = dom.categoryFilter.value;
  const maxPrice = Number(dom.maxPrice.value);
  const sortBy = dom.sortBy.value;

  const list = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search);
    const matchesCategory = category === 'all' || p.category === category;
    const matchesPrice = p.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sorters = {
    relevance: (a, b) => Number(b.featured) - Number(a.featured),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    ratingDesc: (a, b) => b.rating - a.rating
  };

  return list.sort(sorters[sortBy]);
}

function makeEmptyRow(text) {
  const row = document.createElement('li');
  row.className = 'empty';
  row.textContent = text;
  return row;
}

function renderProducts() {
  dom.productsGrid.innerHTML = '';
  const list = filteredProducts();
  dom.resultsCount.textContent = `${list.length} result${list.length === 1 ? '' : 's'}`;

  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No listings match these filters.';
    dom.productsGrid.appendChild(empty);
    return;
  }

  list.forEach((product) => {
    const card = productTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector('.title').textContent = product.title;
    card.querySelector('.meta').textContent = `${product.category} · ${product.featured ? 'Featured' : 'Trusted Seller'}`;
    card.querySelector('.price').textContent = formatMoney(product.price);
    card.querySelector('.rating').textContent = `Rating: ${product.rating.toFixed(1)}★`;

    card.querySelector('.add-cart').addEventListener('click', () => {
      state.cart.push(product);
      persistState();
      renderCart();
      toast(`${product.title} added to cart`);
    });

    card.querySelector('.add-wishlist').addEventListener('click', () => {
      const exists = state.wishlist.some((item) => item.id === product.id);
      if (!exists) {
        state.wishlist.push(product);
        persistState();
        renderWishlist();
        toast(`${product.title} saved to wishlist`);
      }
    });

    dom.productsGrid.appendChild(card);
  });
}

function removeFromCartById(id) {
  const index = state.cart.findIndex((item) => item.id === id);
  if (index >= 0) {
    state.cart.splice(index, 1);
  }
}

function renderCart() {
  dom.cartList.innerHTML = '';
  const grouped = groupedCartItems();

  if (!grouped.length) {
    dom.cartList.appendChild(makeEmptyRow('Your cart is empty.'));
  }

  grouped.forEach((item) => {
    const row = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'item-info';
    info.innerHTML = `<span>${item.title}</span><small>${item.quantity} × ${formatMoney(item.price)}</small>`;

    const controls = document.createElement('div');

    const removeOne = document.createElement('button');
    removeOne.className = 'secondary';
    removeOne.textContent = '-1';
    removeOne.addEventListener('click', () => {
      removeFromCartById(item.id);
      persistState();
      renderCart();
    });

    const removeAll = document.createElement('button');
    removeAll.className = 'danger';
    removeAll.textContent = 'Remove';
    removeAll.addEventListener('click', () => {
      state.cart = state.cart.filter((cartItem) => cartItem.id !== item.id);
      persistState();
      renderCart();
    });

    controls.append(removeOne, ' ', removeAll);
    row.append(info, controls);
    dom.cartList.appendChild(row);
  });

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  dom.cartTotal.textContent = formatMoney(total);
}

function renderWishlist() {
  dom.wishlist.innerHTML = '';
  if (!state.wishlist.length) {
    dom.wishlist.appendChild(makeEmptyRow('No saved items yet.'));
    return;
  }

  state.wishlist.forEach((item) => {
    const row = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'item-info';
    info.innerHTML = `<span>${item.title}</span><small>${item.category}</small>`;

    const remove = document.createElement('button');
    remove.className = 'danger';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      state.wishlist = state.wishlist.filter((wish) => wish.id !== item.id);
      persistState();
      renderWishlist();
    });

    row.append(info, remove);
    dom.wishlist.appendChild(row);
  });
}

function renderOrders() {
  dom.orders.innerHTML = '';
  if (!state.orders.length) {
    dom.orders.appendChild(makeEmptyRow('No orders yet.'));
    return;
  }

  state.orders.forEach((order) => {
    const row = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'item-info';
    info.innerHTML = `<span>#${order.id} · ${order.items} item(s) · ${formatMoney(order.total)}</span><small>${order.status} · ${new Date(order.createdAt).toLocaleDateString()}</small>`;
    row.append(info);
    dom.orders.appendChild(row);
  });
}

function renderMessages() {
  dom.messages.innerHTML = state.messages
    .map((message) => `<p><strong>${message.from}:</strong> ${message.text} <small class="muted">${formatTime(message.at)}</small></p>`)
    .join('');
  dom.messages.scrollTop = dom.messages.scrollHeight;
}

function renderStats() {
  const revenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  dom.statListings.textContent = String(products.length);
  dom.statOrders.textContent = String(state.orders.length);
  dom.statRevenue.textContent = formatMoney(revenue);
  dom.headerListings.textContent = String(products.length);
  dom.headerOrders.textContent = String(state.orders.length);
}

function addListing(event) {
  event.preventDefault();
  const title = document.getElementById('newTitle').value.trim();
  const category = document.getElementById('newCategory').value;
  const price = Number(document.getElementById('newPrice').value);
  const rating = Number(document.getElementById('newRating').value);

  if (title.length < 3 || price <= 0 || rating < 1 || rating > 5) {
    toast('Please provide valid listing details.');
    return;
  }

  const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  products.unshift({ id, title, category, price, rating, featured: false });

  dom.productForm.reset();
  renderProducts();
  renderStats();
  toast('Listing added.');
}

function placeOrder() {
  if (!state.cart.length) {
    toast('Cart is empty.');
    return;
  }

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  state.orders.unshift({
    id: state.orders.length + 1,
    items: state.cart.length,
    total,
    status: 'Processing',
    createdAt: Date.now()
  });

  state.cart = [];
  persistState();
  renderCart();
  renderOrders();
  renderStats();
  toast('Order placed successfully.');
}

function sendMessage(event) {
  event.preventDefault();
  const content = dom.messageInput.value.trim();
  if (!content) {
    return;
  }

  state.messages.push({ from: 'You', text: content, at: Date.now() });
  state.messages.push({ from: 'SellerBot', text: 'Thanks! A seller will respond shortly.', at: Date.now() + 1000 });
  dom.messageInput.value = '';
  persistState();
  renderMessages();
}

function clearFilters() {
  dom.searchInput.value = '';
  dom.categoryFilter.value = 'all';
  dom.maxPrice.value = '500';
  dom.sortBy.value = 'relevance';
  dom.maxPriceValue.textContent = '$500';
  renderProducts();
}

[dom.searchInput, dom.categoryFilter, dom.maxPrice, dom.sortBy].forEach((control) => {
  control.addEventListener('input', () => {
    dom.maxPriceValue.textContent = `$${dom.maxPrice.value}`;
    renderProducts();
  });
});

dom.productForm.addEventListener('submit', addListing);
dom.placeOrderBtn.addEventListener('click', placeOrder);
dom.messageForm.addEventListener('submit', sendMessage);
dom.clearFiltersBtn.addEventListener('click', clearFilters);

renderProducts();
renderCart();
renderWishlist();
renderOrders();
renderMessages();
renderStats();
