# Contributing to Cargo Parts

🚗 Thank you for your interest in contributing to Cargo Parts! We welcome contributions from the community and are excited to have you help us improve this bilingual marketplace for the Saudi Arabian auto parts market.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Internationalization (i18n)](#internationalization-i18n)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@cargoparts.sa](mailto:conduct@cargoparts.sa).

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm, yarn, or pnpm
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/cargoparts.git
   cd cargoparts
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set Up Database**
   ```bash
   npx prisma generate
   npm run db:migrate
   npm run db:seed  # Optional: Add sample data
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Verify Setup**
   - Visit `http://localhost:3000`
   - Ensure the app loads in Arabic (default locale)
   - Test basic navigation

## 📝 Contributing Guidelines

### Types of Contributions

We welcome the following types of contributions:

- 🐛 **Bug fixes**: Fix existing issues or problems
- ✨ **New features**: Add new functionality
- 📚 **Documentation**: Improve or add documentation
- 🌐 **Translations**: Improve Arabic translations or add new languages
- 🎨 **UI/UX improvements**: Enhance user interface and experience
- ⚡ **Performance optimizations**: Improve app performance
- 🧪 **Tests**: Add or improve test coverage
- 🔧 **Refactoring**: Improve code quality without changing functionality

### Before You Contribute

1. **Check existing issues**: Look for existing issues or discussions
2. **Create an issue**: For significant changes, create an issue first
3. **Discuss the approach**: For major features, discuss the implementation approach
4. **Follow the roadmap**: Align contributions with our project roadmap

### Issue Guidelines

When creating issues, please:

- Use clear, descriptive titles
- Provide detailed descriptions
- Include steps to reproduce (for bugs)
- Add relevant labels
- Include screenshots/videos when helpful
- Specify browser/device information (for frontend issues)

**Issue Templates:**
- 🐛 Bug Report
- ✨ Feature Request
- 📚 Documentation
- 🌐 Translation/Localization
- ❓ Question

## 🔄 Pull Request Process

### Creating a Pull Request

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix-name
   ```

2. **Make Your Changes**
   - Follow our coding standards
   - Write tests for new functionality
   - Update documentation as needed
   - Ensure Arabic/RTL support is maintained

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Follow [Conventional Commits](https://conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

4. **Test Your Changes**
   ```bash
   npm run lint        # Check code style
   npm run type-check  # TypeScript validation
   npm run build       # Ensure build works
   npm test            # Run tests (if available)
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request on GitHub.

### PR Requirements

Your pull request must:

- ✅ Pass all CI/CD checks
- ✅ Include appropriate tests
- ✅ Update documentation
- ✅ Maintain Arabic/RTL support
- ✅ Follow coding standards
- ✅ Include a clear description of changes
- ✅ Reference related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Arabic/RTL functionality verified

## Screenshots
(If applicable)

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, your PR will be merged

## 💻 Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Avoid `any` types
- Define proper interfaces and types
- Use strict TypeScript configuration

```typescript
// ✅ Good
interface ListingFilters {
  make?: string;
  model?: string;
  priceRange?: [number, number];
}

// ❌ Bad
const filters: any = { make: "Toyota" };
```

### React Guidelines

- Use functional components with hooks
- Prefer Server Components when possible
- Use Client Components only for interactivity
- Follow React best practices

```tsx
// ✅ Good - Server Component
async function ListingsPage() {
  const listings = await getListings();
  return <ListingGrid listings={listings} />;
}

// ✅ Good - Client Component when needed
'use client';
function SearchFilters() {
  const [filters, setFilters] = useState({});
  // Interactive functionality
}
```

### Styling Guidelines

- Use Tailwind CSS for styling
- Use logical properties for RTL support
- Follow the design system

```tsx
// ✅ Good - RTL support
<div className="ps-4 pe-2 ms-auto">

// ❌ Bad - No RTL support
<div className="pl-4 pr-2 ml-auto">
```

### API Guidelines

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Include Arabic error messages

```typescript
// ✅ Good
return NextResponse.json(
  { 
    success: false, 
    error: { 
      message: "Invalid request", 
      messageAr: "طلب غير صحيح" 
    } 
  },
  { status: 400 }
);
```

### Database Guidelines

- Use Prisma for database operations
- Follow naming conventions
- Include proper indexes
- Support bilingual content

```prisma
model Listing {
  id          String @id @default(cuid())
  titleAr     String
  titleEn     String?
  description String?
  
  @@index([titleAr])
  @@index([createdAt])
}
```

## 🌐 Internationalization (i18n)

### Arabic-First Approach

Cargo Parts is designed with Arabic as the primary language:

- All text must have Arabic translations
- English is optional but recommended
- RTL layout is the default
- Date/time formatting should support Arabic

### Translation Guidelines

1. **Add Translation Keys**
   ```json
   // messages/ar.json
   {
     "nav.home": "الرئيسية",
     "nav.shop": "المتجر",
     "nav.sellers": "البائعون"
   }
   
   // messages/en.json
   {
     "nav.home": "Home",
     "nav.shop": "Shop", 
     "nav.sellers": "Sellers"
   }
   ```

2. **Use in Components**
   ```tsx
   import { useTranslations } from 'next-intl';
   
   function Navigation() {
     const t = useTranslations('nav');
     return (
       <nav>
         <Link href="/">{t('home')}</Link>
         <Link href="/shop">{t('shop')}</Link>
       </nav>
     );
   }
   ```

### RTL Support Checklist

- [ ] Use logical CSS properties (`ps-`, `pe-`, `ms-`, `me-`)
- [ ] Test layout in Arabic mode
- [ ] Ensure icons and images are appropriate for RTL
- [ ] Verify form layouts work correctly
- [ ] Check text alignment and spacing

## 🧪 Testing Guidelines

### Testing Strategy

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and database operations
3. **E2E Tests**: Test complete user flows
4. **Accessibility Tests**: Ensure WCAG compliance
5. **RTL Tests**: Verify Arabic/RTL functionality

### Writing Tests

```typescript
// Example unit test
describe('formatPrice', () => {
  it('should format SAR currency correctly', () => {
    expect(formatPrice(1000, 'ar')).toBe('1,000 ريال');
    expect(formatPrice(1000, 'en')).toBe('1,000 SAR');
  });
});

// Example component test
describe('ListingCard', () => {
  it('should render Arabic title by default', () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByText(mockListing.titleAr)).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:unit       # Unit tests only
npm run test:e2e        # E2E tests
npm run test:coverage   # Coverage report
```

## 📚 Documentation

### Documentation Requirements

- Update README.md for major changes
- Document new APIs in the code
- Add JSDoc comments for functions
- Update CHANGELOG.md

### Documentation Style

```typescript
/**
 * Searches for listings based on filters
 * @param filters - Search filters including make, model, price range
 * @param locale - User's locale for internationalization
 * @returns Promise containing search results and pagination info
 */
async function searchListings(
  filters: ListingFilters,
  locale: string = 'ar'
): Promise<SearchResults> {
  // Implementation
}
```

## 👥 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Email**: [contribute@cargoparts.sa](mailto:contribute@cargoparts.sa)

### Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Create a new discussion
4. Join our community chat (coming soon)

### Recognition

Contributors will be:
- Listed in our contributors section
- Mentioned in release notes
- Invited to community events
- Eligible for contributor rewards

## 🎯 Project Priorities

### High Priority
- Bug fixes and security issues
- Performance improvements
- Arabic/RTL enhancements
- Core marketplace functionality

### Medium Priority
- New features
- UI/UX improvements
- Additional integrations
- Developer experience improvements

### Low Priority
- Non-critical enhancements
- Experimental features
- Advanced analytics
- Third-party integrations

## ❓ Questions?

If you have any questions about contributing, please:

1. Check this document
2. Search existing issues and discussions
3. Create a new discussion with the "question" label
4. Email us at [contribute@cargoparts.sa](mailto:contribute@cargoparts.sa)

---

<div align="center">

**Thank you for contributing to Cargo Parts! 🚗🇸🇦**

*Together, we're building the future of auto parts commerce in Saudi Arabia*

</div>