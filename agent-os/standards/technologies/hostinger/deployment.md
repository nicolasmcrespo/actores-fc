# Hostinger Deployment Standards

## Overview
Standards for deploying web applications to Hostinger hosting platform, focusing on Node.js/React applications with database integration.

## Hostinger Configuration

### Hosting Plan Requirements
```yaml
# Recommended plans for different project types
basic_web_app:
  plan: "Premium Web Hosting"
  resources:
    storage: "100GB SSD"
    bandwidth: "Unlimited"
    email_accounts: "100"
    databases: "Unlimited MySQL"

advanced_web_app:
  plan: "Business Web Hosting"
  resources:
    storage: "200GB SSD"
    bandwidth: "Unlimited"
    email_accounts: "500"
    databases: "Unlimited MySQL"
    ssl: "Free Let's Encrypt"

enterprise:
  plan: "VPS or Cloud Hosting"
  resources:
    cpu: "4+ cores"
    ram: "8GB+"
    storage: "160GB+ SSD"
    databases: "MySQL 8.0+"
```

### Domain and DNS Setup
```javascript
// DNS Configuration for Hostinger
const dnsConfig = {
  a_records: [
    {
      name: "@",
      value: "your_hostinger_ip",
      ttl: 3600
    },
    {
      name: "www",
      value: "your_hostinger_ip",
      ttl: 3600
    }
  ],
  cname_records: [
    {
      name: "api",
      value: "your-domain.com",
      ttl: 3600
    }
  ],
  mx_records: [
    {
      name: "@",
      value: "mx1.hostinger.com",
      priority: 10
    }
  ]
}
```

## Alternative Perspective
**Counter-point**: Hostinger's shared hosting limitations can be problematic for Node.js applications. Consider that Vercel or Netlify offer better developer experience and automatic scaling for modern web apps, even if Hostinger is more cost-effective.

## Node.js Application Deployment

### File Structure for Hostinger
```
public_html/
├── api/                    # Backend API endpoints
│   ├── index.js           # Main server file
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   └── middleware/        # Express middleware
├── build/                 # React build output
│   ├── static/
│   ├── index.html
│   └── manifest.json
├── .htaccess              # URL rewriting rules
├── package.json           # Dependencies
└── node_modules/          # Installed packages
```

### Express Server Configuration
```javascript
// api/index.js - Main server file for Hostinger
const express = require('express')
const path = require('path')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Database configuration for Hostinger MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: false // Hostinger typically doesn't require SSL for local connections
}

// Static files serving
app.use(express.static(path.join(__dirname, '../build')))

// API routes
app.use('/api', require('./routes/api'))

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### Database Integration
```javascript
// Database connection utility for Hostinger MySQL
class DatabaseManager {
  constructor() {
    this.pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000
    })
  }

  async query(sql, params = []) {
    try {
      const [results] = await this.pool.execute(sql, params)
      return results
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  }

  async transaction(queries) {
    const connection = await this.pool.getConnection()
    try {
      await connection.beginTransaction()

      const results = []
      for (const { sql, params } of queries) {
        const [result] = await connection.execute(sql, params)
        results.push(result)
      }

      await connection.commit()
      return results
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
}

module.exports = new DatabaseManager()
```

## File Upload and Storage

### Image Upload Configuration
```javascript
// File upload handling for Hostinger
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads')

    // Ensure upload directory exists
    try {
      await fs.access(uploadPath)
    } catch {
      await fs.mkdir(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
})

module.exports = upload
```

## SSL and Security Configuration

### .htaccess Configuration
```apache
# .htaccess file for Hostinger deployment
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Routes
RewriteRule ^api/(.*)$ /api/index.js [L]

# React Router Support
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /build/index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresDefault "access plus 2 days"
</IfModule>
```

### Environment Variables Setup
```bash
# Environment variables for Hostinger (.env)
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=your_hostinger_db_user
DB_PASSWORD=your_secure_password
DB_NAME=your_database_name

# Application URLs
FRONTEND_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# Email Configuration (if using Hostinger email)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_email_password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/public_html/uploads
```

## Deployment Process

### Automated Deployment Script
```bash
#!/bin/bash
# deploy-hostinger.sh - Deployment script

echo "🚀 Starting Hostinger deployment..."

# Build React application
echo "📦 Building React application..."
npm run build

# Upload files via FTP/SFTP
echo "📤 Uploading files to Hostinger..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env.local' \
  ./build/ user@your-server:/public_html/build/

rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  ./api/ user@your-server:/public_html/api/

# Upload package.json and install dependencies
rsync -avz package.json user@your-server:/public_html/
ssh user@your-server "cd /public_html && npm install --production"

# Upload configuration files
rsync -avz .htaccess user@your-server:/public_html/

echo "✅ Deployment completed successfully!"
```

### Manual Deployment Steps
```markdown
## Manual Deployment Checklist

### Pre-deployment
- [ ] Run `npm run build` locally
- [ ] Test build in local environment
- [ ] Verify environment variables are set
- [ ] Check database connection locally

### File Upload
- [ ] Upload `build/` folder to `/public_html/build/`
- [ ] Upload `api/` folder to `/public_html/api/`
- [ ] Upload `package.json` to `/public_html/`
- [ ] Upload `.htaccess` to `/public_html/`
- [ ] Upload `.env` file (secure transfer)

### Server Setup
- [ ] SSH into Hostinger server
- [ ] Run `npm install --production`
- [ ] Create database and import schema
- [ ] Set correct file permissions (755 for directories, 644 for files)
- [ ] Test API endpoints
- [ ] Verify React app loads correctly

### Post-deployment Testing
- [ ] Test all main user flows
- [ ] Verify database connections
- [ ] Check SSL certificate
- [ ] Test email functionality (if applicable)
- [ ] Monitor server logs for errors
```

## Performance Optimization

### Hostinger-Specific Optimizations
```javascript
// Performance configurations for Hostinger
const performanceConfig = {
  // Enable compression
  compression: true,

  // Cache static assets
  staticCache: {
    maxAge: '1y',
    immutable: true
  },

  // Database connection pooling
  database: {
    connectionLimit: 5, // Lower for shared hosting
    acquireTimeout: 30000,
    timeout: 30000
  },

  // Memory management
  memory: {
    maxMemoryUsage: '256MB', // Conservative for shared hosting
    gcInterval: 30000
  }
}
```

## Monitoring and Logging

### Simple Logging Setup
```javascript
// Simple logging for Hostinger environment
const fs = require('fs').promises
const path = require('path')

class Logger {
  constructor() {
    this.logPath = path.join(__dirname, '../logs')
    this.ensureLogDir()
  }

  async ensureLogDir() {
    try {
      await fs.access(this.logPath)
    } catch {
      await fs.mkdir(this.logPath, { recursive: true })
    }
  }

  async log(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      meta
    }

    const logFile = path.join(this.logPath, `${level}-${new Date().toISOString().split('T')[0]}.log`)
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n')
  }

  info(message, meta) { return this.log('info', message, meta) }
  warn(message, meta) { return this.log('warn', message, meta) }
  error(message, meta) { return this.log('error', message, meta) }
}

module.exports = new Logger()
```

## Alternative Perspective
**Counter-point**: This comprehensive Hostinger setup might be over-engineered for many use cases. Sometimes a simple static site deployment with a separate backend service (like Supabase or Firebase) is more maintainable and cost-effective than managing a full-stack deployment on shared hosting.

This Hostinger deployment standard provides a complete foundation for deploying modern web applications while working within the constraints and capabilities of shared hosting environments.