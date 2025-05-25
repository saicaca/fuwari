# Feature: Auto Update Post Date Based on File Modification Time

## Overview

This PR introduces an **automatic post date update** feature. When the content of a Markdown post is modified, the `updated` field in the frontmatter will be automatically set to the file's last modification time, ensuring the post's update date is always accurate and up-to-date. This process is fully automated and cross-platform.

---

## Implementation Details

### 1. Update Script

- **File:** `scripts/update-post-dates.js`
- **Function:**  
  - Scans all Markdown files (`.md`/`.mdx`) under `src/content/posts/` (including subdirectories).
  - Compares the content hash (excluding frontmatter) to determine if the content has actually changed.
  - If changed, updates the `updated` field in the frontmatter to the file's last modification time (`mtime`).
  - Cleans up hash records for deleted files to keep the cache efficient.
  - Stores content hashes in `scripts/.content-hashes.json` for future comparisons.

### 2. Git Pre-commit Hooks

- **Files:**  
  - `.git/hooks/pre-commit` (for Unix-like systems)
  - `.git/hooks/pre-commit.ps1` (for Windows PowerShell)
- **Function:**  
  - Automatically runs the update script before every `git commit`.
  - If the script fails, the commit is aborted.
  - Recursively adds all changed Markdown files (including those in subdirectories) and the hash cache file to the commit, ensuring all updates are included.

### 3. Usage

- **No manual operation required.**  
  Simply edit and save your Markdown files, then use `git add` and `git commit` as usual. The update process is triggered automatically before each commit.
- **Supports nested directories.**  
  All posts under `src/content/posts/` and its subfolders are handled.
- **Cross-platform.**  
  Both Unix shell and Windows PowerShell hooks are provided.

### 4. Advantages

- **Accurate update time:**  
  Uses the file system's actual modification time, not the commit time.
- **Smart update:**  
  Only updates the `updated` field if the content has really changed.
- **Automatic cache cleanup:**  
  Prevents the hash cache from growing indefinitely.
- **No extra commands:**  
  Developers do not need to run any additional scripts manually.

### 5. Example

Suppose you edit `src/content/posts/guide/index.md` and commit your changes.  
The `updated` field in the frontmatter will be automatically set to the file's last modification date, and the change will be included in your commit.

---

## Migration Notes

- The pre-commit hooks now use glob patterns (`./src/content/posts/**/*.md`) to ensure all Markdown files in subdirectories are included.
- If you previously had hooks that only added top-level `.md` files, please update them as shown in this PR.

---

## Files Added/Modified

- `scripts/update-post-dates.js`
- `.git/hooks/pre-commit`
- `.git/hooks/pre-commit.ps1`
- `scripts/.content-hashes.json` (auto-generated)

---

## How to Test

1. Edit any Markdown file under `src/content/posts/` or its subdirectories.
2. Save the file.
3. Run `git add .` and `git commit -m "test"`.
4. The `updated` field in the frontmatter should reflect the file's last modification time, and the change should be included in the commit.

---

If you have any questions or need further improvements, feel free to contact me! 