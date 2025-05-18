#!/bin/bash

# Exit on error
set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
print_section() {
    echo -e "\n${BLUE}==== $1 ====${NC}"
}

# Print success message
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print info message
print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Print error message
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Update system
print_section "Updating system packages"
print_info "Updating package lists..."
sudo apt update
print_info "Upgrading installed packages..."
sudo apt upgrade -y
print_success "System packages updated!"

# Install common dependencies
print_section "Installing common dependencies"
print_info "Installing required packages..."
sudo apt install -y curl wget git build-essential software-properties-common unzip

# Install Node.js and npm
print_section "Installing Node.js and npm"
print_info "Adding Node.js repository..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
print_info "Installing Node.js 18.x..."
sudo apt install -y nodejs
print_success "Node.js $(node -v) installed!"
print_success "npm $(npm -v) installed!"

# Install PostgreSQL
print_section "Installing PostgreSQL"
print_info "Adding PostgreSQL repository..."
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
print_info "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
print_success "PostgreSQL installed!"

# Start PostgreSQL service
print_info "Starting PostgreSQL service..."
sudo systemctl enable postgresql
sudo systemctl start postgresql
print_success "PostgreSQL service started!"

# Create database and user
print_section "Setting up PostgreSQL database"
print_info "Creating database and user..."
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE parking_system;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE parking_system TO postgres;"
print_success "Database setup completed!"

# Clone project repository (if needed)
# print_section "Cloning project repository"
# print_info "Cloning from GitHub..."
# git clone <repository_url> parking-system
# cd parking-system
# print_success "Repository cloned!"

# Install backend dependencies
print_section "Setting up backend"
print_info "Installing backend dependencies..."
cd backend
npm install
print_success "Backend dependencies installed!"

# Create .env file for backend
print_info "Creating .env file for backend..."
cat > .env << EOL
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_system
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=parking_system_secret_key
JWT_EXPIRES_IN=1d
EOL
print_success "Backend .env file created!"

# Install frontend dependencies
print_section "Setting up frontend"
print_info "Installing frontend dependencies..."
cd ../vehicle-parking-frontend
npm install
print_success "Frontend dependencies installed!"

# Create .env file for frontend (if needed)
print_info "Creating .env file for frontend..."
cat > .env << EOL
VITE_API_URL=http://localhost:5000/api
EOL
print_success "Frontend .env file created!"

# Return to project root
cd ..

# Make the start script executable
print_section "Finalizing setup"
print_info "Making start script executable..."
chmod +x start.sh
print_success "Start script is now executable!"

print_section "Setup completed successfully!"
echo -e "${GREEN}The Vehicle Parking Management System has been set up successfully!${NC}"
echo -e "${YELLOW}You can start the application by running:${NC}"
echo -e "${BLUE}./start.sh${NC}"
echo -e "${YELLOW}Backend will run on:${NC} http://localhost:5000"
echo -e "${YELLOW}Frontend will run on:${NC} http://localhost:3000" 