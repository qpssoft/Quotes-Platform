# QuotesPlatform

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## AI-Assisted Development

This project uses Model Context Protocol (MCP) servers to enhance AI-assisted development workflows.

### MCP Servers Configured

- **Playwright MCP**: Browser automation for testing and web scraping
- **Figma MCP (Remote)**: Design-to-code workflows using Figma URLs
- **Figma MCP (Desktop)**: Local design-to-code with selection support

### Figma Design Agent

Use the `/figma.design` agent to generate code from Figma designs:

```
/figma.design Generate code for https://figma.com/design/abc123/MyFile?node-id=1-2
```

For detailed setup and usage instructions, see [.vscode/MCP_README.md](../.vscode/MCP_README.md)

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
