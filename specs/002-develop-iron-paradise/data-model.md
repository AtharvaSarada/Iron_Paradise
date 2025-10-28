# Data Model: Iron Paradise Gym Management System

## Authentication & Profiles
**Purpose**: User authentication and role management via Supabase Auth.

**Profiles Table**:
- id: uuid (references auth.users, primary key)
- email: text (unique, required)
- full_name: text (optional)
- role: text (enum: 'admin', 'member', 'user', required)
- created_at: timestamp (auto-generated)

**Relationships**: Referenced by members table (user_id)

## Members
**Purpose**: Core member information and membership details.

**Fields**:
- id: uuid (primary key, auto-generated)
- user_id: uuid (references profiles.id, optional for non-registered members)
- name: text (required)
- email: text (required)
- phone: text (optional)
- address: text (optional)
- photo_url: text (optional)
- emergency_contact: text (optional)
- join_date: date (required, default: current date)
- package_id: uuid (references packages.id, optional)
- membership_expiry: date (optional)
- status: text (enum: 'active', 'inactive', required, default: 'active')
- created_at: timestamp (auto-generated)
- updated_at: timestamp (auto-generated)

**Relationships**:
- Belongs to: Profiles (user_id), Packages (package_id)
- Has many: Bills, Diet assignments, Notification reads

**Validation Rules**:
- Email: valid format
- Phone: valid format (if provided)
- Membership expiry: after join date (if set)
- Status transitions: admin controlled

## Packages
**Purpose**: Membership package definitions with pricing and features.

**Fields**:
- id: uuid (primary key, auto-generated)
- name: text (required)
- duration: text (required, e.g., 'monthly', 'quarterly', 'yearly')
- price: decimal(10,2) (required, > 0)
- features: jsonb (array of feature strings, required)
- is_popular: boolean (default: false)
- created_at: timestamp (auto-generated)

**Relationships**:
- Has many: Members

**Validation Rules**:
- Price: positive number
- Name: unique
- Features: non-empty array

## Bills
**Purpose**: Billing records and payment tracking.

**Fields**:
- id: uuid (primary key, auto-generated)
- member_id: uuid (references members.id, required, cascade delete)
- amount: decimal(10,2) (required, > 0)
- bill_date: date (required, default: current date)
- due_date: date (required)
- status: text (enum: 'paid', 'pending', 'overdue', required, default: 'pending')
- package_name: text (required)
- description: text (optional)
- created_at: timestamp (auto-generated)

**Relationships**:
- Belongs to: Members

**Validation Rules**:
- Due date: not in past for new bills
- Amount: matches package price
- Status: logical transitions (pending → paid/overdue)

**State Transitions**:
- pending → paid (payment recorded)
- pending → overdue (due date passed)
- overdue → paid (late payment)

## Notifications
**Purpose**: Admin communications sent to members.

**Fields**:
- id: uuid (primary key, auto-generated)
- title: text (required)
- message: text (required)
- priority: text (enum: 'low', 'normal', 'high', required, default: 'normal')
- created_at: timestamp (auto-generated)

**Relationships**:
- Has many: Notification reads (many-to-many with members)

## Notification Reads
**Purpose**: Tracks which members have read which notifications.

**Fields**:
- notification_id: uuid (references notifications.id, cascade delete)
- member_id: uuid (references members.id, cascade delete)
- read_at: timestamp (required, default: now)

**Primary Key**: (notification_id, member_id)

**Relationships**:
- Belongs to: Notifications, Members

## Supplements
**Purpose**: Gym supplement products catalog.

**Fields**:
- id: uuid (primary key, auto-generated)
- name: text (required)
- description: text (optional)
- price: decimal(10,2) (required, > 0)
- stock_level: integer (required, >= 0)
- image_url: text (optional)
- category: text (optional)
- created_at: timestamp (auto-generated)

**Relationships**: None

**Validation Rules**:
- Price: positive
- Stock level: non-negative

## Diets
**Purpose**: Diet plan templates for members.

**Fields**:
- id: uuid (primary key, auto-generated)
- name: text (required)
- description: text (optional)
- meals: jsonb (array of meal objects, required)
- total_calories: integer (required, > 0)
- created_at: timestamp (auto-generated)

**Relationships**:
- Has many: Diet assignments (many-to-many with members)

**Validation Rules**:
- Meals: valid JSON structure with time, name, calories
- Total calories: positive

## Diet Assignments
**Purpose**: Links diets to assigned members.

**Fields**:
- diet_id: uuid (references diets.id, cascade delete)
- member_id: uuid (references members.id, cascade delete)
- assigned_date: date (required, default: current date)

**Primary Key**: (diet_id, member_id)

**Relationships**:
- Belongs to: Diets, Members

## Activity Logs
**Purpose**: Comprehensive logging of all system activities.

**Fields**:
- id: uuid (primary key, auto-generated)
- user_id: uuid (references profiles.id, optional)
- action_type: text (required)
- details: jsonb (optional, structured data)
- ip_address: text (optional)
- timestamp: timestamp (required, default: now)

**Relationships**:
- Belongs to: Profiles (optional)

**Validation Rules**:
- Action type: from predefined list
- Details: valid JSON

## Database Security & Policies

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies based on user roles from JWT claims

### Key Policies
- **Admin Access**: Full CRUD on all tables
- **Member Access**: Read/write own data, read packages and notifications
- **Public Access**: Read-only access to packages and basic gym info

### Authentication Flow
1. User authenticates via Supabase Auth
2. JWT token includes role claim
3. Frontend routes based on role
4. Database queries filtered by RLS policies

## Indexes for Performance
- Members: email, status, package_id
- Bills: member_id, status, due_date
- Notifications: created_at
- Activity Logs: user_id, timestamp, action_type

## Triggers
- Updated_at triggers on members and packages tables
- Automatic status updates for overdue bills
- Audit logging triggers for critical operations
