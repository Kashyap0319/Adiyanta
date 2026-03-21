# Adityanta - Teacher Slide Builder

Adityanta is a web app for creating classroom-ready presentations quickly.
It provides a slide editor, reusable templates, export tools, and presentation mode in one place.

## Why This Project

- Build educational slides faster with template-first workflow
- Edit with a PowerPoint-like canvas experience in browser
- Export and share presentations without leaving the app

## Core Features

- Slide editor with drag, resize, align, and rich text controls
- Template gallery for education-focused use cases
- Autosave-friendly project flow with user files and favorites
- Export support (PDF / PPTX / video workflow)
- Presentation mode for full-screen delivery
- Keyboard shortcuts for faster editing

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- React Router
- Context API for app/editor/auth state
- jsPDF, html2canvas, pptxgenjs, ffmpeg packages for export/media workflows

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install and Run

```bash
git clone https://github.com/Kashyap0319/Adiyanta.git
cd Adiyanta
npm install
npm run dev
```

App runs on: `http://localhost:5173`

## Environment Variables

Create a `.env` file in project root if needed:

```env
# Optional backend base URL
# VITE_API_BASE_URL=http://localhost:3001/api/v1

# Optional frontend base URL for share links
# VITE_FRONTEND_BASE_URL=https://your-domain.com

# Optional Google OAuth client id
# VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Scripts

```bash
npm run dev      # start local dev server
npm run build    # production build
npm run preview  # preview production build locally
npm run lint     # run eslint
```

## Folder Layout

```text
src/
  components/    UI building blocks (modals, toolbar, sidebar, etc.)
  context/       app-wide state providers
  pages/         route-level pages (auth, home, editor, presentation)
  services/      API integration layer
  utils/         export and shared utility logic
```

## License

MIT
