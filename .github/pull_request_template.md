# Pull Request Template

## 📋 Description

Please provide a clear and concise description of what this PR does.

**Summary:**
<!-- Brief summary of changes -->

**Related Issue(s):**
<!-- Link to related issues -->
Closes #(issue number)
Related to #(issue number)

## 🔧 Type of Change

Please check the type of change your PR introduces:

- [ ] 🐛 **Bug fix** (non-breaking change which fixes an issue)
- [ ] ✨ **New feature** (non-breaking change which adds functionality)
- [ ] 💥 **Breaking change** (fix or feature that would cause existing functionality to change)
- [ ] 📝 **Documentation** (changes to documentation only)
- [ ] 🎨 **Style** (formatting, missing semi-colons, etc; no code change)
- [ ] ♻️ **Refactoring** (code change that neither fixes a bug nor adds a feature)
- [ ] ⚡ **Performance** (code change that improves performance)
- [ ] ✅ **Tests** (adding missing tests or correcting existing tests)
- [ ] 🔧 **Chore** (changes to build process, auxiliary tools, libraries, etc.)

## 🧪 Testing

Please describe the tests that you ran to verify your changes:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] End-to-end tests pass

**Test Configuration:**
- Node.js version:
- Browser(s) tested:
- Device(s) tested:

## 🌐 Arabic/RTL Support

For UI changes, please verify:

- [ ] Layout works correctly in Arabic (RTL)
- [ ] Text displays properly in Arabic
- [ ] Icons and images are appropriate for RTL
- [ ] Navigation flows correctly in RTL
- [ ] Responsive design works in both languages

## 📱 Mobile/Responsive Testing

- [ ] Mobile browsers tested (Safari, Chrome, Firefox)
- [ ] Tablet view tested
- [ ] Desktop view tested
- [ ] Print styles (if applicable)

## 🔒 Security Checklist

- [ ] No sensitive information exposed
- [ ] Input validation implemented
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS prevention measures
- [ ] Authentication/authorization checks
- [ ] Rate limiting considered (if applicable)

## 📊 Performance Impact

- [ ] No significant performance degradation
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Bundle size impact considered
- [ ] Caching strategy implemented (if applicable)

## 🗄️ Database Changes

If this PR includes database changes:

- [ ] Migration files included
- [ ] Migration tested locally
- [ ] Migration is reversible
- [ ] Seed data updated (if needed)
- [ ] Database indexes considered

## 📸 Screenshots/Videos

For UI changes, please include screenshots or screen recordings:

### Before
<!-- Screenshots of the current state -->

### After  
<!-- Screenshots of the new state -->

### Arabic/RTL View
<!-- Screenshots showing RTL layout -->

### Mobile View
<!-- Screenshots of mobile responsive design -->

## ✅ Pre-submission Checklist

Before submitting this PR, please verify:

- [ ] Code follows project coding standards
- [ ] Self-review completed
- [ ] Code is properly commented
- [ ] Tests added for new functionality
- [ ] All existing tests pass
- [ ] Documentation updated (README, API docs, etc.)
- [ ] Arabic translations added/updated
- [ ] Commit messages follow conventional format
- [ ] No console.log or debug code left behind
- [ ] Environment variables documented (if new ones added)

## 🚦 CI/CD Status

- [ ] All GitHub Actions workflows pass
- [ ] Build succeeds
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Security scan passes

## 📚 Documentation Updates

- [ ] README.md updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] ARCHITECTURE.md updated (if applicable)
- [ ] Environment variables documented (if applicable)
- [ ] JSDoc comments added/updated

## 🔄 Breaking Changes

If this is a breaking change, please describe:

**What breaks:**
<!-- Description of what functionality changes -->

**Migration guide:**
<!-- How users should update their code -->

**Deprecation timeline:**
<!-- When will old functionality be removed -->

## 🎯 Saudi Market Considerations

For features affecting the Saudi market:

- [ ] SAR currency formatting
- [ ] Saudi phone number validation
- [ ] Local business rules implemented
- [ ] Cultural considerations addressed
- [ ] Islamic calendar support (if applicable)
- [ ] Payment gateway compatibility (Tap, HyperPay, MADA)

## 📞 Reviewer Instructions

**Focus Areas:**
<!-- What should reviewers pay special attention to? -->

**Testing Instructions:**
<!-- Specific steps for reviewers to test this change -->

## 🙋‍♂️ Questions for Reviewers

<!-- Any specific questions you have for code reviewers -->

---

## 📝 Additional Notes

<!-- Any additional information that would be helpful for reviewers -->

---

### Checklist for Reviewers

- [ ] Code quality and standards
- [ ] Business logic correctness
- [ ] Security considerations
- [ ] Performance impact
- [ ] Arabic/RTL support
- [ ] Mobile responsiveness
- [ ] Test coverage
- [ ] Documentation completeness

---

*By submitting this pull request, I confirm that my contribution is made under the terms of the MIT license and I have read the [Contributing Guidelines](CONTRIBUTING.md).*