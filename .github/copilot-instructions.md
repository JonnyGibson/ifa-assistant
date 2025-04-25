# .cursorrules - AI Development Guidelines
consult the readme.md file to check the current tech stack and goals.
be considering when making change, especially when fixing errors, doubt your self, and think twice
## HTML Standards
- Use **modern HTML5**, ensuring clean, well-structured, and semantic markup.
- Favor accessibility features (ARIA roles, proper heading hierarchy, alt attributes).
- Avoid unnecessary div nesting; prefer native HTML elements for functionality.
- theres no need to be polite or concilatory, i want you to br professional, not friendly

## JavaScript Practices
- Favor **vanilla JavaScript (ECMAScript 2024)** for core functionality.
- Use **npm packages only when essential**, avoiding bloated dependencies.
- Keep JavaScript files **small and contained**, ensuring modular architecture.
- Utilize **ES modules** for efficient code organization.
- Minimize external libraries unless they provide significant benefits.

## Backend Configuration
- Use **Node.js** and **npm** for backend logic and package management.

- Utilize environment variables (`.env`) for sensitive credentials.

## Deployment Guidelines
- Deploy projects to **Netlify** using CI/CD practices.
- Include a `netlify.toml` configuration file for automated builds.
- Ensure optimized asset delivery and caching strategies.

## Code Quality & Best Practices
- Maintain **clean, readable code** with consistent formatting (Prettier/ESLint).
- Use `async/await` for handling asynchronous operations.
- Keep JavaScript logic **lightweight and efficient**, reducing file size.
- Prioritize performance optimizations, avoiding unnecessary re-renders.

## Security Considerations
- Never expose **API keys** or sensitive information in client-side code.
- Validate and sanitize user input to prevent security vulnerabilities.
- Implement authentication and authorization best practices when necessary.

## AI Integration
- When assisting users, ensure generated code follows these principles.
- Provide recommendations based on modern development standards.
- Encourage best practices and efficient workflows.

## Browser Automation (MCP/Playwright) Best Practices
- When using browser automation tools (e.g., Playwright via MCP), prioritize verifying element **interactivity from a user's perspective**.
- Before claiming an element (button, input, link, dropdown etc.) works as expected for a user, attempt to confirm it is **visible, enabled, and clickable (not obscured by other elements or disabled via attributes/CSS)**.
- Do not rely solely on the programmatic success of commands like `fill` or `select`, as these might succeed even if the element is not user-interactive. Where possible, attempt a `click` or check relevant attributes (`disabled`) or computed styles (`pointer-events`, `visibility`, `z-index`, `opacity`) to validate interactability.
- **To detect visual overlays:** If simple checks suggest an element is interactive but user reports indicate it's blocked (e.g., clicks are intercepted), use Playwright's evaluate capability (e.g., `mcp_playwright_playwright_evaluate`) to run `document.elementFromPoint(x, y)` at the element's coordinates. If the returned element is *not* the target element, it indicates an overlay issue.
- Explicitly state if interactability checks (like click attempts, style checks, or `elementFromPoint`) were performed when reporting on UI element functionality.

consider the docs/README.md file to understand current expected functionality