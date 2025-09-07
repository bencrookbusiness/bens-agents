# CLAUDE.md - Ben's Office Development Guide

**AI Assistant Instructions for Ben's Office - AI Agent Management Platform**

## 🎯 Project Overview

Ben's Office is a React TypeScript application that provides a visual interface for managing AI agents and workflows. It organizes external AI workflows (n8n, Zapier, custom APIs) using an intuitive office metaphor:

- **Offices** → Different workspaces/projects
- **Departments** → Groups of related agents  
- **Agents** → Individual AI workflows triggered via webhooks

**Key Features**: Multi-trigger support (click/chat/upload/automatic/none), flexible returns (none/text/chat), real-time updates, webhook integration, future PixiJS sprite visualization.

---

## 🏗️ Architecture & Tech Stack

### Core Stack
- **Frontend**: React 19+ with TypeScript, Vite build tool
- **State Management**: TanStack Query (server state) + Zustand (client state)
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS + shadcn/ui design system
- **Graphics**: PixiJS foundation for future sprite visualization
- **Routing**: React Router with nested routes

### Directory Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── AgentCard/       # Modular agent card system
│   │   ├── index.tsx    # Main container component
│   │   ├── AgentInput.tsx    # Dynamic input handling (chat, click, upload, etc.)
│   │   ├── AgentOutput.tsx   # Dynamic output display (text, chat, none)
│   │   └── types.ts     # TypeScript interfaces
│   ├── DepartmentCard.tsx
│   ├── AddAgentModal.tsx
│   ├── AddDepartmentModal.tsx
│   └── PixiOverlay.tsx  # 2D graphics foundation
├── hooks/               # TanStack Query hooks
│   ├── useOffices.ts
│   ├── useDepartments.ts
│   └── useAgents.ts     # Core webhook integration
├── lib/
│   ├── supabase.ts      # Database client
│   └── utils.ts         # Utilities (cn() class merger)
├── pages/
│   ├── OfficeFloor.tsx  # Main dashboard
│   └── Department.tsx   # Department detail view
├── types/
│   └── database.ts      # TypeScript interfaces
└── App.tsx             # Root with routing setup
```

---

## 🔧 Development Commands & Workflow

### Essential Commands
```bash
# Development
npm run dev              # Start dev server (http://localhost:5175)
npm run build           # Production build
npm run preview         # Preview production build

# Database
# Run supabase-setup.sql in Supabase SQL Editor for schema setup

# Environment Setup
# Create .env with:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Development Workflow
1. **Local Development**: Vite dev server with hot reload on `http://localhost:5175`
2. **Database Changes**: Update `supabase-setup.sql` → Update TypeScript types → Update hooks
3. **New Features**: Component → Hook → Route → Test locally
4. **Production**: Test build → Deploy → Configure environment variables

---

## 🎨 Dynamic Agent Card System

### Architecture Overview
The agent card system is built with a modular, composable architecture that automatically adapts to any combination of trigger and return types:

#### Component Structure
```
AgentCard (container)
├── AgentHeader (title, status, controls)  
├── AgentInput (dynamic based on trigger_type)
│   ├── TextInput (for 'chat' - textarea with send button)
│   ├── ClickTrigger (for 'click' - simple trigger button)  
│   ├── FileUpload (for 'upload' - drag & drop interface)
│   ├── AutomaticIndicator (for 'automatic' - status display)
│   └── NoInput (for 'none' - informational display)
└── AgentOutput (dynamic based on return_type)
    ├── TextOutput (for 'text' - formatted text display with history)
    ├── ChatOutput (for 'chat' - conversation interface)
    └── NoOutput (for 'none' - no output area)
```

#### Supported Combinations (All Implemented ✅)
The modular system supports all 14 possible trigger/return combinations:

**Interactive Triggers (with input UI):**
- **Chat + Text**: Full chat interface with response history
- **Chat + Chat**: Unified chat interface with conversation flow and integrated input
- **Chat + None**: Input-only chat interface for fire-and-forget actions
- **Click + Text**: Simple trigger button with response display
- **Click + Chat**: Click trigger with conversation output
- **Click + None**: Action button with no response expected
- **Upload + Text**: File drag & drop with text response (supports base64 < 1MB)
- **Upload + Chat**: File upload with conversation-style output
- **Upload + None**: File processing with no response display

**Background Triggers (status indicators only):**
- **Automatic + Text**: Scheduled agent with visible results
- **Automatic + Chat**: Scheduled agent with conversation output
- **Automatic + None**: Background process indicator only

