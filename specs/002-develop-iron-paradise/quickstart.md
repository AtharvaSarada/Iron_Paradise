# Quickstart Guide: Iron Paradise Gym Management System

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher (LTS recommended)
- **npm** or **yarn**: Package manager
- **Git**: Version control system
- **Supabase Account**: Free account at supabase.com

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd iron-paradise
git checkout 002-develop-iron-paradise
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

The project includes all necessary dependencies for the tech stack.

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For development
VITE_APP_ENV=development
```

Get these values from your Supabase project dashboard under Settings > API.

### 4. Supabase Setup

#### Create a New Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned (5-10 minutes)

#### Database Schema
Run the SQL migration in Supabase SQL Editor:

```sql
-- Authentication Flow
-- Users table (managed by Supabase Auth + custom fields)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'member', 'user')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  photo_url TEXT,
  emergency_contact TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  package_id UUID REFERENCES packages(id),
  membership_expiry DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  bill_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  package_name TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification reads (many-to-many)
CREATE TABLE notification_reads (
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (notification_id, member_id)
);

-- Supplements table
CREATE TABLE supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_level INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Diets table
CREATE TABLE diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  meals JSONB,
  total_calories INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Diet assignments (many-to-many)
CREATE TABLE diet_assignments (
  diet_id UUID REFERENCES diets(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  assigned_date DATE DEFAULT CURRENT_DATE,
  PRIMARY KEY (diet_id, member_id)
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admin can see everything
CREATE POLICY admin_all ON members FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Members can only see their own data
CREATE POLICY member_own ON members FOR SELECT USING (
  user_id = auth.uid()
);

-- Similar policies needed for other tables
```

#### Authentication Setup
1. Go to Authentication > Settings in Supabase dashboard
2. Configure email templates
3. Set up password requirements
4. Enable email confirmations if desired

#### Storage Setup
1. Go to Storage in Supabase dashboard
2. Create buckets: `member-photos`, `supplement-images`
3. Set up security policies for file access

### 5. Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173` (Vite default).

### 6. Testing

Run the test suite:

```bash
# Unit tests
npm run test:unit

# E2E tests (requires dev server running)
npm run test:e2e

# All tests
npm run test
```

### 7. Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 8. Deployment

#### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Alternative (Netlify)
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables

## Development Workflow

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use conventional commits

### Component Structure
```javascript
// Standard component template
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleAction = () => {
    // Event handler logic
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Component JSX */}
    </motion.div>
  );
}
```

### Service Layer Pattern
```javascript
// services/member.service.js
import { supabase } from '@/config/supabase';
import { logAction } from './logging.service';

export const memberService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      logAction('member_fetch_error', { error: error.message });
      throw error;
    }
  },

  async create(memberData) {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select();
      
      if (error) throw error;
      logAction('member_created', { memberId: data[0].id });
      return data[0];
    } catch (error) {
      logAction('member_create_error', { error: error.message });
      throw error;
    }
  },
  
  // ... other CRUD methods
};
```

### Animation Variants
```javascript
// utils/animations.js
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
  transition: { duration: 0.3 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const listItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};
```

### Branching Strategy
- `main`: Production-ready code
- `002-develop-iron-paradise`: Feature branch for gym system
- Create feature branches from the feature branch for specific tasks

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run test`: Run all tests
- `npm run test:unit`: Run unit tests
- `npm run test:e2e`: Run E2E tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up project structure with Vite + React
- Configure Tailwind, Framer Motion, shadcn/ui
- Set up Supabase project and database schema
- Implement authentication system
- Create basic routing and layouts
- Set up logging service

### Phase 2: Admin Features (Week 2-3)
- Build admin dashboard with analytics
- Implement member management (CRUD)
- Create package management system
- Build billing system
- Implement notification composer
- Add supplement store management
- Create diet management interface
- Build reporting and export functionality

### Phase 3: Member Features (Week 4)
- Build member dashboard
- Create bill viewing interface
- Implement notification center
- Add profile viewing
- Build payment history timeline
- Add PDF download for receipts

### Phase 4: Public Features (Week 5)
- Design animated hero section
- Create package browsing page
- Build inquiry/contact form
- Add gym details and information pages

### Phase 5: Polish & Testing (Week 6)
- Implement all animations and micro-interactions
- Add loading states and error handling
- Write tests for critical paths
- Optimize performance (code splitting, lazy loading)
- Conduct user testing and fix bugs
- Write comprehensive documentation

### Phase 6: Deployment (Week 7)
- Set up CI/CD pipeline
- Deploy frontend to Vercel/Netlify
- Configure environment variables
- Test in production environment
- Monitor logs and fix issues
- Create demo accounts for showcase

## Troubleshooting

### Common Issues

1. **Supabase connection fails**
   - Check `.env.local` file exists and has correct values
   - Verify Supabase project is active
   - Check CORS settings in Supabase

2. **Authentication not working**
   - Ensure RLS policies are set up correctly
   - Check Supabase auth settings
   - Verify JWT token handling

3. **Real-time updates not working**
   - Check Supabase real-time is enabled
   - Verify table has real-time enabled
   - Check network connectivity

4. **Build fails**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

### Performance Optimization
- Code splitting with dynamic imports
- Image optimization (WebP, lazy loading)
- Bundle analysis and tree-shaking
- CDN for static assets

### Security Considerations
- All data access through RLS policies
- Secure password hashing via Supabase
- Input validation on client and server
- HTTPS only in production

## Success Metrics

- Page load time < 3s
- Lighthouse score > 90
- Zero console errors
- All animations at 60fps
- 100% feature completion
- Test coverage > 80%
- Zero critical security issues

## Next Steps

After setup:
1. Run the application and verify basic functionality
2. Implement authentication flow
3. Start with admin dashboard
4. Gradually implement member and public features
5. Add comprehensive testing
6. Optimize performance and animations
