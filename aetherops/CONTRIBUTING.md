# Contributing to AetherOps

Thank you for considering contributing to the AetherOps edge AI orchestrator! Our goal is to make edge orchestration concepts visually accessible and technically robust.

## Getting Started

1. **Prerequisites**
   Before you begin, ensure you have Python 3.10+, Node.js 18+, and Docker installed.
2. **Local Environment setup**
   - Backend: Navigate to `services/edge-gateway` and install dependencies `pip install -r requirements.txt`.
   - Frontend: Navigate to `apps/web` and install dependencies `npm install`.

## Code Style & Standards

- **React / TypeScript:** We use ESLint and Prettier for the frontend logic. Always ensure interfaces are properly declared and JSDoc is robust for the `lib` folder.
- **FastAPI / Python:** We use `black` for formatting and try to adhere strictly to type hints for request/response payloads.

## Making a Pull Request

1. Fork the repo and create your branch from `main`.
2. Do your work and write meaningful commit messages outlining *what* and *why* you are making the change. (See our 40-commit roadmap as an example of structured commit scoping).
3. If you've added new API routes, ensure they are documented in FastAPI Swagger.
4. Issue a PR with a descriptive title!

Happy hacking and building the future of the edge!
