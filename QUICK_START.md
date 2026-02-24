# Phase 1 - Quick Reference Guide

## 🚀 Installation (5 minutes)

```bash
# 1. Run setup script
setup-phase1.bat

# 2. Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Update .env file with generated secrets

# 4. Start application
npm run dev
```

## 🔒 Security Features

### Rate Limiting
```javascript
// Already applied to all routes
// Custom limits for specific routes:
const { authLimiter, otpLimiter, uploadLimiter } = require('./src/middlewares/rateLimiter');

router.post('/auth/login', authLimiter, AuthController.login);
router.post('/send-otp', otpLimiter, AuthController.sendOtp);
router.post('/upload', uploadLimiter, FileController.upload);
```

### Input Sanitization
```javascript
// Automatically applied to all requests
// Manual validation:
const { validateRequest } = require('./src/middlewares/sanitization');

router.post('/endpoint', 
  checkSchema(YOUR_SCHEMA),
  validateRequest,
  Controller.method
);
```

### Error Handling
```javascript
const { AppError, catchAsync } = require('./src/middlewares/errorHandler');

// Throw operational errors
throw new AppError('User not found', 404);

// Wrap async functions
const myController = catchAsync(async (req, res, next) => {
  // Your code - errors automatically caught
});
```

### Logging
```javascript
const { logger } = require('./src/utils/logger');

logger.info('User logged in', { userId: user.id });
logger.error('Payment failed', { error, orderId });
logger.warn('High memory usage', { usage: memUsage });
```

## 📊 Monitoring

### Health Check
```bash
# Check application health
curl http://localhost:3000/api/v1/health

# Response:
{
  "uptime": 3600,
  "message": "OK",
  "timestamp": 1234567890,
  "environment": "development",
  "checks": {
    "database": "connected",
    "memory": {
      "rss": 150,
      "heapTotal": 100,
      "heapUsed": 80
    }
  }
}
```

### Logs Location
- **Error logs**: `logs/error.log`
- **All logs**: `logs/combined.log`
- **Console**: Development only

## 🔐 Environment Variables

### Required
```env
# Database
DB_HOST=your_host
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password

# Security (32+ characters)
SESSION_SECRET_KEY=<generate>
JWT_SECRET=<generate>

# Environment
NODE_ENV=development
PORT=3000
```

### Generate Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Testing

### Test Rate Limiting
```bash
# Should block after limit
for /L %i in (1,1,10) do curl http://localhost:3000/api/v1/test
```

### Test Security Headers
```bash
curl -I http://localhost:3000/
# Look for: X-Content-Type-Options, X-Frame-Options, etc.
```

### Test Error Handling
```bash
curl http://localhost:3000/api/v1/nonexistent
# Should return proper JSON error
```

## ⚠️ Critical Actions

### Before First Run
1. Remove sensitive files from git
2. Rotate all credentials
3. Update .env with strong secrets
4. Run `npm install`

### Before Production
1. Set `NODE_ENV=production`
2. Enable HTTPS
3. Configure firewall
4. Setup monitoring
5. Review SECURITY.md

## 📝 Common Tasks

### Add Rate Limiting to Route
```javascript
const { apiLimiter } = require('./src/middlewares/rateLimiter');
router.post('/my-route', apiLimiter, Controller.method);
```

### Log User Actions
```javascript
logger.info('Action performed', {
  userId: req.user.id,
  action: 'loan_application',
  ip: req.ip
});
```

### Handle Errors
```javascript
// Operational error
if (!user) {
  throw new AppError('User not found', 404);
}

// Async error handling
const getData = catchAsync(async (req, res) => {
  const data = await Model.findAll();
  res.json(data);
});
```

### Create Migration
```bash
npx sequelize-cli migration:generate --name add-user-field
```

## 🐛 Troubleshooting

### Logs not created
```bash
mkdir logs
icacls logs /grant Users:F
```

### Rate limiting not working
```javascript
// Add to index.js
app.set('trust proxy', 1);
```

### Session not persisting
- Check SESSION_SECRET_KEY in .env
- Verify cookie settings

### CORS errors
- Update allowedOrigins in index.js
- Check credentials: true

## 📞 Help

- **Documentation**: See PHASE1_IMPLEMENTATION.md
- **Security**: See SECURITY.md
- **Issues**: Create GitHub issue

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Secrets generated
- [ ] .env updated
- [ ] Sensitive files removed
- [ ] Credentials rotated
- [ ] Application starts
- [ ] Health check works
- [ ] Logs being created
- [ ] Rate limiting tested

---

**Quick Start**: `setup-phase1.bat` → Update .env → `npm run dev`
