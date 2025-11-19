# Figma Design Agent - Quick Reference

## Overview

The Figma Design Agent (`/figma.design`) generates production-ready code from Figma designs, integrating with your project's design system and component library.

## Quick Start

### Basic Usage

```
/figma.design Generate code for https://figma.com/design/abc123/MyFile?node-id=1-2
```

### With Design System

```
/figma.design Implement [Figma URL] using components from src/app/shared/components
```

### Current Selection (Desktop Only)

```
/figma.design Implement my current Figma selection with our design system
```

## Workflow

1. **Extract Context**: Agent extracts fileKey and nodeId from URL or uses current selection
2. **Fetch Design**: Gets structured design data using `get_design_context`
3. **Visual Reference**: Captures screenshot using `get_screenshot`
4. **Design Tokens**: Extracts variables/tokens using `get_variable_defs`
5. **Code Connect**: Checks for component mappings using `get_code_connect_map`
6. **Translation**: Converts React/Tailwind output to project's tech stack
7. **Implementation**: Creates/modifies files following project conventions
8. **Validation**: Compares output with Figma screenshot

## MCP Tools Used

| Tool | Purpose |
|------|---------|
| `get_design_context` | Primary design data extraction |
| `get_screenshot` | Visual reference for validation |
| `get_variable_defs` | Design tokens (colors, spacing, typography) |
| `get_code_connect_map` | Component mappings to codebase |
| `get_metadata` | High-level structure for large designs |
| `create_design_system_rules` | Generate project-specific rules |

## Best Practices

### For Better Results

✅ **Do**:
- Break large screens into smaller components (Header, Card, Footer)
- Specify which design system to use
- Mention existing components to reuse
- Be explicit about framework (Angular, React, Vue)
- Use design tokens instead of hardcoded values

❌ **Don't**:
- Generate entire pages at once (break into components)
- Create new components when existing ones can be reused
- Hardcode colors/spacing when tokens are available
- Skip the screenshot validation step

### Example Prompts

**Component Generation**:
```
/figma.design Generate the Button component from [URL] using our button base in src/app/shared/components/button
```

**Token Extraction**:
```
/figma.design Extract all color and spacing tokens from [URL] and add them to src/styles/theme.css
```

**Large Design Breakdown**:
```
/figma.design Break down the Dashboard page at [URL] into separate components: Header, Sidebar, Card, Footer
```

**Responsive Implementation**:
```
/figma.design Implement [URL] with responsive behavior matching the Figma Auto layout
```

## Configuration

### Remote Server (URL-based)

```json
{
  "figma": {
    "type": "http",
    "url": "https://mcp.figma.com/mcp"
  }
}
```

- Uses Figma URLs only
- Rate limits apply (6 calls/month for Starter)
- No local dependencies

### Desktop Server (Selection-based)

```json
{
  "figma-desktop": {
    "type": "http",
    "url": "http://127.0.0.1:3845/mcp"
  }
}
```

- Supports "current selection" prompts
- Faster response times
- Local image hosting
- Requires Figma desktop app running

**Setup Steps**:
1. Open Figma desktop app (latest version)
2. Switch to Dev Mode (`Shift+D`)
3. Enable desktop MCP server in inspect panel
4. Verify at `http://127.0.0.1:3845/mcp`

## Troubleshooting

### Common Errors

**"Node not found"**:
- Check nodeId format: `"1:2"` not `"1-2"`
- Verify URL structure: `figma.com/design/:fileKey/:fileName?node-id=1-2`

**"Access denied"**:
- Requires View, Edit, or Dev seat in Figma
- Check file sharing permissions

**"Response too large"**:
- Break design into smaller components
- Use `get_metadata` first to get structure
- Fetch specific child nodes instead of entire frame

**"Rate limit exceeded"**:
- Upgrade Figma plan
- Use desktop server (no MCP-specific limits)
- Wait for rate limit reset

**"Connection refused" (Desktop)**:
- Start Figma desktop app
- Enable MCP server in Dev Mode
- Restart VS Code if needed

### Verification Steps

1. Check MCP servers: `Cmd+Shift+P` → "MCP: List Servers"
2. Test tool availability: Type `#mcp_com_figma_mcp_get_design_context` in Copilot chat
3. Verify Figma access: Open design file in Figma
4. Check desktop server: Visit `http://127.0.0.1:3845/mcp` in browser

## Advanced Usage

### Design System Rules

Create project-specific rules for consistent output:

```markdown
## Figma MCP Integration Rules
- Use components from `src/app/shared/components`
- Replace Tailwind with SCSS from `src/styles/theme.css`
- Follow Angular component structure
- Use CSS variables: `--primary-color`, `--secondary-color`
- Reuse buttons, cards, typography components
```

Save to `.github/agents/` or `.vscode/` directory.

### Code Connect Integration

If your project uses Code Connect:

1. Agent automatically checks for mappings
2. Reuses connected components instead of generating new ones
3. Maintains consistency with existing codebase

To disable Code Connect (not recommended):
```
/figma.design Generate [URL] without using Code Connect mappings
```

### Asset Handling

- **Local images**: Agent uses `http://localhost:3845/assets/...` URLs
- **Do not** import new icon packages
- **Do not** use placeholders if source provided
- Assets are automatically downloaded when needed

## Integration with Other Agents

### Spec → Plan → Implement → Figma

```bash
# 1. Create specification
/speckit.specify Create quote card component with author attribution

# 2. Build technical plan
/speckit.plan Build plan using Angular and Material Design

# 3. Implement from Figma
/figma.design Generate code for [Figma URL] following the plan

# 4. Execute implementation
/speckit.implement Execute the tasks with generated code
```

### Figma → Test → Validate

```bash
# 1. Generate component
/figma.design Create Button component from [URL]

# 2. Generate tests
Create unit tests for the generated Button component

# 3. Validate design parity
Compare implementation with Figma screenshot for visual accuracy
```

## Rate Limits & Plans

| Plan | Limit | Notes |
|------|-------|-------|
| Starter / View / Collab | 6 calls/month | Includes all tool calls |
| Professional+ with Dev/Full seat | Per-minute | Same as Figma REST API Tier 1 |
| Desktop Server | REST API limits | No MCP-specific limits |

## Resources

- [Figma MCP Documentation](https://www.figma.com/developers/docs/mcp)
- [Code Connect Setup](https://www.figma.com/developers/code-connect)
- [MCP Configuration](../../.vscode/MCP_README.md)
- [VS Code MCP Integration](https://code.visualstudio.com/docs/copilot/model-context-protocol)

## Support

For issues or questions:
1. Check [.vscode/MCP_README.md](../../.vscode/MCP_README.md) for detailed setup
2. Verify MCP server status in VS Code
3. Check Figma desktop server is running (for selection-based prompts)
4. Review error messages for specific tool calls

---

**Last Updated**: November 19, 2025
