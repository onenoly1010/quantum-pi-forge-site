# Automation Setup for Code Review Fixes

This directory contains automated checks to ensure code quality and catch issues that were addressed in commit [096fdab](https://github.com/onenoly1010/quantum-pi-forge-site/commit/096fdab0a31718659bbc6c1693659a4498184e29).

## What Gets Automated

### 1. Retry Delay Cap (5000ms)
- **Location**: `api/ecosystem-gateway.js`
- **Rule**: Exponential backoff delay must be capped at 5000ms
- **Why**: Prevents excessive wait times that could lead to poor user experience
- **Implementation**: `Math.min(retryDelay * Math.pow(2, attempt), 5000)`

### 2. Accessibility - aria-label
- **Location**: All HTML files (`index.html`, `dashboard.html`)
- **Rule**: All interactive elements (especially close buttons) must have aria-label attributes
- **Why**: Improves accessibility for screen readers and assistive technologies
- **Example**: `<button class="banner-close" id="closeBanner" aria-label="Close banner">×</button>`

### 3. General Code Quality
- JavaScript linting via ESLint
- HTML validation and accessibility checks via HTMLHint

## Running Locally

### Prerequisites
```bash
# Install Node.js (v18 or higher)
# Then install dependencies
npm install
```

### Run All Checks
```bash
# Run all linters and validation
npm run lint

# Or run individually:
npm run lint:js    # ESLint for JavaScript
npm run lint:html  # HTMLHint for HTML
npm test          # Custom validation tests
```

## Validation Tests

The custom test suite (`tests/validate-fixes.js`) checks:

1. **Retry Delay Cap**: Verifies `Math.min` is used with a 5000ms cap
2. **Exponential Backoff**: Ensures proper exponential backoff logic
3. **aria-label on Buttons**: Validates all close buttons have aria-label
4. **HTML Accessibility**: Checks for lang attributes and alt text on images
5. **Configuration**: Validates timeout and retry count settings

### Test Output
```
✓ Retry delay is capped at 5000ms
✓ Exponential backoff logic is present
✓ index.html: Close button 1 has aria-label
✓ index.html: Has lang attribute on html tag
✓ index.html: All images have alt attributes
...
```

## CI/CD Integration

The checks run automatically on:
- Push to `main`, `develop`, or any `copilot/**` branch
- Pull requests to `main` or `develop`

### GitHub Actions Workflow
Location: `.github/workflows/code-quality.yml`

The workflow:
1. Checks out code
2. Sets up Node.js 18
3. Installs dependencies
4. Runs ESLint
5. Runs HTMLHint
6. Runs custom validation tests
7. Reports results

### Status Badge
Add this to your README.md to show build status:
```markdown
![Code Quality](https://github.com/onenoly1010/quantum-pi-forge-site/actions/workflows/code-quality.yml/badge.svg)
```

## Configuration Files

### `.eslintrc.json`
ESLint configuration for JavaScript code quality:
- Enforces semicolons
- Prefers single quotes
- Warns on unused variables
- ES2021+ syntax support

### `.htmlhintrc`
HTMLHint configuration for HTML validation:
- Enforces lowercase tags and attributes
- Requires alt attributes on images
- Checks for aria-label on buttons
- Validates unique IDs

### `package.json`
Defines scripts and dependencies:
```json
{
  "scripts": {
    "lint:js": "eslint '**/*.js'",
    "lint:html": "htmlhint '**/*.html'",
    "lint": "npm run lint:js && npm run lint:html",
    "test": "node tests/validate-fixes.js"
  }
}
```

## Fixing Common Issues

### Issue: Retry delay not capped
```javascript
// ❌ Bad: No cap
const delay = retryDelay * Math.pow(2, attempt);

// ✅ Good: Capped at 5000ms
const delay = Math.min(retryDelay * Math.pow(2, attempt), 5000);
```

### Issue: Missing aria-label
```html
<!-- ❌ Bad: No aria-label -->
<button class="close-btn" id="closeBtn">×</button>

<!-- ✅ Good: Has aria-label -->
<button class="close-btn" id="closeBtn" aria-label="Close dialog">×</button>
```

### Issue: ESLint errors
```bash
# Auto-fix many issues
npx eslint '**/*.js' --fix

# Then manually fix remaining issues
```

## Adding New Checks

To add a new validation rule:

1. Edit `tests/validate-fixes.js`
2. Add a new test function following the pattern
3. Call it from `main()`
4. Run `npm test` to verify

Example:
```javascript
function testMyNewRule() {
  log('\nTest: Checking my new rule', 'info');
  
  // Your validation logic
  if (conditionMet) {
    pass('New rule validated');
  } else {
    fail('New rule violation found');
  }
}
```

## Benefits

✅ **Catches issues early**: Before code review
✅ **Consistent standards**: Automated enforcement
✅ **Faster reviews**: Reviewers focus on logic, not style
✅ **Better accessibility**: Automated WCAG checks
✅ **Documentation**: Rules are code, not just comments
✅ **CI/CD ready**: Runs on every push/PR

## References

- Original fix: [Commit 096fdab](https://github.com/onenoly1010/quantum-pi-forge-site/commit/096fdab0a31718659bbc6c1693659a4498184e29)
- ESLint: https://eslint.org/
- HTMLHint: https://htmlhint.com/
- GitHub Actions: https://docs.github.com/en/actions

## Troubleshooting

### Tests fail locally but pass in CI
- Check Node.js version (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### ESLint/HTMLHint not found
```bash
# Reinstall dependencies
npm install
```

### Custom test script not executable
```bash
# Make it executable
chmod +x tests/validate-fixes.js

# Or run with node explicitly
node tests/validate-fixes.js
```

## Contributing

When adding new features:
1. Run all checks locally first
2. Add tests for new validation rules
3. Update this README if adding new checks
4. Ensure CI passes before merging

---

**Powered by OINIO | Quantum Pi Forge Genesis**