**External Triggers (output-only or status):**
- **None + Text**: External webhook results displayed in UI
- **None + Chat**: External conversation results shown
- **None + None**: Pure external integration with status message

#### Key Features
- **Automatic Layout**: Grid layout for input+output, single column for unified interfaces
- **Visual Type Indicators**: Color-coded badges (blue for input triggers, green for return types)
- **Unified Chat**: Chat → Chat uses single interface with conversation flow
- **Response History**: Stores last 10 interactions with timestamp and status
- **Loading States**: Visual feedback during webhook processing
- **Error Handling**: User-friendly error messages with retry capability
- **Copy to Clipboard**: Easy copying of agent responses
- **File Upload**: Drag & drop support with base64 encoding for files < 1MB

---

## 🗄️ Database Schema & Data Flow

### Core Tables
```sql
offices (id, name, description, owner_id, created_at, updated_at)
departments (id, name, office_id, position_x, position_y, ...)
agents (id, name, description, trigger_type, return_type, webhook_url, workflow_url, department_id, is_active, ...)

-- Enums
trigger_type: 'click' | 'chat' | 'upload' | 'automatic' | 'none'
return_type: 'none' | 'text' | 'chat'
```

### Row Level Security (RLS)
- **Office Level**: Users see only offices they own
- **Department Level**: Users see departments in their offices  
- **Agent Level**: Users see agents in their departments
- **Policy Pattern**: All tables have SELECT, INSERT, UPDATE, DELETE policies with proper joins

### Data Flow Pattern
```
User Action → Component → Custom Hook → TanStack Query → Supabase → RLS Check → Response → Cache Update → UI Update
```

---

## 🔗 Webhook Integration System

### Core Webhook Function: `useTriggerAgent()`
Located in `src/hooks/useAgents.ts`, this is the heart of the external integration system.

### Webhook Payload Structure
```typescript
{
  agent_id: "uuid",
  agent_name: "Agent Name",
  trigger_type: "click" | "chat" | "upload" | "automatic" | "none",
  return_type: "none" | "text" | "chat",
  payload: {
    message?: string,           // For chat triggers
    file?: {                    // For upload triggers
      name: string,
      type: string,
      content: string           // Base64 encoded
    }
  },
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### Supported Platforms
- **n8n**: Use "Webhook" node as trigger
- **Zapier**: "Webhooks by Zapier" trigger
- **Make.com**: Webhook modules
- **Custom APIs**: Any endpoint accepting POST requests

---

## 🎨 UI Component System

### shadcn/ui Components (`src/components/ui/`)
- **button.tsx**: 5 variants (default, outline, ghost, destructive, secondary), 4 sizes
- **card.tsx**: CardHeader, CardTitle, CardContent, CardFooter composition
- **dialog.tsx**: Modal system for forms and confirmations
- **dropdown-menu.tsx**: Complex dropdown with items, separators, shortcuts
- **input.tsx, textarea.tsx, label.tsx**: Form controls
- **select.tsx**: Dropdown selectors for trigger/return types

### Styling Patterns
```typescript
// Use cn() utility for conditional classes
className={cn(
  "base-styles",
  isActive ? "active-styles" : "inactive-styles",
  className
)}

// Component variants using class-variance-authority
const buttonVariants = cva("base", {
  variants: {
    variant: { default: "...", outline: "...", ghost: "..." },
    size: { default: "...", sm: "...", lg: "..." }
  }
})
```

---

## 🪝 Custom Hooks Architecture

### Data Management Pattern
All server communication is handled through custom hooks using TanStack Query:

```typescript
// Query pattern
const { data: offices, isLoading, error } = useOffices()

// Mutation pattern
const createOfficeMutation = useCreateOffice()
const handleCreate = () => createOfficeMutation.mutate({ name: "New Office" })
```

### Key Hooks

**`useOffices.ts`**:
- `useOffices()`: Fetch all user offices with caching
- `useCreateOffice()`: Create office with automatic cache invalidation

**`useDepartments.ts`**:
- `useDepartments(officeId)`: Fetch departments with nested agents
- `useDepartment(departmentId)`: Single department with agents
- `useCreateDepartment()`: Create with parent office validation

**`useAgents.ts`**:
- `useCreateAgent()`: Create agent with webhook validation
- `useUpdateAgent()`: Partial updates (status toggle, edit)
- `useDeleteAgent()`: Safe deletion with cascade cleanup
- `useTriggerAgent()`: **Core webhook integration**

### Query Keys & Cache Management
```typescript
// Query key structure
['offices']                    // All user offices
['departments', officeId]      // Departments for office
['department', departmentId]   // Single department with agents

