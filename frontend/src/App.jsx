import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategoryFilter from "./components/CategoryFilter";
import FoodList from "./components/FoodList";
import SpecialOffers from "./components/SpecialOffers";
import WhyChooseUs from "./components/WhyChooseUs";
import CartDrawer from "./components/CartDrawer";
import AuthModal from "./components/AuthModal";
import OrdersModal from "./components/OrdersModal";
import CheckoutSuccessModal from "./components/CheckoutSuccessModal";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";
import { FOOD_ITEMS } from "./data/foodData";
import { authAPI, foodAPI, orderAPI, getToken, setToken, removeToken } from "./services/api";
import "./App.css";

function App() {
  // Food & Catalog States
  const [foods, setFoods] = useState(FOOD_ITEMS);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeNav, setActiveNav] = useState("home");
  const [appliedPromo, setAppliedPromo] = useState("FOODIE50");
  const [toastMessage, setToastMessage] = useState(null);

  // User Authentication State
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Shopping Cart State
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("foodie_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Modal Visibility States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState({
    isOpen: false,
    orderDetails: null
  });

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("foodie_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Cart save error:", e);
    }
  }, [cartItems]);

  // Check auth session on startup
  useEffect(() => {
    const verifyUserSession = async () => {
      const token = getToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.warn("Session expired or invalid:", err.message);
        removeToken();
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyUserSession();
  }, []);

  // Fetch live foods from GET /api/food
  useEffect(() => {
    const fetchLiveFoods = async () => {
      setLoadingFoods(true);
      try {
        const res = await foodAPI.getAll();
        if (res.success && Array.isArray(res.foods) && res.foods.length > 0) {
          setFoods(res.foods);
        } else {
          // Keep default FOOD_ITEMS as graceful fallback
          setFoods(FOOD_ITEMS);
        }
      } catch (err) {
        console.warn("Backend API unavailable, using local food catalog:", err.message);
        setFoods(FOOD_ITEMS);
      } finally {
        setLoadingFoods(false);
      }
    };

    fetchLiveFoods();
  }, []);

  // Fetch orders when user logs in or opens Orders Modal
  const fetchUserOrders = async () => {
    if (!getToken()) return;
    setLoadingOrders(true);
    try {
      const res = await orderAPI.getMyOrders();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.warn("Could not fetch user orders:", err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  // Trigger floating toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Cart Operations
  const handleAddToCart = (food) => {
    setCartItems((prevItems) => {
      const foodId = food._id || food.id;
      const existing = prevItems.find((item) => (item._id || item.id) === foodId);
      if (existing) {
        return prevItems.map((item) =>
          (item._id || item.id) === foodId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems,
        {
          id: foodId,
          _id: food._id,
          name: food.name,
          price: food.price,
          quantity: 1,
          image: food.image,
          category: food.category
        }
      ];
    });
    showToast(`Added "${food.name}" to cart! 🛒`);
  };

  const handleUpdateQuantity = (foodId, delta) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if ((item._id || item.id) === foodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveItem = (foodId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => (item._id || item.id) !== foodId)
    );
    showToast("Item removed from cart");
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast("Cart has been cleared");
  };

  // Authentication Handlers
  const handleLoginSuccess = (token, userProfile) => {
    setToken(token);
    setUser(userProfile);
    showToast(`Welcome back, ${userProfile.name}! 👋`);
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setOrders([]);
    if (activeNav === "admin") {
      setActiveNav("home");
    }
    showToast("Logged out successfully");
  };

  const navigateToAdmin = () => {
    if (user && user.role === "admin") {
      setActiveNav("admin");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showToast("Access Denied: Administrator role required 🛡️");
    }
  };

  // Checkout & Order Placement Handler
  const handleCheckout = async (grandTotal, items, address) => {
    // 1. Enforce authentication
    if (!user || !getToken()) {
      showToast("Please log in or register to place your order! 🔐");
      setAuthModal({ isOpen: true, mode: "login" });
      return;
    }

    // 2. Validate items
    if (!items || items.length === 0) {
      showToast("Your cart is empty!");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Format payload for backend POST /api/orders
      const orderPayload = {
        items: items.map((item) => ({
          food: item._id || item.id,
          quantity: item.quantity
        })),
        deliveryAddress: address,
        paymentMethod: "COD"
      };

      const res = await orderAPI.create(orderPayload);

      if (res.success && res.order) {
        setOrders((prev) => [res.order, ...prev]);
        setCartItems([]);
        localStorage.removeItem("foodie_cart");
        setIsCartOpen(false);
        setCheckoutModal({ isOpen: true, orderDetails: res.order });
        showToast("Order placed successfully with the kitchen! 🍕");
      } else {
        throw new Error(res.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      showToast(err.message || "Unable to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Promo Code Handler
  const handleApplyOffer = (code) => {
    setAppliedPromo(code);
    setIsCartOpen(true);
    showToast(`Coupon ${code} applied to your cart! 🏷️`);
  };

  // Navigation Handlers
  const scrollToMenu = () => {
    setActiveNav("menu");
    const menuEl = document.getElementById("menu");
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToHome = () => {
    setActiveNav("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSearchTerm("");
    setSelectedCategory("All");
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      setSelectedCategory("All");
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchTerm("");
    scrollToMenu();
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="foodie-app">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        activeNav={activeNav}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        onOpenOrders={() => {
          setActiveNav("orders");
          setIsOrdersOpen(true);
          fetchUserOrders();
        }}
        user={user}
        onLogout={handleLogout}
        onNavigateHome={scrollToHome}
        onNavigateMenu={scrollToMenu}
        onNavigateAdmin={navigateToAdmin}
      />

      <main>
        {activeNav === "admin" && user && user.role === "admin" ? (
          <AdminDashboard
            user={user}
            onNavigateHome={scrollToHome}
            onShowToast={showToast}
          />
        ) : (
          <>
            {/* Hero Section */}
            <Hero
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onExploreMenu={scrollToMenu}
            />

            {/* Special Offers Section */}
            <SpecialOffers onApplyOffer={handleApplyOffer} />

            {/* Food Categories */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />

            {/* Popular Food Items Catalog */}
            <FoodList
              foods={foods}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              selectedCategory={selectedCategory}
              searchTerm={searchTerm}
              onResetFilters={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            />

            {/* Why Choose Us */}
            <WhyChooseUs />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateHome={scrollToHome}
        onNavigateMenu={scrollToMenu}
        onOpenOrders={() => {
          setIsOrdersOpen(true);
          fetchUserOrders();
        }}
      />

      {/* Slide-in Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckoutSuccess={handleCheckout}
        appliedPromo={appliedPromo}
        onApplyPromo={setAppliedPromo}
        onExploreMenu={scrollToMenu}
        user={user}
        isPlacingOrder={isPlacingOrder}
      />

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: "login" })}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* My Orders Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => {
          setIsOrdersOpen(false);
          setActiveNav("home");
        }}
        orders={orders}
        onExploreMenu={scrollToMenu}
        user={user}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        loading={loadingOrders}
      />

      {/* Checkout Success Confirmation Modal */}
      <CheckoutSuccessModal
        isOpen={checkoutModal.isOpen}
        orderDetails={checkoutModal.orderDetails}
        onClose={() => setCheckoutModal({ isOpen: false, orderDetails: null })}
        onTrackOrder={() => {
          setIsOrdersOpen(true);
          fetchUserOrders();
        }}
      />
    </div>
  );
}

export default App;
