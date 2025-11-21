# 🏗️ Technical Overview - DatingAssistent Platform

**Laatst bijgewerkt:** 8 november 2025

---

## 📊 DATABASE STRUCTURE

### **Database Provider:** Neon PostgreSQL (Serverless)
**Connection:** Via `@vercel/postgres`

### **Core Tables:**

#### **1. USERS TABLE**
```sql
users (27 rows)
├── id (primary key)
├── email (unique)
├── password_hash
├── display_name
├── role ('user' | 'admin')
├── subscription_type ('free' | 'sociaal' | 'core' | 'pro' | 'premium')
├── subscription_status ('active' | 'inactive')
├── subscription_start_date
├── subscription_end_date
├── created_at
├── updated_at
└── last_login
```

**Usage:**
- Authentication & authorization
- Subscription management
- Admin role management

---

#### **2. COURSES TABLE**
```sql
courses (8 rows)
├── id (primary key)
├── title
├── description
├── thumbnail_url
├── level ('beginner' | 'intermediate' | 'advanced')
├── is_free (boolean)
├── price (decimal)
├── duration_hours
├── is_published (boolean)
├── position (for ordering)
├── created_at
└── updated_at
```

**Current Courses:**
- 5 Gratis cursussen
- 3 Betaalde cursussen

---

#### **3. COURSE_MODULES TABLE**
```sql
course_modules
├── id (primary key)
├── course_id (foreign key → courses)
├── title
├── description
├── position
├── created_at
└── updated_at
```

---

#### **4. COURSE_LESSONS TABLE**
```sql
course_lessons
├── id (primary key)
├── module_id (foreign key → course_modules)
├── title
├── description
├── content (text)
├── lesson_type ('video' | 'audio' | 'text' | 'quiz' | 'assignment')
├── video_url (nullable)
├── video_duration (nullable)
├── is_preview (boolean)
├── position
├── created_at
└── updated_at
```

---

#### **5. PROGRESS TRACKING**

**USER_COURSE_PROGRESS**
```sql
user_course_progress (0 rows currently)
├── id
├── user_id (foreign key → users)
├── course_id (foreign key → courses)
├── enrolled_at
├── completed_at
├── progress_percentage (0-100)
└── last_accessed_at
```

**USER_LESSON_PROGRESS**
```sql
user_lesson_progress (0 rows currently)
├── id
├── user_id
├── lesson_id
├── is_completed
├── completed_at
└── watch_time_seconds
```

**USER_LESSON_RESPONSES**
```sql
user_lesson_responses (0 rows currently)
├── id
├── user_id
├── lesson_id
├── response_text (user's answers/reflections)
├── created_at
└── updated_at
```

---

#### **6. BLOG & CONTENT**

**BLOG_POSTS** (9 rows)
```sql
├── id
├── slug (unique URL)
├── title
├── excerpt
├── content (HTML)
├── featured_image
├── author
├── published (boolean)
├── published_at
├── seo_title
├── seo_description
├── keywords (array)
├── view_count
└── created_at/updated_at
```

---

#### **7. COMMUNITY FEATURES**

- **FORUM_POSTS** - Community discussions
- **FORUM_COMMENTS** - Replies to posts
- **FORUM_REACTIONS** - Likes/reactions
- **PODCASTS** - Dating advice podcasts
- **REVIEWS** - User reviews/testimonials

---

#### **8. GAMIFICATION**

- **BADGES** (18 types) - Achievement badges
- **USER_BADGES** - User badge assignments
- **USER_POINTS** - Point system for engagement

---

## 🔌 API ENDPOINTS

### **Authentication APIs**

#### `/api/auth/login` - POST
**Input:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Output:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "User Name",
    "subscription": "free"
  },
  "token": "jwt_token_here"
}
```

#### `/api/auth/register` - POST
**Input:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "User Name"
}
```

#### `/api/auth/verify` - GET
Returns current user session

---

### **Course APIs**

#### `/api/courses` - GET
Returns all published courses for user

#### `/api/courses/by-slug/[slug]` - GET
Get single course by slug

#### `/api/admin/courses` - GET/POST (Admin only)
Manage courses

---

### **AI-Powered APIs**

#### 1️⃣ **IJsbreker Generator** - `/api/bio-generator`

**Method:** POST
**Authentication:** Required
**Rate Limit:** 10 requests/hour

**Input:**
```json
{
  "hobby": "hiking",
  "context": "dating app opening message"
}
```

**Output:**
```json
{
  "suggestions": [
    "Hey! I zie dat je van wandelen houdt - wat was je mooiste route tot nu toe?",
    "Hiking fan hier! Heb je tips voor mooie wandelroutes in Nederland?",
    "Je profielfoto met rugzak trekt mijn aandacht - waar was dat?"
  ]
}
```

**Behind the scenes:**
- Uses OpenRouter API
- Model: `meta-llama/llama-3.1-8b-instruct:free`
- Generates 3 personalized opening messages
- Context-aware based on user profile

---

#### 2️⃣ **Chat Coach** - `/api/chat-coach`

**Method:** POST
**Authentication:** Required
**Rate Limit:** 10 requests/hour

**Input:**
```json
{
  "message": "Hoi, hoe gaat het?",
  "context": "first message"
}
```

**Output:**
```json
{
  "analysis": {
    "score": 6,
    "feedback": "Je bericht is vriendelijk maar generiek. Probeer specifieker te zijn!",
    "suggestions": [
      "Refereer naar iets in hun profiel",
      "Stel een open vraag",
      "Voeg humor toe"
    ]
  },
  "improved_version": "Hey! Ik zag dat je van yoga houdt - hoe lang doe je dat al?"
}
```

