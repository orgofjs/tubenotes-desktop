# Contributing to TubeNotes

Thank you for your interest in contributing to TubeNotes. This project is actively developed and contributions of all kinds are welcome. You do not need to write code to contribute. Bug reports, feature ideas, testing, and feedback are all valuable.

Please comply with the terms and conditions here to contribute.

---

### How You Can Contribute

**You can contribute in one or more of the following ways:**

- Reporting bugs or unexpected behavior
- Suggesting new features or improvements
- Testing the app on different platforms
- Improving documentation
- Contributing code via pull requests

**Please always check existing issues before creating a new one.**

---

### Reporting Bugs

**If you encounter a bug or unexpected behavior:**

- Use the **Bug report** issue template
- Provide clear steps to reproduce the issue
- Include screenshots or screen recordings if possible
- Mention your operating system and app version

**Well-described bug reports help issues get fixed faster.**

---

### Suggesting Features

**If you have an idea to improve TubeNotes:**

- Use the **Feature request** issue template
- Clearly describe the problem the feature solves
- Explain how you expect the feature to behave
- Keep suggestions focused and well-scoped

**Feature requests may be discussed and refined before implementation.**

---

### Development Setup (Optional)

**If you want to contribute code, you can set up the project locally.**

### Requirements

- Node.js (LTS recommended)
- npm 9.x+
- Git

### Local Setup

1. Fork the repository
2. Clone your fork:

```bash
git clone https://github.com/orgofjs/tubenotes-desktop.git
```

3. Install dependencies:

```bash
npm install
```

4. Development for desktop:

```bash
npm run electron-dev
```

5. Build for Windows

```bash
npm run build-win
```

6. Build for macOS

```bash
npm run build-mac
```

7. Build for Linux

```bash
npm run build-linux
```

### Branch Naming
**Please create a new branch for your work:**

-fix/sidebar-selection
-fix/canvas-autosave
-feature/text-editor-shortcuts
-feature/windows-file-association

Avoid committing directly to main.

### Commit Messages
**Use clear and descriptive commit messages:**

-Fix sidebar active state when leaving canvas view
-Add groundwork for Windows file association support
-Improve canvas text editor keyboard handling

### Pull Requests
**Before opening a Pull Request, please ensure:**

-The code builds and runs locally
-The change is focused on a single concern
-Related issues are referenced


-Push your branch to your fork
-Open a Pull Request against the main branch
-Describe what was changed and why
-Add screenshots or screen recordings for UI changes (if applicable)

### Code Style & Guidelines

-Follow existing code patterns and structure
-Prefer clarity
-Avoid large refactors in unrelated areas
-Keep changes scoped and readable

### Where to Start

**If you are new to the project, look for issues labeled:**

good first issue
help wanted

**These issues are intended to be approachable and well-scoped.**

**You can find [issues](https://github.com/orgofjs/tubenotes-desktop/issues) here.**

### Reporting Bugs & Suggesting Features

-Use the Bug report template for bugs
-Use the Feature request template for new ideas
-Please search existing issues before opening a new one

## Final Notes

Not all contributions need to be code. Testing, feedback, and documentation improvements are equally valuable.

Thank you for helping improve TubeNotes.