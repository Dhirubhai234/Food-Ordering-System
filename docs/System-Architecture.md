# System Architecture Document — Food Ordering System (Foodie) 🍕🏛️

This document describes the complete **System Architecture** of the **Food Ordering System (Foodie)**, derived directly from the application's actual codebase. It provides multi-tier structural flowcharts, sequence diagrams for key operational workflows, and detailed component explanations suitable for college project evaluation, technical reports, and viva presentations.

---

## 1. High-Level Multi-Tier Architecture Diagram

```mermaid
flowchart TD
    subgraph Tier1["1. PRESENTATION TIER (React 19 + Vite SPA)"]
        UI_Home["Storefront (Hero, Categories, FoodList)"]
        UI_Cart["Cart Drawer & Checkout"]
        UI_Auth["Auth Modal (Login / Sign Up)"]
        UI_Orders["My Orders Modal (Live Stepper)"]
        UI_Admin["Admin Operations Center (Dashboard)"]
        App_State["React State & LocalStorage (JWT, Cart)"]

        UI_Home <--> App_State
        UI_Cart <--> App_State
        UI_Auth <--> App_State
        UI_Orders <--> App_State
        UI_Admin <--> App_State
    end

    subgraph Tier2["2. CLIENT API SERVICE LAYER (api.js)"]
        API_Wrapper["Universal request() Client"]
        Auth_API["authAPI (register, login, getMe, users)"]
        Food_API["foodAPI (getAll, getById, CRUD)"]
        Order_API["orderAPI (create, myOrders, updateStatus)"]

        App_State --> Auth_API & Food_API & Order_API
        Auth_API & Food_API & Order_API --> API_Wrapper
    end

    API_Wrapper -- "HTTP REST Requests (Bearer JWT in Header)" --> Node_Server

    subgraph Tier3["3. SERVER & ROUTING TIER (Express.js 5 + Node.js)"]
        Node_Server["Express Server (server.js :5000)"]
        MW_CORS["CORS & JSON Body Parser"]
        Router_Auth["/api/auth Router"]
        Router_Food["/api/food Router"]
        Router_Order["/api/orders Router"]

        Node_Server --> MW_CORS
        MW_CORS --> Router_Auth & Router_Food & Router_Order
    end

    subgraph Tier4["4. SECURITY & MIDDLEWARE TIER (authMiddleware.js)"]
        MW_Protect["protect (JWT Verification & User Fetch)"]
        MW_Admin["adminOnly (Role Verification: role == 'admin')"]
    end

    subgraph Tier5["5. CONTROLLER TIER (Business Logic)"]
        Ctrl_Auth["authController.js"]
        Ctrl_Food["foodController.js"]
        Ctrl_Order["orderController.js"]

        Router_Auth --> Ctrl_Auth
        Router_Auth -. "Admin: /users" .-> MW_Protect --> MW_Admin --> Ctrl_Auth

        Router_Food --> Ctrl_Food
        Router_Food -. "POST/PUT/DELETE" .-> MW_Protect --> MW_Admin --> Ctrl_Food

        Router_Order -. "POST, /myorders" .-> MW_Protect --> Ctrl_Order
        Router_Order -. "GET all, /:id/status" .-> MW_Protect --> MW_Admin --> Ctrl_Order
    end

    subgraph Tier6["6. DATA ACCESS & ODM TIER (Mongoose 9)"]
        Model_User["User Model (bcrypt pre-save hook)"]
        Model_Food["Food Model (validation & category enums)"]
        Model_Order["Order Model (embedded OrderItems snapshot)"]

        Ctrl_Auth <--> Model_User
        Ctrl_Food <--> Model_Food
        Ctrl_Order <--> Model_Food & Model_Order
    end

    subgraph Tier7["7. DATABASE STORAGE TIER (MongoDB Atlas)"]
        DB_Users[("users Collection")]
        DB_Foods[("foods Collection")]
        DB_Orders[("orders Collection")]

        Model_User <--> DB_Users
        Model_Food <--> DB_Foods
        Model_Order <--> DB_Orders
    end
```

