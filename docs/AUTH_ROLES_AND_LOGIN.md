# Authentication — roles & login screens

## Policy (invite-only)

| Role | Created by | Login screen | Method |
|------|------------|--------------|--------|
| Super Admin, office, Buyer (laptop) | Admin / seed | `/auth/admin` | Phone + password |
| **Buyer** (mobile field) | Admin → Access Control | `/auth/admin` | Phone + **password** (same as Admin login) |
| **Driver** | Admin → Logistics (self-register **off** by default) | `/auth/driver` | Phone + **OTP** |
| Restaurant / Fish Mall | Admin | `/restaurant/auth`, `/fishmall/auth` | OTP (`loginPortal` set) |

Unknown phones cannot receive OTP. Dev auto-admin bootstrap only if `ALLOW_DEV_OTP_BOOTSTRAP=true`.

## Admin workflow

### New buyer

1. Admin → **Access Control** → Create user: phone, role `BUYER`, permissions, password (for web ERP optional).
2. Share phone + password; user opens **`/auth/admin`** → login → `/mobile/buyer/dashboard`.

### New driver

1. Admin → **Logistics → Drivers** → add driver (phone, documents).
2. Approve driver (`isActive=true`).
3. Driver opens **`/auth/driver`** → OTP login.

## Environment

```env
ALLOW_DRIVER_SELF_REGISTER=false
ALLOW_DEV_OTP_BOOTSTRAP=false
SMS_FORCE_SEND=true   # dev: real SMS + random OTP
```

## API

- `POST /auth/otp/send` — body: `{ phone, loginPortal?: "driver"|"buyer"|"restaurant"|"fishmall" }`
- `POST /auth/otp/verify` — body: `{ phone, otp, loginPortal? }`
