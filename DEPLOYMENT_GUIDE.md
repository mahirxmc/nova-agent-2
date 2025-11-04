# Complete Deployment Guide: GitHub Codespaces → Render

This guide provides step-by-step instructions for deploying the AI Agent Platform from GitHub Codespaces to Render.

## Prerequisites

- GitHub account
- Render account (free tier available)
- Supabase project (already configured)
- Groq API key (already set in Supabase)

## Part 1: Prepare Your Code in GitHub Codespaces

### Step 1: Verify Your Project Structure

Make sure your project has these files:
```
ai-agent-platform/
├── src/                      # Source code
├── public/                   # Static assets
├── package.json             # Dependencies
├── vite.config.ts          # Build configuration
├── render.yaml             # Render deployment config
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
└── README.md               # Documentation
```

### Step 2: Test Local Build

In GitHub Codespaces terminal:
```bash
cd ai-agent-platform
pnpm install
pnpm run build
```

Expected output:
- Build completes without errors
- `dist/` folder is created
- Build size: ~420KB JS, ~15KB CSS

### Step 3: Create GitHub Repository

#### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not available
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Authenticate
gh auth login

# Create repository
gh repo create ai-agent-platform --public --source=. --remote=origin --push
```

#### Option B: Manual Method
```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete AI Agent Platform"

# Create repository on GitHub.com manually, then:
git remote add origin https://github.com/YOUR-USERNAME/ai-agent-platform.git
git branch -M main
git push -u origin main
```

## Part 2: Deploy on Render

### Step 1: Access Render Dashboard

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Sign in with your GitHub account (recommended) or email

### Step 2: Create New Static Site

1. Click **"New"** button (top right)
2. Select **"Static Site"**
3. Click **"Connect a repository"**

### Step 3: Connect GitHub Repository

**If first time connecting:**
1. Click "Configure account" link
2. Authorize Render to access GitHub
3. Select repositories to grant access (choose "All repositories" or select specific one)
4. Click "Install"

**If already connected:**
1. Find your repository in the list
2. Click "Connect" next to `ai-agent-platform`

### Step 4: Configure Build Settings

Render will auto-detect your `render.yaml` configuration. Verify these settings:

**Name:** `ai-agent-platform` (or your preferred name)

**Branch:** `main`

**Build Command:** `pnpm install && pnpm run build`

**Publish Directory:** `dist`

**Auto-Deploy:** `Yes` (recommended)

Click **"Create Static Site"**

### Step 5: Wait for Deployment

1. Render will start building your site
2. You'll see real-time build logs
3. Build typically takes 2-5 minutes

**Build stages:**
- Installing dependencies
- Running build command
- Optimizing assets
- Deploying to CDN

### Step 6: Get Your Live URL

Once deployment completes:
1. You'll see "Deploy succeeded" message
2. Your live URL will be displayed at the top
3. Format: `https://ai-agent-platform-xxxx.onrender.com`

**Click the URL to open your live site!**

## Part 3: Verify Deployment

### Test Checklist

1. **Page Loads**
   - [ ] Homepage loads without errors
   - [ ] No console errors in browser DevTools

2. **Guest Chat**
   - [ ] Send a message without signing in
   - [ ] Receive AI response with streaming
   - [ ] Response is relevant and complete

3. **Authentication**
   - [ ] Click "Sign In" button
   - [ ] Sign up with email and password
   - [ ] Confirm email if required (check Supabase settings)
   - [ ] Sign in successfully

4. **Agent Management**
   - [ ] Click "New Agent" button
   - [ ] Fill out agent creation form
   - [ ] Successfully create agent
   - [ ] Select agent from list
   - [ ] Agent appears as selected

5. **File Upload**
   - [ ] Click "Upload File" button
   - [ ] Drag and drop or select a file
   - [ ] File uploads successfully
   - [ ] Extracted text appears (if text file)

6. **Conversation Persistence**
   - [ ] Send multiple messages
   - [ ] Refresh page
   - [ ] Messages are still visible (when logged in)

## Part 4: Troubleshooting

### Build Fails

**Issue:** Build command fails with dependency errors

