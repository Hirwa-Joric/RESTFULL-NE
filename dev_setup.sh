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

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Update system
print_section "Updating system packages"
print_info "Updating package lists..."
sudo apt update
print_info "Upgrading installed packages..."
sudo apt upgrade -y
print_success "System packages updated!"

# Install common development tools
print_section "Installing common development tools"
print_info "Installing essential packages..."
sudo apt install -y build-essential git curl wget unzip zip software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release vim htop tmux \
    net-tools openssh-server cmake pkg-config libssl-dev

# Install Git and configure it
print_section "Setting up Git"
if ! command_exists git; then
    print_info "Installing Git..."
    sudo apt install -y git
else
    print_info "Git already installed: $(git --version)"
fi

print_info "Would you like to configure Git globally? (y/n)"
read -r configure_git
if [[ "$configure_git" =~ ^[Yy]$ ]]; then
    print_info "Enter your Git username:"
    read -r git_username
    print_info "Enter your Git email:"
    read -r git_email
    git config --global user.name "$git_username"
    git config --global user.email "$git_email"
    git config --global init.defaultBranch main
    git config --global core.editor vim
    git config --global pull.rebase false
    print_success "Git configured globally!"
else
    print_info "Skipping Git configuration."
fi

# Install NVM (Node Version Manager)
print_section "Setting up Node.js with NVM"
if ! command_exists nvm; then
    print_info "Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    # Add NVM to current shell session
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
else
    print_info "NVM already installed."
fi

# Install Node.js LTS version
if command_exists nvm; then
    print_info "Installing Node.js LTS version..."
    nvm install --lts
    nvm use --lts
    nvm alias default 'lts/*'
    print_success "Node.js $(node -v) installed!"
    print_success "npm $(npm -v) installed!"

    # Install global npm packages
    print_info "Installing common global npm packages..."
    npm install -g npm@latest
    npm install -g yarn pnpm typescript ts-node nodemon pm2
    print_success "Global npm packages installed!"
else
    print_error "NVM installation failed or not available in this shell session."
    print_info "Installing Node.js via apt..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js $(node -v) installed!"
    print_success "npm $(npm -v) installed!"
fi

# Install Python and pip
print_section "Setting up Python"
if ! command_exists python3; then
    print_info "Installing Python 3..."
    sudo apt install -y python3 python3-pip python3-dev python3-venv
else
    print_info "Python already installed: $(python3 --version)"
fi

# Upgrade pip and install common packages
print_info "Upgrading pip and installing common Python packages..."
python3 -m pip install --upgrade pip
python3 -m pip install wheel setuptools black flake8 pytest mypy pylint
print_success "Python packages installed!"

# Install pyenv for Python version management
print_info "Installing pyenv for Python version management..."
if ! command_exists pyenv; then
    curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash
    
    # Add pyenv to PATH
    echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
    echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
    echo 'eval "$(pyenv init -)"' >> ~/.zshrc
    
    print_success "pyenv installed. You'll need to restart your shell or source ~/.zshrc"
else
    print_info "pyenv already installed."
fi

# Install Docker and Docker Compose
print_section "Setting up Docker"
if ! command_exists docker; then
    print_info "Installing Docker..."
    # Remove old versions if they exist
    sudo apt remove -y docker docker-engine docker.io containerd runc || true
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    
    # Add user to docker group to run docker without sudo
    sudo usermod -aG docker "$USER"
    print_info "You may need to log out and back in for docker group changes to take effect."
    print_success "Docker installed!"
else
    print_info "Docker already installed: $(docker --version)"
fi

# Install Docker Compose
if ! command_exists docker-compose; then
    print_info "Installing Docker Compose v2..."
    sudo apt install -y docker-compose-plugin
    
    # Create docker-compose symlink for backward compatibility
    if [ ! -f /usr/local/bin/docker-compose ]; then
        sudo ln -s /usr/bin/docker-compose /usr/local/bin/docker-compose
    fi
    
    print_success "Docker Compose installed!"
else
    print_info "Docker Compose already installed."
fi

# Install PostgreSQL
print_section "Setting up PostgreSQL"
if ! command_exists psql; then
    print_info "Installing PostgreSQL..."
    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    
    print_info "Starting PostgreSQL service..."
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    print_success "PostgreSQL installed and started!"
else
    print_info "PostgreSQL already installed: $(psql --version)"
fi

# Install MySQL
print_section "Setting up MySQL"
if ! command_exists mysql; then
    print_info "Installing MySQL..."
    sudo apt install -y mysql-server
    
    print_info "Securing MySQL installation..."
    print_info "You'll be prompted to set up MySQL security settings."
    sudo mysql_secure_installation
    
    print_info "Starting MySQL service..."
    sudo systemctl enable mysql
    sudo systemctl start mysql
    print_success "MySQL installed and secured!"
