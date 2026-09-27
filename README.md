# JECC Anonymous Q&A Portal

A modern, responsive platform built with Next.js (App Router) and Tailwind CSS designed for students and community members to ask questions anonymously, and for **Junior Entreprise Centrale Casablanca (JECC)** club members to publish official answers through a password-protected admin dashboard.

---

## 🚀 Live Vercel Deployment

Deploy this project on Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAnwarMOUNIR%2Fjecc-ask-anonymous)

### Environment Variables on Vercel:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `ADMIN_PASSWORD` | Password required to unlock the club members' panel | `clubSecretPass2026` |
| `NEXT_PUBLIC_SUPABASE_URL` | *(Optional)* Supabase project URL for cloud persistence | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Optional)* Supabase public anon key | `ey...` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Optional)* Supabase service role key (for server mutations) | `ey...` |

> **Note**: The application has an automatic in-memory fallback enabled out of the box, allowing you to deploy and test immediately on Vercel even before connecting a Supabase database!

---

## ✨ Features

### 1. Public Anonymous Portal
- **Zero Login / Zero Tracking**: Anyone can submit questions anonymously with a topic category.
- **Search & Category Filtering**: Filter by topics (*General, Events, Recruitment, Workshops, Consulting*) or search keywords.
- **Answer Display**: Real-time display of questions answered by JECC executive members.

### 2. Password-Protected Club Admin Panel
- Access via the **"Club Admin"** button in the top navigation bar.
- Password gate authenticated via HTTP-only secure session cookies.
- **Answer Pending Questions**: Reply to student inquiries and choose your responder title (e.g. *JECC Core Team*, *HR Division*).
- **Edit & Moderate**: Update previous answers or delete spam/inappropriate questions.

---

## 🗄️ Database Setup (Supabase)

If you wish to use Supabase for persistent cloud storage:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the contents of [`supabase-schema.sql`](supabase-schema.sql).
3. Copy your project URL and API keys to your Vercel Environment Variables or `.env.local`.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/AnwarMOUNIR/jecc-ask-anonymous.git
cd jecc-ask-anonymous

# Install dependencies
npm install

# Start local server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the portal.
