# SMS India Hub — OTP integration

Golden Fisheries sends login OTPs and transactional alerts through **SMS India Hub** (`cloud.smsindiahub.in`).

## 1. Panel setup (one-time)

1. Log in at [SMS India Hub dashboard](https://cloud.smsindiahub.in/Web/Dashboard).
2. **API** (top nav) → copy your **API Key**.
3. **DLT Registration** → register **Entity ID**, **Sender ID** (6 characters), and an **OTP template** (TRAI requirement for India).
4. Wait until template status is **Approved** (error `024` means text does not match DLT).

Use your **Transactional** balance for OTP (channel `Trans` in `.env`).

## 2. Backend `.env`

Copy `backend/.env.example` and set:

| Variable | Source |
|----------|--------|
| `SMS_PROVIDER` | `smsindiahub` |
| `SMS_API_KEY` | API section in panel |
| `SMS_SENDER_ID` | DLT-approved sender (6 chars) |
| `SMS_ENTITY_ID` | DLT entity / PE ID |
| `SMS_DLT_TEMPLATE_ID` | DLT template ID for OTP message |
| `SMS_OTP_TEMPLATE` | **Exact** approved message; put `{otp}` where the 6-digit code goes |

Example (replace with your **exact** approved wording from DLT panel):

```env
SMS_OTP_TEMPLATE=Dear User, Your OTP for Golden Fisheries is {#var#}. Valid for 5 mins. Do not share.
```

Use `{#var#}` (DLT standard) or `{otp}` where the 6-digit code goes. Every other character must match DLT.

### API says success but SMS not on phone?

`ErrorCode: 000` only means the gateway **accepted** the message. Indian operators then **scrub** text against your DLT template. If wording does not match exactly, SMS is dropped silently.

Check in SMS India Hub panel → **SMS Reports** / **Delivery Report** for status like `UNDELIVERED`, `NOT-SENT`, or template errors.

| Check | Action |
|-------|--------|
| Template text | Copy full approved template from **DLT Registration → DLT Template** into `SMS_OTP_TEMPLATE` |
| Entity ID | Use full **DLT Entity ID** from operator profile (usually 10–20 digits), not a short internal panel number |
| Sender ID | `SMS_SENDER_ID` must be approved and linked to that template |
| Channel | OTP sends use API channel `OTP` automatically |

Optional: `SMS_CHANNEL=Trans` (default), `SMS_ROUTE=` if your account requires a route id.

**Development**

- `NODE_ENV=development` → OTP code is always `123456`; SMS is **not** sent unless `SMS_FORCE_SEND=true`.
- Set `SMS_FORCE_SEND=true` to test real delivery from your machine.

## 3. Verify

```bash
cd backend
npm run test:sms -- 9XXXXXXXXX
```

Or after login as Super Admin (web): `POST /api/v1/integrations/test/sms` with `{ "phone": "9XXXXXXXXX", "message": "Golden Fisheries test" }`.

Public check: `GET http://localhost:5000/api/v1/integrations/status` → `sms.enabled: true` when all required fields are set.

## 4. App OTP flow

- Driver / Restaurant OTP: `POST /auth/otp/send` → SMS → `POST /auth/otp/verify`.
- Production uses a random 6-digit OTP (not `123456`).

## 5. Common errors

| ErrorCode | Meaning |
|-----------|---------|
| 000 | Submitted successfully |
| 021 | Insufficient credits |
| 024 | Template text mismatch — fix `SMS_OTP_TEMPLATE` to match DLT exactly |
| 013 | Invalid mobile — use 10-digit Indian number in the app |

## 6. Fast2SMS (legacy)

Set `SMS_PROVIDER=fast2sms` and `SMS_API_KEY` only; gateway defaults to Fast2SMS bulk API.