**Solution:**
```bash
# In Codespaces, clean and rebuild
rm -rf node_modules dist
pnpm install
pnpm run build

# If successful, commit and push
git add .
git commit -m "Fix dependencies"
git push
```

### 404 Errors on Routes

**Issue:** Direct URLs return 404

**Solution:** Verify `render.yaml` has SPA routing:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

### Authentication Not Working

**Issue:** Sign up/sign in fails

**Solution:**
1. Check Supabase Dashboard → Authentication → URL Configuration
2. Add your Render URL to "Site URL" and "Redirect URLs"
3. Format: `https://your-app.onrender.com`

### AI Chat Not Responding

**Issue:** Chat sends but no AI response

**Solution:**
1. Verify Groq API key in Supabase:
   - Dashboard → Project Settings → Edge Functions → Secrets
   - Ensure `GROQ_API_KEY` is set
2. Check edge function logs in Supabase Dashboard
3. Test edge function directly:
```bash
curl -X POST https://pnkjdhyvyxkkrfkhnfkz.supabase.co/functions/v1/chat-stream \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

### File Upload Fails

**Issue:** File upload returns error

**Solution:**
1. Check Supabase Storage bucket exists: `user-files`
2. Verify storage policies allow public access
3. Check file size is under 10MB
4. Ensure edge function is deployed: `process-file`

## Part 5: Custom Domain (Optional)

### Add Custom Domain on Render

1. Go to your site dashboard on Render
2. Click "Settings" tab
3. Scroll to "Custom Domain" section
4. Click "Add Custom Domain"
5. Enter your domain (e.g., `aiagent.yourdomain.com`)
6. Follow DNS configuration instructions
7. Wait for DNS propagation (can take up to 48 hours)

### Update Supabase URLs

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add your custom domain to allowed URLs
4. Save changes

## Part 6: Continuous Deployment

### Automatic Deployment

With Auto-Deploy enabled, every push to `main` branch triggers a new deployment:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Render automatically:
# 1. Detects the push
# 2. Starts new build
# 3. Deploys on success
# 4. Updates live site
```

### Manual Deployment

1. Go to Render Dashboard
2. Select your site
3. Click "Manual Deploy" button
4. Choose branch
5. Click "Deploy latest commit"

## Part 7: Monitoring and Maintenance

### View Build Logs

1. Render Dashboard → Your Site
2. Click "Logs" tab
3. View real-time logs
4. Filter by severity

### Check Supabase Metrics

1. Supabase Dashboard → Project
2. View:
   - Database queries
   - Edge function invocations
   - Storage usage
   - Authentication events

### Monitor Groq API Usage

1. Check Groq Dashboard
2. View API calls and costs
3. Set usage alerts if needed

## Part 8: Scaling and Optimization

### Performance Optimization

**Already implemented:**
- Code splitting
- Asset optimization
- Gzip compression
- CDN delivery
- Caching headers

**For future improvements:**
- Add service worker for offline support
- Implement lazy loading for routes
- Use React.memo for expensive components
- Add image optimization

### Cost Management

**Render Free Tier:**
- 100 GB bandwidth/month
- Automatic SSL
- Global CDN
- Auto-deploy from Git

**Supabase Free Tier:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

**Groq API:**
- Check current pricing at groq.com
- Monitor usage in dashboard
- Set up alerts for cost control

## Conclusion

Your AI Agent Platform is now live and accessible worldwide!

**Your deployment URL:** `https://ai-agent-platform-xxxx.onrender.com`

Share this URL with users, and they can:
- Chat with AI agents in real-time
- Create custom agents
- Upload and process files
- Save conversation history

## Next Steps

1. **Test thoroughly** using the verification checklist above
2. **Share with users** and gather feedback
3. **Monitor performance** through Render and Supabase dashboards
4. **Iterate and improve** based on user needs
5. **Scale as needed** by upgrading plans

## Support

- **Render Documentation:** https://render.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Groq Documentation:** https://console.groq.com/docs

---

**Congratulations on your deployment!** Your AI Agent Platform is production-ready and serving users globally.
