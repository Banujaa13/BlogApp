# Blog Application — IN2120 Web Programming

A full-stack, multi-user blog application built with HTML, CSS, JavaScript (frontend REST client), PHP (backend API), and MySQL (database) for the IN2120 Web Programming take-home assignment, Faculty of Information Technology, University of Moratuwa.

## Student Metadata
- **Student Name:** Banujaa
- **Student Index:** 245013X
- **Course:** IN2120 – Web Programming (2026)
- **GitHub Repository:** [https://github.com/Banujaa13/BlogApp.git](https://github.com/Banujaa13/BlogApp.git)
- **Hosted Website URL:** [Add your hosted InfinityFree / 000WebHost URL here]

---

## Key Features
- **User Authentication & Authorization:**
  - Secure user registration, login, and logout.
  - Passwords hashed using standard PHP `password_hash(PASSWORD_DEFAULT)`.
  - Session-based session control (`$_SESSION`).
  - Strict server-side authorization enforcement: authenticated users can only edit or delete **their own** blog posts (`403 Forbidden` returned on unauthorized write attempts).
- **Blog Management (CRUD):**
  - **Create:** Publish new articles using Markdown syntax with live preview.
  - **Read:** Home page lists all blog posts; single post page renders formatted Markdown content.
  - **Update:** Pre-filled blog editor allowing authors to update title and content (refreshes `updated_at`).
  - **Delete:** Author-only deletion with modal confirmation prompt.
- **Modern Responsive Design System:**
  - Glassmorphic UI with dark blue / indigo accent palette, custom typography (Outfit & Inter fonts), hover micro-animations, mobile responsive layout down to 375px.

---

## Tech Stack & Architecture
- **Frontend:** HTML5, CSS3 (Vanilla CSS design system with CSS variables), JavaScript (Fetch API async/await)
- **Markdown Renderer:** Marked.js (CDN)
- **Backend:** PHP 8.x (PDO driver with prepared SQL statements)
- **Database:** MySQL / MariaDB (XAMPP)
- **Database Name:** `blog_app`

---

## Folder Structure
```
BlogApp/
├── frontend/
│   ├── index.html          # Home page — lists all blog posts
│   ├── post.html           # Single blog post view (renders Markdown & owner actions)
│   ├── login.html          # User login form
│   ├── register.html       # User registration form
│   ├── editor.html         # Blog post editor (dual mode: create / edit with preview)
│   ├── css/
│   │   └── style.css       # Unified design system stylesheet
│   └── js/
│       ├── auth.js         # Session check & navbar UI state manager
│       ├── home.js         # Post feed loader & grid renderer
│       ├── post.js         # Single post fetcher & delete flow
│       └── editor.js       # Create/Edit form logic & Markdown preview
├── backend/
│   ├── config/
│   │   └── db.php          # PDO MySQL database connection
│   ├── includes/
│   │   └── auth_check.php  # Reusable auth & ownership enforcement functions
│   └── api/
│       ├── register.php    # Registration REST API
│       ├── login.php       # Login REST API
│       ├── logout.php      # Logout REST API
│       ├── session_check.php# Active session info REST API
│       └── posts.php       # Blog CRUD REST API (GET, POST, PUT, DELETE)
├── database/
│   └── schema.sql          # Database schema script (`user` and `blogPost` tables)
├── .gitignore              # Git ignore rules
├── Blog_Application_PRD.md # Product Requirements Document
├── IN2120- TakeHomeAssignment.pdf # Assignment specification PDF
├── README.md               # Project documentation & setup instructions
└── task.md                 # Assignment progress tracker
```

---

## Database Schema (`database/schema.sql`)

### `user` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | User ID |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Unique handle |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | User email |
| `password` | VARCHAR(255) | NOT NULL | Password hash (`password_hash`) |
| `role` | ENUM('user','admin') | DEFAULT 'user' | Access control level |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration date |

### `blogPost` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Post ID |
| `user_id` | INT | FOREIGN KEY → user(id) ON DELETE CASCADE | Author foreign key |
| `title` | VARCHAR(255) | NOT NULL | Article title |
| `content` | LONGTEXT | NOT NULL | Article content (Markdown) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last updated date |

---

## Local Setup & Running Instructions

1. **Install XAMPP** (Apache + MySQL). Start Apache and MySQL modules in XAMPP Control Panel.
2. Place this repository folder inside your XAMPP `htdocs` folder:
   `C:\xampp\htdocs\BlogApp`
3. **Database Setup:**
   - Open phpMyAdmin (`http://localhost/phpmyadmin`).
   - Create a database named `blog_app`.
   - Import `database/schema.sql` into `blog_app`.
4. **Access Application:**
   - Open browser and navigate to:
     `http://localhost/BlogApp/frontend/index.html`

---

## REST API Specification

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/backend/api/register.php` | `POST` | No | Register new account (`username`, `email`, `password`) |
| `/backend/api/login.php` | `POST` | No | Authenticate user & start session |
| `/backend/api/logout.php` | `POST` | Yes | Destroy active session |
| `/backend/api/session_check.php` | `GET` | No | Check logged-in user state |
| `/backend/api/posts.php` | `GET` | No | Fetch all posts or single post via `?id=X` |
| `/backend/api/posts.php` | `POST` | Yes | Create post (`title`, `content`) |
| `/backend/api/posts.php?id=X` | `PUT` | Yes + Owner | Update post `X` (`title`, `content`) |
| `/backend/api/posts.php?id=X` | `DELETE` | Yes + Owner | Delete post `X` |

---

## Submission Checklist
- [x] Full source code complete and tested locally on XAMPP.
- [x] GitHub repository connected and code pushed.
- [ ] Deploy to free web hosting (e.g. InfinityFree / 000WebHost).
- [ ] Record 3-minute MP4 demonstration video.
- [ ] Create PDF containing GitHub repository link + working hosted URL.
- [ ] Zip submission folder named `245013X.zip`.
