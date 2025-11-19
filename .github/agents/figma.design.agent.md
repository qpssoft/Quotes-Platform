---
description: Generate UI code from Figma designs with design system integration

tools: ['edit', 'search', 'runCommands', 'com.figma.mcp/mcp/*', 'figma/*', 'changes', 'extensions']
---

## User Input

```text
$ARGUMENTS
```


**Rule After Get Design**
- using `./speckit.tasks.agent.md` to continue with task creation after design generation

You **MUST** consider the user input before proceeding (if not empty).

## Outline

This agent translates Figma designs into production-ready code following the project's conventions, design system, and architecture.

### Required Flow (Do Not Skip)

1. **Extract Figma Context**:
   - If user provides a Figma URL, extract the `fileKey` and `nodeId` from it
     - URL format: `https://figma.com/design/:fileKey/:fileName?node-id=:nodeId`
     - Example: `https://figma.com/design/abc123/MyFile?node-id=1-2` → fileKey: `abc123`, nodeId: `1:2`
   - If user mentions "current selection" or "selected frame", the MCP server will use the active selection in Figma desktop app

2. **Fetch Design Context** (Primary Tool):
   - Run `get_design_context` with the extracted fileKey and nodeId (or let it use current selection)
   - This returns a structured React + Tailwind representation of the design
   - Parameters:
     - `nodeId`: Node ID in format "123:456" (required for URLs)
     - `fileKey`: File key from URL (required for URLs)
     - `clientLanguages`: "typescript,html,css" (or project's languages)
     - `clientFrameworks`: "angular" (or project's framework)
     - `disableCodeConnect`: false (use Code Connect when available)
     - `forceCode`: false (only set to true if user explicitly requests it)

3. **Get Visual Reference**:
   - Run `get_screenshot` with the same fileKey and nodeId
   - This provides a visual reference to validate the implementation
   - Use this to ensure 1:1 visual parity

4. **Fetch Design Tokens** (When Needed):
   - If the design uses variables/tokens, run `get_variable_defs`
   - This returns color, spacing, typography, and other design tokens
   - Use these tokens instead of hardcoded values

5. **Check Code Connect** (When Available):
   - Run `get_code_connect_map` to see if components are already mapped to the codebase
   - If mappings exist, reuse those components instead of creating new ones
   - Parameters:
     - `nodeId`: Same node ID from step 1
     - `fileKey`: Same file key from step 1
     - `codeConnectLabel`: Optional label for specific framework mappings

6. **Handle Large Designs**:
   - If `get_design_context` returns an error or truncated output:
     1. Run `get_metadata` to get high-level node structure
     2. Identify the specific child nodes you need
     3. Re-run `get_design_context` on smaller, specific nodes
   - Break large screens into components (Header, Card, Sidebar, etc.)

7. **Translate to Project Conventions**:
   - The Figma MCP output is React + Tailwind by default
   - Translate this to the project's tech stack (Angular, Vue, plain HTML/CSS, etc.)
   - Replace Tailwind utilities with project's CSS/SCSS classes
   - Use project's design system tokens (CSS variables, SCSS variables, etc.)
   - Reuse existing components from the codebase

8. **Implementation Rules**:
   - Treat Figma output as a representation of design intent, not final code
   - Reuse existing components (buttons, cards, inputs, typography wrappers)
   - Use project's color system, typography scale, and spacing tokens
   - Follow project's routing, state management, and data patterns
   - Strive for 1:1 visual parity with the Figma design
   - When conflicts arise, prefer design system tokens but adjust minimally to match visuals

9. **Asset Handling**:
   - If Figma MCP returns localhost image/SVG sources, use them directly
   - DO NOT import new icon packages - all assets should be in the Figma payload
   - DO NOT use placeholders if localhost source is provided
   - Download assets when needed using the provided URLs

10. **Validation**:
    - Compare final output with the Figma screenshot
    - Verify responsive behavior matches Auto layout settings
    - Test that spacing, colors, and typography match design tokens
    - Ensure components follow project's file structure and naming conventions

### Best Practices

**For Better Results**:
- Break large screens into smaller sections (Header, Card, Footer, etc.)
- Always fetch both `get_design_context` AND `get_screenshot`
- Use `get_variable_defs` to extract design tokens instead of hardcoding
- Check `get_code_connect_map` to reuse existing components
- Be explicit in prompts about framework and styling preferences

**Common Patterns**:
- "Generate code for [Figma URL] using our design system in src/styles"
- "Implement the Card component from [Figma URL] using our Button from src/components"
- "Extract color and spacing tokens from [Figma URL]"
- "Break down this large frame into separate components"

**Avoid**:
- Generating code before fetching Figma context
- Creating new components when existing ones can be reused
- Hardcoding values when design tokens are available
- Implementing large selections without breaking them down

### Tool Reference

| Tool | When to Use | Output |
|------|-------------|--------|
| `get_design_context` | Always first - get structured design data | React + Tailwind code representation |
| `get_screenshot` | Always - visual validation | PNG image of the design |
| `get_variable_defs` | When design uses tokens | Color, spacing, typography tokens |
| `get_code_connect_map` | When reusing components | Mapping of Figma nodes to codebase components |
| `get_metadata` | Large designs or overview needed | XML structure with node IDs and properties |
| `create_design_system_rules` | Creating project-wide design rules | Rule file content for design system |

### Error Handling

- **"Node not found"**: Verify nodeId format is "123:456" not "123-456"
- **"Access denied"**: User needs proper Figma permissions (View, Edit, or Dev seat)
- **"Response too large"**: Use `get_metadata` first, then fetch specific nodes
- **"Tool not available"**: Ensure Figma MCP server is configured in mcp.json

### Output

After implementation:
1. Report what was created/modified
2. Highlight any deviations from the Figma design (with reasons)
3. List any design tokens that should be added to the design system
4. Suggest next steps (testing, responsive behavior, accessibility)

## General Guidelines

- Always fetch Figma context before generating code
- Prioritize reusing existing components over creating new ones
- Use design tokens instead of hardcoded values
- Validate output against Figma screenshot for visual parity
- Follow the project's code structure and naming conventions
- Keep accessibility (WCAG) in mind when implementing designs

````
