# Teacher's Education Platform

A modern web platform for teacher education, professional development, and career growth. This application provides a comprehensive solution for educators to enhance their skills, connect with opportunities, and access valuable resources.

## 📋 Membership Plans

### 1. Monthly Membership – ₹999/month
Designed for teachers who want flexibility and ongoing support without heavy commitment.

**Inclusions:**
- Access to selected self-paced modules (2–3 new modules/month)
- 1 live interactive session/month with an expert
- Access to teacher community forum (peer discussions, Q&A, sharing lesson ideas)
- Monthly teaching toolkit (downloadable activity ideas, templates, resources)

**🎯 Target Audience:** New teachers, freelance tutors, budget-conscious educators
**💎 Value Add:** Affordable entry point, "try before committing annually"

### 2. Annual Membership – ₹9,999/year
Best value plan for consistent learners looking for certification.

**Inclusions:**
- Full access to all self-paced modules across pedagogy, EdTech, classroom management, NEP 2020, SEL, etc.
- 12+ live masterclasses (one every month)
- 1 capstone project (submit a teaching portfolio or lesson innovation idea)
- Annual Certificate of Completion (recognized by partner institutions)
- Access to resource library (lesson plan bank, activity kits, assessments)
- Invitations to free/discounted workshops

**🎯 Target Audience:** Mid-career teachers who want structured professional development and certifications
**💎 Value Add:** Continuous growth + credibility

### 3. Premium Educator Track – ₹19,999/year
A career growth package for ambitious teachers aiming for leadership, international exposure, or school transitions.

**Inclusions:**
- Everything from Annual Membership
- 1-on-1 mentorship sessions (quarterly with expert coaches)
- Career services: CV building, interview prep, placement assistance
- International certification tie-ups (Cambridge/IB/Finland pedagogy micro-credentials)
- Specialized tracks: Leadership in Education, Inclusive Education, Digital Pedagogy
- Priority invitations to EduElevate Retreats/Bootcamps
- Digital Portfolio Showcase for job opportunities

**🎯 Target Audience:** Senior teachers, coordinators, and those aiming for global school placements or promotions
**💎 Value Add:** Direct career acceleration + international credibility

### 4. Referral Program
- Earn ₹500 discount credits (or 1 free module) for every peer you bring in
- Referrals can stack up to 50% off the next membership renewal
- Leaderboard with rewards for top referrers

### 5. Add-On Services
- **Pay-per-Course Option**: ₹1,499–₹2,999 for standalone short courses
- **Teaching Resources Marketplace**: Buy/sell lesson plans, worksheets, PPTs
- **Micro-Credentials**: ₹3,000–₹5,000 each (short, high-value courses with certification)
- **Scholarship/EMI Options**: For budget-limited teachers

## 🚀 Features

- **AI-Powered Counselor**: Get personalized career guidance and teaching advice
- **Interactive Lead Capture**: Multi-step form to collect teacher information and preferences
- **Membership Plans**: Multiple subscription tiers for different career stages (see below)
- **Responsive Design**: Fully responsive interface that works on all devices
- **Dark Mode**: Beautiful dark theme for comfortable viewing
- **Secure Authentication**: NextAuth.js integration for user authentication
- **Database Integration**: PostgreSQL database with Prisma ORM
- **Email Notifications**: Automated email communication with Resend
- **Payment Processing**: Secure payment integration with Razorpay

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Headless UI, Hero Icons, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Razorpay
- **Email**: Resend
- **AI**: OpenAI GPT-4 (with GPT-3.5 fallback)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- PostgreSQL database (local or cloud-hosted)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dmdm-2025/teachers_education_board.git
   cd teachers_education_board
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the variables with your configuration

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🖥️ Windows + Apache Deployment

### Prerequisites
1. Install [XAMPP](https://www.apachefriends.org/download.html) (includes Apache, MySQL, PHP)
2. Install [Node.js](https://nodejs.org/) for Windows
3. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

### Setup Instructions

1. **Configure Apache as Reverse Proxy**
   - Open `httpd.conf` (usually in `C:\xampp\apache\conf\`)
   - Uncomment these modules if commented:
     ```
     LoadModule proxy_module modules/mod_proxy.so
     LoadModule proxy_http_module modules/mod_proxy_http.so
     LoadModule rewrite_module modules/mod_rewrite.so
     ```
   - Add at the end of the file:
     ```apache
     <VirtualHost *:80>
         ServerName yourdomain.com
         ServerAlias www.yourdomain.com
         
         ProxyPreserveHost On
         ProxyPass / http://localhost:3000/
         ProxyPassReverse / http://localhost:3000/
         
         ErrorLog logs/yourdomain.com-error.log
         CustomLog logs/yourdomain.com-access.log common
     </VirtualHost>
     ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Start with PM2**
   ```bash
   pm2 start npm --name "teacher-platform" -- start
   pm2 save
   pm2 startup
   ```

5. **Start Apache**
   - Open XAMPP Control Panel
   - Start Apache service

### Alternative: Vercel Deployment (Recommended for Production)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdmdm-2025%2Fteachers_education_board)

## 📦 Project Structure

```
.
├── prisma/           # Database schema and migrations
├── public/           # Static files
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utility functions and configurations
│   └── styles/       # Global styles
├── .env.example      # Example environment variables
└── package.json      # Project dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"

# OpenAI
OPENAI_API_KEY="your_openai_api_key_here"

# Resend
RESEND_API_KEY="your_resend_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

## 🛠️ Scripts

- `dev`: Start the development server
- `build`: Build the application for production
- `start`: Start the production server
- `lint`: Run ESLint
- `type-check`: Check TypeScript types
- `prisma:generate`: Generate Prisma client
- `prisma:push`: Push schema to database

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js & TypeScript
"# teacher-platform" 
