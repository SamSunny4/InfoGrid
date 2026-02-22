# InfoGrid

InfoGrid is a digital display and content management system built for a 43-inch vertical indoor screen. It shows AI-related news, upcoming events, scrolling posters, and QR codes. Content is managed through a built-in admin panel and stored in MongoDB Atlas, with images uploaded to Cloudflare R2.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB Atlas via Mongoose |
| Image Storage | Cloudflare R2 (S3-compatible) |
| Styling | Tailwind CSS v4 |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root and add the following:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
MONGODB_DB=infogrid

# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY=your_r2_access_key_id
R2_SECRET_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-public-bucket-url.com   # optional custom domain

# NewsAPI (auto-fetch feature in admin/news)
NEWSAPI_KEY=your_newsapi_key
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the display board.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin panel.

---

## Admin Panel

The admin panel lives at `/admin` and is divided into four management sections:

| Section | Route | Description |
|---|---|---|
| News | `/admin/news` | Create, edit, and delete news articles with a cover image |
| Events | `/admin/events` | Manage upcoming events with dates and images |
| Posters | `/admin/posters` | Upload and publish posters shown in the display carousel |
| QR Codes | `/admin/qrcodes` | Add titled QR codes with optional redirect URLs |

Each section supports full CRUD operations via REST API routes located in `src/app/api/`.

---

## Database — MongoDB

The app connects to MongoDB Atlas through a cached Mongoose connection defined in `src/lib/mongodb.ts`. The default database name is `infogrid` (overridable via `MONGODB_DB`).

### Collections & Schema

#### `news`

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required, max 200 chars |
| `description` | String | Required, max 2000 chars |
| `imageUrl` | String | Public URL (R2 or external) |
| `imagePath` | String | R2 object key (empty if external image) |
| `newsUrl` | String | Original article URL |
| `category` | String | e.g. General, AI, Technology — default `General` |
| `createdAt` | Date | Auto-managed by Mongoose |
| `updatedAt` | Date | Auto-managed by Mongoose |

#### `events`

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required, max 200 chars |
| `description` | String | Required, max 2000 chars |
| `imageUrl` | String | Public URL from R2 |
| `imagePath` | String | R2 object key used for deletion |
| `eventDate` | Date | Optional event date |
| `eventTime` | String | Optional time string e.g. `14:30` |
| `eventUrl` | String | Optional registration / info link |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

---

## Image Storage — Cloudflare R2

All uploaded images (news covers, event covers, posters, QR code images) are stored in a Cloudflare R2 bucket. R2 is S3-compatible and is accessed via the AWS SDK (`@aws-sdk/client-s3`).

The storage utility is in `src/lib/storage.ts` and exposes two functions:

- **`uploadToR2(buffer, destination, mimeType)`** — uploads a file and returns its public URL
- **`deleteFromR2(destination)`** — deletes a file by its object key

### Setting up Cloudflare R2

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **R2 Object Storage**.
2. Create a new bucket (e.g. `infogrid`).
3. Enable **Public Access** on the bucket, or configure a custom domain.
4. Go to **Manage R2 API Tokens** and create a token with **Object Read & Write** permissions.
5. Copy the **Account ID**, **Access Key ID**, and **Secret Access Key** into `.env.local`.
6. Set `R2_PUBLIC_URL` to your bucket's public URL or custom domain (e.g. `https://pub-xxx.r2.dev`). If omitted, the SDK falls back to `https://pub-<accountId>.r2.dev`.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Display board (public)
│   ├── admin/                # Admin panel pages
│   │   ├── page.tsx          # Admin dashboard
│   │   ├── news/page.tsx
│   │   └── events/page.tsx
│   └── api/                  # REST API routes
│       ├── news/
│       └── events/
├── components/               # Shared UI components
├── lib/
│   ├── mongodb.ts            # Mongoose connection helper
│   └── storage.ts            # Cloudflare R2 upload/delete helpers
└── models/                   # Mongoose models
    ├── News.ts
    └── Event.ts
```

---

## API Routes

All routes follow REST conventions and are prefixed with `/api/`.

| Method | Route | Description |
|---|---|---|
| GET | `/api/news` | List all news |
| POST | `/api/news` | Create a news article |
| GET | `/api/news/[id]` | Get a single news article |
| PUT | `/api/news/[id]` | Update a news article |
| DELETE | `/api/news/[id]` | Delete a news article + R2 image |
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create an event |
| GET/PUT/DELETE | `/api/events/[id]` | Single event operations |
