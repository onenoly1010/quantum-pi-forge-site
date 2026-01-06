# Agent Instructions - Quantum Pi Forge Site

## 🤖 For All Coding Agents

### MANDATORY: Onboarding First

**⚠️ CRITICAL REQUIREMENT ⚠️**

Before starting ANY task in this repository, you **MUST**:

1. **Read the onboarding document**: `.github/agents/ONBOARDING.md`
2. **Review the main README**: `README.md`
3. **Complete the onboarding checklist** found in the onboarding document

**DO NOT SKIP THIS STEP**. The onboarding provides essential context about:
- The Quantum Pi Forge ecosystem and its 6 interconnected services
- The OINIO philosophical framework
- Development workflows and testing procedures
- Code style and design principles
- Security considerations

### Why This Matters

Quantum Pi Forge is not just a website - it's part of a larger ecosystem with specific architectural patterns, philosophical foundations, and integration requirements. Understanding this context is essential to:

- Make appropriate technical decisions
- Maintain consistency across the ecosystem
- Avoid breaking integrations with other services
- Follow established patterns and conventions
- Contribute meaningfully to the project

### Task Execution Order

```
1. Read .github/agents/ONBOARDING.md ← START HERE
   ↓
2. Review README.md for technical details
   ↓
3. Understand the specific task requirements
   ↓
4. Plan your approach considering ecosystem context
   ↓
5. Set up local development environment
   ↓
6. Make minimal, targeted changes
   ↓
7. Test thoroughly (local + multiple browsers)
   ↓
8. Verify no console errors or broken links
   ↓
9. Commit with clear, descriptive messages
   ↓
10. Document any significant changes
```

## 📋 Quick Reference

### Essential Files to Know

- **ONBOARDING.md** - Start here! Ecosystem overview and workflows
- **README.md** - Technical architecture and API documentation
- **index.html** - Main landing page
- **dashboard.html** - Live metrics dashboard
- **api/ecosystem-gateway.js** - Service integration layer
- **style.css** - Design system
- **script.js** - Interactive features

### Key Principles

1. **Minimal Changes**: Make the smallest possible changes to achieve the goal
2. **Test First**: Set up local dev environment and test before committing
3. **Maintain Consistency**: Follow existing patterns and styles
4. **No Breaking Changes**: Don't break integrations with live services
5. **Security First**: No secrets, validate inputs, secure external links

### Testing Commands

```bash
# Local development server (choose one)
python -m http.server 8000
# OR
npx http-server -p 8000

# Visit in browser
http://localhost:8000/index.html
http://localhost:8000/dashboard.html
```

### Common Pitfalls to Avoid

❌ **Don't**:
- Skip reading the onboarding
- Hardcode values that should be configurable
- Break the glass-morphism design aesthetic
- Remove or modify working API integrations
- Commit without local testing
- Add build tools or dependencies (this is a static site)
- Change colors without using CSS custom properties

✅ **Do**:
- Read onboarding thoroughly
- Use existing patterns and conventions
- Test on multiple screen sizes
- Verify all links work
- Check browser console for errors
- Maintain the quantum/OINIO aesthetic
- Ask questions if unclear

## 🔗 Integration Awareness

This site integrates with multiple live production services. Be aware:

### Production Services (DO NOT BREAK)
- Pi Forge Quantum Genesis (Railway)
- Quantum Resonance Clean (Vercel)
- Quantum Pi Forge DEX (Vercel)

### API Gateway
All service communication goes through `api/ecosystem-gateway.js`:
- Has built-in retry logic (3 attempts)
- Handles timeouts gracefully
- Provides unified error handling
- Don't bypass this layer!

### Real-time Features
The dashboard updates automatically:
- Health checks every 30 seconds
- Metrics refresh every 10 seconds
- Any changes must maintain these intervals

## 🎯 Task-Specific Guidelines

### Frontend/UI Tasks
- Maintain glass-morphism aesthetic
- Use CSS custom properties for colors
- Test on mobile, tablet, desktop breakpoints
- Ensure accessibility (semantic HTML, ARIA)

### API/Integration Tasks
- Use ecosystem gateway, don't create direct fetches
- Maintain retry logic and timeout handling
- Test with services both online and offline
- Verify error messages are user-friendly

### Documentation Tasks
- Keep markdown formatting consistent
- Update related files (if changing README, check onboarding)
- Verify all links are valid
- Use clear, concise language

### Performance Tasks
- This is a static site - no build step needed
- Optimize images before adding
- Minimize JavaScript file sizes
- Use CSS over JS for animations when possible

## 🚨 Emergency Contacts

If you encounter issues:

1. **Check existing documentation** first
2. **Review related code** for patterns
3. **Test locally** to reproduce
4. **Create an issue** with clear details if stuck

## ✅ Pre-Commit Checklist

Before every commit, verify:

- [ ] Onboarding reviewed (first time only)
- [ ] Changes tested locally
- [ ] No console errors
- [ ] Works on mobile viewport
- [ ] All links functional
- [ ] No hardcoded secrets or credentials
- [ ] Code follows existing style
- [ ] Changes are minimal and focused
- [ ] Related documentation updated

## 🌟 Success Criteria

You're doing it right when:

✓ Changes are minimal and targeted
✓ Existing functionality still works
✓ Design aesthetic is maintained
✓ API integrations remain stable
✓ Site loads fast and error-free
✓ Code is clean and well-commented
✓ Testing was thorough

## 📖 Remember

> "Where Consciousness Meets Code"

Every change you make is part of a larger ecosystem. Understanding the context makes you a better contributor. Take time to onboard properly - it will save time later and result in higher quality work.

**Now go read that onboarding document! 📚**

---

**For Questions**: Create an issue in the repository
**Last Updated**: January 2025
