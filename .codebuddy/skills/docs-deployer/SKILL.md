---
name: docs-deployer
description: |
  Builds and deploys Storybook documentation to Lighthouse server with versioned directory structure.
  This skill should be used when users want to deploy docs, publish documentation, or update Storybook.
  Triggered by keywords: deploy docs, publish docs, 部署文档, 发布文档, storybook deploy, 文档部署.
---

# Docs Deployer

This skill builds Storybook documentation and deploys it to a Lighthouse server with versioned directory structure.

## When to Use

- When user wants to deploy documentation
- When user wants to publish Storybook to server
- Keywords: deploy docs, publish docs, 部署文档, 发布文档, storybook, 文档部署

## Directory Structure on Server

```
/var/www/html/md/
├── 0.1.0/          # Version 0.1.0 docs
├── 0.1.1/          # Version 0.1.1 docs
├── latest -> 0.1.1 # Symlink to latest version
└── ...
```

## Workflow

### Step 1: Build Storybook

```bash
pnpm build:storybook:react
# Output: storybook-static/react/
```

### Step 2: Get Current Version

```bash
grep -o '"version":\s*"[^"]*"' packages/core/package.json | head -1 | cut -d'"' -f4
```

### Step 3: Query Lighthouse Instances

Use Lighthouse integration tools:

1. **Analyze instances by region**:
   ```
   call_integration: lighthouse / analyze_lighthouse_instances
   ```

2. **Get running instances in region**:
   ```
   call_integration: lighthouse / describe_running_instances
   Arguments: {"Region": "ap-tokyo"}
   ```

3. **Wait for user to select target instance**

### Step 4: Upload Files

```
call_integration: lighthouse / deploy_project_preparation
Arguments: {
  "FolderPath": "/path/to/storybook-static/react",
  "InstanceId": "lhins-xxxxxx",
  "Region": "ap-tokyo",
  "ProjectName": "md-docs-X.Y.Z"
}
```

### Step 5: Create Versioned Directory and Deploy

Execute commands on server:

```bash
# Create versioned directory
mkdir -p /var/www/html/md/X.Y.Z

# Copy files to versioned directory
cp -r /root/uploaded_project/* /var/www/html/md/X.Y.Z/

# Set permissions
chown -R www-data:www-data /var/www/html/md

# Update latest symlink
cd /var/www/html/md
rm -f latest
ln -s X.Y.Z latest

# Cleanup temp files
rm -rf /root/uploaded_project
```

### Step 6: Verify Deployment

```bash
ls -la /var/www/html/md/X.Y.Z/
curl -I http://SERVER_IP/md/X.Y.Z/
```

### Step 7: Report Success

```
call_integration: lighthouse / deploy_success
Arguments: {
  "InstanceName": "instance-name",
  "InstanceId": "lhins-xxxxxx",
  "URL": "http://SERVER_IP/md/X.Y.Z/"
}
```

## Access URLs

After deployment, docs are accessible at:
- Versioned: `http://SERVER_IP/md/X.Y.Z/`
- Latest: `http://SERVER_IP/md/latest/`

## Notes

- Always create a `latest` symlink pointing to the newest version
- Clean up temporary upload directories after deployment
- Ensure www-data ownership for nginx to serve files
- Default nginx root is typically `/var/www/html`
