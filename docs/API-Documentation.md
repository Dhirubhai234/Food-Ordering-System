# REST API Documentation — Food Ordering System (Foodie) 🍕📡

This document provides a comprehensive technical reference for all REST API endpoints available in the **Food Ordering System (Foodie)** backend. It is verified directly against the production Express.js routes and controllers in `backend/routes/` and `backend/controllers/`.

---

## Table of Contents

- [1. Base URL and Environment](#1-base-url-and-environment)
- [2. Authentication and Authorization (JWT)](#2-authentication-and-authorization-jwt)
- [3. Role-Based Access Control (RBAC) Matrix](#3-role-based-access-control-rbac-matrix)
- [4. Standard HTTP Status Codes and Error Responses](#4-standard-http-status-codes-and-error-responses)
- [5. System & Health Endpoints](#5-system--health-endpoints)
- [6. Authentication APIs (`/api/auth`)](#6-authentication-apis-apiauth)
  - [6.1. Register Customer Account](#61-register-customer-account)
  - [6.2. User Login](#62-user-login)
  - [6.3. Get Current User Profile](#63-get-current-user-profile)
  - [6.4. Get All Registered Users (Admin Only)](#64-get-all-registered-users-admin-only)
- [7. Food Catalog APIs (`/api/food`)](#7-food-catalog-apis-apifood)
  - [7.1. Get All Food Items](#71-get-all-food-items)
  - [7.2. Get Single Food Item by ID](#72-get-single-food-item-by-id)
  - [7.3. Create New Food Item (Admin Only)](#73-create-new-food-item-admin-only)
  - [7.4. Update Food Item (Admin Only)](#74-update-food-item-admin-only)
  - [7.5. Delete Food Item (Admin Only)](#75-delete-food-item-admin-only)
- [8. Order Management APIs (`/api/orders`)](#8-order-management-apis-apiorders)
  - [8.1. Place a New Order](#81-place-a-new-order)
  - [8.2. Get Logged-in Customer Orders](#82-get-logged-in-customer-orders)
  - [8.3. Get Order Details by ID](#83-get-order-details-by-id)
  - [8.4. Get All Platform Orders (Admin Only)](#84-get-all-platform-orders-admin-only)
  - [8.5. Update Order Status (Admin Only)](#85-update-order-status-admin-only)
- [9. Testing with cURL / Postman](#9-testing-with-curl--postman)

---

## 1. Base URL and Environment

| Environment | Base URL | Description |
| :--- | :--- | :--- |
| **Local Development** | `http://localhost:5000/api` | Default Express server port |
| **Vite Frontend Proxy** | `import.meta.env.VITE_API_BASE_URL` | Configured via `frontend/.env` |

All requests transmitting payloads must include the header:
```http
Content-Type: application/json
```

---

## 2. Authentication and Authorization (JWT)

The API implements stateless authentication using **JSON Web Tokens (JWT)**.

1. **Token Issuance**: When a user registers (`POST /api/auth/register`) or logs in (`POST /api/auth/login`), the server signs a token containing `{ id: user._id, role: user.role }` using `JWT_SECRET` with a default validity of **7 days**.
2. **Sending the Token**: Protected endpoints require the client to transmit the token in the HTTP `Authorization` header:
   ```http
   Authorization: Bearer <your_jwt_token_here>
   ```
3. **Verification Pipeline**:
   - The `protect` middleware decodes the token, checks signature validity, verifies expiration, loads the user document from MongoDB Atlas (`.select("-password")`), and attaches it to `req.user`.
   - The `adminOnly` middleware checks if `req.user.role === "admin"`. If not, it halts execution with `403 Forbidden`.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Endpoint | HTTP Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | **Public** | Server heartbeat & health check |
| `/api/auth/register` | `POST` | **Public** | Customer registration (forces `role: customer`) |
| `/api/auth/login` | `POST` | **Public** | User login (issues signed JWT) |
| `/api/auth/me` | `GET` | **Customer / Admin** | Logged-in user profile verification |
| `/api/auth/users` | `GET` | **Admin Only** | Directory of all registered users |
| `/api/food` | `GET` | **Public** | Menu items catalog (with search & filters) |
| `/api/food/:id` | `GET` | **Public** | Single dish detail lookup |
| `/api/food` | `POST` | **Admin Only** | Ingest new food item into catalog |
| `/api/food/:id` | `PUT` | **Admin Only** | Modify dish pricing, availability, details |
| `/api/food/:id` | `DELETE` | **Admin Only** | Delete dish from catalog |
| `/api/orders` | `POST` | **Customer / Admin** | Place order with server-side price validation |
| `/api/orders/myorders` | `GET` | **Customer / Admin** | Retrieve personal order history |
| `/api/orders/:id` | `GET` | **Owner / Admin** | Inspect order details (IDOR guarded) |
| `/api/orders` | `GET` | **Admin Only** | Global order feed across all users |
| `/api/orders/:id/status` | `PUT` | **Admin Only** | Update fulfillment status stepper |

---

## 4. Standard HTTP Status Codes and Error Responses

The API uses standard HTTP response codes to indicate request outcome:

| Status Code | Meaning | Usage |
| :--- | :--- | :--- |
| `200 OK` | Success | Request succeeded and returned data |
| `201 Created` | Resource Created | Record created (e.g. registration, dish, order) |
| `400 Bad Request` | Client Error | Missing required fields, invalid format, negative price |
| `401 Unauthorized` | Auth Required | Missing, malformed, or expired JWT token |
| `403 Forbidden` | Access Denied | Authenticated user lacks `admin` privileges or ownership |
| `404 Not Found` | Resource Missing | Non-existent dish or order ID |
| `500 Server Error` | Internal Failure | Unhandled database or server exception |

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Human-readable description of what failed."
}
```

---

## 5. System & Health Endpoints

### 5.1. System Health Check
- **Endpoint**: `GET /api/health`
- **Access**: Public
- **Description**: Verifies the API server is active and responding.

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "Food Ordering API is running"
}
```

---

## 6. Authentication APIs (`/api/auth`)

### 6.1. Register Customer Account
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Security Rule**: Public registration strictly hardcodes `role: "customer"`. Users cannot assign themselves the `admin` role.

#### Request Body
```json
{
  "name": "Aman Verma",
  "email": "aman@example.com",
  "password": "Password123!",
  "phone": "9876543210"
}
```

#### Field Constraints
- `name` (String, required): 2 to 50 characters.
- `email` (String, required): Valid email format, case-insensitive, unique.
- `password` (String, required): Minimum 6 characters (automatically hashed with bcrypt).
- `phone` (String, optional): Contact telephone.

#### Sample Response (`201 Created`)
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67320a1c9e8b7c0012a45ef1",
    "name": "Aman Verma",
    "email": "aman@example.com",
    "role": "customer",
    "phone": "9876543210",
    "createdAt": "2026-11-11T16:00:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: Email already in use (`"An account with this email address already exists."`).
- `400 Bad Request`: Validation failure (e.g. password < 6 characters).

---

### 6.2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Validates email and bcrypt password hash, issuing a 7-day signed JWT token.

#### Request Body
```json
{
  "email": "aman@example.com",
  "password": "Password123!"
}
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67320a1c9e8b7c0012a45ef1",
    "name": "Aman Verma",
    "email": "aman@example.com",
    "role": "customer",
    "phone": "9876543210",
    "createdAt": "2026-11-11T16:00:00.000Z"
  }
}
```

#### Error Responses
- `401 Unauthorized`: Invalid credentials (`"Invalid email or password."`).

---

### 6.3. Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Private (Customer or Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Validates active session token and returns the current user profile.

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "user": {
    "_id": "67320a1c9e8b7c0012a45ef1",
    "name": "Aman Verma",
    "email": "aman@example.com",
    "role": "customer",
    "phone": "9876543210",
    "createdAt": "2026-11-11T16:00:00.000Z",
    "updatedAt": "2026-11-11T16:00:00.000Z"
  }
}
```

---

### 6.4. Get All Registered Users (Admin Only)
- **Endpoint**: `GET /api/auth/users`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Description**: Returns all registered customers and administrators for the Admin Dashboard user directory.

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "_id": "67320a1c9e8b7c0012a45ef1",
      "name": "Aman Verma",
      "email": "aman@example.com",
      "role": "customer",
      "phone": "9876543210",
      "createdAt": "2026-11-11T16:00:00.000Z"
    },
    {
      "_id": "6af4997643ca6e2bfadac74e",
      "name": "System Administrator",
      "email": "admin@foodie.com",
      "role": "admin",
      "phone": "9876543210",
      "createdAt": "2026-11-11T16:30:00.000Z"
    }
  ]
}
```

---

## 7. Food Catalog APIs (`/api/food`)

### 7.1. Get All Food Items
- **Endpoint**: `GET /api/food`
- **Access**: Public
- **Query Parameters**:
  - `category` (String, optional): Filter by category (`Pizza`, `Burger`, `Biryani`, `Chinese`, `Desserts`, `Drinks`).
  - `search` (String, optional): Case-insensitive text search matching name or description.
  - `isVeg` (Boolean String, optional): `"true"` or `"false"`.
  - `all` (Boolean String, optional): `"true"` to include out-of-stock items (used by Admin Dashboard). Defaults to `isAvailable: true` for customer requests.

#### Sample Request
```http
GET /api/food?category=Biryani&isVeg=true HTTP/1.1
Host: localhost:5000
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "foods": [
    {
      "_id": "6af492d42745ac49818d46e4",
      "name": "Paneer Tikka Biryani",
      "description": "Charcoal-grilled cottage cheese cubes simmered with fragrant basmati and rich Indian spices.",
      "price": 379,
      "image": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
      "category": "Biryani",
      "isAvailable": true,
      "isVeg": true,
      "rating": 4.8,
      "prepTime": "25-30 min",
      "createdAt": "2026-11-11T14:00:00.000Z",
      "updatedAt": "2026-11-11T14:00:00.000Z"
    }
  ]
}
```

---

### 7.2. Get Single Food Item by ID
- **Endpoint**: `GET /api/food/:id`
- **Access**: Public

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "food": {
    "_id": "6af492d42745ac49818d46e4",
    "name": "Paneer Tikka Biryani",
    "description": "Charcoal-grilled cottage cheese cubes simmered with fragrant basmati and rich Indian spices.",
    "price": 379,
    "image": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
    "category": "Biryani",
    "isAvailable": true,
    "isVeg": true,
    "rating": 4.8,
    "prepTime": "25-30 min"
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid MongoDB ObjectId format.
- `404 Not Found`: Food item does not exist.

---

### 7.3. Create New Food Item (Admin Only)
- **Endpoint**: `POST /api/food`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`

#### Request Body
```json
{
  "name": "Butter Chicken Naan Roll",
  "description": "Smoky pulled chicken tossed in creamy makhani gravy wrapped inside soft garlic butter naan.",
  "price": 289,
  "category": "Burger",
  "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  "isVeg": false,
  "isAvailable": true,
  "prepTime": "15-20 min",
  "rating": 4.7
}
```

#### Validation Rules
- Supported categories: `["Pizza", "Burger", "Biryani", "Chinese", "Desserts", "Drinks"]`.
- `price` cannot be negative.

#### Sample Response (`201 Created`)
```json
{
  "success": true,
  "message": "Food item created successfully",
  "food": {
    "_id": "6af49bc1da991781b15a284e",
    "name": "Butter Chicken Naan Roll",
    "description": "Smoky pulled chicken tossed in creamy makhani gravy wrapped inside soft garlic butter naan.",
    "price": 289,
    "category": "Burger",
    "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    "isVeg": false,
    "isAvailable": true,
    "rating": 4.7,
    "prepTime": "15-20 min",
    "createdAt": "2026-11-11T16:45:00.000Z"
  }
}
```

---

### 7.4. Update Food Item (Admin Only)
- **Endpoint**: `PUT /api/food/:id`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Description**: Updates partial or full fields on an existing food dish.

#### Request Body
```json
{
  "price": 319,
  "isAvailable": false
}
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "Food item updated successfully",
  "food": {
    "_id": "6af49bc1da991781b15a284e",
    "name": "Butter Chicken Naan Roll",
    "price": 319,
    "isAvailable": false,
    "updatedAt": "2026-11-11T16:50:00.000Z"
  }
}
```

---

### 7.5. Delete Food Item (Admin Only)
- **Endpoint**: `DELETE /api/food/:id`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "Food item deleted successfully"
}
```

---

## 8. Order Management APIs (`/api/orders`)

### 8.1. Place a New Order
- **Endpoint**: `POST /api/orders`
- **Access**: Private (Customer or Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Core Security Guarantee**: The client submits only food item IDs and quantities. The backend fetches authoritative prices directly from MongoDB Atlas to calculate `totalAmount`. Client-supplied prices are strictly ignored.

#### Request Body
```json
{
  "items": [
    {
      "food": "6af492d42745ac49818d46e4",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "Campus Hostel Block 4, Room 302",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "phone": "9876543210"
  },
  "paymentMethod": "COD"
}
```

#### Sample Response (`201 Created`)
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "6af4954fb2363e65b4d84b13",
    "user": "67320a1c9e8b7c0012a45ef1",
    "items": [
      {
        "_id": "6af4954fb2363e65b4d84b14",
        "food": "6af492d42745ac49818d46e4",
        "name": "Paneer Tikka Biryani",
        "price": 379,
        "quantity": 2,
        "image": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80"
      }
    ],
    "totalAmount": 758,
    "deliveryAddress": {
      "street": "Campus Hostel Block 4, Room 302",
      "city": "New Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "phone": "9876543210"
    },
    "paymentMethod": "COD",
    "paymentStatus": "Pending",
    "status": "Confirmed",
    "createdAt": "2026-11-11T16:15:00.000Z",
    "updatedAt": "2026-11-11T16:15:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: Cart is empty (`"Order must contain at least one item."`).
- `400 Bad Request`: Out of stock item (`"Item '<Name>' is currently out of stock."`).
- `404 Not Found`: Referenced food ID does not exist.

---

### 8.2. Get Logged-in Customer Orders
- **Endpoint**: `GET /api/orders/myorders`
- **Access**: Private (Customer or Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns all orders placed by the currently authenticated user, sorted with the newest first.

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "orders": [
    {
      "_id": "6af4954fb2363e65b4d84b13",
      "items": [
        {
          "name": "Paneer Tikka Biryani",
          "price": 379,
          "quantity": 2
        }
      ],
      "totalAmount": 758,
      "status": "Confirmed",
      "createdAt": "2026-11-11T16:15:00.000Z"
    }
  ]
}
```

---

### 8.3. Get Order Details by ID
- **Endpoint**: `GET /api/orders/:id`
- **Access**: Private (Order Owner or Admin)
- **Headers**: `Authorization: Bearer <token>`
- **IDOR Protection**: Returns `403 Forbidden` if a customer attempts to query an order placed by someone else.

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "order": {
    "_id": "6af4954fb2363e65b4d84b13",
    "user": {
      "_id": "67320a1c9e8b7c0012a45ef1",
      "name": "Aman Verma",
      "email": "aman@example.com",
      "phone": "9876543210"
    },
    "items": [
      {
        "name": "Paneer Tikka Biryani",
        "price": 379,
        "quantity": 2
      }
    ],
    "totalAmount": 758,
    "deliveryAddress": {
      "street": "Campus Hostel Block 4, Room 302",
      "city": "New Delhi",
      "pincode": "110001",
      "phone": "9876543210"
    },
    "status": "Confirmed",
    "paymentMethod": "COD",
    "createdAt": "2026-11-11T16:15:00.000Z"
  }
}
```

---

### 8.4. Get All Platform Orders (Admin Only)
- **Endpoint**: `GET /api/orders`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Description**: Returns all customer orders across the platform populated with customer contact details.

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "orders": [
    {
      "_id": "6af4954fb2363e65b4d84b13",
      "user": {
        "_id": "67320a1c9e8b7c0012a45ef1",
        "name": "Aman Verma",
        "email": "aman@example.com",
        "phone": "9876543210"
      },
      "items": [
        {
          "name": "Paneer Tikka Biryani",
          "price": 379,
          "quantity": 2
        }
      ],
      "totalAmount": 758,
      "status": "Confirmed",
      "createdAt": "2026-11-11T16:15:00.000Z"
    }
  ]
}
```

---

### 8.5. Update Order Status (Admin Only)
- **Endpoint**: `PUT /api/orders/:id/status`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`

#### Request Body
```json
{
  "status": "On Way"
}
```

#### Allowed Status Enum Values
- `"Confirmed"`
- `"Preparing"`
- `"On Way"`
- `"Delivered"` (Automatically sets `paymentStatus = "Completed"` for COD orders)
- `"Cancelled"`

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "Order status updated to \"On Way\"",
  "order": {
    "_id": "6af4954fb2363e65b4d84b13",
    "status": "On Way",
    "updatedAt": "2026-11-11T16:40:00.000Z"
  }
}
```

---

## 9. Testing with cURL / Postman

### 1. Health Check
```powershell
curl http://localhost:5000/api/health
```

### 2. Login to get JWT Token
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email": "admin@foodie.com", "password": "Admin@123456"}'
```

### 3. Fetch Orders using Admin Bearer Token
```powershell
$token = "YOUR_TOKEN_HERE"
curl http://localhost:5000/api/orders `
  -H "Authorization: Bearer $token"
```

### 4. Update Order Fulfillment Status
```powershell
curl -X PUT http://localhost:5000/api/orders/6af4954fb2363e65b4d84b13/status `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"status": "Delivered"}'
```

---

*Documentation generated for Food Ordering System (Foodie) — College Project & Viva Examination Submission.*
