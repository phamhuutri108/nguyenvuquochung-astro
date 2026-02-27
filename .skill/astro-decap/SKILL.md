---
name: astro-decap-cms-setup
description: >
  Use this skill when the user wants to start a new Astro website project from scratch,
  set it up in VS Code, commit to GitHub, and connect Decap CMS as the content management system.
  Triggers: "build new website with Astro", "setup Astro project", "Astro + Decap CMS",
  "start website with CMS", "new Astro site with content management".
---

# Astro + Decap CMS — New Project Setup Skill

This skill walks Claude through setting up a complete, production-ready Astro website
with Decap CMS, from zero to deployed with a working /admin interface.

---

## Prerequisites (confirm before starting)

Ask the user to confirm they have installed:
- Node.js v18+ (`node -v` to check)
- Git (`git --version` to check)
- VS Code with the Claude extension
- A GitHub account (free)
- A Netlify account (free) — netlify.com

If anything is missing, help them install it before continuing.

---

## Phase 1 — Scaffold the Astro Project

Run in VS Code terminal:

```bash
npm create astro@latest my-website -- --template blog --install --git
cd my-website
```

> If user wants a blank site instead of blog template, use `--template minimal`

Open the project in VS Code:
```bash
code .
```

Verify it runs:
```bash
npm run dev
```
Site should be live at `http://localhost:4321`

---

## Phase 2 — Add Decap CMS Files

Create two files inside `public/admin/`:

### `public/admin/index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Content Manager</title>
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

### `public/admin/config.yml`

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "src/content/blog"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Published Date", name: "pubDate", widget: "datetime" }
      - { label: "Description", name: "description", widget: "string" }
      - { label: "Hero Image", name: "heroImage", widget: "image", required: false }
      - { label: "Body", name: "body", widget: "markdown" }
```

> Adjust `collections` fields to match the actual frontmatter of the Astro content collection.
> Check `src/content/config.ts` for the exact schema if it exists.

### Add Identity Widget to homepage

In `src/pages/index.astro` (or the main layout file), add inside `<head>`:

```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

Also add this redirect script anywhere in the `<body>` of the homepage so the widget
redirects back to `/admin` after login:

```html
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
```

---

## Phase 3 — Push to GitHub

Initialize Git and push (skip `git init` if Astro already did it during scaffold):

```bash
git add .
git commit -m "feat: add Decap CMS setup"
```

Create a new repository on GitHub (github.com → New repository), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Phase 4 — Deploy on Netlify and Enable CMS

### Step 1 — Connect repo to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Choose **GitHub** → select the repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy site**

Wait for the first deploy to finish (usually 1–2 minutes).

### Step 2 — Enable Netlify Identity

In Netlify dashboard for the site:
1. Go to **Integrations** → **Identity** → click **Enable Identity**
2. In **Configuration and usage** → under **Registration**, set to **Invite only**
   (so only you can log in as admin)

### Step 3 — Enable Git Gateway

Still in Identity settings:
1. Scroll down to **Services** → **Git Gateway**
2. Click **Enable Git Gateway**

This allows Decap CMS to commit to your GitHub repo on your behalf.

### Step 4 — Invite yourself as admin user

In the Identity tab → click **Invite users** → enter your email.
You'll get an email with a confirmation link. Click it, set your password.
That's your CMS login.

### Step 5 — Access the CMS

Navigate to:
```
https://your-site-name.netlify.app/admin/
```

Log in with the email/password from the invite. You should see the Decap CMS editor.

---

## Phase 5 — Local Development with CMS Proxy

To edit content locally (without pushing to GitHub each time), run the proxy server:

```bash
npx netlify-cms-proxy-server
```

Then in a separate terminal:
```bash
npm run dev
```

Go to `http://localhost:4321/admin/` — the CMS will work locally, saving files to disk.

> Note: this only works when `backend.name` is `git-gateway`. Local proxy bypasses authentication.

---

## Typical Project File Structure After Setup

```
my-website/
├── public/
│   └── admin/
│       ├── index.html        ← Decap CMS entry point
│       └── config.yml        ← CMS content schema
├── src/
│   ├── content/
│   │   └── blog/             ← Markdown files managed by CMS
│   ├── layouts/
│   └── pages/
│       └── index.astro       ← Add Identity widget here
├── astro.config.mjs
└── package.json
```

---

## Common Issues and Fixes

| Problem | Fix |
|---|---|
| `/admin` shows blank page | Check `public/admin/index.html` exists and Decap script URL is correct |
| Login popup doesn't appear | Make sure Netlify Identity is enabled and Identity widget script is in `<head>` |
| CMS saves but site doesn't rebuild | Check Git Gateway is enabled in Netlify → Identity → Services |
| `config.yml` fields don't match content | Compare with `src/content/config.ts` schema and align field names |
| Using Cloudflare proxy on custom domain | Redirect `/admin` traffic to the `.netlify.app` subdomain to avoid 405 errors |

---

## Notes for Claude When Helping in VS Code

- Always check `src/content/config.ts` first to understand the existing content schema before writing `config.yml`
- If the user has a custom layout, find the main `<head>` component and add the Identity widget script there
- When the user asks to add new content types, add a new entry under `collections:` in `config.yml`
- Remind the user to redeploy on Netlify after any changes to `public/admin/config.yml`
- The Netlify Identity service is currently being deprecated — if the user is starting a new project in 2026+, consider suggesting GitHub backend with OAuth as an alternative