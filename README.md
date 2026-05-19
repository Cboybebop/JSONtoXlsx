# JSON to XLSX (Next.js)
<img width="2457" height="1573" alt="image" src="https://github.com/user-attachments/assets/9601ba0e-878d-45c3-9db3-4a205f55dd67" />

A modern Next.js app for converting JSON into XLSX directly in the browser.

## Features
- Paste JSON or upload a `.json` file
- Automatic row/column detection
- Row mapping controls (start row + max rows)
- Column mapping chips to choose export fields
- Progress bar for file loading + export
- Intelligent validation errors with suggested fixes
- One-click `.xlsx` download
- Client-side conversion using `xlsx`
- Ready to deploy on Vercel

## Local development
```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push this repo to GitHub.
2. Import the repository in Vercel.
3. Use default build settings (`npm run build`, output from Next.js).

## Expected JSON shape
- Array of objects
- Or an object where values are objects

Example:
```json
[
  { "id": 1, "name": "Ada" },
  { "id": 2, "name": "Grace" }
]
```
