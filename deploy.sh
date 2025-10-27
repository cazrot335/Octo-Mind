#!/bin/bash

# OctoMind Quick Deployment Script
# This script helps you deploy OctoMind to Vercel (Frontend) and Render (Backend)

echo "🐙 OctoMind Deployment Helper"
echo "=============================="
echo ""

# Check if required tools are installed
check_tools() {
    echo "📋 Checking required tools..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo "❌ git is not installed. Please install git first."
        exit 1
    fi
    
    echo "✅ All required tools are installed"
    echo ""
}

# Function to install Vercel CLI
install_vercel() {
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    else
        echo "✅ Vercel CLI already installed"
    fi
}

# Main menu
show_menu() {
    echo "What would you like to do?"
    echo ""
    echo "1) Deploy Backend to Render (Manual - Opens Browser)"
    echo "2) Deploy Frontend to Vercel (Automated)"
    echo "3) Deploy Both (Backend Manual + Frontend Automated)"
    echo "4) Setup Docker Deployment"
    echo "5) View Deployment Guide"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1) deploy_backend ;;
        2) deploy_frontend ;;
        3) deploy_both ;;
        4) setup_docker ;;
        5) view_guide ;;
        6) exit 0 ;;
        *) echo "Invalid choice"; show_menu ;;
    esac
}

# Deploy backend
deploy_backend() {
    echo ""
    echo "🚀 Deploying Backend to Render"
    echo "=============================="
    echo ""
    echo "📝 Steps to follow:"
    echo ""
    echo "1. Go to https://render.com and sign up/login"
    echo "2. Click 'New +' → 'Web Service'"
    echo "3. Connect your GitHub repository: cazrot335/Octo-Mind"
    echo "4. Configure:"
    echo "   - Name: octomind-backend"
    echo "   - Region: Choose closest to you"
    echo "   - Branch: main"
    echo "   - Root Directory: backend"
    echo "   - Runtime: Node"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "   - Plan: Free"
    echo ""
    echo "5. Add Environment Variables:"
    echo "   - NODE_ENV = production"
    echo "   - PORT = 3001"
    echo "   - GROQ_API_KEY = (your Groq API key from https://console.groq.com)"
    echo "   - FIREBASE_PROJECT_ID = (from Firebase Console)"
    echo "   - FIREBASE_CLIENT_EMAIL = (from Firebase Console)"
    echo "   - FIREBASE_PRIVATE_KEY = (from Firebase Console - paste entire key)"
    echo ""
    echo "6. Click 'Create Web Service'"
    echo ""
    echo "7. Wait for deployment to complete"
    echo ""
    echo "8. Copy your backend URL (e.g., https://octomind-backend.onrender.com)"
    echo ""
    
    read -p "Press Enter to open Render.com in your browser..."
    
    # Try to open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "https://render.com"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "https://render.com"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        start "https://render.com"
    fi
    
    echo ""
    read -p "Have you deployed the backend and copied the URL? (y/n): " backend_done
    
    if [[ "$backend_done" == "y" ]]; then
        read -p "Enter your backend URL (e.g., https://octomind-backend.onrender.com): " backend_url
        
        # Update frontend environment
        echo "REACT_APP_API_URL=$backend_url" > frontend/.env.production
        
        echo "✅ Backend URL saved to frontend/.env.production"
        echo ""
        
        show_menu
    else
        echo "⚠️  Please complete backend deployment before continuing"
        show_menu
    fi
}

# Deploy frontend
deploy_frontend() {
    echo ""
    echo "🚀 Deploying Frontend to Vercel"
    echo "=============================="
    echo ""
    
    # Check if backend URL is set
    if [ ! -f "frontend/.env.production" ]; then
        echo "⚠️  Backend URL not configured!"
        read -p "Enter your backend URL (e.g., https://octomind-backend.onrender.com): " backend_url
        echo "REACT_APP_API_URL=$backend_url" > frontend/.env.production
    fi
    
    install_vercel
    
    echo ""
    echo "📦 Deploying frontend..."
    cd frontend
    
    # Login to Vercel
    echo "🔐 Logging in to Vercel..."
    vercel login
    
    # Deploy
    echo "🚀 Deploying..."
    vercel --prod
    
    echo ""
    echo "✅ Frontend deployed successfully!"
    echo ""
    
    cd ..
    show_menu
}

# Deploy both
deploy_both() {
    echo ""
    echo "🚀 Deploying Full OctoMind Application"
    echo "======================================="
    echo ""
    echo "This will guide you through deploying both backend and frontend"
    echo ""
    
    deploy_backend
    deploy_frontend
}

# Setup Docker
setup_docker() {
    echo ""
    echo "🐳 Docker Deployment Setup"
    echo "=========================="
    echo ""
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed"
        echo "Please install Docker from: https://www.docker.com/get-started"
        echo ""
        show_menu
        return
    fi
    
    echo "✅ Docker is installed"
    echo ""
    echo "📝 Docker deployment options:"
    echo ""
    echo "1. Build and run locally:"
    echo "   docker-compose up -d"
    echo ""
    echo "2. Deploy to cloud:"
    echo "   - AWS ECS/Fargate"
    echo "   - Google Cloud Run"
    echo "   - DigitalOcean App Platform"
    echo "   - Azure Container Instances"
    echo ""
    
    read -p "Would you like to build Docker images now? (y/n): " build_docker
    
    if [[ "$build_docker" == "y" ]]; then
        echo ""
        echo "🔨 Building Docker images..."
        docker-compose build
        
        echo ""
        echo "✅ Docker images built successfully!"
        echo ""
        echo "To run locally:"
        echo "  docker-compose up -d"
        echo ""
        echo "To stop:"
        echo "  docker-compose down"
        echo ""
    fi
    
    show_menu
}

# View guide
view_guide() {
    echo ""
    echo "📖 Opening Deployment Guide..."
    echo ""
    
    if [ -f "DEPLOYMENT_GUIDE.md" ]; then
        # Try to open in default editor
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "DEPLOYMENT_GUIDE.md"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "DEPLOYMENT_GUIDE.md"
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            start "DEPLOYMENT_GUIDE.md"
        else
            cat "DEPLOYMENT_GUIDE.md"
        fi
    else
        echo "❌ DEPLOYMENT_GUIDE.md not found"
    fi
    
    echo ""
    show_menu
}

# Run the script
check_tools
show_menu
