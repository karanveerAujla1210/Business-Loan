# MiniBusiness Loan CRM - API Documentation

## Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.minibusinessloan.com/api/v1`

## Interactive Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`

## Authentication
All protected endpoints require Bearer token authentication.

```http
Authorization: Bearer <your_jwt_token>
```

---

## Health & Status

### GET /health
Check application health status.

**Response**:
```json
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

---

## Authentication Endpoints

### POST /auth/generate-otp-customer
Generate OTP for customer login.

**Request**:
```json
{
  "mobile": "9876543210"
}
```

**Response**:
```json
{
  "status": true,
  "message": "OTP sent successfully",
  "api_version": "1.0"
}
```

**Rate Limit**: 3 requests per hour

---

### POST /auth/verify-otp-customer
Verify OTP and login customer.

**Request**:
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

**Response**:
```json
{
  "status": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "mobile": "9876543210",
      "name": "John Doe"
    }
  },
  "message": "Login successful",
  "api_version": "1.0"
}
```

**Rate Limit**: 5 attempts per 15 minutes

---

### POST /auth/send-otp-staff
Generate OTP for staff login.

**Request**:
```json
{
  "mobile": "9876543210",
  "role": "admin"
}
```

**Rate Limit**: 3 requests per hour

---

### POST /auth/verify-otp-staff
Verify OTP and login staff.

**Request**:
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

**Rate Limit**: 5 attempts per 15 minutes

---

## User Endpoints

### GET /user/get-user-profile
Get current user profile.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "status": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "mobile": "9876543210",
    "email": "john@example.com"
  },
  "api_version": "1.0"
}
```

---

### PUT /user/update-profile
Update user profile.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

### DELETE /user/delete
Delete user account.

**Headers**: `Authorization: Bearer <token>`

---

## Sourcing Endpoints

### GET /sourcing/get-banners
Get application banners.

**Response**:
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "title": "Welcome",
      "image_url": "https://..."
    }
  ],
  "api_version": "1.0"
}
```

---

### POST /sourcing/upload-file-web
Upload document file.

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request**:
```
file: <binary>
type: "aadhaar" | "pan" | "bank_statement"
```

**Rate Limit**: 20 uploads per hour

---

### POST /sourcing/process-bank-statement
Process bank statement.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "file_url": "https://...",
  "bank_name": "HDFC"
}
```

---

## Collection Endpoints

### POST /collection/razorpay/create-order
Create Razorpay payment order.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "amount": 10000,
  "currency": "INR",
  "receipt": "receipt_123"
}
```

**Response**:
```json
{
  "status": true,
  "data": {
    "order_id": "order_123",
    "amount": 10000,
    "currency": "INR"
  },
  "api_version": "1.0"
}
```

---

### POST /collection/razorpay/create-qr
Create payment QR code.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "amount": 10000,
  "description": "Loan EMI Payment"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "mobile",
      "message": "Invalid mobile number"
    }
  ],
  "api_version": "1.0"
}
```

### 401 Unauthorized
```json
{
  "status": false,
  "message": "Not Authorized",
  "api_version": "1.0"
}
```

### 404 Not Found
```json
{
  "status": false,
  "message": "Route not found",
  "api_version": "1.0"
}
```

### 429 Too Many Requests
```json
{
  "status": false,
  "message": "Too many requests, please try again later",
  "api_version": "1.0"
}
```

### 500 Internal Server Error
```json
{
  "status": false,
  "message": "Something went wrong. Please try again later.",
  "api_version": "1.0"
}
```

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 attempts | 15 minutes |
| OTP Generation | 3 requests | 1 hour |
| File Upload | 20 uploads | 1 hour |

---

## Webhooks

### POST /razorpay/universal-webhook
Razorpay payment webhook.

**Headers**: `X-Razorpay-Signature`

---

### POST /razorpay/qr-webhook
Razorpay QR payment webhook.

**Headers**: `X-Razorpay-Signature`

---

## Testing

### Postman Collection
Import the Postman collection from `/docs/postman_collection.json`

### cURL Examples

**Health Check**:
```bash
curl http://localhost:3000/api/v1/health
```

**Generate OTP**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/generate-otp-customer \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'
```

**Get Profile**:
```bash
curl http://localhost:3000/api/v1/user/get-user-profile \
  -H "Authorization: Bearer <your_token>"
```

---

## Support

- **Email**: dev@minibusinessloan.com
- **Issues**: GitHub issue tracker
- **Swagger UI**: http://localhost:3000/api-docs
