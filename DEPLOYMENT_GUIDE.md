# 🚀 Nova Agent - Complete Deployment Guide

## 📋 Overview
Nova Agent is a professional AI chat platform with 5 specialized agents powered by GroqCloud's Llama 3.3 70B model.

### ✨ Features
- **5 Specialized AI Agents**: Assistant, Researcher, Developer, Navigator, Creator
- **Real-time Streaming**: Instant AI responses with live typing
- **Professional UI**: ChatGPT/Manus-style interface
- **GroqCloud Powered**: Ultra-fast Llama 3.3 70B model
- **Edge Runtime**: Optimized performance with Next.js 15

## 🔧 Environment Variables

### Required Environment Variables
```bash
# GroqCloud API Configuration
GROQ_API_KEY=your_groqcloud_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Supabase Configuration (Optional - for future features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# GitHub Configuration (Optional - for future features)
GITHUB_TOKEN=your_github_token

# Database
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

## 🚀 Render Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy Nova Agent with GroqCloud integration"
git push origin main
```

### 2. Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure service settings:

#### Basic Settings
- **Name**: `nova-agent`
- **Region**: Choose nearest region
- **Branch**: `main`

#### Build Settings
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

#### Environment Variables
Add all environment variables from the section above

#### Advanced Settings
- **Instance Type**: `Free` (or `Standard` for better performance)
- **Auto-Deploy**: Yes (for automatic updates)

### 3. Deploy Configuration
```yaml
# render.yaml (optional - for automatic deployment)
services:
  - type: web
    name: nova-agent
    env: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: GROQ_API_KEY
        value: your_groqcloud_api_key_here
      - key: GROQ_MODEL
        value: llama-3.3-70b-versatile
      - key: NEXT_PUBLIC_SUPABASE_URL
        value: your_supabase_url_here
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        value: your_supabase_anon_key_here
```

## 🧪 Testing After Deployment

### 1. Basic Functionality Test
1. Open your deployed URL
2. Select different agents from the sidebar
3. Send test messages to each agent
4. Verify streaming responses work correctly

### 2. API Endpoint Test
```bash
curl -X POST https://your-app.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "agent": "nova-assistant"
  }'
```

### 3. Performance Test
- Test response times (should be < 2 seconds)
- Verify streaming works smoothly
- Check all 5 agents function correctly

## 🔍 Troubleshooting

### Common Issues

#### 1. GroqCloud API Errors
**Problem**: API key not working
**Solution**: 
- Verify API key is correct
- Check GroqCloud dashboard for usage limits
- Ensure model name is correct: `llama-3.3-70b-versatile`

#### 2. Build Errors
**Problem**: Build fails on Render
**Solution**:
- Check package.json dependencies
- Verify all environment variables are set
- Check build logs in Render dashboard

#### 3. Streaming Issues
**Problem**: Responses not streaming
**Solution**:
- Check Edge Runtime is working
- Verify CORS headers
- Check browser console for errors

### Debug Commands
```bash
# Check build locally
npm run build

# Test API locally
npm run dev
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Test"}]}'

# Check environment variables
npm run dev
# In browser console: console.log(process.env)
```

## 📊 Performance Optimization

### 1. Free Tier Limitations
- **CPU**: Shared
- **RAM**: 512MB
- **Bandwidth**: 100GB/month
- **Builds**: 400/month

### 2. Upgrade Recommendations
For production use, consider:
- **Standard Instance**: $7/month for better performance
- **Background Worker**: For AI processing
- **PostgreSQL**: For persistent storage

### 3. Caching Strategy
```javascript
// Add caching to API responses
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Implement in your API route
const cacheKey = `${agent}-${JSON.stringify(messages)}`
if (cache.has(cacheKey)) {
  return cache.get(cacheKey)
}
```

## 🎯 Production Checklist

### Before Going Live
- [ ] All environment variables set
- [ ] GroqCloud API key tested
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring setup
- [ ] Performance monitoring configured

### Post-Deployment
- [ ] Test all agent functionalities
- [ ] Monitor response times
- [ ] Check error logs
- [ ] Verify user experience
- [ ] Set up alerts for downtime

## 📈 Scaling Considerations

### When to Upgrade
1. **High Traffic**: > 1000 concurrent users
2. **Slow Responses**: > 3 second response times
3. **Frequent Errors**: > 1% error rate
4. **Resource Limits**: Hitting free tier limits

### Scaling Options
1. **Vertical Scaling**: Upgrade to Standard/Pro instances
2. **Horizontal Scaling**: Multiple instances with load balancer
3. **CDN**: Add Cloudflare for static assets
4. **Database**: Upgrade to managed PostgreSQL

## 🆘 Support

### Getting Help
1. **Render Docs**: https://render.com/docs
2. **GroqCloud Docs**: https://console.groq.com/docs
3. **Next.js Docs**: https://nextjs.org/docs
4. **Community**: GitHub Issues, Discord, Stack Overflow

### Emergency Contacts
- **Render Support**: support@render.com
- **GroqCloud Support**: https://console.groq.com/support
- **Project Issues**: Create GitHub issue

---

## 🎉 Deployment Complete!

Your Nova Agent is now live and ready to use! Users can:
- Chat with 5 specialized AI agents
- Enjoy real-time streaming responses
- Experience professional ChatGPT-like interface
- Benefit from ultra-fast GroqCloud AI

**Expected Performance**:
- Response Time: 1-3 seconds
- Uptime: 99.9% (with proper monitoring)
- Concurrent Users: 100+ (free tier)

🚀 **Your Nova Agent is ready for production!**