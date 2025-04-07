# Mongang Dashboard

A dashboard application for the Discord bot Mongang Points System - track gang points, user contributions, and leaderboards.

## Features

- **Gang Management**: View all gangs, their members, points, and activity
- **User Tracking**: Monitor user contributions, points, and gang membership
- **Leaderboards**: Track top gangs and users, with weekly reset functionality
- **Activity Feed**: Real-time activity tracking for all point-related events
- **Points History**: Historical data visualization with weekly breakdowns
- **Google Sheets Integration**: Automatic weekly exports of leaderboards
- **Role-Based Access**: Admin and user-specific views and permissions
- **Mobile Responsive**: Full functionality on mobile devices

## Project Structure

The project is split into three main components:

### 1. Client (`/client`)
React-based frontend using:
- Next.js 13+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- NextAuth.js for authentication
- SWR for data fetching
- Chart.js for data visualization

Key directories:
```
client/
├── app/                 # Next.js 13 app directory
│   ├── (auth)/         # Authentication routes
│   ├── dashboard/      # Dashboard pages
│   ├── gangs/         # Gang management
│   └── users/         # User management
├── components/         # Reusable components
├── lib/               # Utility functions
├── styles/           # Global styles
└── types/            # TypeScript definitions
```

### 2. Server (`/server`)
Express.js backend with:
- MongoDB with Mongoose
- JWT authentication
- Rate limiting
- Caching layer
- API documentation

Key directories:
```
server/
├── controllers/       # Route controllers
├── middleware/       # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
└── utils/           # Helper functions
```

### 3. Shared
Common configuration and utilities:
```
├── .env              # Environment variables
├── package.json      # Project dependencies
└── run.sh           # Deployment scripts
```

## Setup & Development

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Discord Bot Token
- Google Sheets API credentials

### Local Development

1. Clone and install dependencies:
```bash
git clone https://github.com/Karatekid05/MongangDashboard.git
cd MongangDashboard

# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
```

2. Configure environment variables:
```bash
# Root .env
MONGODB_URI=mongodb://localhost:27017/mongangpointsys
NODE_ENV=development

# Client .env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Server .env
PORT=3002
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
GOOGLE_SHEETS_ID=your_sheet_id
```

3. Start development servers:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub

2. Connect your GitHub repository to Vercel:
   - Create a new project
   - Select the repository
   - Configure build settings:
     ```
     Build Command: cd client && npm run build
     Output Directory: client/.next
     Install Command: cd client && npm install
     ```

3. Configure environment variables in Vercel:
   - Add all client-side environment variables
   - Set `NEXT_PUBLIC_API_URL` to your production API URL

4. Deploy:
   ```bash
   vercel --prod
   ```

### Backend (VPS/DigitalOcean)

1. Set up server:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
   echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
   sudo apt update
   sudo apt install -y mongodb-org
   ```

2. Clone and setup project:
   ```bash
   git clone https://github.com/Karatekid05/MongangDashboard.git
   cd MongangDashboard/server
   npm install
   ```

3. Configure environment variables:
   ```bash
   nano .env
   # Add all necessary environment variables
   ```

4. Start with PM2:
   ```bash
   pm2 start npm --name "mongang-api" -- run start
   pm2 startup
   pm2 save
   ```

5. Setup Nginx (optional):
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/mongang
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/mongang /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## API Documentation

### Authentication
- `POST /api/auth/login` - Discord OAuth2 login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Gangs
- `GET /api/gangs` - List all gangs
- `GET /api/gangs/:id` - Get gang details
- `GET /api/gangs/:id/members` - List gang members
- `GET /api/gangs/:id/activity` - Get gang activity
- `GET /api/gangs/:id/points-history` - Get points history

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `GET /api/users/:id/activity` - Get user activity
- `GET /api/users/:id/points-history` - Get points history

### Leaderboards
- `GET /api/leaderboards/gangs` - Gang leaderboard
- `GET /api/leaderboards/users` - User leaderboard
- `GET /api/leaderboards/weekly` - Weekly rankings
- `GET /api/leaderboards/history` - Historical data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers directly.
