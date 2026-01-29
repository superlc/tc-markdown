---
name: changelog-generator
description: |
  Generates changelog content from git commits between the last version tag and current HEAD.
  This skill should be used before publishing a package to automatically create or update CHANGELOG.md
  with a summary of changes. Triggered when users mention: publish, release, changelog, version bump,
  npm publish, or request to update changes/changelog.
  中文关键词：变更日志、更新日志、changelog、发布记录、版本记录、更新记录。
---

# Changelog Generator

This skill generates changelog entries by analyzing git commits between the last published version and the current state.

## When to Use

- Before running `npm publish` or `pnpm publish`
- When user asks to update CHANGELOG.md or changes.md
- When preparing a new release
- When user mentions "publish", "release", "version bump"

## Workflow

### Step 1: Gather Version and Commit Information

Run the helper scripts to collect information:

```bash
# Get version info (latest tag, package version, commit count)
bash {SKILL_DIR}/scripts/get_version_info.sh

# Get commit list since last tag
bash {SKILL_DIR}/scripts/get_commits.sh
```

### Step 2: Categorize Commits

Analyze the commit messages and categorize them:

| Category | Commit Prefixes | Description |
|----------|----------------|-------------|
| Features | `feat:`, `feature:`, `add:` | New features or capabilities |
| Bug Fixes | `fix:`, `bugfix:`, `hotfix:` | Bug fixes |
| Performance | `perf:`, `performance:` | Performance improvements |
| Refactor | `refactor:`, `refact:` | Code refactoring |
| Style | `style:`, `ui:`, `css:` | UI/Style changes |
| Docs | `docs:`, `doc:` | Documentation changes |
| Chore | `chore:`, `build:`, `ci:`, `test:` | Maintenance tasks |
| Breaking | `BREAKING:`, `breaking:`, contains `!:` | Breaking changes |

For commits without conventional prefixes, infer category from content.

### Step 3: Generate Changelog Entry

Create a changelog entry in this format:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Features
- Description of feature (commit hash)

### Bug Fixes
- Description of fix (commit hash)

### Breaking Changes
- Description of breaking change (commit hash)

### Other Changes
- Other notable changes
```

Guidelines for writing entries:
- Write in user-facing language, not technical commit messages
- Group related commits into single entries when appropriate
- Highlight breaking changes prominently
- Include commit hash for reference
- Omit trivial changes (typo fixes, minor refactors) unless significant

### Step 4: Update CHANGELOG.md

1. Check if CHANGELOG.md exists in project root
2. If exists, prepend new entry after the title/header
3. If not exists, create new file with proper header:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [X.Y.Z] - YYYY-MM-DD
...
```

### Step 5: Confirm with User

Before finalizing:
- Show the generated changelog entry
- Ask user to confirm the version number
- Ask if any entries should be added, removed, or reworded

## Output Format

The changelog should follow [Keep a Changelog](https://keepachangelog.com/) conventions:
- Versions in descending order (newest first)
- ISO date format (YYYY-MM-DD)
- Semantic versioning for version numbers
- Clear categorization of changes

## Notes

- If no conventional commit prefixes are used, infer categories from commit content
- Merge commits are excluded by default
- For monorepos, consider adding package scope to entries
- Always verify the version number matches package.json before publishing
