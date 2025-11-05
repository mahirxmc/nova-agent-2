# 🔐 GitHub Personal Access Token Setup

## 📋 Required Scopes (Minimal Access)

When creating your Personal Access Token, select ONLY these scopes:

✅ **`repo`** (Full control of private repositories)
   - This includes everything needed for pushing to your repository
   - Alternative: You can use more specific scopes if desired:
   - ✅ `repo:status` (Access commit status)
   - ✅ `repo_deployment` (Access deployment status)  
   - ✅ `public_repo` (Access public repositories)
   - ✅ `repo:invite` (Access repository invitations)

## 🚀 After Token Creation

### **Step 1: Token Creation**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Token name: "Nova Agent Deployment"
4. Select ONLY the scopes above
5. Click "Generate token"
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### **Step 2: Push Commands**
```bash
# Navigate to your project
cd nova-agent-2

# Set your username (if not already set)
git config --global user.name "mahirxmc"

# Try push again - when prompted:
# Username: mahirxmc
# Password: [paste your Personal Access Token]

git push origin main
```

### **Step 3: Verify Authentication**
```bash
# If you want to save credentials for future
git config --global credential.helper store

# Or use a more secure method
git config --global credential.helper cache --timeout=3600
```

## 🔒 Security Best Practices

✅ **DO:**
- Use descriptive token names
- Use minimum required scopes
- Store tokens securely (password manager, environment variables)
- Regenerate tokens if compromised

❌ **DON'T:**
- Share tokens with others
- Commit tokens to code repositories
- Use same token for multiple purposes
- Use tokens with excessive permissions

## 🧪 Test Token Works

Before doing anything major, test your token:
```bash
# This should show your repository info
curl -H "Authorization: token YOUR_TOKEN_HERE" \
     https://api.github.com/user/repos

# Look for "nova-agent-2" in the response
```

## 📞 What Happens Next

1. ✅ Token creation (2 minutes)
2. ✅ Push to GitHub (1 minute) 
3. ✅ Render auto-deploy (2-3 minutes)
4. ✅ Chat works at https://nova-agent-2.onrender.com

## 🎯 Alternative: SSH Setup

If you prefer not to use tokens, SSH is more secure:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "princeiron72.2@gmail.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Go to GitHub: https://github.com/settings/keys
# Click "New SSH key", paste the key

# Switch to SSH
git remote set-url origin git@github.com:mahirxmc/nova-agent-2.git

# Push
git push origin main
```

## ✅ Ready to Proceed

Create your token with the scopes listed above, then use these commands:
1. Create token at https://github.com/settings/tokens
2. Copy the token
3. Run the push commands above

**Your chat will work immediately after deployment!**
