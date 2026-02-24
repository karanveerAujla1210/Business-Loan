# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@minibusinessloan.com instead of using the issue tracker.

## Security Measures Implemented

### Phase 1 - Critical Security (Completed)

1. **Rate Limiting**
   - API rate limiting: 100 requests per 15 minutes
   - Auth endpoints: 5 attempts per 15 minutes
   - OTP requests: 3 per hour
   - File uploads: 20 per hour

2. **Input Sanitization**
   - XSS protection on all inputs
   - SQL injection prevention via Sequelize ORM
   - Request validation with express-validator

3. **Security Headers**
   - Helmet.js for HTTP security headers
   - Content Security Policy (CSP)
   - HSTS enabled
   - XSS filter enabled

4. **Session Security**
   - Secure cookies in production
   - HttpOnly cookies
   - SameSite strict policy
   - Session secret from environment

5. **Error Handling**
   - Centralized error handling
   - No sensitive data in error responses
   - Structured logging with Winston
   - Separate dev/prod error responses

6. **Database Security**
   - Encrypted connections
   - Parameterized queries
   - Connection pooling
   - Migration system for schema versioning

## Security Best Practices

### For Developers

1. **Never commit sensitive data**
   - Use .env files (excluded from git)
   - Rotate credentials if exposed
   - Use strong secrets (min 32 characters)

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Use environment variables**
   - Never hardcode credentials
   - Use different configs for dev/prod

4. **Validate all inputs**
   - Use express-validator schemas
   - Sanitize user inputs
   - Validate file uploads

5. **Log security events**
   - Failed login attempts
   - Unauthorized access attempts
   - File upload activities

### For Deployment

1. **Enable HTTPS only**
2. **Set NODE_ENV=production**
3. **Use strong session secrets**
4. **Enable secure cookies**
5. **Configure firewall rules**
6. **Regular security audits**
7. **Monitor logs for suspicious activity**

## Immediate Actions Required

1. **Remove exposed credentials**
   ```bash
   git rm --cached certs/* private.key public.key .env
   git commit -m "Remove sensitive files"
   ```

2. **Rotate all credentials**
   - Database passwords
   - API keys (Razorpay, AWS, Firebase)
   - JWT secrets
   - Session secrets

3. **Install new dependencies**
   ```bash
   npm install
   ```

4. **Run migrations**
   ```bash
   npm run migrate
   ```

## Security Checklist

- [x] Rate limiting implemented
- [x] Input sanitization enabled
- [x] Security headers configured
- [x] Secure session management
- [x] Centralized error handling
- [x] Structured logging
- [x] Database migrations setup
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented

## Contact

For security concerns: security@minibusinessloan.com
