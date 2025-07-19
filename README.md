# AI Analytics Frontend

A modern Next.js frontend for the AI Analytics platform with comprehensive dashboard, query automation, and Teams integration.

## 🚀 **Live Demo**
- **Backend API**: https://my-app-be-u7uh.onrender.com
- **Frontend**: Deploy to Netlify for live version

## ✨ **Features**

- 🤖 **AI Query Interface**: Natural language and direct SQL queries
- 📊 **Analytics Dashboard**: Real-time metrics and performance insights
- 👥 **Role-Based Access**: Admin, Team Lead, and Agent roles
- 📝 **Admin Prompt Management**: Save and reuse query templates
- 🔄 **Report Automation**: Schedule automated reports with Teams integration
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI components

## 🛠️ **Tech Stack**

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

## 📋 **Prerequisites**

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

## 🏃‍♂️ **Quick Start**

### **Local Development**

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd ai-analytics-frontend
   npm install --legacy-peer-deps
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_USE_MOCK_API=false
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3001
   ```

## 🌐 **Netlify Deployment**

### **Ready for One-Click Deployment!**

Your frontend is pre-configured with:
- ✅ **Backend URL**: https://my-app-be-u7uh.onrender.com/api
- ✅ **Build Configuration**: Optimized for Netlify
- ✅ **Environment Variables**: Pre-set for production
- ✅ **Static Export**: Ready for CDN deployment

### **Deploy Steps:**

1. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.app)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Netlify will auto-detect:**
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
   - **Environment variables**: Set automatically

3. **Click Deploy** - Your site will be live in 2-3 minutes!

## 🔑 **Login Credentials**

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@example.com | Test123@Password |
| Team Lead | teamlead@example.com | Test123@Password |
| Agent | agent@example.com | Test123@Password |

## 📱 **Features by Role**

### **Admin Users**
- ✅ AI Query execution (natural language + SQL)
- ✅ Admin prompt management (create, edit, use)
- ✅ Report automation & scheduling
- ✅ Teams integration
- ✅ Full dashboard access

### **Team Lead & Agent Users**
- ✅ AI Query execution
- ✅ Use saved admin prompts
- ✅ View analytics dashboard
- ✅ Query history tracking

## 🎯 **Key Pages**

### **AI & Automation Hub**
- **Query Tab**: Execute natural language or SQL queries
- **Saved Prompts Tab**: Use admin-created templates with variables
- **History Tab**: View past executions
- **Automation Tab**: Schedule reports (Admin only)

### **Analytics Dashboard**
- **Overview**: Key metrics and KPIs
- **Quality Check**: Video analysis results
- **Performance**: Agent and team metrics
- **Error Analysis**: System monitoring

## 🔧 **Technical Details**

### **Deployment Configuration**
- **Static Export**: Optimized for Netlify CDN
- **API Integration**: Connects to Render backend
- **Environment**: Production-ready configuration
- **Build**: Automated with proper dependencies

### **Performance**
- **Fast Loading**: Static generation
- **Responsive**: Mobile-optimized
- **Caching**: Efficient asset delivery
- **SEO**: Optimized meta tags

## 🐛 **If Deployment Fails**

### **Common Solutions:**

1. **Dependency Issues:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Build Errors:**
   - Check Node.js version (18+)
   - Clear cache: `rm -rf node_modules && npm install --legacy-peer-deps`

3. **Environment Variables:**
   - Verify backend URL is accessible
   - Check API endpoints return data

## ✅ **Deployment Checklist**

- ✅ Dependencies cleaned up
- ✅ Testing dependencies removed
- ✅ Next.js configured for static export
- ✅ Netlify configuration optimized
- ✅ Backend API URL configured
- ✅ Environment variables set
- ✅ Build tested locally

**Your frontend is ready for Netlify deployment!** 🚀

Simply push to GitHub and connect to Netlify for automatic deployment.