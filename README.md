# 🚀 Nova Agent - Professional AI Chat Platform

A sophisticated AI chat platform with 5 specialized agents powered by GroqCloud's Llama 3.3 70B model.

## ✨ Features

### 🤖 5 Specialized AI Agents
- **Nova Assistant** 🤖 - General helpful AI assistant
- **Nova Researcher** 🔍 - Expert researcher with detailed analysis
- **Nova Developer** 💻 - Expert programmer and code solutions
- **Nova Navigator** 🧭 - Information organization and navigation
- **Nova Creator** 🎨 - Creative content and idea generation

### ⚡ Advanced Features
- **Real-time Streaming**: Instant AI responses with live typing
- **Professional UI**: ChatGPT/Manus-style interface
- **GroqCloud Powered**: Ultra-fast Llama 3.3 70B model
- **Edge Runtime**: Optimized performance with Next.js 15
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- GroqCloud API key

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd nova-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

### Environment Variables
```bash
# Required
GROQ_API_KEY=your_groqcloud_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Optional (for future features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌐 Deployment

### Render Deployment
1. Push to GitHub
2. Create new Web Service on Render
3. Set environment variables
4. Deploy with `npm run build` and `npm start`

[See complete deployment guide](./DEPLOYMENT_GUIDE.md)

## 📊 Performance

### Expected Metrics
- **Response Time**: 1-3 seconds
- **First Load**: < 2 seconds
- **Uptime**: 99.9%+
- **Concurrent Users**: 100+ (free tier)

### Optimization Features
- Edge runtime for API routes
- Streaming responses
- Optimized bundle size
- Efficient caching

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Framer Motion** - Animations

### Backend
- **Next.js API Routes** - Edge runtime
- **GroqCloud API** - AI model
- **Streaming** - Real-time responses

### Infrastructure
- **Render** - Hosting (recommended)
- **Vercel** - Alternative hosting
- **GitHub** - Source control

## 🧪 Testing

### Local Testing
```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "agent": "nova-assistant"
  }'
```

### Test Cases
- [ ] All 5 agents respond correctly
- [ ] Streaming works smoothly
- [ ] Mobile responsive design
- [ ] Error handling works
- [ ] Performance benchmarks

## 🔧 Configuration

### Agent Customization
Edit agent prompts in `src/app/api/chat/route.ts`:

```typescript
const agentPrompts = {
  'nova-assistant': 'Your custom prompt here...',
  'researcher': 'Your custom prompt here...',
  // ... other agents
}
```

### Model Selection
Change the default model in the API route:
```typescript
const model = 'llama-3.3-70b-versatile' // or other GroqCloud models
```

## 📈 Scaling

### Performance Scaling
1. **Vertical**: Upgrade to Standard/Pro instances
2. **Horizontal**: Multiple instances with load balancer
3. **CDN**: Add Cloudflare for static assets
4. **Database**: Add persistent storage

### Monitoring
- Response time monitoring
- Error rate tracking
- User analytics
- Resource usage

## 🆘 Troubleshooting

### Common Issues

#### 1. API Key Errors
```bash
# Check API key is valid
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.groq.com/openai/v1/models
```

#### 2. Build Errors
```bash
# Clean build
rm -rf .next node_modules
npm install
npm run build
```

#### 3. Streaming Issues
- Check Edge Runtime is working
- Verify CORS headers
- Check browser console

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **GroqCloud** - For the amazing Llama 3.3 70B model
- **Next.js** - For the excellent framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Vercel** - For the hosting platform

---

## 📞 Support

- **Documentation**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: Create GitHub issue
- **Email**: support@nova-agent.com

---

🚀 **Nova Agent is ready for production!**

Built with ❤️ using the latest AI technology and web development best practices.