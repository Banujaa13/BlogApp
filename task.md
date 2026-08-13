# Task Tracker — Blog Application (IN2120)

> **Student Index:** 245013X  
> **Repository:** [https://github.com/Banujaa13/BlogApp.git](https://github.com/Banujaa13/BlogApp.git)

---

## Current Status
**Last updated:** 2026-08-13  
**Currently working on:** Local codebase & database setup completed and verified; Git repository linked to remote; ready for deployment & video recording.  
**Blocked on:** None.  
**Next action when I resume:** Deploy codebase to free web hosting (InfinityFree/000WebHost), record 3-minute demonstration video, generate final submission PDF and zip.

---

## Environment Setup
- [x] XAMPP installed, Apache + MySQL running
- [x] phpMyAdmin accessible, `blog_app` database created
- [x] `user` and `blogPost` tables created
- [x] Git installed, GitHub repo created & connected (`https://github.com/Banujaa13/BlogApp.git`)
- [x] Antigravity IDE installed and project folder opened
- [ ] Free hosting account (InfinityFree/000WebHost) registered
- [ ] Test PHP file successfully deployed to hosting (confirms account works)

## Phase 1 — Backend: Auth
- [x] `backend/config/db.php` created and tested (PDO connection working)
- [x] `backend/api/register.php` created
  - [x] Tested: new user appears in `user` table
  - [x] Tested: password is hashed with `password_hash()`, not plain text
  - [x] Tested: duplicate email/username rejected
- [x] `backend/api/login.php` created
  - [x] Tested: correct credentials → session starts
  - [x] Tested: wrong password → rejected (401 response)
- [x] `backend/api/logout.php` created
  - [x] Tested: session destroyed, can't access protected actions after
- [x] `backend/api/session_check.php` created
  - [x] Tested: returns correct logged-in user info

## Phase 2 — Frontend: Auth Pages
- [x] `register.html` + JS wired to `register.php` with client validation
- [x] `login.html` + JS wired to `login.php` with error handling
- [x] Navbar shows Login/Register when logged out
- [x] Navbar shows username + Logout + "New Post" when logged in

## Phase 3 — Backend: Blog CRUD
- [x] `backend/api/posts.php` — GET (list all posts)
- [x] `backend/api/posts.php` — GET single post by id
- [x] `backend/api/posts.php` — POST create (auth required)
- [x] `backend/api/posts.php` — update (auth + ownership check)
- [x] `backend/api/posts.php` — delete (auth + ownership check)
- [x] Tested: User A cannot edit/delete User B's post (403 Forbidden verified)

## Phase 4 — Frontend: Blog Pages
- [x] `index.html` — home page listing all posts in responsive grid
- [x] `post.html` — single post view (content, author, date, markdown rendering)
- [x] `editor.html` — create mode with live Markdown preview
- [x] `editor.html` — edit mode (pre-filled, author ownership enforced)
- [x] Delete button with confirmation modal prompt
- [x] Markdown editor & viewer integrated (Marked.js CDN)

## Phase 5 — Styling
- [x] Shared CSS (`frontend/css/style.css`) applied consistently across all pages
- [x] Responsive check at mobile width (~375px)

## Phase 6 — Deployment
- [ ] Hosting account ready (from Environment Setup)
- [ ] Database exported from local phpMyAdmin and imported to host
- [ ] `db.php` updated with live host's DB credentials
- [ ] All files uploaded to host
- [ ] Every feature retested on the LIVE site (not just local)

## Phase 7 — Submission Materials
- [x] All code staged and pushed to GitHub
- [ ] PDF created with GitHub link + hosted site link
- [ ] 3-minute demo video recorded, covering:
  - [ ] Registration & login
  - [ ] Create, update, delete a blog
  - [ ] Viewing (list + single post)
  - [ ] Hosted website access
- [ ] Video saved as .mp4
- [ ] Folder renamed to student index number (`245013X`)
- [ ] Folder zipped (`245013X.zip`)
- [ ] Final review against PRD Section 8 acceptance criteria

---

## Notes / Decisions Log
- Configured PDO with `PDO::ERRMODE_EXCEPTION` and `FETCH_ASSOC` in `backend/config/db.php`.
- Implemented method override support in `backend/api/posts.php` (`_method: 'PUT'` and `_method: 'DELETE'`) for maximum compatibility with HTML client requests.
- Integrated Marked.js via CDN for client-side Markdown parsing in both reader (`post.html`) and live editor preview tab (`editor.html`).
- Server-side authorization enforced in `backend/includes/auth_check.php` via `verify_post_owner()` returning `403 Forbidden` for non-owners.
