# Development Guide

This guide covers the development setup and architecture for Ben's Office.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Supabase      │    │  External APIs  │
│                 │    │                 │    │                 │
│  - Components   │◄──►│  - PostgreSQL   │    │  - n8n          │
│  - TanStack     │    │  - Auth         │    │  - Zapier       │
│  - TailwindCSS  │    │  - Realtime     │    │  - Custom       │
│  - PixiJS       │    │  - Storage      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        ▲
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                          HTTP POST (Webhooks)
```

## Key Components

### Core Components

- **OfficeFloor**: Main dashboard showing departments
- **Department**: Department detail view with agents
- **AgentCard**: Individual agent display and control
- **AgentTrigger**: Handles different trigger types
- **PixiOverlay**: Future sprite visualization layer

### UI Components

Built on shadcn/ui with custom styling:
- Button, Input, Card, Dialog, Select
- Dropdown menus and form components
- Responsive grid layouts

### Data Layer

- **TanStack Query**: Server state management
- **Supabase Client**: Database and auth
- **Custom Hooks**: useOffices, useDepartments, useAgents

## Database Schema

```sql
offices (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

departments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  office_id UUID REFERENCES offices(id),
  position_x INTEGER,
  position_y INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

agents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type trigger_type_enum,
  return_type return_type_enum,
  webhook_url TEXT NOT NULL,
  workflow_url TEXT,
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Webhook Integration

### Request Format

When an agent is triggered, the app sends:

```typescript
{
  agent_id: string
  agent_name: string
  trigger_type: 'click' | 'chat' | 'upload' | 'automatic' | 'none'
  return_type: 'none' | 'text' | 'chat'
  payload: {
    message?: string      // For chat triggers
    file?: {              // For upload triggers
      name: string
      type: string
      content: string     // Base64 encoded
    }
  }
  timestamp: string       // ISO 8601
}
```

### Response Handling

- **return_type: 'none'**: No response expected
- **return_type: 'text'**: Plain text or JSON response
- **return_type: 'chat'**: Formatted chat response

## Development Workflow

### 1. Adding New Features

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# - Add components in src/components/
# - Add hooks in src/hooks/
# - Update types in src/types/
# - Add routes in App.tsx

# Test locally
npm run dev

# Commit changes
git commit -m "Add new feature"
```

### 2. Database Changes

1. Update `supabase-setup.sql`
2. Update TypeScript types in `src/types/database.ts`
3. Update Supabase client types in `src/lib/supabase.ts`
4. Add/update query hooks in `src/hooks/`

### 3. Component Development

```typescript
// Follow this pattern for new components
import { cn } from '../lib/utils'
import type { ComponentProps } from '../types'

interface MyComponentProps {
  // Define props with TypeScript
}

export function MyComponent({ ...props }: MyComponentProps) {
  // Component logic
  return (
    <div className={cn("base-styles", className)}>
      {/* Content */}
    </div>
  )
}
```

## Testing Strategy

### Manual Testing Checklist

- [ ] Office creation and switching
- [ ] Department CRUD operations
- [ ] Agent CRUD operations
- [ ] All trigger types work correctly
- [ ] Webhook integration functions
- [ ] UI responsiveness across devices
- [ ] Error handling displays correctly

### Future Automated Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Component tests
npm run test:components
```

## Environment Setup

### Required Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Optional: Error tracking
VITE_SENTRY_DSN=your_sentry_dsn
```

### Development Tools

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting (if configured)
npm run lint
```

## Deployment

### Build Process

```bash
# Production build
npm run build

# Test production build
npm run preview
```

### Deployment Targets

- **AWS EC2**: Direct server deployment
- **Vercel**: Automatic deployments from Git
- **Netlify**: Static site hosting
- **Cloudflare Pages**: CDN + hosting

### Environment Configuration

1. Set up Supabase project
2. Run database migrations
3. Configure environment variables
4. Set up domain and SSL
5. Configure Cloudflare (optional)

## Performance Considerations

### Bundle Size

- Tree-shaking enabled by Vite
- Dynamic imports for large components
- PixiJS loaded separately for visualization

### Database Optimization

- RLS policies limit data access
- Indexed foreign keys for performance
- Query optimization with selective loading

### Caching Strategy

- TanStack Query for server state caching
- Browser caching for static assets
- CDN caching for global distribution

## Future Enhancements

### Planned Features

1. **Enhanced PixiJS Integration**
   - Draggable department sprites
   - Animated agent status indicators
   - Collision detection and pathfinding

2. **Agent Marketplace**
   - Pre-built agent templates
   - Community sharing
   - One-click installations

3. **Advanced Analytics**
   - Agent execution metrics
   - Performance dashboards
   - Usage analytics

### Technical Debt

- Add comprehensive error boundaries
- Implement proper loading states
- Add accessibility improvements
- Optimize mobile experience

## Troubleshooting

### Common Issues

1. **Supabase Connection**: Check environment variables
2. **Build Failures**: Clear node_modules and reinstall
3. **Type Errors**: Update TypeScript definitions
4. **Webhook Failures**: Verify URL accessibility

### Debug Tools

```javascript
// Enable debug logging
localStorage.setItem('debug', 'bens-office:*')

// Access query cache
window.queryClient = queryClient

// PixiJS debugging
window.PIXI = PIXI
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add appropriate tests
5. Update documentation
6. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow React hooks patterns
- Use Tailwind for styling
- Add JSDoc comments for complex functions
- Keep components small and focused