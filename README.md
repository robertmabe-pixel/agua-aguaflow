# AguaFlow Water Quality API

A robust Node.js API for ingesting, processing, and managing water quality sensor data. Built for environmental monitoring and water quality assessment applications.

## 🌊 Features

- **Sensor Data Ingestion**: RESTful endpoints for receiving water quality measurements
- **Data Validation**: Comprehensive validation of sensor data with quality checks
- **Real-time Processing**: Immediate processing and quality flagging of incoming data
- **Alert System**: Configurable alerts for critical water quality conditions
- **Swagger Documentation**: Complete API documentation with interactive testing
- **MongoDB Integration**: Efficient data storage with optimized queries
- **Comprehensive Testing**: Full test suite with Jest and Supertest
- **Production Ready**: Logging, error handling, and monitoring capabilities

## 📊 Supported Water Quality Parameters

- **Temperature** (°C)
- **pH Level** (0-14 scale)
- **Dissolved Oxygen** (mg/L)
- **Turbidity** (NTU)
- **Electrical Conductivity** (µS/cm)
- **Salinity** (PSU)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 4.4 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/robertmabe-pixel/agua-aguaflow.git
   cd agua-aguaflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or start your local MongoDB service
   sudo systemctl start mongod
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000`
   - Swagger Documentation: `http://localhost:3000/api-docs`
   - Health Check: `http://localhost:3000/health`

## 📚 API Documentation

### Core Endpoints

#### Ingest Sensor Data
```http
POST /api/v1/water-quality/ingest
Content-Type: application/json

{
  "sensorId": "WQ-001-PIER-A",
  "timestamp": "2025-10-26T20:30:00.000Z",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "depth": 2.5
  },
  "measurements": {
    "temperature": 18.5,
    "ph": 7.2,
    "dissolvedOxygen": 8.3,
    "turbidity": 1.2,
    "conductivity": 450,
    "salinity": 0.3
  }
}
```

#### Get Latest Sensor Data
```http
GET /api/v1/water-quality/sensors/{sensorId}/latest
```

#### List All Sensors
```http
GET /api/v1/water-quality/sensors
```

### Interactive Documentation

Visit `http://localhost:3000/api-docs` for complete interactive API documentation with:
- Request/response schemas
- Parameter validation rules
- Example requests and responses
- Try-it-out functionality

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
The test suite covers:
- ✅ API endpoint functionality
- ✅ Data validation and error handling
- ✅ Quality check algorithms
- ✅ Database operations
- ✅ Alert condition detection

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.js  # MongoDB connection setup
│   └── swagger.js   # API documentation configuration
├── models/          # Database models
│   └── WaterQualityData.js
├── routes/          # API route definitions
│   └── waterQuality.js
├── services/        # Business logic
│   └── waterQualityService.js
├── utils/           # Utility functions
│   └── logger.js    # Winston logging configuration
└── server.js        # Application entry point

tests/               # Test files
├── waterQuality.test.js
└── ...

logs/                # Application logs (auto-created)
├── combined.log
└── error.log
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/aguaflow` |
| `LOG_LEVEL` | Logging level | `info` |
| `API_BASE_URL` | Base URL for API documentation | `http://localhost:3000` |

### Quality Check Thresholds

The API automatically flags data that falls outside these ranges:

| Parameter | Normal Range | Alert Threshold |
|-----------|--------------|-----------------|
| Temperature | 0-40°C | Outside range |
| pH | 6.0-9.0 | < 5.0 or > 10.0 |
| Dissolved Oxygen | > 2.0 mg/L | < 1.0 mg/L (critical) |
| Turbidity | < 10 NTU | > 10 NTU |

## 🚨 Alert System

The API includes an intelligent alert system that:

- **Quality Flags**: Automatically flags measurements outside normal ranges
- **Critical Alerts**: Triggers immediate alerts for dangerous conditions
- **Extensible**: Easy to add custom alert conditions and notification channels

### Alert Levels

- **Info**: Data outside typical ranges but not dangerous
- **Warning**: Conditions that may indicate environmental stress
- **Critical**: Immediate attention required (e.g., very low oxygen levels)

## 📈 Monitoring & Logging

### Logging
- **Winston** for structured logging
- **Morgan** for HTTP request logging
- Separate log files for errors and combined logs
- Configurable log levels

### Health Monitoring
- Health check endpoint at `/health`
- Database connection monitoring
- Graceful shutdown handling

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Request validation** with Joi
- **Rate limiting** ready for implementation
- **API key authentication** ready for implementation

## 🚀 Deployment

### Production Checklist

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production MongoDB URI
   - Set up proper logging levels
   - Configure security headers

2. **Database**
   - Set up MongoDB replica set for high availability
   - Configure database indexes for performance
   - Set up automated backups

3. **Monitoring**
   - Set up application monitoring (New Relic, DataDog, etc.)
   - Configure error tracking (Sentry)
   - Set up log aggregation

4. **Security**
   - Enable API key authentication
   - Set up rate limiting
   - Configure HTTPS/TLS
   - Set up firewall rules

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Visit `/api-docs` for interactive API documentation
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Email**: api-support@agua.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core API endpoints
- ✅ Data validation and quality checks
- ✅ Swagger documentation
- ✅ Comprehensive testing

### Phase 2 (Next)
- 🔄 Real-time data streaming (WebSockets)
- 🔄 Advanced analytics and reporting
- 🔄 Multi-tenant support
- 🔄 Enhanced alert system with notifications

### Phase 3 (Future)
- 📋 Machine learning for anomaly detection
- 📋 Data visualization dashboard
- 📋 Mobile app integration
- 📋 IoT device management

---

**Built with ❤️ by the Agua Inc. team for better water quality monitoring.**

