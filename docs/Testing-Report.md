# System Testing & Quality Assurance Report — Food Ordering System (Foodie) 🧪📋

This report documents the verification, validation, and automated quality assurance results for the **Food Ordering System (Foodie)**. All test cases reflect actual executions against the live Express.js backend, React 19 frontend, and MongoDB Atlas database.

---

## 1. Testing Objectives and Scope

### 1.1. Objectives
1. **Functional Correctness**: Verify all customer, admin, and database operations execute according to system specifications.
2. **Data Integrity & Financial Accuracy**: Ensure order totals are computed strictly on the backend using authoritative MongoDB Atlas prices, preventing client-side price tampering.
3. **Role-Based Access Control (RBAC)**: Validate strict authorization boundaries separating customers from administrators.
4. **Resilience & Reliability**: Verify network connection stability, TLS handshake handling with cloud MongoDB Atlas clusters, and graceful error handling.

### 1.2. Scope
- **In-Scope**:
  - React (Vite) client build, HMR, UI states, and `localStorage` caching.
  - Express.js REST API routes (`/api/auth`, `/api/food`, `/api/orders`, `/api/health`).
  - Mongoose models, validation constraints, pre-save hooks, and MongoDB Atlas persistence.
  - Customer registration, login, cart management, checkout, and order history tracking.
  - Admin dashboard, analytics metrics, food catalog CRUD, and fulfillment status updates.
- **Out-of-Scope (Marked as Not Run)**:
  - Third-party payment gateway webhooks (Stripe / Razorpay).
  - Real-time GPS rider tracking via WebSockets.
  - Large-scale distributed load stress testing (>10,000 concurrent virtual users).

---

## 2. Frontend Testing (React 19 + Vite)

### 2.1. Production Build & Bundling
- **Tool**: Vite 8 Production Bundler (`vite build`).
- **Command**: `npm run build` executed in `frontend/`.
- **Result**: Successfully transformed 45 modules into optimized static client assets:
  - `dist/index.html`: `0.75 kB`
  - `dist/assets/index.css`: `53.13 kB` (gzip: `10.19 kB`)
  - `dist/assets/index.js`: `293.61 kB` (gzip: `86.36 kB`)
  - **Build Duration**: `616ms` with **0 compilation errors or syntax warnings**.

### 2.2. Hot Module Replacement (HMR) & Dev Server
- **Tool**: Vite Development Server (`http://localhost:5173`).
- **Result**: Verified real-time client state preservation during component updates across `Navbar.jsx`, `FoodCard.jsx`, `CartDrawer.jsx`, and `AdminDashboard.jsx`. Server responded with HTTP `200 OK`.

### 2.3. Client-Side Persistence
- **Storage Target**: Browser `localStorage`.
- **Tested Keys**:
  - `foodie_token`: Holds user/admin JWT for persistent login sessions.
  - `foodie_cart`: Serializes active shopping cart items across page refreshes.

---

## 3. Backend API Testing (Express.js 5 + Node.js)

### 3.1. Server Lifecycle & Health Verification
- **Endpoint**: `GET /api/health`
- **Result**: Returned HTTP `200 OK` with payload:
  ```json
  {
    "success": true,
    "message": "Food Ordering API is running"
  }
  ```

### 3.2. Middleware Execution Pipeline
- **CORS Middleware**: Verified cross-origin requests from `http://localhost:5173` to `http://localhost:5000` are permitted without origin rejection.
- **Body Parsing**: Verified `express.json()` and `express.urlencoded()` parse incoming JSON payloads correctly.
- **Global Error Handler**: Verified unhandled exceptions return structured JSON errors (`500 Internal Server Error`) without crashing the Node.js process.

---

## 4. MongoDB Database Testing (MongoDB Atlas + Mongoose 9)

### 4.1. Connection Stability & TLS Alert 80 Resolution
- **Issue Tested**: Under Windows Node.js runtimes, default IPv6 DNS resolution intermittently triggers OpenSSL TLS Alert 80 (`tlsv1 alert internal error`) during Atlas M0 secondary shard discovery.
- **Solution Tested**: Configured `{ family: 4, serverSelectionTimeoutMS: 10000 }` in `backend/config/db.js` coupled with an automatic 6-attempt primary discovery loop.
- **Result**: Connection established successfully to Atlas primary shard (`ac-5rzjnai-shard-00-02.sxjmjvx.mongodb.net`) under test database `test`.

### 4.2. Schema Validation & Indexes
- **Unique Indexes**: Verified `email` field in `users` collection enforces uniqueness at database level.
- **Validation Constraints**: Verified Mongoose rejects invalid category enums, negative prices, and empty orders.

---

## 5. Customer Registration and Login Testing

### 5.1. Registration (`POST /api/auth/register`)
- **Test Input**: Name, valid email, 6+ character password, and telephone number.
- **Execution Log**:
  - Successfully registered test user `student_1794413903509@foodie.test`.
  - Stored salted hash (`$2a$10$...`) in Atlas; plain-text password was never written to disk.
  - Public registration strictly assigned `role: "customer"`.
  - Returned HTTP `201 Created` with signed JWT token.

