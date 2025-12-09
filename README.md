# 🚀 PDF Converter Web App - MERN Stack

A modern, futuristic PDF converter application with a sleek black, white, and neon green UI. Built with the MERN stack (MongoDB, Express, React, Node.js).

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Features

### Core Functionality
- 📄 **PDF → DOC/JPG/PNG/TXT** conversion
- 🖼️ **Image → PDF** conversion (JPG, PNG, WEBP)
- 📝 **DOC/DOCX → PDF** conversion
- 🔄 **Image format conversion** (JPG ↔ PNG ↔ WEBP)
- ⚡ **Lightning-fast processing** with optimized algorithms
- 📊 **Real-time conversion progress** tracking

### User Features
- 👤 **User authentication** (JWT-based)
- 📈 **Conversion history** with detailed stats
- 💳 **Stripe payment integration** for premium plans
- 🎯 **Rate limiting** (10 free conversions/day)
- 📧 **Email notifications** for password reset
- 🔒 **Secure file handling** with auto-deletion after 24h

### UI/UX
- 🎨 **Futuristic black/white/neon green theme**
- ✨ **Smooth animations** with Framer Motion
- 📱 **Fully responsive** design
- 🖱️ **Drag & drop** file upload
- 🌙 **Dark mode** by default
- 💎 **Glassmorphism effects**

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Dropzone** for file uploads

### Backend
- **Node.js** & **Express**
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing
- **Stripe** for payments
- **NodeMailer** for emails

### File Processing
- **pdf-lib** - PDF manipulation
- **sharp** - Image processing
- **pdf-parse** - PDF text extraction
- **pdf2pic** - PDF to image conversion

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pdf-converter-app.git
cd pdf-converter-app
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use any text editor
```

**Configure your `.env` file:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pdf-converter
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Optional: Add these for full functionality
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://localhost:5173
```

**Create required folders:**

```bash
mkdir uploads converted
```

**Start the backend:**

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### 3. Frontend Setup

Open a **new terminal**:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## 📁 Project Structure

```
pdf-converter-app/
│
├── server/                      # Backend API
│   ├── config/                 # Configuration files
│   ├── controllers/            # Route controllers
│   │   ├── authController.js
│   │   └── convertController.js
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   └── ConversionHistory.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── convert.js
│   │   ├── user.js
│   │   └── payment.js
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js
│   │   └── rateLimit.js
│   ├── utils/                  # Helper functions
│   │   ├── fileConverter.js
│   │   └── email.js
│   ├── uploads/                # Uploaded files (temp)
│   ├── converted/              # Converted files (temp)
│   ├── server.js               # Entry point
│   ├── package.json
│   └── .env
│
└── client/                      # Frontend React app
    ├── public/
    ├── src/
    │   ├── components/          # React components
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── FileUploader.jsx
    │   │   ├── ConvertOptions.jsx
    │   │   ├── ConversionHistory.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/               # Page components
    │   │   ├── Home.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── utils/               # Utility functions
    │   │   └── api.js
    │   ├── App.jsx              # Main app
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🔧 Configuration

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt install mongodb

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Ubuntu
```

**Option 2: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdf-converter
   ```

### Stripe Setup (Optional - for premium features)

1. Create [Stripe account](https://stripe.com)
2. Get test API keys from Dashboard
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Set up webhook:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/payment/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy webhook secret to `.env`

### Email Setup (Optional - for password reset)

**Using Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Add to `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

## 🎨 UI Customization

