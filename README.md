# Mongang Dashboard

A modern web dashboard for the Mongang Points System Discord bot, providing real-time insights into gang activities, user contributions, and leaderboards.

## 🌟 Features

- **Real-time Gang Management**
  - View and track gang points, activities, and member contributions
  - Weekly and all-time leaderboards
  - Detailed gang statistics and performance metrics

- **User Analytics**
  - Individual user contribution tracking
  - Point history and breakdown by category
  - Activity timeline and engagement metrics
  - Gang membership and role information

- **Activity Monitoring**
  - Live activity feed with filtering and search
  - Point transaction history
  - Event logging and tracking
  - Custom date range analytics

- **Interactive Leaderboards**
  - Weekly and all-time rankings
  - Gang and individual leaderboards
  - Point category breakdowns
  - Historical performance tracking

- **Administrative Tools**
  - User management interface
  - Point adjustment capabilities
  - System configuration
  - Activity moderation

## 🚀 Quick Start

### Prerequisites

- Node.js v16.x or higher
- MongoDB v4.4 or higher
- Discord Bot Token (if running bot locally)
- Google Sheets API credentials (for leaderboard exports)

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Karatekid05/MongangDashboard.git
   cd MongangDashboard
   ```

2. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure Environment Variables**

   Create `.env` files in both server and client directories:

   Server `.env`:
   ```env
   PORT=3002
   MONGODB_URI=mongodb://localhost:27017/mongangpointsys
   NODE_ENV=development
   DISCORD_BOT_TOKEN=your_token_here
   GUILD_ID=your_guild_id_here
   GOOGLE_SHEETS_ID=your_sheets_id_here
   ```

   Client `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3002/api
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Start the API server
   cd server
   npm run dev

   # Terminal 2: Start the React development server
   cd client
   npm start
   ```

## 🌐 Deployment

### Dashboard Deployment (Vercel)

1. **Prepare for Deployment**
   - Ensure all environment variables are set in your Vercel dashboard
   - Update API endpoints in the client configuration
   - Build and test the production build locally

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel --prod
   ```

### Discord Bot Deployment (VPS)

1. **Server Setup**
   - Set up a VPS with Ubuntu/Debian
   - Install Node.js, MongoDB, and PM2
   - Configure firewall and security settings

2. **Application Deployment**
   ```bash
   # Install PM2
   npm install -g pm2

   # Clone and setup
   git clone https://github.com/Karatekid05/MongangDashboard.git
   cd MongangDashboard/server
   npm install

   # Configure environment
   cp .env.example .env
   nano .env  # Edit with your production values

   # Start with PM2
   pm2 start index.js --name "mongang-bot"
   pm2 save
   ```

## 📚 API Documentation

### Base URL
```
Production: https://api.mongang.com/api
Development: http://localhost:3002/api
```

### Endpoints

#### Gangs
- `GET /gangs` - List all gangs
- `GET /gangs/:id` - Get gang details
- `GET /gangs/:id/members` - List gang members
- `GET /gangs/:id/activity` - Get gang activity

#### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `GET /users/:id/activity` - Get user activity
- `GET /users/:id/points` - Get point breakdown

#### Leaderboards
- `GET /leaderboard/gangs` - Gang leaderboard
- `GET /leaderboard/users` - User leaderboard
- `GET /leaderboard/weekly` - Weekly rankings

#### Activity
- `GET /activity` - Recent activity feed
- `GET /activity/search` - Search activities
- `GET /activity/stats` - Activity statistics

## 🛠 Technologies

- **Frontend**: React, Material-UI, Chart.js
- **Backend**: Node.js, Express, MongoDB
- **Discord Integration**: Discord.js
- **External Services**: Google Sheets API
- **Deployment**: Vercel (Dashboard), VPS (Bot)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Karatekid05** - *Initial work and maintenance*

## 🙏 Acknowledgments

- Discord.js community
- MongoDB Atlas team
- All contributors and users of the Mongang Points System
