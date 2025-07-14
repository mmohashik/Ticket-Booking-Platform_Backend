# E-commerce Backend Integration Guide

## Overview
The E-commerce backend has been successfully integrated into the main Ticket Booking Platform backend. This integration allows the system to handle both event management and e-commerce functionality through separate API endpoints while sharing the same MongoDB connection and server infrastructure.

## Architecture

### Separate Backend Systems
- **Event Backend**: `/api/*` - Manages events, venues, admin authentication
- **E-commerce Backend**: `/api/ecom/*` - Manages products, orders, customers, inventory

### Database Separation
- **Event Models**: Uses existing collection names (Event, Admin, Venue, Booking)
- **E-commerce Models**: Uses prefixed collection names (EcomUser, EcomProduct, EcomCategory, etc.)
- **No Conflicts**: Collections are completely separate to avoid data conflicts

### Authentication
- Each backend system has its own authentication flow
- E-commerce uses separate JWT tokens and middleware
- No conflicts between event admin and e-commerce admin authentication

## E-commerce Backend Features

### Available API Endpoints

#### Authentication
- `POST /api/ecom/auth/signin` - E-commerce admin login
- `POST /api/ecom/auth/signup` - E-commerce admin registration
- `POST /api/ecom/auth/forget-password` - Password reset request
- `POST /api/ecom/auth/reset-password/:token` - Password reset
- `GET /api/ecom/auth/verify-token` - Token verification

#### Products
- `GET /api/ecom/products` - Get all products
- `GET /api/ecom/products/:id` - Get product by ID
- `POST /api/ecom/products` - Add new product (with image upload)
- `PUT /api/ecom/products/:id` - Update product
- `DELETE /api/ecom/products/:id` - Soft delete product

#### Categories
- `GET /api/ecom/categories` - Get all categories
- `POST /api/ecom/categories` - Add new category
- `PUT /api/ecom/categories/:id` - Update category
- `DELETE /api/ecom/categories/:id` - Soft delete category

#### Customers
- `GET /api/ecom/customers` - Get all customers
- `POST /api/ecom/customers` - Add new customer
- `PUT /api/ecom/customers/:id` - Update customer
- `DELETE /api/ecom/customers/:id` - Soft delete customer

#### Orders
- `GET /api/ecom/orders` - Get all orders
- `GET /api/ecom/orders/:id` - Get order by ID
- `POST /api/ecom/orders` - Create new order
- `PUT /api/ecom/orders/:id/status` - Update order status

#### Stock/Inventory
- `GET /api/ecom/stock` - Get all stock items
- `GET /api/ecom/stock/low-stock` - Get low stock items
- `POST /api/ecom/stock` - Add new stock
- `PUT /api/ecom/stock/:id` - Update stock

#### Dashboard
- `GET /api/ecom/dashboard/stats` - Get dashboard statistics
- `GET /api/ecom/dashboard/analytics` - Get sales analytics

#### Health Check
- `GET /api/ecom` - E-commerce API status
- `GET /api/ecom/health` - E-commerce health check

## Directory Structure

```
controllers/
├── ecom/                    # E-commerce controllers
│   ├── authController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── customerController.js
│   ├── orderController.js
│   ├── stockController.js
│   └── dashBoardController.js
├── admin.controller.js      # Existing event controllers
├── event.controller.js
└── venue.controller.js

models/
├── ecom/                    # E-commerce models
│   ├── User.js             # EcomUser model
│   ├── Product.js          # EcomProduct model
│   ├── Category.js         # EcomCategory model
│   ├── Customer.js         # EcomCustomer model
│   ├── Order.js            # EcomOrder model
│   └── Stock.js            # EcomStock model
├── admin.model.js          # Existing event models
├── event.model.js
├── venue.model.js
└── booking.model.js

routes/
├── ecom/                   # E-commerce routes
│   ├── index.js           # Main e-commerce routes handler
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── customerRoutes.js
│   ├── orderRoutes.js
│   ├── stockRoutes.js
│   └── dashBoardRoutes.js
├── admin.route.js         # Existing event routes
├── event.route.js
└── venue.route.js

middleware/
├── ecom/                  # E-commerce middleware
│   ├── auth.js           # E-commerce authentication
│   └── errorHandlers.js  # E-commerce error handling
├── authMiddleware.js     # Existing event middleware
└── multer.js

services/
├── ecom/                 # E-commerce services
│   └── emailService.js   # E-commerce email service
└── (existing services)

config/
├── ecom/                 # E-commerce config
│   └── uploadConfig.js   # E-commerce file upload config
└── (existing config)

utils/
├── ecom/                 # E-commerce utilities
│   └── generateToken.js  # E-commerce JWT token generation
├── email.js             # Existing utilities
└── qrCodeGenerator.js

public/
├── images/              # Event images (existing)
└── uploads/
    └── ecom/            # E-commerce product images
```

