
# Contributing

Thank you for your interest in contributing!

## Before You Start

If you plan to make major changes (especially new features or design changes), please open an issue or discussion before starting work. This helps ensure your effort aligns with the project's direction.

## Submitting Code

Please keep each pull request focused on a single purpose. Avoid mixing unrelated changes in one PR, as this can make reviewing and merging code more difficult.

Please use the [Conventional Commits](https://www.conventionalcommits.org/) format for your commit messages whenever possible. This keeps our history clear and consistent.

Before starting code, please run prepare script for automatically Biome formatting (`pnpm format`) on git commit and prevent error astro error (`pnpm check`) and TypeScript error (`pnpm type-check`) on git push.

```bash
pnpm prepare
```