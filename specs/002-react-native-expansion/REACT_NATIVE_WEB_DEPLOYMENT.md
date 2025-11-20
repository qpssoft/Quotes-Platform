# React Native Web Deployment Guide

## Overview
This guide explains how to deploy the React Native web application to GitHub Pages at the subpath `/Quotes/App`.

## Architecture

The repository now deploys TWO applications to GitHub Pages:
- **Angular App** (quotes-platform) → `https://qpssoft.github.io/Quotes/`
- **React Native Web** (quotes-native) → `https://qpssoft.github.io/Quotes/App`

## Configuration

### 1. Package.json Scripts

```json
{
  "scripts": {
    "build:web": "expo export --platform web --output-dir dist",
    "deploy:gh-pages": "npm run build:web && gh-pages -d dist -t true"
  }
}
```

### 2. App.json Configuration

```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "output": "single",
      "publicPath": "/Quotes/App/"
    }
  }
}
```

Key settings:
- **bundler**: `metro` - Uses Metro bundler (Expo 54 default)
- **output**: `single` - Creates a single-page application bundle
- **publicPath**: `/Quotes/App/` - Base path for GitHub Pages subpath deployment

### 3. Metro Configuration

Simplified `metro.config.js`:

```javascript
const {getDefaultConfig} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

## Deployment Methods

### Automatic Deployment (Recommended)

Every push to `main` branch automatically deploys both apps:

1. **Trigger**: Push to `main` or manual workflow dispatch
2. **Build Process**:
   - Builds Angular app → `/Quotes/`
   - Builds React Native web → `/Quotes/App/`
   - Combines both into single deployment
3. **Deploy**: GitHub Actions uploads to GitHub Pages
4. **Live**: Changes appear in 2-5 minutes

**Workflow file**: `.github/workflows/deploy.yml`

### Manual Deployment

Deploy React Native web manually:

```bash
cd quotes-native
npm run deploy:gh-pages
```

This will:
1. Build the web app to `dist/` directory
2. Push `dist/` contents to `gh-pages` branch at `/App` path
3. Deploy to GitHub Pages

**Note**: Manual deployment only uploads the React Native app, not the Angular app.

## Build Process

### Local Build

Test the build locally before deploying:

```bash
cd quotes-native

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Build for production
npm run build:web
```

**Output directory**: `dist/`

**Build artifacts**:
- `index.html` - Entry point
- `_expo/static/js/web/` - JavaScript bundles
- `assets/` - Images, fonts, and other assets
- `metadata.json` - Build metadata

### Build Configuration

#### Dependencies

Required packages in `package.json`:

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native-web": "^0.19.13"
  },
  "devDependencies": {
    "gh-pages": "^6.1.0"
  }
}
```

#### React 19 Compatibility

Use `--legacy-peer-deps` flag for npm install due to React 19:

```bash
npm install --legacy-peer-deps
```

This is required because `react-native-web` 0.19.x expects React 18, but we're using React 19.

## GitHub Actions Workflow

### Full Workflow Overview

`.github/workflows/deploy.yml`:

```yaml
jobs:
  build:
    steps:
      # Build Angular App
      - Install Angular dependencies
      - Build Angular production → quotes-platform/dist/
      
      # Build React Native Web
      - Install React Native dependencies (--legacy-peer-deps)
      - Build React Native Web → quotes-native/dist/
      
      # Combine and Deploy
      - Create combined deployment directory
      - Copy Angular files → deploy/
      - Copy React Native files → deploy/App/
      - Upload to GitHub Pages
```

### Workflow Triggers

- **Push to main**: Automatic deployment on every commit
- **Manual dispatch**: Run workflow manually from GitHub Actions tab

## Troubleshooting

### Build Errors

#### Error: "Unable to resolve module expo-router"

**Cause**: App is configured for static rendering with expo-router

**Solution**: Set `output` to `single` in `app.json`:

```json
{
  "expo": {
    "web": {
      "output": "single"
    }
  }
}
```

#### Error: "ERESOLVE unable to resolve dependency tree"

**Cause**: React version conflicts with react-native-web

**Solution**: Install with legacy peer deps:

```bash
npm install --legacy-peer-deps
```

#### Error: "expo export:web can only be used with Webpack"

**Cause**: Using old webpack-based command

