# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0fce72e6-e1e6-4518-911d-cf5489ccbf0a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0fce72e6-e1e6-4518-911d-cf5489ccbf0a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "New Project" and import your GitHub repository
   - Vercel will automatically detect it's a Vite project

2. **Configure Environment Variables:**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_MAPBOX_TOKEN=your-mapbox-token-here
   ```

3. **Deploy:**
   - Vercel will automatically build and deploy
   - Your PWA will be available at `your-project.vercel.app`

### Manual Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally
npm run preview

# Deploy dist/ folder to any static hosting service
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_MAPBOX_TOKEN` - Mapbox token (optional, for map features)

### PWA Features

The app includes:
- ✅ Service Worker for offline functionality
- ✅ Web App Manifest for installation
- ✅ Background sync for offline photo uploads
- ✅ Push notifications support
- ✅ Responsive design for all devices

### Build Optimization

The build is optimized with:
- Code splitting
- Asset optimization
- Service worker precaching
- Security headers
- PWA manifest validation

## 🌐 Custom Domain

### With Vercel:
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### With Other Providers:
Deploy the `dist/` folder to any static hosting service that supports:
- HTTPS (required for PWA)
- SPA routing (for client-side navigation)
- Custom headers (for security and caching)