### 5.2. Duplicate Email Prevention
- **Test Input**: Attempting to register an existing email.
- **Result**: Caught Mongoose duplicate key error `E11000`; server returned HTTP `400 Bad Request` (`"An account with this email address already exists."`).

### 5.3. User Authentication (`POST /api/auth/login`)
- **Test Input**: Correct email and password.
- **Result**: Bcrypt compared candidate password against hash; returned HTTP `200 OK` with sanitized user object and 7-day signed JWT.
- **Negative Test**: Incorrect password returned HTTP `401 Unauthorized` (`"Invalid email or password."`).

---

## 6. Add to Cart and Checkout Testing

### 6.1. Shopping Cart Operations
- **Addition**: Adding item to cart creates cart line item with `quantity: 1`.
- **Quantity Controls**: `+` increments count; `−` decrements count. When quantity reaches 0, item is automatically purged from cart.
- **Cart Counter**: Navigation badge dynamically updates across all client interactions.

### 6.2. Promo Code Engine
- **Test Coupon**: `FOODIE50` applied to cart subtotal.
- **Result**: 50% discount (up to ₹150 cap) deducted immediately from gross total.

---

## 7. Order Placement and Order History Testing

### 7.1. Server-Side Price Verification
- **Test Input**: Submitted 2 units of *"Paneer Tikka Biryani"* (Database price: ₹379) and 1 unit of *"Pepperoni Loaded Pizza"* (Database price: ₹499).
- **Client Sent**: IDs and quantities only (`[{ food: id1, quantity: 2 }, { food: id2, quantity: 1 }]`).
- **Server Calculation**:
  $$\text{Total} = (379 \times 2) + (499 \times 1) = 758 + 499 = ₹1257$$
- **Actual Saved Total**: **₹1257** (HTTP `201 Created`, Order ID: `6af4954fb2363e65b4d84b13`).
- **Price Tampering Resistance**: Confirmed client cannot inject manipulated lower prices.

### 7.2. Order History Retrieval (`GET /api/orders/myorders`)
- **Execution**: Issued authenticated request with customer Bearer token.
- **Result**: Returned array of orders belonging exclusively to that customer (`count: 1`, Status: `Confirmed`).
- **UI Stepper**: Successfully rendered 4-step delivery pipeline (`Confirmed` 📝 → `Cooking` 🍳 → `On Way` 🛵 → `Delivered` 🏠).

---

## 8. Admin Login and Dashboard Testing

### 8.1. Admin Authentication
- **Test Credentials**: `admin@foodie.com` / `Admin@123456`.
- **Result**: Returned HTTP `200 OK` with JWT encoding `{ id: ..., role: "admin" }`.
- **Navbar Integration**: Unlocked the `🛡️ Admin Panel` button and profile badge in the frontend UI.

### 8.2. Analytics & Statistics Verification
- **Total Orders**: Accurately counted all active orders from MongoDB `orders` collection.
- **Gross Revenue**: Correctly aggregated INR revenue sum across all non-cancelled orders.
- **Menu Items Counter**: Correctly reported 12 items in catalog with in-stock vs. out-of-stock badges.
- **Total Registered Users**: Returned registered accounts via `GET /api/auth/users`.

---

## 9. Food CRUD and Order Status Update Testing

### 9.1. Food Ingestion (`POST /api/food`)
- **Payload**: Dish *"Chef's Truffle Fries"*, category *"Burger"*, price `₹199`.
- **Result**: Successfully created document `6af49bc1da991781b15a284e` (HTTP `201 Created`).

### 9.2. Food Modification (`PUT /api/food/:id`)
- **Payload**: Updated price to `₹229` and set `isAvailable: false`.
- **Result**: Successfully updated fields in MongoDB (HTTP `200 OK`).

### 9.3. Food Deletion (`DELETE /api/food/:id`)
- **Execution**: Issued delete request with admin token.
- **Result**: Successfully removed dish document from Atlas (HTTP `200 OK`).

### 9.4. Order Status Update (`PUT /api/orders/:id/status`)
- **Payload**: Updated status to `"On Way"`.
- **Result**: Successfully changed status in database (HTTP `200 OK`). Customer "My Orders" stepper dynamically transitioned to active on-the-way delivery state.

---

## 10. Access Control and Security Testing (RBAC & IDOR)

| Security Test | Tested Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Admin Route Guard** | Customer attempts `GET /api/orders` | HTTP `403 Forbidden` | HTTP `403 Forbidden` | **PASSED** |
| **Admin Food Creation** | Customer attempts `POST /api/food` | HTTP `403 Forbidden` | HTTP `403 Forbidden` | **PASSED** |
| **Admin Users Directory**| Customer attempts `GET /api/auth/users`| HTTP `403 Forbidden` | HTTP `403 Forbidden` | **PASSED** |
| **IDOR Protection** | Customer attempts to view another user's order | HTTP `403 Access denied` | HTTP `403 Access denied` | **PASSED** |
| **Privilege Escalation**| Public registration with payload `role: "admin"` | Role forced to `"customer"` | Role saved as `"customer"` | **PASSED** |
| **Password Leakage** | Querying `/api/auth/me` or `/api/auth/users` | Hash excluded | Hash field excluded (`undefined`) | **PASSED** |

