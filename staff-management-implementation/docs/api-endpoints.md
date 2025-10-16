# 🔌 Staff Management API Endpoints

## 📋 Staff Management Endpoints

### Get All Staff
```http
GET /api/admin/staff
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `department` (optional): Filter by department
- `status` (optional): Filter by status (active/inactive)
- `role` (optional): Filter by role

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "staff": [...]
}
```

### Get Specific Staff
```http
GET /api/admin/staff/:id
```

### Create Staff
```http
POST /api/admin/staff
```
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@sportify.com",
  "password": "password123",
  "phone": "+1234567890",
  "employeeId": "EMP001",
  "department": "Sales",
  "hireDate": "2025-01-01",
  "role": "staff",
  "permissions": ["read", "write"]
}
```

### Update Staff
```http
PUT /api/admin/staff/:id
```

### Delete Staff
```http
DELETE /api/admin/staff/:id
```

### Update Staff Status
```http
PUT /api/admin/staff/:id/status
```
**Body:**
```json
{
  "isActive": true
}
```

### Bulk Operations
```http
POST /api/admin/staff/bulk-action
```
**Body:**
```json
{
  "action": "activate|deactivate|delete",
  "staffIds": ["id1", "id2", "id3"]
}
```

## 🏢 Department Management Endpoints

### Get All Departments
```http
GET /api/admin/departments
```

### Create Department
```http
POST /api/admin/departments
```
**Body:**
```json
{
  "name": "Sales",
  "description": "Sales department",
  "manager": "manager_id",
  "permissions": ["read", "write"]
}
```

### Update Department
```http
PUT /api/admin/departments/:id
```

### Delete Department
```http
DELETE /api/admin/departments/:id
```

## 📊 Analytics Endpoints

### Staff Analytics
```http
GET /api/admin/staff/analytics
```
**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalStaff": 50,
    "activeStaff": 45,
    "departments": [...],
    "recentHires": [...],
    "performance": {...}
  }
}
```

### Staff Reports
```http
GET /api/admin/staff/reports
```

### Export Staff Data
```http
POST /api/admin/staff/export
```
**Body:**
```json
{
  "format": "csv|pdf",
  "filters": {
    "department": "Sales",
    "status": "active"
  }
}
```

## 🔐 Authentication

All endpoints require admin authentication:
```http
Authorization: Bearer <jwt_token>
```

## 📝 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Staff member not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

## 🧪 Testing Examples

### Create Staff Test
```bash
curl -X POST http://localhost:5000/api/admin/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@sportify.com",
    "password": "password123",
    "employeeId": "EMP002",
    "department": "Marketing",
    "hireDate": "2025-01-01"
  }'
```

### Get Staff List Test
```bash
curl -X GET "http://localhost:5000/api/admin/staff?page=1&limit=10&search=john" \
  -H "Authorization: Bearer <token>"
```

---

**Last Updated**: October 16, 2025  
**Version**: 1.0.0
