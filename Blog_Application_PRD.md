# Product Requirements Document (PRD)
## Blog Application — IN2120 Web Programming Take-Home Assignment

**Institution:** University of Moratuwa, Faculty of Information Technology
**Course:** IN2120 – Web Programming (2026)
**Document owner:** [Banujaa / 245013X]
**Stack:** HTML, CSS, JavaScript (frontend) · PHP (backend) · MySQL (database)

---

## 1. Overview

### 1.1 Purpose
Build a full-stack, multi-user blog application demonstrating authentication, authorization, CRUD operations, and deployment of a PHP/MySQL web app to a public host.

### 1.2 Goals
- Users can register, log in, and manage their own blog posts securely.
- All visitors (logged in or not) can read all blog posts.
- Only the post's author can edit or delete it.
- The app is deployed live and publicly accessible.

### 1.3 Out of scope (unless you want to go further for extra polish)
- Comments, likes, tags/categories, search, pagination, image uploads — none of these are required by the spec, but can be added as bonus polish if time allows. Don't let them block core requirements.

---

## 2. User Roles

| Role | Description | Permissions |
|---|---|---|
| **Guest** (not logged in) | Anyone visiting the site | Read all blogs, register, log in |
| **Authenticated User** | Registered, logged-in user | Read all blogs; create own blogs; edit/delete **only their own** blogs |
| **Admin** (optional, `role` column supports it) | Elevated user | Same as authenticated user at minimum; you may optionally extend to moderate all posts, but this is not a strict requirement |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
| ID | Requirement |
|---|---|
| FR-1 | User can register with username, email, password |
| FR-2 | Passwords must be hashed (`password_hash()`), never stored in plain text |
| FR-3 | User can log in with email/username + password |
| FR-4 | On successful login, a PHP session is created |
| FR-5 | User can log out, destroying the session |
| FR-6 | Unauthenticated users cannot access create/edit/delete actions (redirect to login) |
| FR-7 | Authenticated users can only edit/delete posts where `blogPost.user_id == session user id` — enforced **server-side**, not just hidden in the UI |
| FR-8 | Attempting to edit/delete another user's post returns a 403/error, not a silent failure |

### 3.2 Blog Management (CRUD)
| ID | Requirement |
|---|---|
| FR-9 | Authenticated user can create a new post (title + content, Markdown supported) |
| FR-10 | All users (including guests) can view a list of all posts on the home page |
| FR-11 | All users can open a single post to view full content, author name, and date |
| FR-12 | Author can update their own post's title/content |
| FR-13 | Author can delete their own post (with confirmation prompt) |
| FR-14 | `updated_at` timestamp refreshes on edit |

### 3.3 Frontend Pages
| Page | Purpose | Access |
|---|---|---|
| `index.html` / Home | List all blog posts (title, snippet, author, date) | Public |
| `post.html?id=` | Single blog view (full content, author, date) | Public |
| `login.html` | Login form | Public |
| `register.html` | Registration form | Public |
| `editor.html` (create) | Blog editor — new post | Auth only |
| `editor.html?id=` (edit) | Blog editor — pre-filled for editing | Auth + owner only |
| Navbar | Shows Login/Register when logged out; shows username + Logout + "New Post" when logged in | All |

---

## 4. Database Design

### 4.1 `user` table
| Column | Type | Notes |
|---|---|---|
| id | INT, PK, AUTO_INCREMENT | |
| username | VARCHAR(50), UNIQUE, NOT NULL | |
| email | VARCHAR(100), UNIQUE, NOT NULL | |
| password | VARCHAR(255), NOT NULL | store hashed value |
| role | ENUM('user','admin') DEFAULT 'user' | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | recommended, not strictly required |

