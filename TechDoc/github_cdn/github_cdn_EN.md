# GitHub Repository + jsDelivr CDN JSON File Hosting Guide (English)

GitHub public repositories combined with jsDelivr CDN enable free JSON file hosting with fast global distribution.

---

## Step 1: Create a GitHub Repository

1. Log in to GitHub
2. Click the + button (top right) -> New repository
3. Enter repository name (e.g., `my-json-data`)
4. Set to **Public** (jsDelivr only supports public repos)
5. Check "Add a README file"
6. Click "Create repository"

## Step 2: Upload JSON Files

1. Add file -> Upload files
2. Upload your JSON file(s)
3. Click "Commit changes"

## Step 3: Generate jsDelivr CDN URL

**Base URL format:**
```
https://cdn.jsdelivr.net/gh/username/repository/file-path
```

**With version tag (recommended for production):**
```
https://cdn.jsdelivr.net/gh/username/repository@v1.0.0/data.json
```

## Step 4: Use & Verify

**Browser**: Paste the URL in your browser's address bar. JSON content displayed = success.

**JavaScript**:
```html
<script>
fetch('https://cdn.jsdelivr.net/gh/user/repo/data.json')
  .then(response => response.json())
  .then(data => console.log(data))
</script>
```

**cURL**:
```bash
curl https://cdn.jsdelivr.net/gh/user/repo/data.json
```

---

## Important Notes

### 1. Caching & Version Management

jsDelivr aggressively uses CDN caching:
- Branch reference: ~12 hours cache
- `@latest`: up to 7 days cache
- Tag URL (e.g., `@v1.0.0`): up to 1 year cache, permanently stored on S3

**Production recommendation**: Use Git release tags and version-pinned URLs.

### 2. GitHub Repository Size Limits

- Recommended repo size: under 1GB
- GitHub warning threshold: over 1GB
- Single file limit: 100MB
- Unofficial max size: ~5GB

### 3. jsDelivr Bandwidth

jsDelivr itself has no bandwidth limits, free usage, global CDN.

### 4. jsDelivr Usage Limits

- Package size: 150MB max
- Single file: 20MB max
- HTML files: served as text/plain

### 5. Cache Purge

Emergency cache refresh:
```bash
curl https://purge.jsdelivr.net/gh/user/repo@version/file-path
```
Or use the web tool: https://www.jsdelivr.com/tools/purge

---

## Operational Checklist

- [ ] GitHub public repo created
- [ ] JSON files uploaded
- [ ] jsDelivr URL generated
- [ ] Browser test passed
- [ ] JavaScript fetch test passed
- [ ] Git Release tag created
- [ ] Version URL applied
- [ ] Cache policy confirmed
- [ ] Data transfer monitored

---

## Conclusion

GitHub + jsDelivr is a free yet powerful static JSON distribution method, especially suited for API config files, LLM prompt data, stock/crypto metadata, and version-controlled static data. Applying Git tag-based version management enables stable production operations.
