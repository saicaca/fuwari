---
title: How to Clone a Git Repository and Push It to a Private Repository While Keeping All History Intact
published: 2025-03-03
tags: [GitHub]
image: 'banner.png'
category: OpenSource
draft: false
---

Sometimes, you may need to clone a Git repository from a different account and push it to your own private repository while keeping all commit history, branches, and tags intact. 

This can be useful if:

- You want to work on a project privately without losing its history.
  
- You're moving a project from one GitHub account to another.

- You want to make a fork of a repository without using GitHub's fork feature.

In this guide, we'll walk through the step-by-step process of **mirroring a Git repository** while preserving all its data.


## Step 1: Clone the Original Repository as a Bare Repository

A bare repository is a special Git repository that only contains the Git metadata (branches, commits, tags) but not the working files. This is useful for mirroring repositories.

To create a bare clone, use the following command:

Clone the repository as a bare repository

```bash
git clone --bare https://github.com/original-user/original-repo.git
```

This will create a new directory named original-repo.git, which contains all the Git history but no working files.

## Step 2: Create a New Private Repository on GitHub

Go to GitHub and create a new private repository. Do not initialize it with a README, .gitignore, or license file.

For example, let's say the new repository is: `https://github.com/your-username/your-private-repo.git`

### Step 3: Push Everything to Your Private Repository

Now, navigate into the bare repository and push all branches and tags to your new private repository:

```bash
cd original-repo.git
git push --mirror https://github.com/your-username/your-private-repo.git
```

The `--mirror` flag ensures that all branches, tags, and refs are transferred exactly as they were in the original repository, keeping all the history and data intact.

### Step 4: Clone the New Private Repository Locally

Since we cloned a bare repository earlier, we now need to create a normal working copy from our private repository.

```bash
cd ..
rm -rf original-repo.git  # Clean up the bare repo. You can keep it if you want. You can also delete the entire directory manually if you don't need it anymore.
git clone https://github.com/your-username/your-private-repo.git
cd your-private-repo
```

Now, you have a fully functional repository with the complete commit history, and you can start working on it.


## Bonus: Verify That Everything Is Transferred

To check that all commits, branches, and tags have been properly transferred, run:

```bash
# List all branches
git branch -a

# List all tags
git tag

# Show commit history
git log --oneline --graph --all
```

If everything looks good, you've successfully cloned and transferred the repository while keeping all history intact!

## Alternative: Using SSH Instead of HTTPS

If you prefer to use SSH instead of HTTPS, replace the URLs accordingly:

### Cloning the original repository (using SSH)

```bash
git clone --bare git@github.com:original-user/original-repo.git

# Pushing to your private repository (using SSH)
git push --mirror git@github.com:your-username/your-private-repo.git
```

## Conclusion

By following this guide, you can successfully clone a Git repository and push it to your own private repository while keeping all history, branches, and tags intact. This is a great way to preserve the integrity of a project while maintaining full control over its future development.

Do you have any questions or suggestions? Feel free to reach out in any media given in the website! I'm always happy to help. 😊


