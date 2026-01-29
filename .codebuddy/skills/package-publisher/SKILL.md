---
name: package-publisher
description: |
  Manages npm package publishing workflow including version bumping, git commit, and changelog generation.
  This skill should be used when users want to publish packages, bump versions, or prepare releases.
  Triggered by keywords: publish, release, version, bump, npm publish, pnpm publish, patch, minor, major, prerelease.
  中文关键词：发布、发版、版本、升级版本、发布包、npm发布、更新版本号。
---

# Package Publisher

This skill manages the complete npm package publishing workflow, including version management, git commits, and changelog generation.

## When to Use

- When user wants to publish a package (`npm publish`, `pnpm publish`)
- When user wants to bump version (`patch`, `minor`, `major`, `prerelease`)
- When preparing a new release
- Keywords: publish, release, version, bump, patch, minor, major, prerelease, alpha, beta, rc

## Semantic Version Types

| Type | Command | Example | Description |
|------|---------|---------|-------------|
| patch | `npm version patch` | 1.0.0 → 1.0.1 | Bug fixes, backward compatible |
| minor | `npm version minor` | 1.0.0 → 1.1.0 | New features, backward compatible |
| major | `npm version major` | 1.0.0 → 2.0.0 | Breaking changes |
| prerelease | `npm version prerelease` | 1.0.0 → 1.0.1-0 | Pre-release version |
| prepatch | `npm version prepatch` | 1.0.0 → 1.0.1-0 | Pre-release patch |
| preminor | `npm version preminor` | 1.0.0 → 1.1.0-0 | Pre-release minor |
| premajor | `npm version premajor` | 1.0.0 → 2.0.0-0 | Pre-release major |
| prerelease --preid=alpha | `npm version prerelease --preid=alpha` | 1.0.0 → 1.0.1-alpha.0 | Alpha release |
| prerelease --preid=beta | `npm version prerelease --preid=beta` | 1.0.0 → 1.0.1-beta.0 | Beta release |
| prerelease --preid=rc | `npm version prerelease --preid=rc` | 1.0.0 → 1.0.1-rc.0 | Release candidate |

## Workflow

### Step 1: Check Git Status

Run the helper script to check for uncommitted changes:

```bash
bash {SKILL_DIR}/scripts/check_git_status.sh
```

If there are uncommitted changes:
1. Review the changes
2. Stage all relevant changes: `git add .` or selectively stage files
3. Commit with conventional commit format (see Commit Convention below)
4. Re-run status check to confirm clean state

### Step 2: Get Package Information

```bash
bash {SKILL_DIR}/scripts/get_package_info.sh
```

For monorepo, check each package that needs publishing:
```bash
bash {SKILL_DIR}/scripts/get_package_info.sh packages/core
bash {SKILL_DIR}/scripts/get_package_info.sh packages/react
```

### Step 3: Confirm Version Bump Type

Ask user to confirm:
1. Which version type to use (patch/minor/major/prerelease)
2. For prerelease, which preid (alpha/beta/rc)
3. For monorepo, which packages to publish

### Step 4: Generate Changelog

**IMPORTANT**: Before bumping version, invoke the `changelog-generator` skill to:
1. Collect commits since last release
2. Generate changelog entry
3. Update CHANGELOG.md

This ensures the changelog reflects all changes up to this release.

### Step 5: Commit Changelog (if updated)

If changelog was updated:
```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for vX.Y.Z"
```

### Step 6: Bump Version

For single package:
```bash
npm version <type> -m "chore(release): v%s"
```

For monorepo with pnpm:
```bash
# Update version in specific package
cd packages/<name>
npm version <type> --no-git-tag-version

# Or update all packages simultaneously
pnpm -r exec npm version <type> --no-git-tag-version
```

Then commit and tag manually for monorepo:
```bash
git add .
git commit -m "chore(release): bump version to X.Y.Z"
git tag vX.Y.Z
```

### Step 7: Verify Before Publish

Before publishing, verify:
1. Version is correct in package.json
2. Build succeeds: `pnpm build` or `npm run build`
3. Tests pass: `pnpm test` or `npm test`
4. CHANGELOG.md is updated

### Step 8: Publish

For single package:
```bash
npm publish --access public
```

For monorepo:
```bash
# Publish specific package
pnpm --filter <package-name> publish --access public

# Or publish all public packages
pnpm -r publish --access public
```

### Step 9: Push to Remote

```bash
git push origin main
git push origin --tags
```

## Commit Convention

Use Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation only |
| style | Code style (formatting, no code change) |
| refactor | Code refactoring |
| perf | Performance improvement |
| test | Adding/updating tests |
| build | Build system or dependencies |
| ci | CI configuration |
| chore | Other changes (release, etc.) |

### Examples

```bash
# Feature commit
git commit -m "feat(core): add streaming markdown support"

# Bug fix
git commit -m "fix(react): resolve memory leak in useMarkdown hook"

# Release commit
git commit -m "chore(release): v1.2.0"

# Breaking change
git commit -m "feat(api)!: change parseToHast return type

BREAKING CHANGE: parseToHast now returns Promise<HastNode>"
```

### Scope Examples for Monorepo

- `core` - @tc/md-core package
- `react` - @tc/md-react package  
- `vue` - @tc/md-vue package
- `deps` - dependency updates
- `release` - version releases

## Notes

- Always run `pnpm build` before publishing to ensure dist files are up to date
- For scoped packages (@org/name), use `--access public` if publishing publicly
- Use `--dry-run` flag to preview publish without actually publishing
- For monorepo, consider using changesets or lerna for more sophisticated version management
