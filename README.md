# MindSpace Backend

MindSpace is a backend service I built to practice **real-world backend engineering**, not just CRUD APIs.

The goal was to design a system that handles authentication, content management, and secure sharing **the way production systems do**, with proper token lifecycle management and defensive checks.

---

## Why I Built This

- how authentication actually works in real apps
- how tokens expire and refresh safely
- how to design sharing without breaking security
- how to handle edge cases, not just happy paths

---

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- JWT (Access Tokens)
- HTTP-only Cookies
- Zod for validation
- Crypto for secure token hashing

---

## Authentication Design (Key Part)

I implemented a **two-token authentication model**, similar to what real production apps use.

### Access Token

- Short-lived (15 minutes)
- Used for all protected API requests
- Stored as an HTTP-only cookie
- Stateless (JWT)

### Refresh Token

- Long-lived
- Stored as an HTTP-only cookie
- Hashed and stored in the database
- Used only to issue new access tokens
- Supports expiry and manual revocation (logout)

**Important design choice:**
The refresh token is the _primary credential_.
Access tokens are short-lived derivatives to reduce risk.

---

## Token Flow (Simplified)

1. User logs in → access + refresh token issued
2. Access token expires → API returns 401
3. Client calls refresh endpoint
4. Refresh token is validated against DB
5. New access token is issued
6. User continues without re-login

Refresh tokens are scoped using cookie `path` so they are **only sent to the refresh endpoint**, not to every API.

---

## Content Management

- Create, read, update, delete content
- Supported content types:

  - YouTube
  - Twitter
  - (Extensible for more)

- Every mutation checks:

  - ownership
  - authentication
  - valid input

---

## Sharing System

- Global sharing toggle
- Per-content sharing toggle
- Public read-only access for shared content
- Private content remains fully protected

I intentionally separated **sharing state** from **ownership** to avoid security leaks.

---

## API Design Principles

- RESTful endpoints
- Correct HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`)
- Clear separation between public and protected routes
- No trust in client-side state
- Defensive backend validation everywhere

---

## Example Endpoints

```
POST   /api/v1/auth/login
GET    /api/v1/auth/refresh/access-token
POST   /api/v1/auth/logout

GET    /api/v1/mind/content
POST   /api/v1/mind/content
PATCH  /api/v1/mind/content/share/:contentId
DELETE /api/v1/mind/content/:contentId
```

---

## Security Considerations

- HTTP-only cookies to protect tokens from XSS
- Refresh tokens are hashed before storing in DB
- Tokens can be revoked on logout
- Cookie scope limits token exposure
- No sensitive data leaked in error responses

---

## What This Project Demonstrates

- Real understanding of authentication flows
- Backend system design thinking
- Security-first mindset
- Ability to reason about edge cases and failures
- Writing backend code with long-term maintainability in mind

---

## Final Note

This project was built to reflect **how real backend systems behave**, not just to “work”.

I focused more on **correctness and design decisions** than on shortcuts.