else
    print_info "MySQL already installed: $(mysql --version)"
fi

# Install MongoDB
print_section "Setting up MongoDB"
if ! command_exists mongod; then
    print_info "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt update
    sudo apt install -y mongodb-org
    
    print_info "Starting MongoDB service..."
    sudo systemctl enable mongod
    sudo systemctl start mongod
    print_success "MongoDB installed and started!"
else
    print_info "MongoDB already installed: $(mongod --version)"
fi

# Install VSCode
print_section "Setting up Visual Studio Code"
if ! command_exists code; then
    print_info "Installing Visual Studio Code..."
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
    sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
    sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
    rm -f packages.microsoft.gpg
    sudo apt update
    sudo apt install -y code
    print_success "Visual Studio Code installed!"
    
    # Install some useful VSCode extensions
    print_info "Installing useful VSCode extensions..."
    code --install-extension ms-python.python
    code --install-extension dbaeumer.vscode-eslint
    code --install-extension esbenp.prettier-vscode
    code --install-extension ms-azuretools.vscode-docker
    code --install-extension ms-vscode.vscode-typescript-next
    code --install-extension ritwickdey.LiveServer
    code --install-extension formulahendry.code-runner
    code --install-extension GitHub.copilot
    print_success "VSCode extensions installed!"
else
    print_info "Visual Studio Code already installed."
fi

# Install AWS CLI
print_section "Setting up AWS CLI"
if ! command_exists aws; then
    print_info "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    print_success "AWS CLI installed: $(aws --version)"
else
    print_info "AWS CLI already installed: $(aws --version)"
fi

# Install Terraform
print_section "Setting up Terraform"
if ! command_exists terraform; then
    print_info "Installing Terraform..."
    sudo apt update
    sudo apt install -y gnupg software-properties-common
    wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
    sudo apt update
    sudo apt install -y terraform
    print_success "Terraform installed: $(terraform --version)"
else
    print_info "Terraform already installed: $(terraform --version)"
fi

# Install Kubernetes tools
print_section "Setting up Kubernetes tools"
if ! command_exists kubectl; then
    print_info "Installing kubectl..."
    sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
    echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
    sudo apt update
    sudo apt install -y kubectl
    print_success "kubectl installed: $(kubectl version --client)"
else
    print_info "kubectl already installed."
fi

# Install Minikube for local Kubernetes development
if ! command_exists minikube; then
    print_info "Installing Minikube..."
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
    rm minikube-linux-amd64
    print_success "Minikube installed: $(minikube version)"
else
    print_info "Minikube already installed."
fi

# Setup ZSH and Oh-My-Zsh (if needed)
print_section "Setting up ZSH and Oh-My-Zsh"
if ! command_exists zsh; then
    print_info "Installing ZSH..."
    sudo apt install -y zsh
    print_success "ZSH installed: $(zsh --version)"
fi

if [ ! -d "$HOME/.oh-my-zsh" ]; then
    print_info "Installing Oh-My-Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
    
    # Install useful ZSH plugins
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
    
    # Update ~/.zshrc to use the plugins
    sed -i 's/plugins=(git)/plugins=(git zsh-autosuggestions zsh-syntax-highlighting docker docker-compose kubectl terraform)/' ~/.zshrc
    
    print_success "Oh-My-Zsh installed and configured!"
else
    print_info "Oh-My-Zsh already installed."
fi

# Install useful CLI tools
print_section "Installing useful CLI tools"
print_info "Installing tools like jq, htop, tldr, etc..."
sudo apt install -y jq htop neofetch bat tldr fzf ripgrep fd-find ncdu

# Create symbolic links for some tools that have different names
if command_exists batcat && ! command_exists bat; then
    sudo ln -s /usr/bin/batcat /usr/local/bin/bat
fi
if command_exists fdfind && ! command_exists fd; then
    sudo ln -s /usr/bin/fdfind /usr/local/bin/fd
fi

print_success "CLI tools installed!"

# Final steps and cleanup
print_section "Performing final cleanup"
print_info "Removing unnecessary packages..."
sudo apt autoremove -y
sudo apt clean

# Add helpful aliases to .zshrc
print_info "Adding useful aliases to .zshrc..."
cat << 'EOF' >> ~/.zshrc

# Development aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias py='python3'
alias pip='pip3'
alias npmls='npm list -g --depth=0'
alias dps='docker ps'
alias dc='docker-compose'
alias k='kubectl'
alias tf='terraform'
alias myip='curl -s https://ipinfo.io/ip'
alias update='sudo apt update && sudo apt upgrade -y'
EOF

print_section "Development environment setup completed!"
echo -e "${GREEN}Your development environment has been successfully set up!${NC}"
echo -e "${YELLOW}You may need to restart your shell or log out and log back in for some changes to take effect.${NC}"
echo -e "${BLUE}Happy coding!${NC}" 