## Key Features Implemented

### ✅ Completed Features
1. **Separate Authentication**: E-commerce has its own auth system
2. **Database Separation**: All e-commerce models use "Ecom" prefix
3. **File Upload Handling**: Separate upload directory for e-commerce images
4. **Complete CRUD Operations**: Full Create, Read, Update, Delete for all modules
5. **Soft Delete**: All e-commerce entities support soft deletion
6. **Dashboard Analytics**: Revenue, orders, low stock monitoring
7. **Image Management**: Multiple image upload for products
8. **Email Services**: Password reset and order confirmation emails
9. **Stock Management**: Low stock alerts and inventory tracking
10. **Order Management**: Order status tracking and updates

### Route Protection
- **Public Routes**: Product and category listing
- **Protected Routes**: All admin operations require authentication
- **Middleware**: Separate authentication middleware for e-commerce

### File Upload
- **Location**: `/public/uploads/ecom/`
- **Access**: `http://localhost:3000/uploads/ecom/filename.jpg`
- **Validation**: Images only, 5MB max file size

## Environment Variables

Add these to your `.env` file:

```env
# Existing variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

# E-commerce email configuration
EMAIL_USER=your_gmail_account
EMAIL_PASS=your_app_password
```

## Testing the Integration

### 1. Start the Server
```bash
npm run dev
```

### 2. Test E-commerce Endpoints

#### Health Check
```bash
curl http://localhost:3000/api/ecom/health
```

#### Create E-commerce Admin User
```bash
curl -X POST http://localhost:3000/api/ecom/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ecom Admin",
    "email": "admin@ecom.com",
    "password": "password123",
    "dateOfBirth": "1990-01-01"
  }'
```

#### Login E-commerce Admin
```bash
curl -X POST http://localhost:3000/api/ecom/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecom.com",
    "password": "password123"
  }'
```

### 3. Frontend Integration

Update your frontend environment variables:
```env
VITE_API_URL=http://localhost:3000
VITE_ECOM_API_URL=http://localhost:3000/api/ecom
```

## Benefits of This Integration

### 1. **No Conflicts**
- Separate API routes (`/api/ecom/*` vs `/api/*`)
- Separate database collections (Ecom prefix)
- Separate authentication systems

### 2. **Shared Infrastructure**
- Same MongoDB connection
- Same server instance
- Same environment configuration
- Shared middleware and utilities where appropriate

### 3. **Scalability**
- Easy to scale both systems together
- Shared monitoring and logging
- Unified deployment process

### 4. **Maintainability**
- Clear separation of concerns
- Modular code structure
- Independent testing possible

## Migration Notes

### From Separate E-commerce Backend
The original `ecom_backend` folder contained a complete standalone backend. The integration:

1. **Preserved All Functionality**: No features were lost
2. **Updated Model Names**: Added "Ecom" prefix to avoid conflicts
3. **Updated Routes**: Added `/api/ecom/` prefix
4. **Updated File Paths**: Organized into integrated structure
5. **Maintained Compatibility**: Frontend can easily switch to new endpoints

### Cleanup
After verifying the integration works correctly, you can safely:
1. Remove the `ecom_backend` folder
2. Update your frontend to use the new API endpoints
3. Update any deployment scripts to use the single backend

## Future Enhancements

### Phase 1 - Optimization
- [ ] Add rate limiting for e-commerce APIs
- [ ] Implement caching for frequently accessed data
- [ ] Add API documentation with Swagger
- [ ] Add comprehensive logging

### Phase 2 - Advanced Features
- [ ] Real-time inventory updates
- [ ] Advanced analytics and reporting
- [ ] Bulk operations for products and orders
- [ ] Integration with payment gateways

### Phase 3 - Performance
- [ ] Database indexing optimization
- [ ] Image optimization and CDN integration
- [ ] API response caching
- [ ] Performance monitoring

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure only one server is running on port 3000
2. **Database Connection**: Both systems use the same MONGODB_URI
3. **Image Upload Issues**: Check that `/public/uploads/ecom/` directory exists
4. **CORS Issues**: Update CLIENT_URL to match your frontend URL

### Development Tips

1. **Testing**: Use separate test databases for event and e-commerce data
2. **Environment**: Use different JWT secrets for development/production
3. **Monitoring**: Monitor both `/api/health` and `/api/ecom/health` endpoints
4. **Logging**: Check logs for both event and e-commerce operations

## Conclusion

The e-commerce backend has been successfully integrated into the main backend following the same pattern used for the frontend integration. This provides a unified system that can handle both event management and e-commerce operations while maintaining clear separation of concerns and avoiding any conflicts between the two systems.