---

## 2. Core Operational Workflow Diagrams

### 2.1. User Registration and Login Flow (JWT Issuance)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as User / Customer
    participant UI as React UI (AuthModal)
    participant API as api.js (authAPI)
    participant Server as Express (authController)
    participant Model as User Model (Mongoose)
    participant DB as MongoDB Atlas

    Note over Customer,DB: --- Registration Workflow ---
    Customer->>UI: Fills Registration Form (Name, Email, Password)
    UI->>API: authAPI.register(payload)
    API->>Server: POST /api/auth/register
    Server->>Model: User.findOne({ email })
    Model->>DB: Check for duplicate email
    DB-->>Model: Email available
    Server->>Model: User.create({ name, email, password, role: 'customer' })
    Note over Model: pre('save') hook hashes password with bcrypt (salt 10)
    Model->>DB: Save User document
    DB-->>Model: User created (_id)
    Server->>Server: generateToken(_id, role)
    Server-->>API: 201 Created { success: true, token, user }
    API-->>UI: Save token in localStorage('foodie_token')
    UI-->>Customer: Show "Welcome!" Toast & Update Navbar to Logged In

    Note over Customer,DB: --- Login Workflow ---
    Customer->>UI: Enters Email & Password
    UI->>API: authAPI.login(credentials)
    API->>Server: POST /api/auth/login
    Server->>Model: User.findOne({ email }).select('+password')
    Model->>DB: Fetch record with password hash
    DB-->>Model: Return User record
    Server->>Model: user.comparePassword(candidatePassword)
    Note over Model: bcrypt.compare() validates hash
    Server->>Server: generateToken(_id, user.role)
    Server-->>API: 200 OK { success: true, token, user }
    API-->>UI: Store JWT in localStorage
    UI-->>Customer: Display Profile Avatar & Set Active Session
```

---

### 2.2. Fetching Food Items Catalog Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as User / Customer
    participant UI as React UI (App / FoodList)
    participant API as api.js (foodAPI)
    participant Server as Express (foodController)
    participant Model as Food Model
    participant DB as MongoDB Atlas

    Customer->>UI: Opens Homepage or selects Category ("Biryani")
    UI->>API: foodAPI.getAll({ category: 'Biryani' })
    API->>Server: GET /api/food?category=Biryani
    Note over Server: getFoods() builds query: { isAvailable: true, category: 'Biryani' }
    Server->>Model: Food.find(query).sort({ createdAt: -1 })
    Model->>DB: Execute query on 'foods' collection
    DB-->>Model: Returns array of food documents
    Model-->>Server: [ { _id, name, price, image, rating, prepTime, isVeg }, ... ]
    Server-->>API: 200 OK { success: true, count: N, foods: [...] }
    API-->>UI: Update 'foods' React State
    UI-->>Customer: Render responsive Food Cards Grid
```

---

### 2.3. Adding and Placing an Order Flow (Server-Side Price Authority)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Logged-in Customer
    participant UI as CartDrawer UI
    participant API as api.js (orderAPI)
    participant MW as authMiddleware (protect)
    participant Ctrl as orderController.js
    participant FoodDB as Food Model / DB
    participant OrderDB as Order Model / DB

    Customer->>UI: Enters Delivery Address & clicks "Place Order"
    Note over UI: Cart only sends: [{ food: id, quantity: N }]
    UI->>API: orderAPI.create(orderPayload)
    API->>MW: POST /api/orders (Header: Authorization: Bearer JWT)
    MW->>MW: jwt.verify(token, JWT_SECRET)
    MW->>Ctrl: Attach req.user and call createOrder()
    
    loop For each item in payload
        Ctrl->>FoodDB: Food.findById(item.food)
        FoodDB-->>Ctrl: Authoritative Dish Data (DB Price & Availability)
        Note over Ctrl: Check: food.isAvailable == true<br/>itemTotal = food.price * quantity<br/>totalAmount += itemTotal
    end

    Note over Ctrl: Server constructs OrderItem snapshot<br/>(freezing name and price at checkout time)
    Ctrl->>OrderDB: Order.create({ user, items, totalAmount, deliveryAddress, status: 'Confirmed' })
    OrderDB-->>Ctrl: Saved Order Document
    Ctrl-->>API: 201 Created { success: true, order }
    API-->>UI: Trigger CheckoutSuccessModal & Clear Shopping Cart
    UI-->>Customer: Display "Order Placed Successfully!" with Order ID