**Behind the scenes:**
- Uses OpenRouter API
- Analyzes message quality
- Provides actionable feedback
- Suggests improvements

---

#### 3️⃣ **Foto Advies API** - `/api/recommendations`

**Status:** ⚠️ Currently implemented but needs enhancement

**Method:** GET
**Authentication:** Required

**Current Input:**
```
?userId=123
```

**Current Output:**
```json
{
  "recommendations": [
    {
      "type": "photo",
      "advice": "Voeg een groepsfoto toe",
      "priority": "high"
    }
  ]
}
```

**Potential Enhancement:**
```json
{
  "photo_url": "base64_encoded_image",
  "analyze": true
}
```

**Desired Output:**
```json
{
  "score": 7.5,
  "analysis": {
    "lighting": "good",
    "composition": "needs improvement",
    "authenticity": "excellent"
  },
  "tips": [
    "Probeer meer natuurlijk licht",
    "Zoom iets meer uit voor betere compositie",
    "Foto straalt authenticiteit uit - behoud dit!"
  ]
}
```

**Note:** Photo analysis requires image processing API (not yet implemented)

---

## 📧 EMAIL SERVICE

### **Current Status:** ⚠️ Not yet configured

**Recommended Services:**

#### **Option 1: Resend** (Recommended)
```bash
npm install resend
```

**Why Resend:**
- ✅ Simple API
- ✅ 100 emails/day free
- ✅ React Email templates
- ✅ Great deliverability

**Setup:**
```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'DatingAssistent <noreply@datingassistent.nl>',
    to: email,
    subject: 'Welkom bij DatingAssistent!',
    html: '<h1>Welkom {name}!</h1>'
  });
}
```

#### **Option 2: SendGrid**
- Enterprise-grade
- 100 emails/day free
- Complex setup

#### **Option 3: Mailchimp**
- Marketing focus
- Not ideal for transactional emails

---

## 🎯 API USAGE EXAMPLES

### **IJsbreker Generator Flow:**

```typescript
// Frontend component
const generateOpeners = async () => {
  const response = await fetch('/api/bio-generator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      hobby: userInput,
      context: 'opening message'
    })
  });

  const data = await response.json();
  // data.suggestions = [message1, message2, message3]
};
```

---

## 🔐 SECURITY FEATURES

### **Implemented:**
- ✅ JWT authentication with HttpOnly cookies
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on AI endpoints
- ✅ XSS protection with DOMPurify
- ✅ SQL injection protection (parameterized queries)
- ✅ Webhook signature verification (MultiSafePay)

### **Environment Variables Required:**
```bash
# Database
POSTGRES_URL=

# Authentication
JWT_SECRET=

# AI Services
OPENROUTER_API_KEY=

# Payment
MULTISAFEPAY_API_KEY=
MULTISAFEPAY_WEBHOOK_SECRET=

# Email (when configured)
RESEND_API_KEY=
```

---

## 📈 PROGRESS TRACKING SYSTEM

### **How it works:**

1. **User enrolls** → `user_course_progress` row created
2. **User completes lesson** → `user_lesson_progress` updated
3. **Progress calculation:**
   ```typescript
   progress = (completed_lessons / total_lessons) * 100
   ```

4. **Completion detection:**
   ```typescript
   if (progress === 100) {
     completed_at = now()
     // Award certificate/badge
   }
   ```

---

## 🎨 VIDEO STORAGE

**Current Location:** `public/uploads/videos/`

**Format:** `video_{timestamp}_{random}.mp4`

**Example:**
```
video_1762610171020_whul55xqwse.mp4
```

**Access:** `/uploads/videos/video_xxx.mp4`

**Database Link:** `video_url` column in `course_lessons` table

---

## 🔄 SYNC SYSTEM (FIXED)

**Previous Issue:** ⚠️ Sync overwrote manual content

**Current Behavior:** ✅ Safe mode
- Checks for custom content before sync
- Skips reset if video URLs or content exist
- Only syncs empty courses

```typescript
// Sync safety check
if (hasCustomContent) {
  console.warn('Course has custom content - skipping reset');
  return;
}
```

---

## 📝 TODO: Missing Features

### **1. Email Integration**
- [ ] Configure Resend API
- [ ] Welcome email template
- [ ] Password reset email
- [ ] Course completion email
- [ ] Weekly digest email

### **2. Photo Analysis Enhancement**
- [ ] Integrate image processing API
- [ ] Score calculation algorithm
- [ ] Tip generation based on analysis

### **3. Progress Tracking**
- [x] Database structure ✅
- [ ] Frontend UI components
- [ ] Certificate generation
- [ ] Badge awarding logic

### **4. Video Recovery**
- [ ] Restore lost video links for course ID 12
- [ ] Document video-to-lesson mapping

---

## 🚀 DEPLOYMENT CHECKLIST

### **Before Going Live:**

1. ✅ Database structure complete
2. ✅ Authentication system secure
3. ✅ Admin panel functional
4. ✅ AI endpoints rate-limited
5. ⚠️ Email service (pending)
6. ⚠️ Video content restoration (pending)
7. ✅ Payment integration (MultiSafePay)
8. ⚠️ Environment variables set

---

## 📞 SUPPORT & MAINTENANCE

**Key Scripts:**
- `node check-courses.js` - Verify course data
- `node check-admin.js` - Verify admin users
- `node show-database-structure.js` - Full DB overview

**Database Access:**
- Neon Console: https://console.neon.tech/

**Admin Panel:**
- Local: http://localhost:9001/admin
- Production: https://yourdomain.com/admin

---

**Document Created:** November 8, 2025
**Status:** Ready for production (with noted exceptions)