The app uses a custom theme based on:
- **Black** (#000) - Background
- **White** (#fff) - Text
- **Neon Green** (#00ff66) - Accents

### Modify Colors

Edit `client/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      neon: {
        green: '#00ff66',  // Change this
        dark: '#00e676',   // And this
      },
    },
  },
}
```

### Custom Animations

Add new animations in `client/src/index.css`:

```css
@keyframes your-animation {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}
```

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test File Conversion

1. Open http://localhost:5173
2. Upload a test PDF file
3. Select JPG as target format
4. Click "Convert Now"
5. Download the converted file

## 📦 Building for Production

### Frontend Build

```bash
cd client
npm run build
```

This creates an optimized production build in `client/dist/`.

### Backend Production

```bash
cd server
NODE_ENV=production npm start
```

## 🚢 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Go to [Render](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**: Add all from `.env`

### Deploy Frontend to Vercel

```bash
cd client
npm install -g vercel
vercel
```

Or use [Vercel Dashboard](https://vercel.com):
1. Import GitHub repository
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

### Deploy Frontend to Netlify

```bash
cd client
npm run build
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📱 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user
POST   /api/auth/forgot-password   Request password reset
POST   /api/auth/reset-password    Reset password
```

### Conversion Endpoints

```
POST   /api/convert                Convert file
GET    /api/convert/download/:id   Download converted file
GET    /api/convert/history        Get conversion history
GET    /api/convert/stats          Get user statistics
```

### User Endpoints

```
GET    /api/user/profile           Get user profile
PUT    /api/user/profile           Update profile
GET    /api/user/usage             Get usage statistics
```

### Payment Endpoints

```
POST   /api/payment/create-checkout-session    Create Stripe session
POST   /api/payment/webhook                     Stripe webhook
POST   /api/payment/cancel-subscription        Cancel subscription
```

## 🔐 Security Features

- ✅ **JWT authentication** with secure token generation
- ✅ **Password hashing** with bcrypt (10 rounds)
- ✅ **Rate limiting** on all routes
- ✅ **CORS protection** configured
- ✅ **Helmet.js** for HTTP headers security
- ✅ **Input validation** on all endpoints
- ✅ **File size limits** (10MB default)
- ✅ **Auto file deletion** after 24 hours
- ✅ **SQL injection** prevention with Mongoose
- ✅ **XSS protection** with sanitized inputs

## ⚡ Performance Optimization

- **Compression** middleware for response gzipping
- **MongoDB indexing** for faster queries
- **File streaming** for large file handling
- **React lazy loading** for code splitting
- **Cloudinary CDN** for file storage (optional)
- **Debounced uploads** to prevent spam

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongo --version
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod  # Linux
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000
kill -9 <PID>

# Or change port in .env
PORT=5001
```

**CORS Errors**
- Update `CLIENT_URL` in backend `.env`
- Check proxy settings in `vite.config.js`

**File Upload Fails**
```bash
# Ensure folders exist with correct permissions
cd server
mkdir -p uploads converted
chmod 755 uploads converted
```

**Conversion Fails**
- Check file size limit (10MB default)
- Verify supported format
- Check server logs for detailed error

## 🔄 Adding New File Formats

To add support for new formats, edit:

1. **Backend**: `server/utils/fileConverter.js`
```javascript
const SUPPORTED_CONVERSIONS = {
  pdf: ['jpg', 'png', 'txt', 'doc', 'excel'],  // Add 'excel'
  // Add new format
  excel: ['pdf', 'csv'],
};
```

2. **Frontend**: `client/src/components/ConvertOptions.jsx`
```javascript
const formatOptions = {
  // Add new options
  excel: [
    { value: 'pdf', label: 'PDF', icon: <FileIcon /> },
    { value: 'csv', label: 'CSV', icon: <FileText /> },
  ],
};
```

## 📊 Monitoring & Logs

### View Backend Logs

```bash
cd server
npm run dev  # Development logs

# Or in production
tail -f logs/app.log
```

### Database Monitoring

```bash
# Connect to MongoDB
mongo

# Show databases
show dbs

# Use your database
use pdf-converter

# Show collections
show collections

# Query users
db.users.find()

# Query conversions
db.conversionhistories.find().sort({createdAt: -1}).limit(10)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React Team for an amazing framework
- Tailwind CSS for the utility-first CSS framework
- Stripe for payment processing
- MongoDB for the database
- All open-source contributors

## 📞 Support

- 📧 Email: support@pdfconverter.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/pdf-converter-app/issues)
- 📖 Docs: [Documentation](https://docs.pdfconverter.com)

## 🎯 Roadmap

- [ ] Add OCR support for scanned PDFs
- [ ] Batch file conversion
- [ ] Admin dashboard
- [ ] Mobile app (React Native)
- [ ] API for developers
- [ ] Cloud storage integration
- [ ] Advanced PDF editing
- [ ] Collaboration features
- [ ] White-label solution

---

**Built with ❤️ using the MERN Stack**

⭐ Star this repo if you find it helpful!