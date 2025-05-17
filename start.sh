#!/bin/bash

# Set terminal colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Simple Parking Management System${NC}"
echo -e "${BLUE}=====================================${NC}"

# Start backend server
echo -e "${YELLOW}Starting backend server...${NC}"
cd backend
npm install && npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started!${NC}"

# Start frontend server
echo -e "${YELLOW}Starting frontend server...${NC}"
cd ../vehicle-parking-frontend
npm install && npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started!${NC}"

# Return to the project root
cd ..

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Both servers are now running!${NC}"
echo -e "${YELLOW}Backend API: http://localhost:5000${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Trap Ctrl+C to kill both processes
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; echo 'Servers stopped'; exit 0" INT

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID 