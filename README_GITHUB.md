# MiniBusiness Loan CRM - Complete Backend System

[![Security](https://img.shields.io/badge/Security-95%25-brightgreen)](https://github.com/karanveerAujla1210/Business-Loan)
[![Test Coverage](https://img.shields.io/badge/Coverage-60%25+-brightgreen)](https://github.com/karanveerAujla1210/Business-Loan)
[![API Docs](https://img.shields.io/badge/API%20Docs-100%25-blue)](https://github.com/karanveerAujla1210/Business-Loan)
[![Production Ready](https://img.shields.io/badge/Production-Ready-success)](https://github.com/karanveerAujla1210/Business-Loan)

Enterprise-grade MiniBusiness Loan CRM backend built with Node.js, Express, Sequelize ORM, and SQL Server. Complete with security, testing, monitoring, compliance, and production deployment features.

## 🚀 Features

### Phase 1: Security & Stability ✅
- 4-tier rate limiting (DDoS protection)
- XSS prevention with input sanitization
- Helmet.js security headers
- Centralized error handling
- Winston structured logging
- Health monitoring endpoint
- Database migrations

### Phase 2: Testing & Quality ✅
- Jest testing framework
- 60%+ code coverage
- ESLint code quality
- Prettier formatting
- Husky pre-commit hooks
- GitHub Actions CI/CD

### Phase 3: Documentation & DevOps ✅
- Swagger UI (OpenAPI 3.0)
- Complete API documentation
- Docker containerization
- Multi-environment setup
- Automated deployment
- Health checks

### Phase 4: Monitoring & Observability ✅
- Performance monitoring
- Metrics API endpoints
- Email alerting system
- Real-time dashboard
- Prometheus integration

### Phase 5: Business Features ✅
- Loan/payment/customer reports
- Analytics dashboard
- Automated notifications (EMI reminders, overdue alerts)
- Audit trail system
- Weekly reports

### Phase 6: Compliance & Optimization ✅
- PII encryption (AES-256)
- GDPR/DPDPA compliance
- Data export/deletion endpoints
- Performance caching
- Data retention manager
- Production readiness

## 📊 Database Schema

**Database**: Microsoft SQL Server  
**Total Tables**: 52+  
**Categories**: User Management, Loan Application, Business Details, Documents, Repayment, Credit Assessment, Staff, Messaging, System

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete schema documentation.

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express 5.x
- **Database**: SQL Server (MSSQL)
- **ORM**: Sequelize
- **Authentication**: JWT + Firebase
- **Testing**: Jest + Supertest
- **Documentation**: Swagger UI
- **Containerization**: Docker
- **Monitoring**: Prometheus
- **Logging**: Winston
- **Security**: Helmet, Rate Limiting, Sanitization

## 📦 Installation

### Prerequisites
- Node.js 16+
- SQL Server
- Docker (optional)

### Quick Start

```bash
# Clone repository
git clone https://github.com/karanveerAujla1210/Business-Loan.git
cd Business-Loan

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Docker Setup

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

Create `.env` file:

```env
# Database
# Use localhost for local host-based development.
# If the backend runs inside docker-compose, use `DB_HOST=db`.
DB_HOST=localhost
DB_PORT=1433
DB_NAME=MiniBusiness_Loan_CRM
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your_32_char_encryption_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket

# Firebase
FIREBASE_PROJECT_ID=your_project_id
```

## 📚 API Documentation

### Swagger UI
```
http://localhost:3000/api-docs
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/applicants` | POST | Create applicant |
| `/api/v1/loans` | GET | Get loans |
| `/api/v1/repayments` | POST | Record payment |
| `/api/v1/metrics` | GET | System metrics |
| `/api/v1/reports/loans` | GET | Loan reports |
| `/dashboard` | GET | Monitoring dashboard |
| `/analytics` | GET | Analytics dashboard |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

## 🚢 Deployment

### Automated Deployment
```bash
deploy.bat
# Select: dev, staging, or prod
```

### Manual Deployment
```bash
# Build Docker image
docker build -t minibusiness-api:latest .

# Run container
docker run -d -p 3000:3000 --env-file .env minibusiness-api:latest
```

## 📈 Monitoring

### Dashboards
- **Performance**: http://localhost:3000/dashboard
- **Analytics**: http://localhost:3000/analytics
- **Metrics API**: http://localhost:3000/api/v1/metrics

### Prometheus
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'minibusiness-api'
    static_configs:
      - targets: ['localhost:3000']
```

## 🔒 Security

- **Rate Limiting**: 4-tier protection (auth, general, strict, public)
- **Input Sanitization**: XSS prevention on all inputs
- **Helmet.js**: Security headers
- **CSRF Protection**: Token-based
- **PII Encryption**: AES-256 for sensitive data
- **Audit Trail**: All critical operations logged

## 📋 Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server
npm test               # Run tests with coverage
npm run lint           # Check code quality
npm run lint:fix       # Fix linting issues
npm run format         # Format code
npm run migrate        # Run database migrations
npm run migrate:undo   # Rollback migration
```

## 📁 Project Structure

```
Updated Backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── validators/      # Input validation
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── public/             # Static files (dashboards)
├── .github/
│   └── workflows/      # CI/CD pipelines
├── index.js            # Entry point
├── package.json        # Dependencies
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose
└── README.md           # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Karanveer Aujla** - [GitHub](https://github.com/karanveerAujla1210)

## 🙏 Acknowledgments

- Tech Aviom for project foundation
- All contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/karanveerAujla1210/Business-Loan/issues)
- **Email**: dev@minibusinessloan.com

---

**Project Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2024
