# Aja Logistics - Authentication & Authorization Design

## Architecture

1. **Authentication Protocol**: JWT (JSON Web Tokens) with standard Bearer authorization header (`Authorization: Bearer <token>`).
2. **Password Security**: Bcrypt hash with salt rounds = 10.
3. **Roles & RBAC**:
   - `CUSTOMER`: Access to own profile, customer portal, own shipments, own quote requests, own support tickets.
   - `STAFF`: Access to operations dashboard, quote review workflows, shipment creation & tracking updates.
   - `ADMIN`: Unrestricted access to all modules, staff user creation, role assignment, audit logs, and CMS management.

## Default Bootstrap Accounts
The database automatically seeds default credentials on initial startup for development and operation verification:

- **Admin Account**:
  - Email: `admin@aja-logistics.com`
  - Password: `AdminPassword123!`
  - Role: `ADMIN`

- **Staff Account**:
  - Email: `staff@aja-logistics.com`
  - Password: `StaffPassword123!`
  - Role: `STAFF`

- **Demo Customer Account**:
  - Email: `customer@aja-logistics.com`
  - Password: `CustomerPassword123!`
  - Role: `CUSTOMER`

## Token Structure
Payload encoded in JWT:
```json
{
  "userId": "usr_admin_1",
  "email": "admin@aja-logistics.com",
  "role": "ADMIN",
  "fullName": "مدير النظام - Aja Admin"
}
```
Expirations: 24 hours.