### 4.2 `blogPost` table
| Column | Type | Notes |
|---|---|---|
| id | INT, PK, AUTO_INCREMENT | |
| user_id | INT, FK → user(id), NOT NULL | |
| title | VARCHAR(255), NOT NULL | |
| content | TEXT / LONGTEXT, NOT NULL | stores Markdown or HTML |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### 4.3 Sample SQL
```sql
CREATE DATABASE blog_app;
USE blog_app;

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blogPost (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

---

## 5. Backend API Design (PHP endpoints)

Use either a REST-style JSON API (fetch() from JS) or classic form POST + PHP redirect. A JSON API is cleaner and recommended.

| Endpoint | Method | Auth required | Description |
|---|---|---|---|
| `/api/register.php` | POST | No | Create new user |
| `/api/login.php` | POST | No | Verify credentials, start session |
| `/api/logout.php` | POST | Yes | Destroy session |
| `/api/session_check.php` | GET | No | Return current logged-in user (or null) |
| `/api/posts.php` | GET | No | List all posts |
| `/api/posts.php?id=1` | GET | No | Get single post |
| `/api/posts.php` | POST | Yes | Create new post |
| `/api/posts.php?id=1` | PUT/POST | Yes + owner | Update post |
| `/api/posts.php?id=1` | DELETE/POST | Yes + owner | Delete post |

**Security checklist for every write endpoint:**
1. Check `$_SESSION['user_id']` exists → else 401
2. Use prepared statements for all queries
3. For update/delete: fetch the post, compare `post.user_id === $_SESSION['user_id']` → else 403
4. Sanitize/escape output when rendering (prevent XSS from post content)
5. Validate input (non-empty title/content, valid email format, password length)

---

## 6. Suggested Folder Structure

```
blog-app/
├── frontend/
│   ├── index.html
│   ├── post.html
│   ├── login.html
│   ├── register.html
│   ├── editor.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── home.js
│       ├── post.js
│       └── editor.js
├── backend/
│   ├── config/
│   │   └── db.php            # PDO connection
│   ├── api/
│   │   ├── register.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── session_check.php
│   │   └── posts.php
│   └── includes/
│       └── auth_check.php    # reusable auth/ownership check
├── database/
│   └── schema.sql
└── README.md
```

---

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Responsive UI (usable on mobile and desktop widths) |
| NFR-2 | Clean, consistent styling (single CSS file or design system) |
| NFR-3 | Passwords hashed; SQL via prepared statements only |
| NFR-4 | Reasonable page load performance (no blocking scripts) |
| NFR-5 | Graceful error handling (invalid login, empty fields, DB errors shown as user-friendly messages, not raw PHP errors) |
| NFR-6 | Hosted version has full feature parity with local version |

---

## 8. Acceptance Criteria (self-check before submission)

- [ ] Register → new row appears in `user` table with hashed password
- [ ] Login → session persists across pages; logout clears it
- [ ] Logged-out user cannot see "New Post" / edit / delete controls
- [ ] Logged-in User A cannot edit/delete User B's post (test with two accounts)
- [ ] New post appears immediately on home page after creation
- [ ] Single post view shows correct title, content, author, date
- [ ] Edit updates the post and `updated_at`
- [ ] Delete removes the post and it disappears from home page
- [ ] Site is responsive at mobile width (~375px)
- [ ] Hosted URL works and matches local functionality exactly
- [ ] GitHub repo is complete and pushed
- [ ] PDF with GitHub link + hosted link created
- [ ] 3-minute MP4 demo recorded covering all required flows
- [ ] Final submission folder named with index number, zipped correctly

---

## 9. Suggested Build Order / Milestones

1. **Setup** — local server running, DB + tables created, GitHub repo initialized
2. **Auth backend** — register.php, login.php, logout.php, session_check.php + test with Postman/curl
3. **Auth frontend** — register.html, login.html, navbar logic showing logged-in state
4. **Posts backend** — posts.php (GET list, GET single, POST create) + ownership checks for update/delete
5. **Posts frontend** — home page (list), single post page, editor page (create)
6. **Edit/Delete flow** — editor.html pre-fill for edit, delete button with confirm + ownership enforcement
7. **Styling pass** — responsive CSS across all pages
8. **Deploy** — push to InfinityFree/000WebHost, import DB, update config, retest every feature live
9. **Record demo video**
10. **Package submission** — PDF with links, zip folder, final check against Section 8 checklist

---

## 10. Submission Checklist (from assignment spec)

1. Full source code
2. Pushed to GitHub
3. PDF containing: GitHub repo link + hosted website link (must be working)
4. 3-minute MP4 demo video showing: registration/login, create/update/delete, viewing (list + single), hosted site access
5. All of the above placed in one folder named with your **student index number**, then zipped
