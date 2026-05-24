# Readlexia - Dyslexia-Friendly Reading & Learning Platform

> A production-ready full-stack web application designed to make reading easier and support literacy development for people with dyslexia through evidence-based accessibility features and interactive learning exercises.

## Overview

Readlexia is a comprehensive digital learning ecosystem that combines document management, specialized literacy exercises, and cognitive accessibility tools to support individuals with dyslexia. The platform addresses the specific visual processing, phonological, and working memory challenges that dyslexic readers face by providing:

- **Accessibility-first design** with evidence-based reading support tools
- **Structured literacy exercises** targeting phonemic awareness and sound-blending skills
- **Intelligent progress tracking** with real-time analytics
- **Administrative oversight** with comprehensive system monitoring and user management
- **Enterprise-grade security** with JWT authentication, XSS protection, and comprehensive error handling

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Readlexia
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

3. **Configure Database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE readlexia;
```

4. **Configure Environment Variables**

Backend `.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=readlexia
DB_LOGGING=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_change_in_production_12345678
JWT_EXPIRATION=24h

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# Optional: Email Configuration (for password reset, notifications)
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USER=your-email@gmail.com
# MAIL_PASSWORD=your-app-password

# Optional: File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Readlexia
VITE_VERSION=1.0.0
```

5. **Start the application**

**Option 1: Use batch file (Windows)**
```bash
start-app.bat
```

**Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Open your browser**
```
http://localhost:5173
```

---

## ✨ Features

### Core Accessibility Features
- **Reading Ruler** - Customizable visual guide for line-by-line reading support
- **Syllable Splitter** - Break words into syllables and phonemes for improved word recognition
- **Dyslexia-Friendly Fonts** - Optimized typography for reduced visual processing load
- **Color Customization** - Custom background, text, and overlay colors for visual comfort

### Literacy Exercises
- **Phoneme Segmentation** - Identify individual sounds within words with visual/audio cues
- **Sound Blending** - Combine phonemes to form complete words, developing phonological awareness
- **Letter Discrimination** - Distinguish between similar letters and letter combinations
- **Multi-sensory Learning** - Exercises incorporate visual, auditory, and kinesthetic elements
- **Progress Tracking** - Detailed performance analytics and skill development monitoring
- **Adaptive Difficulty** - Exercises adjust based on user performance and learning level

#### Exercise Types Explained
- **PHONEME_SEGMENTATION**: Break words into individual phonemes; users select correct phoneme combinations from multiple options
- **SOUND_BLENDING**: Combine displayed phonemes into a complete word; users type the resulting word
- **LETTER_DISCRIMINATION**: Identify which letter fills a blank space in a word; visual and phonetic distractors provided
- **SYLLABLE_AWARENESS**: Identify syllable boundaries within multi-syllabic words
- **RHYME_MATCHING**: Identify rhyming word pairs to develop phonological awareness

### User Management & Personalization
- **Secure JWT Authentication** - Bcrypt hashing with token-based session management
- **User Profiles** - Customizable reading preferences and accessibility settings
- **Session Management** - Persistent sessions with automatic synchronization
- **Reading Preferences** - Save and apply individual accessibility configurations

### Document Management
- **Document Library** - Full CRUD operations with version control
- **Categorization** - Organize content by subject matter and difficulty level
- **Offline Support** - Auto-sync mechanism for seamless offline/online transitions
- **PDF Support** - Enhanced PDF viewing with accessibility overlays
- **Import/Export** - Flexible content management and sharing capabilities

### Learning Analytics
- **Admin Dashboard** - Real-time system metrics and user engagement analytics
- **User Activity Tracking** - Monitor active users, learning patterns, and progress trends
- **Document Metrics** - Track content creation, distribution, and usage patterns
- **Exercise Analytics** - Monitor completion rates, performance metrics, and learning outcomes
- **Category Distribution** - Analyze content organization and user preferences

### Support & Help System
- **Help Content Management** - Administrators can create and update help documentation
- **Support Tickets** - User support system with ticket tracking and resolution
- **Notifications** - Real-time updates on document shares, exercise completions, and system events
- **Multi-Channel Support** - Integrated help desk with user feedback collection

### Security
- **XSS Protection** - DOMPurify sanitization of all user input
- **SQL Injection Prevention** - TypeORM parameterized queries
- **Rate Limiting** - Protection against brute force and abuse attacks
- **Input Validation** - Comprehensive validation on both frontend and backend
- **CORS Configuration** - Strict cross-origin policies
- **Security Headers** - Helmet.js for HTTP security headers
- **Request Tracing** - Unique X-Request-ID for all requests enabling distributed tracing

### Logging & Error Handling
- **Request ID Tracking** - UUID-based request correlation across the application
- **Comprehensive Logging** - Detailed logs with context for debugging and monitoring
- **Enhanced Exception Handling** - Structured error responses with actionable information
- **Database Connection Resilience** - Retry logic and connection pooling for reliability
- **Error Analytics** - Centralized error capture and monitoring

---

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite 6
- Tailwind CSS v4
- Axios
- Radix UI Components

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **Database**: MySQL 8.0+ with TypeORM
- **Authentication**: JWT + Passport.js
- **Security**: Helmet.js, bcrypt, DOMPurify
- **Logging**: Winston
- **Testing**: Jest

### DevOps & Infrastructure
- **Process Management**: PM2 (production)
- **Containerization**: Docker ready
- **Database Connection Pooling**: TypeORM with configurable limits
- **Request Tracing**: UUID-based request ID middleware
- **Error Monitoring**: Structured error logging and reporting

---

## 📊 System Architecture

### Database Schema
The system uses normalized MySQL database with the following core entities:
- **Users** - Authenticated user accounts with preferences
- **Documents** - Learning materials with metadata and content
- **Exercises** - Structured literacy exercises with question sets
- **Notifications** - User activity and system notifications
- **HelpContent** - Administrator-managed help articles
- **SupportTickets** - User support request tracking
- **UserActivity** - Session and engagement tracking (implicit)

### Security Model
- **Authentication**: JWT tokens with 24-hour expiration (configurable)
- **Authorization**: Role-based access control (User, Admin roles)
- **Data Protection**: Bcrypt for password hashing (salt rounds: 10+)
- **Input Validation**: DTO-based validation on all endpoints
- **Output Sanitization**: XSS protection via DOMPurify
- **Request Validation**: Rate limiting and CORS

---

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user account
- `POST /auth/login` - User login (returns JWT token)
- `GET /auth/profile` - Get current authenticated user profile
- `POST /auth/reset-password` - Reset user password

### Documents  
- `GET /documents` - Retrieve all user documents
- `GET /documents/:id` - Get specific document by ID
- `POST /documents` - Create new document
- `PATCH /documents/:id` - Update document metadata or content
- `DELETE /documents/:id` - Delete document

### Exercises
- `GET /exercises` - List all available exercises
- `GET /exercises/:id` - Get specific exercise details
- `POST /exercises` - Create new exercise
- `POST /exercises/generate` - Generate exercise from document content
- `GET /exercises/:id/questions` - Get exercise questions

### Users
- `GET /users/:id` - Get user profile
- `PATCH /users/:id` - Update user settings and preferences
- `DELETE /users/:id` - Delete user account

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/:id` - Get specific notification
- `PATCH /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

### Help Content
- `GET /help-content` - Get all help articles
- `GET /help-content/:id` - Get specific help article
- `POST /help-content` - Create help article (Admin only)
- `PATCH /help-content/:id` - Update help article (Admin only)
- `DELETE /help-content/:id` - Delete help article (Admin only)

### Support Tickets
- `GET /support-tickets` - Get user support tickets
- `POST /support-tickets` - Create new support ticket
- `PATCH /support-tickets/:id` - Update ticket status
- `DELETE /support-tickets/:id` - Close/delete ticket

### Admin Analytics
- `GET /admin/analytics` - Get system-wide analytics dashboard
- `GET /admin/analytics/users` - User statistics and trends
- `GET /admin/analytics/documents` - Document usage analytics
- `GET /admin/analytics/exercises` - Exercise completion analytics
- `GET /admin/analytics/system-health` - Real-time system performance metrics

---

## 🏗️ Project Structure

```
Readlexia/
├── backend/                      # NestJS Backend (Port 3001)
│   ├── src/
│   │   ├── auth/                # Authentication & JWT
│   │   │   ├── guards/          # Authorization guards
│   │   │   ├── strategies/      # Passport strategies
│   │   │   └── dto/             # Data transfer objects
│   │   │
│   │   ├── documents/           # Document management
│   │   │   └── dto/             # Document DTOs
│   │   │
│   │   ├── exercises/           # Literacy exercises
│   │   │   └── dto/             # Exercise DTOs
│   │   │
│   │   ├── users/               # User management
│   │   │   └── dto/             # User DTOs
│   │   │
│   │   ├── admin/               # Admin features
│   │   │   ├── admin-analytics.service.ts
│   │   │   ├── admin-help-content.service.ts
│   │   │   └── admin-support-tickets.service.ts
│   │   │
│   │   ├── notifications/       # Real-time notifications
│   │   │
│   │   └── common/              # Shared utilities
│   │       ├── config/          # Configuration management
│   │       ├── filters/         # Exception filters
│   │       ├── interceptors/    # Request/response interceptors
│   │       └── middleware/      # Request middleware
│   │
│   ├── test/                    # E2E tests
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                    # React Frontend (Port 5173)
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx          # Main application component
│   │   │   ├── routes.tsx       # Route configuration
│   │   │   ├── components/      # Reusable components
│   │   │   ├── contexts/        # React context providers
│   │   │   └── pages/           # Page components
│   │   │
│   │   ├── services/            # API service layer
│   │   │   ├── api.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── documents.service.ts
│   │   │   ├── exercises.service.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── help-content.service.ts
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── apiErrorHandler.ts
│   │   │   ├── errorLogger.ts
│   │   │   ├── validators.ts
│   │   │   ├── tokenManager.ts
│   │   │   └── offlineManager.ts
│   │   │
│   │   └── styles/              # Tailwind & component styles
│   │
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── start-app.bat               # Windows startup script
├── README.md
└── Documentation/
    ├── ERROR_HANDLING_IMPROVEMENTS.md
    ├── SYSTEM_ANALYTICS_AUDIT_REPORT.md
    └── EXERCISE_FIXES_SUMMARY.md
