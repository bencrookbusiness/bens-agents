# Ben's Office

A visual interface for managing AI agents and workflows. Link external AI agents/workflows (e.g., n8n, Zapier) into a simple UI organized as offices → departments → agent cards.

![Ben's Office](https://via.placeholder.com/800x400?text=Ben%27s+Office+Screenshot)

## Features

- **Office Management**: Create and manage multiple offices
- **Department Organization**: Group agents by department
- **Agent Integration**: Connect any webhook-enabled workflow
- **Multiple Trigger Types**: Click, Chat, Upload, Automatic, or External triggers
- **Flexible Returns**: No return, Text, or Chat responses
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui
- **Real-time Updates**: Powered by Supabase

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Auth)
- **State Management**: TanStack Query + Zustand
- **Future**: PixiJS for sprite visualization

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bens-office
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the contents of `supabase-setup.sql`
3. Go to Settings → API to get your project URL and anon key

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## Usage

### Creating Your First Office

1. Sign up/Login (Supabase Auth)
2. Create an office from the dropdown
3. Add departments to organize your agents
4. Add agents with webhook URLs

### Agent Types

#### Trigger Types
- **Click**: User clicks a button to run
- **Chat**: User sends a message
- **Upload**: User uploads a file
- **Automatic**: Runs on schedule (external)
- **None**: Triggered externally

#### Return Types
- **None**: Agent processes but returns nothing
- **Text**: Agent returns data/text
- **Chat**: Agent responds in chat format

### Webhook Integration

When an agent is triggered, Ben's Office sends a POST request to your webhook URL:

```json
{
  "agent_id": "uuid",
  "agent_name": "Code Review Agent",
  "trigger_type": "upload",
  "return_type": "text",
  "payload": {
    "message": "Hello world",
    "file": {
      "name": "document.pdf",
      "type": "application/pdf",
      "content": "base64-encoded-content"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Supported Platforms

Ben's Office works with any platform that supports webhooks:

- **n8n**: Use the "Webhook" node
- **Zapier**: Use "Webhooks by Zapier" 
- **Make (Integromat)**: Use the "Webhooks" module
- **Custom APIs**: Any endpoint that accepts POST requests

## Development

### Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── AgentCard.tsx    # Agent display component
│   ├── DepartmentCard.tsx
│   └── ...
├── hooks/               # React Query hooks
├── lib/                 # Utilities and config
├── pages/               # Route components
├── types/               # TypeScript definitions
└── App.tsx             # Main app component
```

### Adding New Features

1. Create components in `src/components/`
2. Add database queries in `src/hooks/`
3. Update types in `src/types/database.ts`
4. Add routes in `App.tsx`

## Roadmap

### Phase 1 (Current)
- ✅ Basic office/department/agent management
- ✅ Webhook integration
- ✅ Multiple trigger types
- ✅ Real-time updates

### Phase 2 (Next)
- 🔲 PixiJS sprite visualization
- 🔲 Drag-and-drop department layout
- 🔲 Agent execution history
- 🔲 Error handling and retry logic

### Phase 3 (Future)
- 🔲 Agent templates marketplace
- 🔲 Workflow builder integration
- 🔲 Team collaboration features
- 🔲 Analytics and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@bensagents.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/bens-office/issues)
- 💬 Discord: [Join our community](https://discord.gg/your-invite)

---

Built with ❤️ by [Ben](https://github.com/your-username)