# How to Add This Project to GitHub

## Step-by-Step Guide

### Prerequisites
- A GitHub account (create one at https://github.com if you don't have one)
- Git installed on your computer (check with `git --version`)

---

## Step 1: Create a New Repository on GitHub

1. Go to https://github.com and sign in
2. Click the **"+" icon** in the top right corner → **"New repository"**
3. Fill in the repository details:
   - **Repository name**: `bilfen-blog` (or your preferred name)
   - **Description**: "Full-stack blog application with Express, Nuxt 2, and React Native"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

---

## Step 2: Initialize Git Locally (if not already done)

The project will be initialized in the next steps, but if you want to check:
```bash
git init
```

---

## Step 3: Add All Files to Git

This will stage all files except those in `.gitignore`:
```bash
git add .
```

---

## Step 4: Create Your First Commit

```bash
git commit -m "Initial commit: Full-stack blog monorepo with backend, web, and mobile apps"
```

---

## Step 5: Connect to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bilfen-blog.git
```

Or if you prefer SSH (after setting up SSH keys):
```bash
git remote add origin git@github.com:YOUR_USERNAME/bilfen-blog.git
```

---

## Step 6: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password (use a Personal Access Token, not your regular password).

---

## Step 7: Verify

Go to your GitHub repository page and refresh. You should see all your files!

---

## Important Notes

### Environment Variables
- Never commit `.env` files (already in `.gitignore`)
- Commit `.env.example` files as templates
- Document required environment variables in README

### Database Files
- SQLite database files (`*.db`) are in `.gitignore` and won't be committed
- Only commit migration files and schema

### Node Modules
- `node_modules/` folders are excluded (already in `.gitignore`)
- Others can install dependencies with `npm install` after cloning

---

## Future Updates

After making changes, use these commands:

```bash
# Check what changed
git status

# Add specific files or all changes
git add .
# or: git add path/to/file

# Commit with a descriptive message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

---

## Troubleshooting

### If you get authentication errors:
- Use a Personal Access Token instead of password: https://github.com/settings/tokens
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### If remote already exists:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/bilfen-blog.git
```

### To check your remote:
```bash
git remote -v
```

