# Socratop - Multi-Platform Sports Data Platform

## Project Overview
This is a Next.js 15 application that serves as a comprehensive sports data platform. The website has been transformed from a single Cadence app landing page into a multi-functional platform that includes:

1. **Cadence Running App** - Smart metronome + GPS tracking for runners
2. **Data Analysis Platform** - Strava integration, workout data analysis, equipment management
3. **Personal Center** - User profiles, equipment tracking, sports history

## Key Features
- **Multi-language Support**: English and Chinese with automatic browser detection
- **Apple Sign-In Integration**: OAuth authentication with Supabase
- **Strava API Integration**: Connect user accounts and sync activity data  
- **FIT File Analysis**: Professional workout data parsing and visualization
- **Equipment Management**: Track sports gear usage and lifecycle
- **Responsive Design**: Modern UI with mobile-first approach

## Development Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run export` - Build and export static files

## Environment Configuration
Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
NEXT_PUBLIC_STRAVA_REDIRECT_URI=http://localhost:3000/auth/strava/callback
```

## Database Structure
The application uses Supabase with the following main tables:
- `users_profiles` - Extended user information
- `strava_connections` - Strava API connection data
- `sports_equipment` - User's sports gear tracking
- `activities` - Synced workout activities from Strava

## Language Settings
**Default Language**: English (EN)
- The application defaults to English interface
- Users can switch to Chinese using the language toggle
- Language preference is stored in localStorage
- Browser language detection only applies on first visit

## Architecture
- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth with Apple Sign-In
- **Database**: Supabase PostgreSQL
- **External APIs**: Strava API for activity synchronization
- **File Processing**: FIT file parser for workout data analysis
- **Charts**: Recharts for data visualization

## Project Status
The website has been successfully refactored into a multi-platform sports ecosystem with comprehensive user management, data analysis capabilities, and equipment tracking features. All major functionality is implemented and ready for production deployment.