```

---

### 2.4. Admin Managing Food Items (CRUD Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as System Administrator
    participant UI as AdminDashboard UI
    participant API as api.js (foodAPI)
    participant MW_Prot as protect Middleware
    participant MW_Adm as adminOnly Middleware
    participant Ctrl as foodController.js
    participant DB as MongoDB Atlas (foods)

    Admin->>UI: Fills "Add Dish" Form (Name, Price, Category, Image)
    UI->>API: foodAPI.create(dishPayload)
    API->>MW_Prot: POST /api/food (Header: Bearer Admin_JWT)
    MW_Prot->>MW_Prot: Decode JWT & fetch user
    MW_Prot->>MW_Adm: User authenticated
    Note over MW_Adm: Check req.user.role == 'admin'
    MW_Adm->>Ctrl: Access Granted -> createFood()
    Ctrl->>Ctrl: Validate required fields & Category enum
    Ctrl->>DB: Food.create(payload)
    DB-->>Ctrl: Saved Food Document
    Ctrl-->>API: 201 Created { success: true, food }
    API-->>UI: Prepend dish to 'foods' table & close modal
    UI-->>Admin: Show Success Toast Notification ("Dish Added!")
```

---

### 2.5. Admin Updating Order Status & Live Customer Tracking

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    participant AdminUI as AdminDashboard (Orders Tab)
    participant API as api.js (orderAPI)
    participant MW as protect + adminOnly
    participant Ctrl as orderController.js
    participant DB as MongoDB Atlas (orders)
    participant CustUI as Customer "My Orders" Modal
    actor Customer as Customer

    Admin->>AdminUI: Changes status dropdown: "Preparing" -> "On Way"
    AdminUI->>API: orderAPI.updateStatus(orderId, "On Way")
    API->>MW: PUT /api/orders/:id/status (Bearer Admin_JWT)
    MW->>Ctrl: Admin verified -> updateOrderStatus()
    Ctrl->>DB: Order.findByIdAndUpdate(orderId, { status: "On Way" })
    DB-->>Ctrl: Updated Order Document
    Ctrl-->>API: 200 OK { success: true, order }
    API-->>AdminUI: Update table status badge to "On Way" (Purple)

    Note over Customer,CustUI: --- Customer Checks Status ---
    Customer->>CustUI: Opens "My Orders" portal
    CustUI->>API: orderAPI.getMyOrders()
    API->>Ctrl: GET /api/orders/myorders (Bearer Customer_JWT)
    Ctrl->>DB: Order.find({ user: customerId })
    DB-->>Ctrl: Return latest orders
    Ctrl-->>CustUI: 200 OK { orders: [...] }
    Note over CustUI: Stepper marks "Confirmed" and "Cooking" complete,<br/>and highlights "On Way" as active!
    CustUI-->>Customer: Displays Scooter icon 🛵 active on delivery stepper!