---

## 11. Comprehensive Test Case Execution Matrix

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-001** | Frontend production build via Vite | Compile without syntax/JSX errors | Built in 616ms (0 errors) | **PASSED** |
| **TC-002** | System health check (`GET /api/health`) | HTTP 200 with status message | HTTP 200 `Food Ordering API is running` | **PASSED** |
| **TC-003** | Atlas cloud connection with IPv4 retry loop | Connect to primary node without SSL 80 | Connected to `ac-5rzjnai-shard-00-02` | **PASSED** |
| **TC-004** | Customer self-registration with valid data | HTTP 201, bcrypt hash stored, JWT issued | HTTP 201, `role: customer`, valid token | **PASSED** |
| **TC-005** | Customer registration with duplicate email | HTTP 400 with duplicate email error | HTTP 400 `An account with this email...` | **PASSED** |
| **TC-006** | Customer login with valid credentials | HTTP 200, JWT token returned | HTTP 200, valid JWT token issued | **PASSED** |
| **TC-007** | Customer login with invalid password | HTTP 401 Unauthorized | HTTP 401 `Invalid email or password.` | **PASSED** |
| **TC-008** | Verify user profile session (`GET /api/me`) | HTTP 200 with sanitized user profile | HTTP 200, profile returned without hash | **PASSED** |
| **TC-009** | Public food catalog retrieval (`GET /api/food`) | HTTP 200 with array of available dishes | HTTP 200, count: 12 dishes returned | **PASSED** |
| **TC-010** | Filter food catalog by category & vegetarian | HTTP 200 with matching subset only | HTTP 200, matching items returned | **PASSED** |
| **TC-011** | LocalStorage cart persistence on page reload | Retain cart items and quantities | Cart state restored from `localStorage` | **PASSED** |
| **TC-012** | Client promo coupon discount calculation | Deduct discount from order gross total | `FOODIE50` applied discount correctly | **PASSED** |
| **TC-013** | Place order with server-side price computation | Calculate total using MongoDB Atlas prices | Calculated ₹1257 from database prices | **PASSED** |
| **TC-014** | Retrieve customer order history (`myorders`) | Return customer's past orders | HTTP 200 with placed orders list | **PASSED** |
| **TC-015** | Admin login with admin credentials | HTTP 200, JWT with `role: "admin"` | HTTP 200, `role: "admin"` confirmed | **PASSED** |
| **TC-016** | Admin Dashboard displays live metric cards | Render Total Orders, Revenue, Items, Users | Live counts matched MongoDB records | **PASSED** |
| **TC-017** | Admin creates new menu dish (`POST /api/food`)| HTTP 201, dish saved to Atlas | HTTP 201 Created, ID returned | **PASSED** |
| **TC-018** | Admin updates dish price and stock toggle | HTTP 200, price and availability updated | HTTP 200, new price ₹229, in-stock: false | **PASSED** |
| **TC-019** | Admin deletes menu dish (`DELETE /api/food/:id`)| HTTP 200, dish removed from Atlas | HTTP 200 `Food item deleted successfully` | **PASSED** |
| **TC-020** | Admin updates order status (`PUT status`) | HTTP 200, status updated to "On Way" | HTTP 200, customer stepper updated | **PASSED** |
| **TC-021** | Block customer from Admin APIs (RBAC) | HTTP 403 Forbidden for customer token | HTTP 403 Forbidden (Blocked) | **PASSED** |
| **TC-022** | Prevent IDOR order snooping between customers | HTTP 403 when accessing others' orders | HTTP 403 Access Denied | **PASSED** |
| **TC-023** | Prevent self-escalation to admin on signup | Reject or override admin role to customer | Forced `role: "customer"` | **PASSED** |
| **TC-024** | Online Razorpay/Stripe Payment Webhook | Process automated digital credit card charge | *Feature planned for future release* | **NOT RUN** |
| **TC-025** | WebSocket Live GPS Rider Tracking | Push live delivery vehicle coordinates | *Feature planned for future release* | **NOT RUN** |
| **TC-026** | Automated Load Testing (10,000 requests/sec) | Benchmark server under distributed load | *Stress test outside project scope* | **NOT RUN** |

---

## 12. Quality Summary & Conclusion

- **Total Test Cases Planned**: 26
- **Test Cases Executed**: 23
- **Passed**: 23 (100% of executed tests)
- **Failed**: 0
- **Not Run**: 3 (Documented future roadmap features)

The testing results confirm that the **Food Ordering System (Foodie)** meets the functional, architectural, and security requirements necessary for academic college project evaluation and production demonstration.

---

*Report prepared for Food Ordering System (Foodie) — College Project Quality Assurance Documentation.*
