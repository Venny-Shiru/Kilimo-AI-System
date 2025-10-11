# Kilimo(Agri)protect AI - Technical Architecture

## System Overview

Kilimo(Agri)protect AI is a full-stack environmental monitoring and land restoration platform built with modern web technologies and AI capabilities.

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │  Map Viewer  │  │  Analytics   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Restoration │  │Notifications │  │     Auth     │      │
│  │   Planner    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Next.js API Routes)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Environmental │  │  Restoration │  │      AI      │      │
│  │     Data     │  │   Projects   │  │Recommendations│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Supabase   │ │  Vercel AI   │ │  External    │
    │  (Database)  │ │     SDK      │ │  APIs        │
    └──────────────┘ └──────────────┘ └──────────────┘
\`\`\`

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React hooks, SWR for data fetching

### Backend
- **API**: Next.js API Routes (serverless functions)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: Vercel AI SDK with OpenAI GPT-4

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Environment**: Serverless

## Database Schema

### Core Tables

#### profiles
- User profiles extending Supabase auth
- Roles: admin, manager, analyst, viewer
- Organization tracking

#### environmental_data
- NDVI values (vegetation health)
- Soil health scores
- Erosion risk levels
- Land use classification
- Degradation levels
- Supports multiple data sources (satellite, sensor, manual)

#### restoration_projects
- Project metadata and status tracking
- Budget allocation and spending
- Success rate estimates
- Links to creators (users)

#### restoration_techniques
- Specific techniques per project
- Cost estimates and priorities
- Categories: planting, soil conservation, water management

#### plant_species
- Recommended species per project
- Survival rates and costs
- Planting season information

#### notifications
- User-specific alerts
- Categorized by type and severity
- Read/unread tracking

#### sensor_data
- Real-time IoT sensor readings
- Soil moisture, temperature, rainfall
- Geolocation data

## API Endpoints

### Environmental Data
- `GET /api/environmental-data` - Fetch environmental metrics
- `POST /api/environmental-data` - Add new measurements
- Query params: `regionId` for filtering

### Restoration Projects
- `GET /api/restoration-projects` - List all projects
- `POST /api/restoration-projects` - Create new project
- Query params: `status` for filtering

### AI Recommendations
- `POST /api/ai/recommendations` - Generate AI-powered restoration recommendations
- Input: Region data (NDVI, soil health, erosion risk, etc.)
- Output: Plant species, soil techniques, water management strategies

### Notifications
- `GET /api/notifications` - Fetch user notifications
- `PATCH /api/notifications` - Mark as read/unread
- Query params: `unreadOnly` for filtering

## AI Integration

### Restoration Recommendations Engine

**Model**: OpenAI GPT-4o-mini via Vercel AI SDK

**Input Parameters**:
- Region name and location
- NDVI value (vegetation health)
- Soil health score
- Erosion risk level
- Degradation level
- Area size in hectares
- Climate information

**Output**:
- Native plant species recommendations (3-5 species)
  - Common and scientific names
  - Survival rate estimates
  - Cost per unit
  - Optimal planting seasons
- Soil conservation techniques (2-4 techniques)
  - Implementation details
  - Cost estimates
  - Priority rankings
- Water management strategies (2-3 strategies)
  - Technique descriptions
  - Cost estimates
- Overall success rate estimate
- Reasoning and justification

**Fallback**: Hardcoded recommendations for Kenya-specific restoration if AI fails

## External Data Integration (Future)

### Satellite Imagery APIs
- **NASA MODIS**: NDVI and vegetation indices
- **Sentinel Hub**: Multispectral imagery
- **Google Earth Engine**: Historical land use data

### Weather Data
- **OpenWeatherMap**: Current conditions
- **Climate Data Store**: Historical climate data

### GIS Services
- **Mapbox**: Base maps and geocoding
- **OpenStreetMap**: Land use classification

## Security

### Authentication
- Supabase Auth with email/password
- JWT tokens for session management
- Middleware for token refresh

### Authorization
- Row Level Security (RLS) policies in Supabase
- Role-based access control (RBAC)
- API route protection with user verification

### Data Protection
- HTTPS only
- Environment variables for secrets
- SQL injection prevention via Supabase client
- XSS protection via React

## Performance Optimization

### Frontend
- Server-side rendering (SSR) for initial load
- Client-side data fetching with SWR
- Image optimization with Next.js Image
- Code splitting and lazy loading

### Backend
- Database indexing on frequently queried fields
- Connection pooling via Supabase
- Serverless function optimization
- Edge caching where appropriate

### Database
- Indexes on: region_id, measurement_date, user_id, status
- Query optimization with proper joins
- Pagination for large datasets

## Deployment

### Development
\`\`\`bash
npm run dev
\`\`\`

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Environment Variables Required
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### Vercel Deployment
- Automatic deployments from Git
- Environment variables configured in Vercel dashboard
- Supabase integration connected

## Monitoring & Logging

### Application Monitoring
- Vercel Analytics for performance
- Error tracking with console.error
- Custom [v0] prefixed logs for debugging

### Database Monitoring
- Supabase dashboard for query performance
- Connection pool monitoring
- Storage usage tracking

## Future Enhancements

### Phase 1: Enhanced Data Integration
- Real-time satellite imagery integration
- IoT sensor network expansion
- Weather API integration
- Automated data collection pipelines

### Phase 2: Advanced AI Features
- Computer vision for satellite image analysis
- Predictive degradation modeling
- Automated alert generation
- Success prediction ML models

### Phase 3: Mobile Application
- React Native mobile app
- Offline data collection
- GPS-based field surveys
- Photo documentation

### Phase 4: Collaboration Features
- Multi-user project collaboration
- Document sharing and versioning
- Real-time chat and comments
- Stakeholder reporting tools

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint + Prettier for formatting
- Component-based architecture
- Functional components with hooks

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows
- Manual testing for UI/UX

### Git Workflow
- Feature branches from main
- Pull requests for code review
- Semantic commit messages
- Automated deployments on merge

## Support & Documentation

### Developer Resources
- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- Vercel AI SDK: https://sdk.vercel.ai/docs
- shadcn/ui: https://ui.shadcn.com

### API Documentation
- OpenAPI/Swagger spec (to be added)
- Postman collection (to be added)
- GraphQL schema (future consideration)

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: Development Team
