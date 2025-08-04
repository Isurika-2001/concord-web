# Concord Tech Solutions

A modern, responsive website for Concord Tech Solutions - a web development company specializing in React, Next.js, and modern web technologies.

## 🚀 Features

- **Responsive Design:** Mobile-first approach with smooth navigation
- **Modern Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Contact Form:** Functional contact form with email integration
- **Admin Dashboard:** Protected admin panel for viewing submissions
- **Custom Theme:** Brand colors (#2c2b5f primary, #7668cd secondary)
- **SEO Optimized:** Proper metadata and structure

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Material-UI Icons
- **Deployment:** Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Isurika-2001/concord-web.git
cd concord-web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
# Admin Passwords
NEXT_PUBLIC_ISURIKA_PASSWORD=saSA12!@concordAdmin
NEXT_PUBLIC_THARINDU_PASSWORD=taTA12!@concordAdmin
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## 🏗️ Project Structure

```
concord-web/
├── src/
│   ├── app/
│   │   ├── admin/[userName]/page.tsx  # Admin dashboard
│   │   ├── api/
│   │   │   ├── contact/route.ts       # Contact form API
│   │   │   └── submissions/route.ts   # Submissions API
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Home page
│   └── components/ui/                 # shadcn/ui components
├── public/                            # Static assets
├── data/                              # Contact submissions
└── .env.local                         # Environment variables
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect to GitHub:**
   - Go to [Vercel](https://vercel.com)
   - Sign in with GitHub
   - Import your repository: `Isurika-2001/concord-web`

2. **Configure Environment Variables:**
   - Add the same environment variables from `.env.local`
   - `NEXT_PUBLIC_ISURIKA_PASSWORD`
   - `NEXT_PUBLIC_THARINDU_PASSWORD`

3. **Deploy:**
   - Vercel will automatically detect Next.js
   - Build and deploy automatically

### Other Platforms

The project is compatible with:
- **Netlify:** Use `npm run build` and `npm start`
- **Railway:** Direct GitHub integration
- **DigitalOcean App Platform:** Next.js support

## 🔐 Admin Access

- **URL:** `/admin/isurika` or `/admin/tharindu`
- **Usernames:** `isurika`, `tharindu`
- **Passwords:** Set via environment variables
- **Features:** View contact form submissions

## 📞 Contact Information

- **Email:** isurikalakshani2001@gmail.com
- **Phone:** (+94) 78 510 9735 / (+94) 71 221 5008
- **Address:** Biyagama, Western Province Sri Lanka

## 🎨 Customization

### Colors
- Primary: `#2c2b5f`
- Secondary: `#7668cd`

### Services
- Web Development
- Cloud Services  
- Custom Solutions

## 📝 License

This project is private and proprietary to Concord Tech Solutions.

## 🤝 Contributing

This is a private project. For questions or support, contact the development team.

---

Built with ❤️ by Concord Tech Solutions
