# 🛒 E-Commerce Microservices Architecture

A **distributed, event-driven microservices** system built for a modern e-commerce platform. This project demonstrates scalable architecture patterns for handling high-traffic scenarios with separate concerns and independent scaling.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Product       │    │     Order       │    │    Payment      │    │  Notification   │
│   Service       │    │    Service      │    │    Service      │    │    Service      │
│                 │    │                 │    │                 │    │                 │
│ • View Products │    │ • Place Orders  │    │ • Process       │    │ • Send          │
│ • Add to Cart   │    │ • Initiate      │    │   Payments      │    │   Notifications │
│ • High Read     │    │   Payment       │    │ • Handle        │    │ • Track Events  │
│   Traffic       │    │ • Trigger       │    │   Retries       │    │ • Success/Fail  │
│                 │    │   Events        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
                    ┌─────────────────────────────────────┐
                    │           Event Bus                 │
                    │        (RabbitMQ/Redis)             │
                    │                                     │
                    │ • Order Created                     │
                    │ • Payment Processed                 │
                    │ • Notification Sent                 │
                    └─────────────────────────────────────┘
```

## 🎯 Why Microservices?

### **Product Service** - High Read Traffic
- **Scaling Reason**: Browsing traffic is extremely high (many reads vs. fewer writes)
- **Pattern**: Read-heavy service that can be horizontally scaled
- **Use Case**: Product catalog, search, recommendations

### **Order Service** - Sales Spike Handling
- **Scaling Reason**: Sales events create huge spikes in order placements
- **Pattern**: Event-driven order processing with async payment initiation
- **Use Case**: Order management, inventory updates, payment triggers

### **Payment Service** - Reliable Processing
- **Scaling Reason**: Payment processing requires high reliability and retry mechanisms
- **Pattern**: Idempotent operations with safe retry logic
- **Use Case**: Payment gateway integration, transaction management

### **Notification Service** - Event-Driven Communication
- **Scaling Reason**: Notifications should not block core business processes
- **Pattern**: Event listener that processes async notifications
- **Use Case**: Email, SMS, push notifications, tracking updates

## 🚀 Current Implementation Status

### ✅ **Product Service** (This Repository)
- **Product Management**: CRUD operations for products
- **Cart Operations**: Add items to shopping cart
- **Data Persistence**: JSON-based storage with file I/O
- **Type Safety**: Full TypeScript implementation
- **API Endpoints**: RESTful API for product operations

### 🔄 **Order Service** (Planned)
- **Order Processing**: Create and manage orders
- **Payment Initiation**: Trigger payment service
- **Event Publishing**: Emit order events to event bus
- **Inventory Management**: Update product availability

### 💳 **Payment Service** (Planned)
- **Gateway Integration**: Multiple payment providers
- **Retry Logic**: Safe retry mechanisms for failed payments
- **Transaction Management**: Payment status tracking
- **Event Publishing**: Payment success/failure events

### 📧 **Notification Service** (Planned)
- **Event Listening**: Subscribe to business events
- **Multi-Channel**: Email, SMS, push notifications
- **Delivery Tracking**: Success/failure monitoring
- **Template Management**: Dynamic notification content

## 🛠️ Technology Stack

### **Current Stack**
- **Runtime**: Node.js with ES Modules
- **Language**: TypeScript 5.9+
- **Framework**: Express.js 5.1+
- **Development**: Nodemon for hot reloading
- **Data Storage**: JSON files (development)

### **Planned Stack**
- **Event Bus**: RabbitMQ / Redis
- **Database**: PostgreSQL / MongoDB (per service)
- **Message Queue**: Bull / Agenda for job processing
- **Monitoring**: Prometheus + Grafana
- **Tracing**: Jaeger / Zipkin
- **API Gateway**: Kong / Traefik

## 📁 Project Structure

```
product-service/
├── src/
│   ├── controllers/          # Business logic handlers
│   │   ├── products.ts       # Product CRUD operations
│   │   └── carts.ts          # Shopping cart management
│   ├── types/                # TypeScript interfaces
│   │   └── index.ts          # Shared type definitions
│   ├── assets/               # Data storage (JSON files)
│   │   ├── mock_products.json
│   │   └── mock_carts.json
│   ├── services/             # External service integrations
│   │   └── rabbitmq.service.ts
│   ├── routes/               # API route definitions
│   └── app.ts                # Express application setup
├── dist/                     # Compiled JavaScript output
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── nodemon.json             # Development server configuration
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- TypeScript 5.9+

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd product-service

# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

### **Development Commands**
```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests (when implemented)
npm test
```

## 📡 API Endpoints

### **Products**
```
GET    /products              # Get all products
GET    /products/:id          # Get product by ID
POST   /products              # Create new product
PUT    /products/:id          # Update product
DELETE /products/:id          # Delete product
```

### **Carts**
```
POST   /carts                 # Add item to cart
GET    /carts                 # Get cart contents
PUT    /carts/:id             # Update cart
DELETE /carts/:id             # Remove item from cart
```

## 🔄 Event-Driven Communication

### **Event Flow**
1. **User Action** → Product Service
2. **Order Creation** → Order Service (publishes event)
3. **Payment Processing** → Payment Service (listens to order events)
4. **Notification** → Notification Service (listens to payment events)

### **Event Types**
- `order.created` - New order placed
- `payment.processed` - Payment completed
- `payment.failed` - Payment failed (triggers retry)
- `notification.sent` - Notification delivered

## 📈 Scaling Strategies

### **Horizontal Scaling**
- **Product Service**: Multiple instances for high read traffic
- **Order Service**: Auto-scaling based on order volume
- **Payment Service**: Load-balanced payment processing
- **Notification Service**: Queue-based async processing

### **Database Scaling**
- **Read Replicas**: For product catalog
- **Sharding**: By customer region/order volume
- **Caching**: Redis for frequently accessed data

## 🧪 Testing Strategy

### **Unit Tests**
- Service layer business logic
- Controller request/response handling
- Type validation and error handling

### **Integration Tests**
- API endpoint testing
- Event publishing/consuming
- Database operations

### **Load Testing**
- High-traffic scenarios
- Order spike simulations
- Payment processing under load

## 🚧 Roadmap

### **Phase 1: Core Services** ✅
- [x] Product Service (Current)
- [ ] Order Service
- [ ] Basic Event Bus

### **Phase 2: Payment & Notifications**
- [ ] Payment Service
- [ ] Notification Service
- [ ] Event-driven communication

### **Phase 3: Production Ready**
- [ ] Database integration
- [ ] Monitoring & logging
- [ ] API Gateway
- [ ] Load balancing

### **Phase 4: Advanced Features**
- [ ] CQRS pattern
- [ ] Saga pattern for distributed transactions
- [ ] Circuit breakers
- [ ] Rate limiting

## 🤝 Contributing

This is a learning project for understanding:
- **Microservices Architecture**
- **Event-Driven Systems**
- **Distributed Systems**
- **Scalable API Design**

## 📚 Learning Resources

- **Microservices Patterns**: Martin Fowler's blog
- **Event Sourcing**: EventStore documentation
- **CQRS**: Microsoft's CQRS pattern guide
- **Saga Pattern**: Microservices.io patterns

## 📄 License

This project is for educational purposes. Feel free to use as a reference for learning microservices architecture.

---

**Happy Learning! 🎓** 

*Building scalable systems, one service at a time.*
