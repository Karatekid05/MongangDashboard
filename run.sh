#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Mongang Dashboard Runner ===${NC}"
echo ""

# Check if mode is provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Usage:${NC} ./run.sh [mode]"
  echo ""
  echo "Available modes:"
  echo "  api      - Run only the API server (no Discord bot)"
  echo "  bot      - Run both API server and Discord bot"
  echo "  frontend - Run only the frontend/dashboard"
  echo "  all      - Run everything (API, bot, and frontend)"
  echo ""
  echo "Example: ./run.sh api"
  exit 1
fi

MODE=$1

case $MODE in
  "api")
    echo -e "${GREEN}Starting API server only (no Discord bot)...${NC}"
    cd server && npm run dev:api
    ;;
    
  "bot")
    echo -e "${GREEN}Starting API server with Discord bot...${NC}"
    echo -e "${YELLOW}Make sure your DISCORD_BOT_TOKEN and GUILD_ID are set in server/.env${NC}"
    cd server && npm run dev:bot
    ;;
    
  "frontend")
    echo -e "${GREEN}Starting frontend dashboard...${NC}"
    cd client && npm start
    ;;
    
  "all")
    echo -e "${GREEN}Starting all services (API, bot, and frontend)...${NC}"
    echo -e "${YELLOW}Make sure your DISCORD_BOT_TOKEN and GUILD_ID are set in server/.env${NC}"
    
    # Check if tmux is installed
    if ! command -v tmux &> /dev/null; then
      echo -e "${RED}Error: tmux is not installed.${NC}"
      echo "To run all services at once, please install tmux:"
      echo "  Ubuntu/Debian: sudo apt-get install tmux"
      echo "  macOS: brew install tmux"
      echo ""
      echo "Alternatively, run each service in separate terminals:"
      echo "  Terminal 1: ./run.sh bot"
      echo "  Terminal 2: ./run.sh frontend"
      exit 1
    fi
    
    # Create a new tmux session
    tmux new-session -d -s mongang
    
    # Split the window horizontally for API/bot and frontend
    tmux split-window -h -t mongang
    
    # Send commands to each pane
    tmux send-keys -t mongang:0.0 "cd $(pwd)/server && npm run dev:bot" C-m
    tmux send-keys -t mongang:0.1 "cd $(pwd)/client && npm start" C-m
    
    # Attach to the session
    tmux attach-session -t mongang
    ;;
    
  *)
    echo -e "${RED}Invalid mode: $MODE${NC}"
    echo "Run ./run.sh without arguments to see available modes."
    exit 1
    ;;
esac 