```

---

## 3. Detailed Component Breakdown

### 3.1. Presentation Tier (React 19 + Vite)
- **Role**: Renders the dynamic User Interface, manages client state, and delivers responsive experiences across mobile, tablet, and desktop viewports.
- **Key Modules**:
  - **`App.jsx`**: Top-level coordinator managing global application state (`cartItems`, `user`, `foods`, `orders`, `activeNav`).
  - **`Navbar.jsx`**: Navigation bar with real-time cart badge counter, customer avatar, and role-guarded `🛡️ Admin Panel` link.
  - **`Hero.jsx` & `CategoryFilter.jsx`**: Interactive discovery tools supporting real-time catalog search and category pill filtering.
  - **`FoodList.jsx` / `FoodCard.jsx`**: Grid rendering dishes with veg/non-veg tags, prep times, pricing, and quantity counters.
  - **`CartDrawer.jsx`**: Off-canvas shopping cart supporting promo coupon discounts and delivery address capture.
  - **`OrdersModal.jsx`**: Customer order tracking portal featuring a 4-step delivery pipeline.
  - **`AdminDashboard.jsx`**: Administrative suite featuring real-time business metrics, order fulfillment management, food catalog CRUD, and registered user tables.

---

### 3.2. Client API Service Layer (`frontend/src/services/api.js`)
- **Role**: Centralized communication bridge between the React frontend and Express backend.
- **Key Features**:
  - **Universal `request()` Wrapper**: Automatically retrieves the JWT token from `localStorage.getItem("foodie_token")` and attaches it as `Authorization: Bearer <token>`.
  - **Automatic Error Normalization**: Extracts structured error messages returned by Express and throws standard JavaScript `Error` objects for toast notifications.
  - **Environment-Driven Endpoint Resolution**: Reads `import.meta.env.VITE_API_BASE_URL` with automatic fallback to `http://localhost:5000/api`.

---

### 3.3. Server & Routing Tier (Express.js 5 + Node.js)
- **Role**: Coordinates incoming HTTP requests, terminates cross-origin traffic, handles payload parsing, and routes traffic to specialized controllers.
- **Key Modules**:
  - **`server.js`**: Application entry point. Configures CORS, parses JSON/URL-encoded bodies, and mounts route handlers.
  - **`config/db.js`**: Robust Mongoose initialization module featuring an IPv4-enforced DNS lookup (`family: 4`) and an automatic discovery retry loop tailored for MongoDB Atlas M0 clusters.
  - **Routes**:
    - `routes/authRoutes.js`: Maps endpoints for `/register`, `/login`, `/me`, and `/users`.
    - `routes/foodRoutes.js`: Maps endpoints for public catalog browsing and admin food mutations.
    - `routes/orderRoutes.js`: Maps endpoints for customer checkout, personal order history, and admin fulfillment updates.

---

### 3.4. Security & Middleware Tier (`backend/middleware/authMiddleware.js`)
- **Role**: Enforces stateless authentication and Role-Based Access Control (RBAC).
- **Key Guards**:
  - **`protect` Middleware**:
    1. Extracts Bearer token from the incoming `Authorization` header.
    2. Verifies cryptographic signature using `process.env.JWT_SECRET`.
    3. Queries `User.findById(decoded.id).select("-password")` to ensure the account still exists.
    4. Binds the sanitized user object to `req.user` and passes control to the next handler.
  - **`adminOnly` Middleware**:
    1. Inspects `req.user.role`.
    2. If `req.user.role === "admin"`, invokes `next()`.
    3. If not, halts execution and responds with HTTP `403 Forbidden` (`"Forbidden: Admin privileges required."`).

---

### 3.5. Controller Tier (Business Logic)
- **Role**: Implements domain business rules, coordinates model operations, and formats responses.
- **Key Controllers**:
  - **`authController.js`**: Validates registration formats, prevents duplicate accounts, issues signed JWTs, and enforces default `customer` roles.
  - **`foodController.js`**: Manages food inventory queries (supporting filters for categories, text search, vegetarian flags, and admin stock visibility), validating price bounds and category enums.
  - **`orderController.js`**: Coordinates order placement, calculates prices using the database as the sole source of truth, manages ownership checks to prevent Insecure Direct Object References (IDOR), and handles fulfillment status transitions.