// Cache invalidation pattern
queryClient.invalidateQueries({ queryKey: ['departments', officeId] })
```

---

## 🎮 PixiJS Foundation (Future Enhancement)

### Current Implementation (`src/components/PixiOverlay.tsx`)
- Basic PixiJS Application setup
- Simple desk sprite rendering for departments
- Interactive event handling foundation
- Positioned as absolute overlay with `pointer-events-none`

### Future Vision with MCP Integration
- **Drag & Drop**: Department positioning on office floor
- **Animated Sprites**: Worker sprites moving between desks
- **Activity Indicators**: Visual agent status and execution
- **Pathfinding**: Smart sprite movement with collision detection

**IMPORTANT NOTE**: When implementing PixiJS features, we will use the MCP server to access PixiJS documentation and examples. This ensures we have up-to-date information about PixiJS APIs, best practices, and implementation patterns. The MCP server provides real-time access to documentation without relying on potentially outdated training data.

### PixiJS Implementation Plan (Phase 3+)
1. **MCP Documentation Access**: Set up MCP server connection for PixiJS docs
2. **Interactive Floor Plan**: Convert current grid layout to PixiJS canvas
3. **Sprite Management**: Create department and agent sprites with proper animations
4. **Interaction System**: Implement click, drag, and hover interactions
5. **Performance Optimization**: Use PixiJS best practices for large office layouts

---

## 🚀 Development Guidelines

### Adding New Features

#### 1. New Component Pattern
```typescript
// src/components/NewComponent.tsx
import { cn } from '../lib/utils'
import type { ComponentProps } from '../types'

interface NewComponentProps {
  // Define props with TypeScript
}

export function NewComponent({ className, ...props }: NewComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {/* Content */}
    </div>
  )
}
```

#### 2. New Hook Pattern
```typescript
// src/hooks/useNewFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useNewFeature() {
  return useQuery({
    queryKey: ['new-feature'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table')
        .select('*')
      if (error) throw error
      return data
    }
  })
}

export function useCreateNewFeature() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newData) => {
      const { data, error } = await supabase
        .from('table')
        .insert([newData])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-feature'] })
    }
  })
}
```

#### 3. Database Schema Changes
1. Update `supabase-setup.sql`
2. Update `src/types/database.ts` interfaces
3. Update `src/lib/supabase.ts` if needed
4. Create/update corresponding hooks
5. Update components to use new data

### Code Quality Standards

#### TypeScript Best Practices
- **Strict Mode**: All files use strict TypeScript
- **Interface Over Type**: Prefer `interface` for object shapes
- **Proper Typing**: Avoid `any`, use proper types from Supabase
- **Null Safety**: Handle `null/undefined` explicitly

#### Component Best Practices
- **Single Responsibility**: Each component has one clear purpose
- **Prop Drilling**: Avoid excessive prop drilling, use composition
- **Error Boundaries**: Wrap risky components in error boundaries
- **Loading States**: Always show loading and error states

#### Performance Considerations
- **Query Optimization**: Use proper query keys and stale times
- **Component Memoization**: Use `React.memo` for expensive components
- **Bundle Size**: Dynamic imports for large dependencies (PixiJS)
- **Image Optimization**: Optimize images and use appropriate formats

---

## 🔒 Security & Authentication

### Supabase Authentication
- **Built-in Auth**: Email/password, social providers available
- **Session Management**: Automatic session handling with Supabase client
- **Protected Routes**: Use Supabase auth state for route protection

### Row Level Security (RLS)
```sql
-- Example policy pattern
CREATE POLICY "Users can view their own offices" ON offices
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view departments in their offices" ON departments
  FOR SELECT USING (
    office_id IN (
      SELECT id FROM offices WHERE owner_id = auth.uid()
    )
  );
