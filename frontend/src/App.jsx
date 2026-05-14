import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const emptyCheckout = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  customer_address: "",
};

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
};

const emptyProduct = {
  id: null,
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  is_active: true,
  image: null,
};

function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("devshop_cart") || "[]"); }
    catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [checkoutForm, setCheckoutForm] = useState(emptyCheckout);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  const [adminTab, setAdminTab] = useState("overview");
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || "");
  const [adminUser, setAdminUser] = useState(
    JSON.parse(localStorage.getItem("adminUser") || "null")
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const authConfig = useMemo(
    () => ({ headers: { Authorization: `Token ${adminToken}` } }),
    [adminToken]
  );

  const showToast = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    window.clearTimeout(window.__devshopToastTimer);
    window.__devshopToastTimer = window.setTimeout(() => {
      setMessage("");
    }, 2600);
  };

  const loadPublicData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_URL}/products/`),
        axios.get(`${API_URL}/categories/`),
      ]);
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch {
      showToast("Unable to load data. Please start the Django backend.", "error");
    }
  };

  const loadOrders = async () => {
    if (!adminToken) return;
    try {
      const response = await axios.get(`${API_URL}/orders/`, authConfig);
      setOrders(response.data);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadPublicData();
  }, []);

  useEffect(() => {
    localStorage.setItem("devshop_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    loadOrders();
  }, [adminToken]);

  const visibleProducts = products
    .filter((product) => product.is_active || isAdminRoute)
    .filter((product) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.description || "").toLowerCase().includes(q) ||
        (product.category?.name || "").toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" ||
        String(product.category?.id) === String(categoryFilter);

      return matchesSearch && matchesCategory;
    });

  const lowStockProducts = products.filter((product) => Number(product.stock) <= 5);
  const pendingOrders = orders.filter((order) => order.status === "pending");

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const loginAdmin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/admin-login/`, loginForm);
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(response.data.user));
      setAdminToken(response.data.token);
      setAdminUser(response.data.user);
      setLoginForm({ username: "", password: "" });
      showToast("Admin login successful.", "success");
    } catch {
      showToast("Login failed. Use Django admin username and password.", "error");
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminToken("");
    setAdminUser(null);
    setOrders([]);
    showToast("Logged out.", "success");
  };

  const addToCart = (product) => {
    setMessage("");
    setCartOpen(true);

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const incrementCartItem = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
          : item
      )
    );
  };

  const decrementCartItem = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const submitOrder = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    const payload = {
      ...checkoutForm,
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await axios.post(`${API_URL}/orders/`, payload);
      setSuccessOrder(response.data);
      showToast("Order created successfully!", "success");
      setCart([]);
      setCartOpen(false);
      setCheckoutOpen(false);
      setCheckoutForm(emptyCheckout);
      await loadPublicData();
    } catch {
      showToast("Order failed. Please check stock and backend server.", "error");
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();

    try {
      await axios.post(`${API_URL}/categories/`, categoryForm, authConfig);
      setCategoryForm(emptyCategory);
      showToast("Category created successfully.", "success");
      await loadPublicData();
    } catch {
      showToast("Category creation failed. Check slug uniqueness or login.", "error");
    }
  };

  const buildProductPayload = () => {
    const formData = new FormData();
    formData.append("name", productForm.name);
    formData.append("slug", productForm.slug);
    formData.append("description", productForm.description);
    formData.append("price", productForm.price);
    formData.append("stock", Number(productForm.stock));
    formData.append("is_active", productForm.is_active ? "true" : "false");

    if (productForm.category_id) {
      formData.append("category_id", productForm.category_id);
    }

    if (productForm.image instanceof File) {
      formData.append("image", productForm.image);
    }

    return formData;
  };

  const submitProduct = async (event) => {
    event.preventDefault();

    const config = {
      headers: {
        Authorization: `Token ${adminToken}`,
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      if (productForm.id) {
        await axios.patch(`${API_URL}/products/${productForm.id}/`, buildProductPayload(), config);
        showToast("Product updated successfully.", "success");
      } else {
        await axios.post(`${API_URL}/products/`, buildProductPayload(), config);
        showToast("Product created successfully.", "success");
      }

      setProductForm(emptyProduct);
      await loadPublicData();
    } catch {
      showToast("Product save failed. Check required fields and login.", "error");
    }
  };

  const editProduct = (product) => {
    setAdminTab("products");
    setShowProductForm(true);
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category_id: product.category?.id || "",
      is_active: product.is_active,
      image: null,
    });
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/products/${productId}/`, authConfig);
      showToast("Product deleted successfully.", "success");
      await loadPublicData();
    } catch {
      showToast("Delete failed. Check login.", "error");
    }
  };

  const updateOrderStatus = async (order, status) => {
    try {
      await axios.patch(`${API_URL}/orders/${order.id}/`, { status }, authConfig);
      showToast(`Order #${order.id} updated to ${status}.`, "success");
      await loadOrders();
    } catch {
      showToast("Unable to update order status.", "error");
    }
  };


  const printOrder = (order) => {
    const rows = (order.order_items || []).map((item) => `
      <tr><td>${item.product_name}</td><td>${item.quantity}</td><td>${item.unit_price} MAD</td></tr>
    `).join("");

    const html = `
      <html><head><title>Invoice #${order.id}</title>
      <style>body{font-family:Arial;padding:40px}h1{color:#1e40af}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #ddd;padding:12px;text-align:left}.total{margin-top:24px;font-size:22px;font-weight:bold}</style>
      </head><body>
      <h1>DevShopPro Invoice #${order.id}</h1>
      <p><strong>Customer:</strong> ${order.customer_name}</p>
      <p><strong>Phone:</strong> ${order.customer_phone}</p>
      <p><strong>Address:</strong> ${order.customer_address}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <table><thead><tr><th>Product</th><th>Qty</th><th>Unit price</th></tr></thead><tbody>${rows || "<tr><td colspan='3'>No item details</td></tr>"}</tbody></table>
      <div class="total">Total: ${order.total_amount} MAD</div>
      </body></html>`;
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const goToAdmin = () => {
    window.location.href = "/admin";
  };

  const goToStore = () => {
    window.location.href = "/";
  };

  const CartDrawer = () => (
    <>
      {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)} />}
      <aside className={cartOpen ? "cart-drawer open" : "cart-drawer"}>
        <div className="drawer-head">
          <div>
            <span className="mini-label">Shopping cart</span>
            <h2>{cartItemsCount} item(s)</h2>
          </div>
          <button className="icon-btn" onClick={() => setCartOpen(false)}>×</button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add products from the store to start an order.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="drawer-item" key={item.id}>
                <div className="drawer-thumb">
                  {item.image ? <img src={item.image} alt={item.name} /> : <span>{item.name.charAt(0)}</span>}
                </div>

                <div className="drawer-info">
                  <strong>{item.name}</strong>
                  <p>{item.price} MAD</p>

                  <div className="qty-row">
                    <button onClick={() => decrementCartItem(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => incrementCartItem(item.id)}>+</button>
                    <button className="remove-link" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <div className="total-row">
            <span>Total</span>
            <strong>{cartTotal.toFixed(2)} MAD</strong>
          </div>

          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Checkout
          </button>
        </div>
      </aside>
    </>
  );

  const CheckoutModal = () => (
    <>
      {checkoutOpen && (
        <div className="modal-overlay" onClick={() => setCheckoutOpen(false)}>
          <div className="checkout-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setCheckoutOpen(false)}>×</button>

            <div className="section-title modal-title">
              <h2>Complete your order</h2>
              <p>No real payment. This creates a simulated order.</p>
            </div>

            <form className="checkout-form clean checkout-form-fixed" onSubmit={submitOrder} autoComplete="on">
              <input
                type="text"
                placeholder="Full name"
                value={checkoutForm.customer_name}
                onChange={(e) =>
                  setCheckoutForm({ ...checkoutForm, customer_name: e.target.value })
                }
                required
              />

              <input
                type="email"
                placeholder="Email optional"
                value={checkoutForm.customer_email}
                onChange={(e) =>
                  setCheckoutForm({ ...checkoutForm, customer_email: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Phone number"
                value={checkoutForm.customer_phone}
                onChange={(e) =>
                  setCheckoutForm({ ...checkoutForm, customer_phone: e.target.value })
                }
                required
              />

              <textarea
                placeholder="Delivery address"
                value={checkoutForm.customer_address}
                onChange={(e) =>
                  setCheckoutForm({ ...checkoutForm, customer_address: e.target.value })
                }
                required
              />

              <div className="total-row modal-total">
                <span>Total</span>
                <strong>{cartTotal.toFixed(2)} MAD</strong>
              </div>

              <button type="submit">Place order</button>
            </form>
          </div>
        </div>
      )}
    </>
  );

  const ProductModal = () => (
    <>
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>×</button>

            <div className="modal-image">
              {selectedProduct.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              ) : (
                <span>{selectedProduct.name.charAt(0)}</span>
              )}
            </div>

            <div>
              <p className="category">{selectedProduct.category?.name || "Product"}</p>
              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <strong>{selectedProduct.price} MAD</strong>
              <p>Stock: {selectedProduct.stock}</p>
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );


  const SuccessModal = () => (
    <>
      {successOrder && (
        <div className="modal-overlay" onClick={() => setSuccessOrder(null)}>
          <div className="success-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSuccessOrder(null)}>×</button>
            <div className="success-icon">✓</div>
            <h2>Order confirmed</h2>
            <p>Your simulated order has been created successfully.</p>
            <div className="success-box"><span>Order number</span><strong>#{successOrder.id}</strong></div>
            <button onClick={() => setSuccessOrder(null)}>Continue shopping</button>
          </div>
        </div>
      )}
    </>
  );

  const OrderDetailsModal = () => (
    <>
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            <h2>Order #{selectedOrder.id}</h2>
            <div className="order-info-grid">
              <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
              <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
              <p><strong>Email:</strong> {selectedOrder.customer_email || "-"}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
            </div>
            <p><strong>Address:</strong> {selectedOrder.customer_address}</p>
            <div className="table-wrapper">
              <table><thead><tr><th>Product</th><th>Qty</th><th>Unit price</th></tr></thead><tbody>
                {(selectedOrder.order_items || []).map((item) => <tr key={item.id}><td>{item.product_name}</td><td>{item.quantity}</td><td>{item.unit_price} MAD</td></tr>)}
              </tbody></table>
            </div>
            <div className="total-row modal-total"><span>Total</span><strong>{selectedOrder.total_amount} MAD</strong></div>
            <button onClick={() => printOrder(selectedOrder)}>Print invoice</button>
          </div>
        </div>
      )}
    </>
  );


  const Toast = ({ message, type }) => (
    <div className={type === "error" ? "toast-popup error" : "toast-popup success"}>
      <div className="toast-icon">{type === "error" ? "!" : "✓"}</div>
      <div>
        <strong>{type === "error" ? "Action failed" : "Success"}</strong>
        <p>{message}</p>
      </div>
    </div>
  );

  if (isAdminRoute) {
    return (
      <div className="admin-page">
        {message && <Toast message={message} type={messageType} />}

        {!adminToken ? (
          <section className="admin-login-page">
            <div className="login-brand">
              <span>DevShopPro</span>
              <h1>Admin Dashboard</h1>
              <p>Use the same account used for Django admin.</p>
              <button className="secondary-store-btn" onClick={goToStore}>← Back to store</button>
            </div>

            <div className="login-card">
              <h2>Login</h2>
              <form onSubmit={loginAdmin}>
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                />

                <button type="submit">Login to Dashboard</button>
              </form>
            </div>
          </section>
        ) : (
          <section className="admin-shell">
            <aside className="admin-sidebar">
              <div className="sidebar-brand">DevShop Admin</div>
              <button className={adminTab === "overview" ? "side-active" : ""} onClick={() => setAdminTab("overview")}>Overview</button>
              <button className={adminTab === "products" ? "side-active" : ""} onClick={() => setAdminTab("products")}>Products</button>
              <button className={adminTab === "orders" ? "side-active" : ""} onClick={() => setAdminTab("orders")}>Orders</button>
              <button className={adminTab === "settings" ? "side-active" : ""} onClick={() => setAdminTab("settings")}>Settings</button>
              <button onClick={goToStore}>View store</button>
              <button className="logout-btn" onClick={logoutAdmin}>Logout</button>
            </aside>

            <div className="admin-main">
              <div className="admin-topbar">
                <div>
                  <strong>Connected as {adminUser?.username}</strong>
                  <p>Professional React admin dashboard</p>
                </div>
                <button onClick={() => { loadPublicData(); loadOrders(); }}>Refresh</button>
              </div>

              {adminTab === "overview" && (
                <>
                  <div className="section-title admin-title">
                    <h2>Dashboard Overview</h2>
                    <p>Statistics and project monitoring.</p>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card"><span>Products</span><strong>{products.length}</strong></div>
                    <div className="stat-card"><span>Categories</span><strong>{categories.length}</strong></div>
                    <div className="stat-card"><span>Orders</span><strong>{orders.length}</strong></div>
                    <div className="stat-card warning"><span>Low Stock</span><strong>{lowStockProducts.length}</strong></div>
                  </div>

                  <div className="admin-card full">
                    <h3>Alerts</h3>
                    <p>{pendingOrders.length > 0 ? `You have ${pendingOrders.length} pending orders waiting for confirmation.` : "No pending order at the moment."}</p>
                    {lowStockProducts.length > 0 && <p>{lowStockProducts.length} products have low stock. Please restock soon.</p>}
                  </div>
                </>
              )}

              {adminTab === "products" && (
                <>
                  <div className="admin-actions-row">
                    <div>
                      <h2>Products Control</h2>
                      <p>Forms are hidden by default. Use the action buttons to manage categories and products.</p>
                    </div>

                    <div className="admin-action-buttons">
                      <button type="button" onClick={() => setShowCategoryForm(true)}>+ Add Category</button>
                      <button type="button" onClick={() => { setProductForm(emptyProduct); setShowProductForm(true); }}>+ Add Product</button>
                    </div>
                  </div>

                  {showCategoryForm && (
                    <div className="modal-overlay" onClick={() => setShowCategoryForm(false)}>
                      <form className="admin-form-modal" onSubmit={submitCategory} onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="modal-close" onClick={() => setShowCategoryForm(false)}>×</button>
                        <h3>Add Category</h3>
                        <p>Create a category and use it later for products.</p>
                        <input type="text" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                        <input type="text" placeholder="Slug example: electronics" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} required />
                        <textarea placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                        <div className="form-actions">
                          <button type="submit" onClick={() => setTimeout(() => setShowCategoryForm(false), 350)}>Create Category</button>
                          <button type="button" className="secondary-btn" onClick={() => setShowCategoryForm(false)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {showProductForm && (
                    <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
                      <form className="admin-form-modal wide" onSubmit={submitProduct} onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="modal-close" onClick={() => setShowProductForm(false)}>×</button>
                        <h3>{productForm.id ? "Edit Product" : "Add Product"}</h3>
                        <p>Fill product information, choose a category, and optionally upload an image.</p>

                        <input type="text" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                        <input type="text" placeholder="Slug example: smart-watch" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} required />

                        <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}>
                          <option value="">No category</option>
                          {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
                        </select>

                        <textarea placeholder="Product description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />

                        <div className="two-fields">
                          <input type="number" step="0.01" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                          <input type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
                        </div>

                        <input type="file" accept="image/*" onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })} />

                        <label className="checkbox-row">
                          <input type="checkbox" checked={productForm.is_active} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} />
                          Active product
                        </label>

                        <div className="form-actions">
                          <button type="submit" onClick={() => setTimeout(() => setShowProductForm(false), 450)}>{productForm.id ? "Update Product" : "Create Product"}</button>
                          <button type="button" className="secondary-btn" onClick={() => { setProductForm(emptyProduct); setShowProductForm(false); }}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="admin-card full">
                    <h3>Products Management</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id}>
                              <td>{product.image ? <img className="thumb" src={product.image} alt={product.name} /> : "-"}</td>
                              <td>{product.name}</td>
                              <td>{product.category?.name || "-"}</td>
                              <td>{product.price} MAD</td>
                              <td className={Number(product.stock) <= 5 ? "low-stock" : ""}>{product.stock}</td>
                              <td><span className={product.is_active ? "status active-status" : "status inactive-status"}>{product.is_active ? "Active" : "Inactive"}</span></td>
                              <td>
                                <div className="table-actions">
                                  <button type="button" onClick={() => editProduct(product)}>Edit</button>
                                  <button type="button" className="danger-btn" onClick={() => deleteProduct(product.id)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {adminTab === "orders" && (
                <div className="admin-card full">
                  <h3>Orders Management</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr><th>ID</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.customer_name}</td>
                            <td>{order.customer_phone}</td>
                            <td>{order.total_amount} MAD</td>
                            <td>
                              <select value={order.status} onChange={(e) => updateOrderStatus(order, e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td>{new Date(order.created_at).toLocaleString()}</td>
                            <td><div className="table-actions"><button onClick={() => setSelectedOrder(order)}>Details</button><button onClick={() => printOrder(order)}>Print</button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === "settings" && (
                <div className="admin-card full">
                  <h3>Project Settings</h3>
                  <p><strong>API URL:</strong> {API_URL}</p>
                  <p><strong>Authentication:</strong> Django Token Authentication</p>
                  <p><strong>Database:</strong> MySQL with Docker Compose, SQLite for local fallback</p>
                  <p><strong>CI/CD:</strong> GitHub Actions pipeline for tests and Docker build</p>
                </div>
              )}
            </div>
          </section>
        )}
        {OrderDetailsModal()}
      </div>
    );
  }

  return (
    <div className="store-page">
      <header className="store-header">
        <nav className="store-nav">
          <div className="logo">DevShop<span>Pro</span></div>

          <div className="store-actions">
            <a href="#products">Products</a>
            <a href="#categories">Categories</a>
            <a href="#why">Why us</a>
            <button className="admin-link" onClick={goToAdmin}>Admin</button>
            <button className="cart-button" onClick={() => setCartOpen(true)}>
              🛒 Cart <span>{cartItemsCount}</span>
            </button>
          </div>
        </nav>

        <section className="store-hero">
          <div>
            <span className="badge">Modern E-commerce</span>
            <h1>Shop smart products with a smooth experience.</h1>
            <p>Professional React storefront connected to Django API with product search, persistent cart, side cart and checkout modal.</p>
            <a className="hero-link" href="#products">Start shopping</a>
          </div>

          <div className="floating-card">
            <strong>{products.length}+</strong>
            <span>Products managed by DevShop admin</span>
          </div>
        </section>
      </header>

      <main>
        {message && <Toast message={message} type={messageType} />}

        <section id="categories" className="section categories-section">
          <div className="section-title"><h2>Categories</h2><p>Browse products by category.</p></div>
          <div className="category-strip">
            <button className={categoryFilter === "all" ? "category-pill active-pill" : "category-pill"} onClick={() => setCategoryFilter("all")}>All products</button>
            {categories.map((category) => (
              <button className={String(categoryFilter) === String(category.id) ? "category-pill active-pill" : "category-pill"} key={category.id} onClick={() => setCategoryFilter(category.id)}>{category.name}</button>
            ))}
          </div>
        </section>

        <section id="products" className="section">
          <div className="section-title">
            <h2>Featured Products</h2>
            <p>Search, filter and add products to a premium cart window.</p>
          </div>

          <div className="store-toolbar">
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image" onClick={() => setSelectedProduct(product)}>
                  {product.image ? <img src={product.image} alt={product.name} /> : <span>{product.name.charAt(0)}</span>}
                </div>

                <div className="product-info">
                  <p className="category">{product.category?.name || "Product"}</p>
                  <h3>{product.name}</h3>
                  <p className="description">{product.description}</p>

                  <div className="product-bottom">
                    <div>
                      <strong>{product.price} MAD</strong>
                      <small>Stock: {product.stock}</small>
                    </div>

                    <button onClick={() => addToCart(product)} disabled={product.stock <= 0}>
                      {product.stock > 0 ? "Add" : "Out of stock"}
                    </button>
                  </div>

                  <button className="details-btn" onClick={() => setSelectedProduct(product)}>View details</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="why" className="section why-section">
          <div className="section-title"><h2>Why DevShopPro?</h2><p>Small e-commerce platform with professional operations.</p></div>
          <div className="why-grid">
            <div><span>🚚</span><h3>Fast order flow</h3><p>Simple checkout form for simulated orders.</p></div>
            <div><span>🧾</span><h3>Admin invoices</h3><p>Orders can be reviewed and printed from dashboard.</p></div>
            <div><span>📦</span><h3>Stock tracking</h3><p>Product stock updates after every order.</p></div>
          </div>
        </section>
      </main>

      <footer className="store-footer"><div><strong>DevShopPro</strong><p>DevOps mini project: Django, React, MySQL, Docker and CI/CD.</p></div><button className="admin-link dark" onClick={goToAdmin}>Admin Dashboard</button></footer>

      {CartDrawer()}
      {CheckoutModal()}
      {SuccessModal()}
      {ProductModal()}
    </div>
  );
}

export default App;