```

### Key Files

- **Backend Main Entry**: `backend/src/main.ts` - Application bootstrap with security headers
- **Database Entities**: `backend/src/*/[entity].entity.ts` - TypeORM entities
- **Frontend Entry**: `frontend/src/main.tsx` - React application entry point
- **Environment Configuration**: `.env` files for backend and frontend configuration

## 📋 Recent Improvements & Bug Fixes

### Exercise System (May 2026)
- **Phoneme Extraction Algorithm** - Complete rewrite with 100% test coverage for common word patterns
  - Fixed segmentation for words like "THE", "HIM", "BLEND", "SCHOOL"
  - Support for common consonant clusters (th, sh, ch, ph, str, scr, etc.)
- **Sound Blending** - Removed answer exposure vulnerability; users now must genuinely blend sounds
- **Letter Discrimination** - Fixed duplicate question mark formatting issues
- **Question Generation** - Enhanced clarity with better instructions and improved wrong-answer generation

### Analytics System (May 2026)
- **Real Data Integration** - Replaced all hardcoded metrics with live database queries
- **Active User Tracking** - Real metrics for users active in last 7/30 days
- **Document Metrics** - Track new documents created over configurable time periods
- **Category Analysis** - Dynamic distribution of documents by category
- **Performance Metrics** - Actual exercise completion rates and user averages

### Error Handling & Logging (May 2026)
- **Request ID Middleware** - Unique UUID for every request enabling distributed tracing
- **Enhanced Exception Filter** - Structured error responses with request IDs and categorization
- **Service Logging** - Comprehensive logging across all services (Auth, Documents, Users, Exercises)
- **Database Resilience** - Connection retry logic with configurable pool sizing
- **Security Headers** - Helmet.js integration for HTTP security

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                # Unit tests
npm run test:e2e       # E2E tests

# Frontend tests
cd frontend  
npm run test
```

---

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to hosting
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT_SECRET (32+ characters, cryptographically random)
- [ ] Configure MySQL with SSL connection
- [ ] Set TypeORM `synchronize: false` in production
- [ ] Enable HTTPS/TLS on all endpoints
- [ ] Configure CORS whitelist (specific domains only)
- [ ] Set up error monitoring and alerting (e.g., Sentry)
- [ ] Configure automated database backups (daily minimum)
- [ ] Set appropriate database connection pool limits
- [ ] Enable rate limiting thresholds for production load
- [ ] Configure request timeout limits
- [ ] Set up centralized logging (e.g., ELK stack)
- [ ] Enable security headers (Helmet.js - already configured)
- [ ] Test offline mode and sync functionality thoroughly
- [ ] Configure admin user accounts and access controls
- [ ] Set up monitoring for active user sessions
- [ ] Test disaster recovery procedures
- [ ] Configure CDN for static assets if needed
- [ ] Validate accessibility compliance (WCAG 2.1 AA)
- [ ] Perform security audit and penetration testing

---

## 📝 License

No License

---

## 🙏 Credits

**Original Design:** [Figma Wireframe](https://www.figma.com/design/umM4l9mjm3qvE3wsUepuQs/Dyslexia-Support-Website-Wireframe_)

---

## ♿ Accessibility & Compliance

Readlexia is designed with accessibility-first principles and implements multiple standards:

### Web Accessibility Standards
- **WCAG 2.1 AA Compliance** - Meeting Web Content Accessibility Guidelines
- **Keyboard Navigation** - Full keyboard accessibility without requiring a mouse
- **Screen Reader Support** - Semantic HTML and ARIA labels for assistive technologies
- **Color Contrast** - Minimum 4.5:1 contrast ratio for text (WCAG AA standard)
- **Text Sizing** - Support for user-customized font sizes up to 200%

### Dyslexia-Specific Accommodations
- **Font Choices**: OpenDyslexic, Sans-serif, and Courier available
- **Spacing**: Increased letter-spacing and line-height adjustable
- **Color Overlays**: Proven color combinations (blue-on-cream, gray-on-white, etc.)
- **Pointer Precision**: Larger tap targets (minimum 44x44px) for touch interfaces
- **Reduced Motion**: Option to disable animations and transitions
- **Clear Language**: Simplified UI text and instructional language

### Standards & Certifications
- Mobile-responsive design (iOS and Android compatible)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Tested with JAWS, NVDA, and VoiceOver screen readers

---

## 🔐 Data Privacy & Security Policy

- **GDPR Compliant** - User data handling follows EU data protection regulations
- **Data Encryption**: All data in transit uses HTTPS/TLS
- **Password Security**: Bcrypt hashing with 10+ salt rounds
- **Session Security**: Secure, HTTP-only JWT tokens
- **Data Retention**: Configurable user data retention policies
- **User Rights**: Support for data export, deletion, and portability

---

**Ready to help people read better! 🚀**