---

### 3.6. Data Access & ODM Tier (Mongoose 9)
- **Role**: Defines strict schemas, applies validation constraints, handles cryptographic hooks, and provides model abstraction.
- **Key Models**:
  - **`User.js`**: Enforces unique lowercase emails, includes a `pre("save")` hook for automatic `bcryptjs` hashing, and provides `comparePassword()` instance methods.
  - **`Food.js`**: Enforces supported categories via schema enums, non-negative price constraints, and stock booleans.
  - **`Order.js`**: Implements a hybrid NoSQL schema embedding an array of `OrderItem` snapshots alongside top-level status enums and delivery coordinates.

---

### 3.7. Database Storage Tier (MongoDB Atlas)
- **Role**: Cloud-managed document storage offering high availability, automated replicas, and persistent BSON storage across three core collections:
  - **`users`**: Stores credentials, profile data, and access roles.
  - **`foods`**: Stores the live restaurant dish catalog.
  - **`orders`**: Stores finalized transactions, frozen item prices, delivery addresses, and fulfillment states.

---

## 4. End-to-End Request-Response Lifecycle

Here is what happens when a customer places an order:

1. **Client Action**: Customer reviews cart items, fills in the hostel/street address, and clicks **Place Order** in [`CartDrawer.jsx`](file:///c:/Users/dkdbg/OneDrive/Desktop/Food-Ordering-System/frontend/src/components/CartDrawer.jsx).
2. **Client Preparation**: `App.jsx` constructs an order payload containing only `{ food: <ObjectId>, quantity: <Number> }` and the address. Client prices are deliberately omitted.
3. **Transport**: `api.js` intercepts the request, reads `foodie_token` from `localStorage`, appends `Authorization: Bearer <token>`, and issues a `POST` request to `http://localhost:5000/api/orders`.
4. **Network & Routing**: Express receives the request, parses the JSON payload, and routes it to `orderRoutes.js`.
5. **Authentication Verification**: `protect` middleware extracts the token, verifies the signature against `JWT_SECRET`, loads the user document from MongoDB, and attaches it to `req.user`.
6. **Price Verification & Integrity Check**:
   - `orderController.js` loops over the item IDs.
   - Queries `Food.findById(id)` from MongoDB Atlas.
   - Verifies that every requested dish is currently `isAvailable === true`.
   - Computes `item.price * item.quantity` using the **database price**.
7. **Document Persistence**: An `Order` document is created with status `Confirmed` and saved to the `orders` collection in Atlas.
8. **HTTP Response**: Express returns `201 Created` with the finalized order JSON.
9. **UI Reaction**: The frontend clears the shopping cart, clears `localStorage("foodie_cart")`, closes the cart drawer, and launches the `CheckoutSuccessModal.jsx`.

---

## 5. Architectural Quality Attributes

| Quality Attribute | Implementation in Foodie |
| :--- | :--- |
| **Security** | Salting & hashing via `bcryptjs`, stateless JWT authentication, schema-level password redaction (`select: false`), and backend price calculation. |
| **Separation of Concerns** | Decoupled client (React SPA) and server (Express REST API) communicating solely via JSON over HTTP. |
| **Reliability** | IPv4 enforcement (`family: 4`) with multi-attempt primary discovery loop in `config/db.js` resolving Atlas TLS alert 80 handshakes on Windows. |
| **Maintainability** | Standard Model-View-Controller (MVC) organization with clear boundaries across routes, controllers, and Mongoose schemas. |
| **Scalability** | Stateless server architecture allowing horizontal Node.js clustering behind load balancers with central MongoDB Atlas clustering. |

---

*Documentation generated for Food Ordering System (Foodie) — College Project & Viva Examination Submission.*