```

### Environment Variables
```env
# Required for production
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional
VITE_ANALYTICS_ID=analytics-id
VITE_SENTRY_DSN=error-tracking
```

---

## 📋 Common Development Tasks

### Adding a New Trigger Type
1. Update `trigger_type` enum in `supabase-setup.sql`
2. Update TypeScript types in `src/types/database.ts`
3. Update `AgentTrigger.tsx` component logic
4. Update `AddAgentModal.tsx` form options
5. Test webhook payload structure

### Adding a New Return Type
1. Update `return_type` enum in database
2. Update TypeScript types
3. Update response handling in `useTriggerAgent()`
4. Update UI to display new return type
5. Test external platform integration

### Adding a New Page
1. Create page component in `src/pages/`
2. Add route to `App.tsx` routing configuration
3. Update navigation components if needed
4. Add any required data hooks
5. Test routing and data loading

### Database Migration
1. Update `supabase-setup.sql` with new changes
2. Run migration in Supabase dashboard
3. Update TypeScript interfaces
4. Update affected hooks and components
5. Test data integrity

---

## 🚀 Deployment Guide

### Production Build
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Files output to dist/ directory
```

### Environment Setup
1. **Supabase Production**: Create production project, run schema
2. **Environment Variables**: Set production URLs and keys
3. **Domain Setup**: Configure DNS for bensagents.com
4. **SSL**: Ensure HTTPS for webhook security

### Deployment Options
- **Vercel**: Connect GitHub repo, auto-deploy on push
- **Netlify**: Similar Git integration with build commands
- **AWS EC2**: Upload dist/ files to web server
- **Custom Server**: Host dist/ files with proper routing

---

## 🐛 Troubleshooting Common Issues

### Development Issues
- **Port Conflicts**: Vite auto-increments port (5173 → 5174 → 5175 etc.) - currently on 5175
- **Environment Variables**: Restart dev server after .env changes
- **TypeScript Errors**: Check interface definitions match database schema
- **Supabase Connection**: Verify URL and anon key in .env

### CSS/Styling Issues ✅ RESOLVED
- **PostCSS Configuration**: Use object syntax: `{ tailwindcss: {}, autoprefixer: {} }`
- **Invalid @apply Directives**: Replace unknown utility classes with standard CSS
- **Diagnostic**: Add `body { background: red !important; }` to test CSS processing

**Status**: All styling issues resolved. App running successfully with full CSS support.

### Authentication Issues
- **TypeScript Import Error**: Use `import type { User, Session }` instead of `import { User, Session }` from '@supabase/supabase-js' - these are types, not runtime values
- **RLS Policies**: Ensure policies match current auth.uid()
- **Session Persistence**: Check Supabase client configuration
- **Token Expiry**: Handle automatic token refresh

### Webhook Issues
- **CORS Errors**: Ensure external platforms accept CORS
- **Payload Format**: Verify webhook expects JSON POST
- **URL Validation**: Test webhook URLs with tools like webhook.site
- **Error Handling**: Check network tab for failed requests

### Production Issues
- **Environment Variables**: Ensure all required vars are set
- **Build Errors**: Check TypeScript compilation
- **Routing**: Configure SPA routing for production server
- **Performance**: Enable gzip, CDN, and caching

---

## 📈 Future Roadmap

### Phase 1 (Current - Completed)
- ✅ Office/Department/Agent CRUD operations
- ✅ Webhook integration system
- ✅ Multiple trigger types
- ✅ Authentication and RLS security
- ✅ Responsive UI with dark mode

### Phase 2 (Next Priority)
- 🟨 Enhanced error handling and retry logic
- 🟨 Agent execution history and logging  
- 🟨 File upload processing for upload triggers
- 🟨 Office Management System (edit, delete, sharing)
- 🟨 Real-time agent status indicators
- 🟨 PixiJS drag-and-drop department positioning

### Phase 3 (Advanced Features)
- ⏳ Agent templates and marketplace
- ⏳ Workflow builder integration
- ⏳ Team collaboration features
- ⏳ Analytics dashboard
- ⏳ Advanced PixiJS sprite system

### Phase 4 (Enterprise Features)
- ⏳ Multi-tenant architecture
- ⏳ Advanced webhook management
- ⏳ Custom integrations API
- ⏳ Performance monitoring
- ⏳ Advanced security features

---

## 💡 AI Assistant Guidelines

When working on this project, remember:

1. **Architecture Consistency**: Follow established patterns for hooks, components, and data flow
2. **Type Safety**: Maintain strict TypeScript throughout
3. **Database First**: Always consider RLS and data relationships
4. **Webhook Integration**: The core value is external platform connectivity
5. **User Experience**: Prioritize smooth, responsive interactions
6. **Future Ready**: Keep PixiJS foundation and extensibility in mind
7. **Security First**: Never compromise on authentication or data isolation
8. **Documentation**: Update this file when making architectural changes

This codebase is well-structured for growth from a simple agent manager to a comprehensive visual workflow orchestration platform. Each component, hook, and pattern has been designed with scalability and maintainability in mind.