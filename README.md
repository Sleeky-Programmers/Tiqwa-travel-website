# Tiqwa-travel-website

## Email Verification

The frontend flow is:

1. Sign up through `/api/proxy/auth/signup`.
2. Redirect to `/email-verification?email=...` after signup succeeds.
3. Submit `{ email, token }` to `/api/proxy/auth/verify-email`.
4. Sign in through `/api/proxy/auth/login` after verification.

The sandbox was verified at `https://sandbox.premiumwhitelabel.com/api/v2`. Signup and login return `{ success, data, message }`. Signup data includes nullable profile
fields; login returns a string `token` and `role`. Invalid verification returned HTTP `422` with:

```json
{
	"status": "error",
	"status_code": "011",
	"message": "Some required fields are missing or empty!",
	"errors": { "token": ["The selected token is invalid."] }
}
```

The verification endpoint accepted the request both without authorization and with an invalid bearer token. A successful verification response could not be captured
because the OTP is delivered by email; the UI therefore treats the success payload as an opaque typed data object until a real success response is available. No resend
endpoint was documented or verified.
