# Vercel Deployment Guide

## Quick Deploy

1. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `onenoly1010/quantum-pi-forge-site`
   - Click "Deploy"

2. **Configure Domain:**
   - Project Settings → Domains
   - Add `quantumpiforge.com`
   - Add `www.quantumpiforge.com`

3. **DNS Configuration:**
   ```
   quantumpiforge.com → CNAME → cname.vercel-dns.com
   www.quantumpiforge.com → CNAME → cname.vercel-dns.com
   ```

## Automatic Deployments

- **Production:** Pushes to `main` branch auto-deploy to quantumpiforge.com
- **Preview:** Pull requests get unique preview URLs

## Build Configuration

- **Framework Preset:** Other (Static HTML)
- **Build Command:** (none)
- **Output Directory:** `.` (root)
- **Install Command:** `npm install` (optional)

## Monitoring

- View deployment logs: Vercel Dashboard → Deployments
- Check domain status: Project Settings → Domains
- Analytics: Vercel Dashboard → Analytics

## Troubleshooting

### Domain Not Resolving
- Verify DNS records with `dig quantumpiforge.com`
- Wait up to 48 hours for propagation
- Check Vercel dashboard for verification status

### 404 Errors
- Ensure `vercel.json` routes are correct
- Check file paths are case-sensitive
- Verify all referenced files exist in repo

### Build Failures
- Check deployment logs in Vercel dashboard
- Ensure all files are committed and pushed
- Verify `vercel.json` syntax is valid
