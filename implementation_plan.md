# Implementation Plan: URL Shortener Bonus Features

This plan outlines the changes needed to implement the 7 bonus features for the full-stack URL Shortener.

## Proposed Changes

### Database & Prisma
- #### [MODIFY] [schema.prisma](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/prisma/schema.prisma)
  - Add `browser`, `os`, and `deviceType` optional `String` fields to the `Visit` model.
  - Run database migration to apply changes.

---

### Backend Components
- #### [MODIFY] [backend/package.json](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/package.json)
  - Install dependencies: `qrcode`, `ua-parser-js`, `csv-parse`, `multer`.
- #### [MODIFY] [app.js](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/src/app.js)
  - Register the new `publicRoutes` for public-facing stats.
- #### [NEW] [publicRoutes.js](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/src/routes/publicRoutes.js)
  - Add `GET /api/public/:shortCode/stats` (no auth required).
- #### [MODIFY] [urlRoutes.js](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/src/routes/urlRoutes.js)
  - Add `GET /api/urls/:id/qrcode` route.
  - Add `PATCH /api/urls/:id` route for inline edit.
  - Add `POST /api/urls/bulk` route with `multer` middleware for CSV upload.
- #### [MODIFY] [urlController.js](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/src/controllers/urlController.js)
  - Add `getQrCode()` to generate base64 QR codes using `qrcode` library.
  - Add `updateUrl()` for updating destination URL.
  - Add `bulkCreate()` to process CSV content.
- #### [MODIFY] [urlService.js](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/src/services/urlService.js)
  - Update `createUrl` to accept `expiresAt`.
  - Add `updateUrl` to change destination URL after ownership check.
  - Add `bulkCreateUrl` logic to loop through CSV entries.
- #### [MODIFY] [urlValidators.js](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/src/validators/urlValidators.js)
  - Add schema validator for `expiresAt` (must be future).
  - Add schema validator for URL update.
- #### [MODIFY] [redirectController.js](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/src/controllers/redirectController.js)
  - Add expiration check logic (returns 410 if expired).
  - Integrate `ua-parser-js` to extract `browser`, `os`, and `deviceType` during redirect.
- #### [MODIFY] [analyticsService.js](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/backend/src/services/analyticsService.js)
  - Update `getAnalytics` to group/aggregate device and browser breakdown.
  - Add daily clicks trend query logic for the last 30 days.

---

### Frontend Components
- #### [MODIFY] [frontend/package.json](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/frontend/package.json)
  - Install dependency: `recharts`.
- #### [MODIFY] [App.jsx](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/frontend/src/App.jsx)
  - Add public route `/stats/:shortCode`.
- #### [NEW] [PublicStatsPage.jsx](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/frontend/src/pages/PublicStatsPage.jsx)
  - Build UI for public stats sharing.
- #### [MODIFY] [UrlTable.jsx](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/frontend/src/components/UrlTable.jsx)
  - Add QR Code modal and button.
  - Add "Expires" column with logic for red/orange badges.
  - Add inline editing for Destination URL (Pencil icon, Save/Cancel).
  - Add "Share Stats" button copying to clipboard.
- #### [MODIFY] [UrlForm.jsx](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/frontend/src/components/UrlForm.jsx)
  - Add Expiry Date input.
- #### [MODIFY] [DashboardPage.jsx](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/frontend/src/pages/DashboardPage.jsx)
  - Add Bulk Import modal with file upload for `.csv`.
- #### [MODIFY] [AnalyticsPage.jsx](file:///c:/Users/sruth_5j39l0q/PROJECTS/url-shortening-and-analytics/frontend/src/pages/AnalyticsPage.jsx)
  - Add horizontal progress bars for device and browser percentages.
  - Add `recharts` LineChart for daily clicks over the last 30 days.

## Verification Plan
### Automated Tests
- Prisma migration will be tested by running `npx prisma migrate dev --name test_migration`.
- Backend endpoints will be interactively tested using browser sessions or curl (for API routes like `/api/public/:shortCode/stats`, redirect logic testing via `localhost:5000/r/:shortcode`).

### Manual Verification
- Verify via the Frontend Dev Server:
  - Generate a link, view its QR code, and download it.
  - Set an expiry date on a link, test clicking it before and after simulating expiry.
  - Click the link multiple times from different simulated tools/devices (using dev tools) to populate analytics.
  - View the `AnalyticsPage` to confirm charts and progress bars display correctly.
  - Inline edit a URL from `UrlTable` and confirm it persists.
  - Copy public stats link and view logged out.
  - Upload a valid `.csv` with URLs and see them appear in the dashboard.
