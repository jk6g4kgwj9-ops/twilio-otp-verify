# Twilio OTP Verify - Free USA Number Setup

Complete Node.js + Twilio Verify implementation for sending and verifying OTPs via SMS, plus messaging capabilities using a free Twilio trial number.

## Features

✅ **Send OTP via SMS** - Verify Service for secure OTP delivery
✅ **Verify OTP** - Confirm OTP codes sent to users
✅ **Send SMS Messages** - Direct messaging using your Twilio number
✅ **Resend OTP** - Allow users to request another OTP
✅ **Check Verification Status** - Track verification attempts
✅ **Phone Validation** - Automatic phone number formatting
✅ **Error Handling** - Comprehensive error responses

---

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Twilio Account (free trial available)

---

## 🚀 Setup Instructions

### 1. Create Twilio Free Account

1. Go to **[https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)**
2. Sign up with your email and phone number
3. Complete verification (you'll receive an OTP via SMS)
4. Go to **[Twilio Console](https://console.twilio.com)**

### 2. Get Your Credentials

#### Account SID & Auth Token
1. In Twilio Console, you'll see your **Account SID** and **Auth Token** displayed
2. Copy both values (keep Auth Token private!)
3. **Note:** On trial accounts, the token shows only once. If you lose it, regenerate it

#### Get Your Free USA Twilio Phone Number
1. Go to **[Phone Numbers](https://console.twilio.com/us-east-1/explore/phone-numbers/manage/incoming)**
2. Click **"Get Started"** → **"Get a Twilio Phone Number"**
3. Choose **United States** and accept the number offered (or search for specific area codes)
4. Copy the number (format: +1XXXXXXXXXX)
5. This is your `TWILIO_PHONE_NUMBER` for sending SMS

#### Create Verify Service
1. Go to **[Verify Services](https://console.twilio.com/us-east-1/explore/verify/services)**
2. Click **"Create a new Service"**
3. Name it (e.g., "OTP Verification")
4. Click **"Create"**
5. Copy the **Service SID** (starts with `VA`)
6. This is your `VERIFY_SERVICE_SID`

### 3. Configure Environment Variables

1. Clone this repository and navigate to it
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in your credentials in `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   PORT=3000
   NODE_ENV=development
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
Environment: development
```

---

## 📱 API Endpoints

### 1. Send OTP

**Endpoint:** `POST /send-otp`

**Request:**
```bash
curl -X POST http://localhost:3000/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+15551234567"}'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to +15551234567",
  "status": "pending",
  "phone": "+15551234567"
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /verify-otp`

**Request:**
```bash
curl -X POST http://localhost:3000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+15551234567","code":"123456"}'
```

**Response (Success):**
```json
{
  "success": true,
  "status": "approved",
  "message": "OTP verified successfully"
}
```

**Response (Failed):**
```json
{
  "success": false,
  "status": "failed",
  "message": "Invalid OTP"
}
```

---

### 3. Send SMS Message

**Endpoint:** `POST /send-sms`

Use your Twilio number to send messages to any verified number.

**Request:**
```bash
curl -X POST http://localhost:3000/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to":"+15551234567","message":"Hello! This is a test message."}'
```

**Response:**
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued"
}
```

---

### 4. Check Verification Status

**Endpoint:** `POST /check-verification-status`

**Request:**
```bash
curl -X POST http://localhost:3000/check-verification-status \
  -H "Content-Type: application/json" \
  -d '{"phone":"+15551234567"}'
```

**Response:**
```json
{
  "success": true,
  "status": "approved",
  "phone": "+15551234567"
}
```

---

### 5. Resend OTP

**Endpoint:** `POST /resend-otp`

**Request:**
```bash
curl -X POST http://localhost:3000/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+15551234567"}'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent to +15551234567",
  "status": "pending"
}
```

---

### 6. Health Check

**Endpoint:** `GET /health`

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## ⚠️ Important Notes for Twilio Trial Accounts

### Receiving OTPs/SMS
- ✅ **You CAN send OTPs and SMS to verified numbers** (add recipients in Twilio Console)
- ❌ Cannot send to unverified numbers without upgrading
- ✅ **Verify Service allows sending to ANY number** (Twilio manages this)

### Adding Verified Phone Numbers
1. Go to **[Verified Caller IDs](https://console.twilio.com/us-east-1/account/phone-numbers/verified)**
2. Click **"Add a Verified Phone Number"**
3. Enter the phone number and follow verification instructions
4. Once verified, you can send SMS directly to that number

### Upgrading to Production
When you upgrade your Twilio account:
- Remove "Twilio trial message" prefix
- Send SMS to any number
- Access advanced features
- Get dedicated Twilio number(s)

### OTP Delivery
- Twilio Verify Service automatically handles delivery to any number
- No need for pre-verification for OTP delivery
- Verify Service has built-in retry logic

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git** - Add to `.gitignore`
2. **Keep Auth Token secret** - Regenerate if exposed
3. **Validate phone numbers** - Use proper formatting
4. **Rate limit endpoints** - Prevent OTP brute force
5. **Use HTTPS in production** - Never send credentials over HTTP
6. **Set OTP expiry** - Configure in Verify Service settings
7. **Log attempts** - Monitor suspicious activity

---

## 🧪 Testing Locally

### Using cURL (Command Line)

1. **Send OTP:**
   ```bash
   curl -X POST http://localhost:3000/send-otp \
     -H "Content-Type: application/json" \
     -d '{"phone":"+15551234567"}'
   ```

2. **Check your phone** - You'll receive an SMS with a 6-digit code

3. **Verify OTP:**
   ```bash
   curl -X POST http://localhost:3000/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"phone":"+15551234567","code":"123456"}'
   ```

### Using Postman

1. Open Postman
2. Create new requests for each endpoint
3. Set method to `POST`
4. Add JSON body
5. Send requests

### Using ngrok for External Testing

```bash
# Install ngrok
brew install ngrok  # macOS

# Start your server
npm start

# In another terminal, expose your server
ngrok http 3000

# Use the ngrok URL in your mobile app or external services
```

---

## 📊 Example: Full Authentication Flow

```bash
# 1. User enters phone number - SEND OTP
curl -X POST http://localhost:3000/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+15551234567"}'

# Response: { "success": true, "status": "pending" }

# 2. User receives SMS with OTP code (e.g., 123456)

# 3. User enters code - VERIFY OTP
curl -X POST http://localhost:3000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+15551234567","code":"123456"}'

# Response: { "success": true, "status": "approved" }

# 4. User is now authenticated!
```

---

## 🐛 Troubleshooting

### "SMS not received"
- Ensure phone number is in correct format: `+1XXXXXXXXXX`
- Check if number is in Twilio trial's verified list
- For OTP: Verify Service doesn't require pre-verification
- Check Twilio Console logs for errors

### "Invalid credentials"
- Verify SID, Auth Token, and Verify Service SID are correct
- Ensure `.env` file is in root directory
- Reload server after changing `.env`

### "Failed to send SMS"
- Ensure `TWILIO_PHONE_NUMBER` is correct
- Check recipient number is verified (for non-Verify Service)
- Verify account has active SMS credits

### "Code not received"
- OTP codes expire after 10 minutes (default)
- Check Twilio Console's Activity logs
- Verify phone number format is correct

---

## 📚 Additional Resources

- [Twilio Verify Documentation](https://www.twilio.com/docs/verify)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio Console](https://console.twilio.com)
- [Node.js Twilio SDK](https://github.com/twilio/twilio-node)

---

## 📝 License

MIT

---

## ❓ FAQ

**Q: Can I use the free Twilio trial forever?**
A: Trial accounts have limitations. You can upgrade to a paid account anytime.

**Q: How long are OTP codes valid?**
A: Default is 10 minutes. Configure in Verify Service settings.

**Q: Can I send to international numbers?**
A: Yes, with Verify Service. Format numbers with country code (e.g., +44XXXXXXXXXX)

**Q: Do I need to verify every phone number to send SMS?**
A: Only for direct SMS (non-Verify). Verify Service automatically handles it.

**Q: What's the difference between Verify Service and Programmable SMS?**
A: Verify Service = OTP delivery & verification. Programmable SMS = General messaging.
