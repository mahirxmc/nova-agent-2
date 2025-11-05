# AI Agent Platform

A production-grade AI Agent Platform with real-time chat, agent management, and file processing capabilities. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Real-time AI Chat**: Streaming responses with Groq API integration
- **User Authentication**: Secure signup/login with Supabase Auth
- **Agent Management**: Create and configure custom AI agents with different capabilities
- **File Upload**: Process PDF, DOCX, TXT, CSV, XLSX, and images
- **Conversation History**: Persistent chat history with database storage
- **Modern UI**: Clean, professional interface with Modern Minimalism Premium design
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript 5.6** - Type-safe development
- **Vite 6.0** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication and user management
  - Edge Functions (Deno runtime)
  - Storage for file uploads
  - Real-time subscriptions

### AI Integration
- **Groq API** - Fast AI inference with llama-3.3-70b-versatile model
- Streaming responses for real-time chat experience

## Project Structure

```
ai-agent-platform/
├── src/
│   ├── components/
│   │   ├── AgentManager.tsx      # Agent creation and management
│   │   ├── AuthModal.tsx         # Login/signup modal
│   │   ├── ChatInterface.tsx     # Main chat interface
│   │   ├── ErrorBoundary.tsx     # Error handling
│   │   └── FileUpload.tsx        # File upload component
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── lib/
│   │   └── supabase.ts          # Supabase client
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── supabase/
│   └── functions/
│       ├── chat-stream/          # AI chat streaming
│       ├── agent-execute/        # Agent task execution
│       └── process-file/         # File processing
├── render.yaml                   # Render deployment config
└── README.md                     # This file
```

## Database Schema

The platform uses the following tables:
- **user_profiles** - User profile information
- **agents** - Custom AI agents
- **conversations** - Chat conversations
- **messages** - Individual messages
- **files** - Uploaded files metadata
- **agent_executions** - Agent task history
- **usage_metrics** - Usage tracking
- **audit_logs** - Security audit trail

All tables are protected with Row Level Security (RLS) policies.

## Installation

### Prerequisites
- Node.js 20+ and pnpm
- Supabase account
- Groq API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-agent-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Configure Groq API key in Supabase**
   - Go to Supabase Dashboard > Project Settings > Edge Functions
   - Add secret: `GROQ_API_KEY=your-groq-api-key`

5. **Run development server**
   ```bash
   pnpm dev
   ```

## Deployment to Render

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`
   - Click "Create Static Site"

3. **Environment Variables** (Not needed for frontend)
   - Supabase credentials are hardcoded in the build
   - Groq API key is already set in Supabase Edge Functions

### Deployment Configuration

The `render.yaml` file configures:
- Build command: `pnpm install && pnpm run build`
- Publish directory: `./dist`
- SPA routing (all routes serve `index.html`)
- Security headers
- Asset caching

## Usage

### As a Guest
- Send messages to the AI without authentication
- Limited to temporary conversations

### As a Registered User
- Sign up with email and password
- Create custom AI agents with specific capabilities
- Upload and process files
- Save conversation history
- Access all platform features

### Creating AI Agents

1. Click "New Agent" in the sidebar
2. Configure:
   - **Name**: Give your agent a descriptive name
   - **Type**: Choose from Chat, Research, Code, Web Browser, File Processor, or Custom
   - **Description**: Describe what the agent does
   - **Capabilities**: Select Web Search, Code Execution, File Processing, Web Browsing, or Memory
3. Click "Create Agent"
4. Select the agent to use it in conversations

### Uploading Files

1. Click "Upload File" button
2. Drag and drop or select a file
3. Supported formats: PDF, DOCX, TXT, CSV, XLSX, JPG, PNG, GIF
4. File will be processed and text extracted (for supported formats)
5. Use the extracted content in your conversations

## Edge Functions

### chat-stream
- Handles real-time AI chat with streaming responses
- Integrates with Groq API
- Maintains conversation context

### agent-execute
- Executes agent-specific tasks
- Handles different agent types (research, code, web browsing, etc.)
- Saves execution history

### process-file
- Uploads files to Supabase Storage
- Extracts text from documents
- Saves file metadata to database

## Security

- **Row Level Security (RLS)** on all database tables
- **Authentication** required for data persistence
- **CORS** properly configured for edge functions
- **Environment variables** for sensitive credentials
- **Security headers** configured in deployment

## Performance

- **Optimized build**: ~420KB JS (gzipped: ~107KB)
- **Code splitting**: Lazy loading for better performance
- **Asset caching**: 1-year cache for static assets
- **Streaming responses**: Real-time AI chat without delays

## Troubleshooting

### Build Errors
- Ensure Node.js 20+ is installed
- Clear cache: `pnpm store prune`
- Reinstall: `rm -rf node_modules && pnpm install`

### Authentication Issues
- Verify Supabase URL and anon key in `.env`
- Check if email confirmation is required in Supabase settings

### Chat Not Working
- Verify Groq API key is set in Supabase Edge Functions secrets
- Check edge function logs in Supabase Dashboard
- Ensure RLS policies are correctly configured

### File Upload Failing
- Check if `user-files` bucket exists in Supabase Storage
- Verify storage policies allow public access
- Ensure file size is under 10MB

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues and questions:
- Create a GitHub issue
- Check existing documentation
- Review Supabase and Groq API documentation

## Acknowledgments

- Built with [React](https://react.dev)
- Powered by [Supabase](https://supabase.com)
- AI by [Groq](https://groq.com)
- Icons by [Lucide](https://lucide.dev)
- Deployed on [Render](https://render.com)

---

**Built by MiniMax Agent** - Production-grade AI Agent Platform
/* Triggering fresh deployment */
