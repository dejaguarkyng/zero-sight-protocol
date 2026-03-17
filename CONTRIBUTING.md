# Contributing to Zero Sight Protocol

Thanks for taking the time to contribute.

## Ways to Contribute

- Report bugs
- Propose features
- Improve documentation
- Submit fixes and enhancements

## Getting Started

1. Fork the repository.
2. Create a feature branch.
3. Install dependencies.
4. Run tests and type checks.
5. Open a pull request.

## Local Setup

```bash
pnpm install
pnpm typecheck
pnpm test -- --run
pnpm build
```

## Development Guidelines

- Keep changes focused and small.
- Preserve public API behavior unless a breaking change is explicitly discussed.
- Add or update tests for behavior changes.
- Prefer clear naming and minimal complexity.
- Update docs when user-facing behavior changes.

## Commit and PR Guidelines

- Use clear commit messages.
- In PR descriptions, include:
  - What changed
  - Why it changed
  - How it was tested
  - Any breaking change notes
- Link related issues when available.

## Pull Request Checklist

- Tests pass locally.
- Type check passes locally.
- Docs were updated if needed.
- No unrelated refactors were included.

## Questions

For discussion, open an issue with context and expected behavior.
