#!/bin/bash

echo "🚀 Nova Agent - Quick Setup Script"
echo "=================================="

# Check if we have all required tools
echo "📋 Checking requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Nova Agent is ready for deployment!"
echo ""
echo "📝 Next Steps:"
echo "1. Push to GitHub: git push origin master"
echo "2. Deploy to Render: https://dashboard.render.com/"
echo "3. Set environment variables in Render dashboard"
echo "4. Test your deployed app!"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
echo "🌐 Your app will be available at: https://your-app-name.onrender.com"
echo ""
echo "🔑 Required Environment Variables for Render:"
echo "- GROQ_API_KEY=your_groqcloud_api_key"
echo "- GROQ_MODEL=llama-3.3-70b-versatile"
echo "- NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"