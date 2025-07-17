# EverBetter_APITesting

A clean, beginner-friendly, and scalable API automation framework using Playwright's APIRequestContext.

## 📁 Folder Structure

```
EverBetter_APITesting/
├── config/         # Centralized config (base URL, tokens, etc.)
├── tests/          # All API test cases (one file per API or scenario)
├── utils/          # Reusable request and helper utilities
├── package.json    # Project dependencies and scripts
└── README.md       # This file
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run all tests:**
   ```sh
   npx playwright test
   ```
3. **Add a new API test:**
   - Copy any test in `tests/` as a template.
   - Change the endpoint, payload, and assertions as needed.
   - No framework refactor required!

## 🧩 How it works
- Central config in `config/config.ts` for easy updates.
- All requests use Playwright's APIRequestContext via `utils/request.ts`.
- Each test is self-contained and readable.
- No code rewrite needed to add new APIs—just add a new test file.

## 📝 Example: Add a new API
1. Get your cURL request.
2. Create a new test file in `tests/` (e.g., `myapi.spec.ts`).
3. Use the provided pattern to send the request and assert the response.

## 👶 For Beginners
- All code is commented for clarity.
- No prior Playwright or API experience needed.
- If stuck, just read the comments or ask for help!

---

**Happy Testing!**