**Solution**: Use new Metro-based command:

```bash
npm run build:web
# which runs: expo export --platform web --output-dir dist
```

### Deployment Issues

#### Assets not loading (404 errors)

**Cause**: Incorrect `publicPath` configuration

**Solution**: Verify `app.json` has correct path:

```json
{
  "expo": {
    "web": {
      "publicPath": "/Quotes/App/"
    }
  }
}
```

#### Blank page after deployment

**Cause**: SPA routing not configured

**Solution**: Ensure 404.html is created (handled by GitHub Actions):

```bash
cp dist/index.html dist/404.html
```

#### GitHub Pages not updating

**Possible causes**:
1. Build failed - Check GitHub Actions logs
2. Cache issue - Hard refresh (Ctrl+F5)
3. Branch mismatch - Verify deploying to `gh-pages` branch
4. Permissions - Check repository Settings → Pages

**Debug steps**:
```bash
# Check GitHub Actions status
# Visit: https://github.com/qpssoft/Quotes/actions

# Verify gh-pages branch exists
git fetch
git branch -a | grep gh-pages

# Check Pages settings
# Visit: https://github.com/qpssoft/Quotes/settings/pages
```

## Project Structure

```
quotes-native/
├── src/                        # React Native source code
├── assets/                     # Images, fonts, audio
├── web/                        # Web-specific files
│   └── index.html             # HTML template
├── dist/                       # Build output (gitignored)
│   ├── index.html             # Generated entry point
│   ├── 404.html               # SPA fallback
│   ├── _expo/                 # Expo build artifacts
│   │   └── static/js/web/     # JavaScript bundles
│   └── assets/                # Compiled assets
├── app.json                   # Expo configuration
├── metro.config.js            # Metro bundler config
└── package.json               # Dependencies and scripts
```

## Testing Deployment

### Local Testing

Test the built site locally:

```bash
# Build the app
npm run build:web

# Serve locally with correct base path
npx serve dist -s -p 3000 --basePath=/Quotes/App

# Visit: http://localhost:3000/Quotes/App
```

### Production Testing

After deployment, verify:

1. **Main page loads**: Visit https://qpssoft.github.io/Quotes/App
2. **Navigation works**: Click between tabs (Home, Search, Favorites, Settings)
3. **Assets load**: Check that images, fonts, and audio files work
4. **Responsive design**: Test on mobile and desktop
5. **SPA routing**: Refresh on a sub-route (should not 404)

## Monitoring

### Build Status

Check build status:
- **GitHub Actions**: https://github.com/qpssoft/Quotes/actions
- **Build logs**: Click on latest workflow run
- **Deployment status**: Check green checkmark on commits

### Analytics

GitHub Pages provides basic analytics:
- **Traffic**: Repository → Insights → Traffic
- **Popular content**: See most viewed pages
- **Referrers**: See where visitors come from

## Rollback

### Rollback to Previous Version

If deployment breaks:

```bash
# Find previous successful commit
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Or force push previous commit
git reset --hard <previous-commit-hash>
git push --force origin main
```

### Emergency Disable

Temporarily disable React Native app:

1. Go to `.github/workflows/deploy.yml`
2. Comment out React Native build steps
3. Commit and push

## Performance

### Bundle Size

Check bundle size after build:

```bash
npm run build:web
du -sh dist/
ls -lh dist/_expo/static/js/web/
```

**Target**: < 1 MB JavaScript bundle

### Optimization

Reduce bundle size:
1. Enable code splitting (future enhancement)
2. Lazy load routes
3. Optimize images (use WebP)
4. Enable compression in GitHub Pages

## Related Documentation

- [Main README](../../README.md) - Repository overview
- [Angular Deployment](../../DEPLOYMENT.md) - Angular app deployment
- [Phase 4 Status](./PHASE4_WINDOWS_IMPLEMENTATION_STATUS.md) - Windows desktop implementation
- [Expo Web Docs](https://docs.expo.dev/workflow/web/) - Official Expo web documentation

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/qpssoft/Quotes/issues
- **Discussions**: https://github.com/qpssoft/Quotes/discussions

---

**Last Updated**: November 20, 2025
**Expo Version**: 54.0.25
**React Native Version**: 0.81.5
**Status**: ✅ Production Deployment Ready
