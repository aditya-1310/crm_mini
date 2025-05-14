# Mini CRM Platform

A comprehensive Customer Relationship Management system with segment-based campaign management capabilities.

## 🚀 Features

- **Customer Data Management**: Store and manage customer profiles
- **Order Management**: Track customer purchases and order history
- **Segment Builder**: Create dynamic customer segments based on flexible rule conditions
- **Campaign Creation**: Design personalized campaigns targeting specific segments
- **Campaign Delivery**: Automated message delivery with real-time tracking
- **Dashboard**: Analytics and campaign performance metrics

## 🏗️ Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│                 │        │                  │        │                 │
│  React Frontend │◄─────► │  Express Backend │◄─────► │  MongoDB Atlas  │
│                 │        │                  │        │                 │
└─────────────────┘        └──────────────────┘        └─────────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │                  │
                           │   Vendor API     │
                           │  (Messaging)     │
                           │                  │
                           └──────────────────┘
```

### Backend Architecture

The backend implements a pub-sub architecture for efficient message processing:

```
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│               │     │                 │     │                 │
│ API Endpoints │────►│  Message Queue  │────►│ Batch Processor │
│               │     │                 │     │                 │
└───────────────┘     └─────────────────┘     └─────────────────┘
       │                                              │
       │                                              ▼
       │                                      ┌─────────────────┐
       └─────────────────────────────────────►│                 │
                                              │    Database     │
                                              │                 │
                                              └─────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**:
  - React.js
  - Material UI
  - Axios for API calls
  - React Router for navigation

- **Backend**:
  - Node.js with Express
  - MongoDB with Mongoose ODM
  - JWT for authentication
  - Swagger for API documentation

- **DevOps**:
  - Git for version control
  - npm for package management

- **Tools & Utilities**:
  - Postman for API testing
  - Nodemon for development
  - ESLint for code quality

## 📋 Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- MongoDB Atlas account (or local MongoDB)

## 🔧 Local Setup

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/aditya-1310/crm_mini.git
   cd crm_mini
   ```

2. Install dependencies:
   ```bash
   cd backend-service
   npm install
   ```

3. Create a `.env` file in the backend-service directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
   JWT_SECRET=your-secret-key
   ```

4. Seed the database with sample data:
   ```bash
   node src/scripts/seedCustomers.js
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../mini-crm-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

4. Access the application at `http://localhost:3000`

## 🔌 API Documentation

Once the backend server is running, you can access the Swagger API documentation at:
```
http://localhost:5000/api-docs
```

## 📏 Project Structure

```
mini-crm-backend/
├── backend-service/               # Backend API service
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controllers/           # API controllers
│   │   ├── models/                # Database models
│   │   ├── routes/                # API routes
│   │   ├── scripts/               # Utility scripts
│   │   ├── services/              # Business logic
│   │   └── index.js               # Main entry point
│   └── package.json
│
└── mini-crm-frontend/             # React frontend
    ├── public/                    # Static files
    ├── src/
    │   ├── components/            # Reusable components
    │   ├── config/                # Frontend configuration
    │   ├── context/               # React context providers
    │   ├── pages/                 # Page components
    │   ├── services/              # API services
    │   └── App.js                 # Main app component
    └── package.json
```

## 🧪 Testing

### Backend Testing

```bash
cd backend-service
npm test
```

### Frontend Testing

```bash
cd mini-crm-frontend
npm test
```

## ⚠️ Known Limitations

1. **Authentication**: Basic authentication is implemented. For production, consider enhancing with refresh tokens and more robust security measures.

2. **Scalability**: The current implementation uses in-memory queues for the pub-sub system. For high volume production environments, consider using a dedicated message broker like RabbitMQ or Kafka.

3. **Vendor API**: The messaging vendor API is simulated. Integration with a real SMS/Email provider would be needed for production.

4. **Error Handling**: Basic error handling is implemented. More comprehensive error handling and logging would be beneficial in a production environment.

5. **Testing**: Limited test coverage. A more comprehensive test suite would be necessary for production.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
