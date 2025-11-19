# MCP Server Configuration

This project uses Model Context Protocol (MCP) servers to enhance AI-assisted development workflows.

## Configured Servers

### Playwright MCP Server

**Purpose**: Browser automation for testing and web scraping

**Type**: stdio

**Configuration**:
```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-playwright"]
}
```

**Capabilities**:
- Browser automation and testing
- Web scraping
- UI interaction testing
- Screenshot capture
- Network request monitoring

**Usage**: Tools are available when interacting with GitHub Copilot in VS Code.

---

### Figma MCP Server (Remote)

**Purpose**: Design-to-code workflows using Figma's hosted MCP server

**Type**: http

**URL**: `https://mcp.figma.com/mcp`

**Configuration**:
```json
{
  "type": "http",
  "url": "https://mcp.figma.com/mcp"
}
```

**Features**:
- Generate code from Figma designs (link-based)
- Extract design tokens (colors, spacing, typography)
- Get Code Connect mappings
- Take design screenshots
- Get design metadata

**Limitations**:
- Requires Figma URL with fileKey and node-id
- Cannot use "current selection" in Figma
- Rate limits apply based on Figma plan (Starter: 6 calls/month, Professional+: per-minute limits)

---

### Figma MCP Server (Desktop)

**Purpose**: Local design-to-code workflows with selection support

**Type**: http

**URL**: `http://127.0.0.1:3845/mcp`

**Configuration**:
```json
{
  "type": "http",
  "url": "http://127.0.0.1:3845/mcp"
}
```

**Setup Required**:
1. Open Figma desktop app (must be latest version)
2. Create or open a Design file
3. Switch to Dev Mode (Shift+D)
4. In the inspect panel, click "Enable desktop MCP server"
5. Confirm the server is running at `http://127.0.0.1:3845/mcp`

**Features**:
- All remote server features, plus:
- Selection-based workflows (select frame in Figma, prompt in IDE)
- Local image server for assets
- Faster response times
- No rate limits (beyond Figma REST API limits)

**Advantages over Remote**:
- Can use "current selection" prompts
- Hosts images locally
- Better for rapid iteration

---

## GitHub Copilot Agents

### Figma Design Agent

**Command**: `/figma.design`

**Purpose**: Generate production-ready code from Figma designs

**Location**: `.github/agents/figma.design.agent.md`

**Usage Examples**:

```
/figma.design Generate code for https://figma.com/design/abc123/MyFile?node-id=1-2
```

```
/figma.design Implement the selected frame in Figma using our design system
```

```
/figma.design Extract color and spacing tokens from [Figma URL]
```

**Workflow**:
1. Extracts fileKey and nodeId from Figma URL (or uses current selection)
2. Fetches design context using `get_design_context`
3. Gets visual reference using `get_screenshot`
4. Extracts design tokens using `get_variable_defs` (when needed)
5. Checks Code Connect mappings using `get_code_connect_map`
6. Translates React/Tailwind output to project's tech stack (Angular, etc.)
7. Implements with project's design system and components
8. Validates output against Figma screenshot

**Best Practices**:
- Break large screens into smaller components
- Always specify which design system to use
- Mention existing components to reuse
- Be explicit about framework (Angular, React, Vue, etc.)

---

## Verifying MCP Setup

### Check MCP Configuration

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "MCP: List Servers"
4. Verify all three servers appear

### Test Figma MCP Tools

1. Open Copilot chat (`Ctrl+Alt+B` or `Ctrl+Cmd+I`)
2. Switch to Agent mode
3. Type `#mcp_com_figma_mcp_get_design_context`
4. If tools appear, configuration is correct

### Restart if Needed

If tools don't appear:
1. Restart Figma desktop app (for desktop server)
2. Restart VS Code
3. Check `.vscode/mcp.json` syntax

---

## Rate Limits

### Figma MCP Server

**Starter Plan or View/Collab seats**: 6 tool calls per month

**Professional/Organization/Enterprise with Dev/Full seat**:
- Per-minute rate limits (same as Figma REST API Tier 1)
- Rate limits may change at Figma's discretion

**Desktop Server**: Uses Figma REST API rate limits (no specific MCP limits)

---

## Troubleshooting

### Playwright Issues

**Error**: "Browser not found"
**Solution**: Run `npx playwright install` to download browsers

**Error**: "Command failed"
**Solution**: Ensure Node.js and npm are installed

### Figma Remote Server Issues

**Error**: "Access denied"
**Solution**: Verify you have View, Edit, or Dev seat access to the Figma file

**Error**: "Node not found"
**Solution**: Check nodeId format is "123:456" not "123-456"

**Error**: "Rate limit exceeded"
**Solution**: Upgrade Figma plan or wait for rate limit reset

### Figma Desktop Server Issues

**Error**: "Connection refused"
**Solution**: 
1. Open Figma desktop app
2. Switch to Dev Mode (Shift+D)
3. Enable desktop MCP server in inspect panel
4. Verify server is running at `http://127.0.0.1:3845/mcp`

**Error**: "Tools not available"
**Solution**:
1. Restart Figma desktop app
2. Restart VS Code
3. Verify mcp.json configuration

---

## Additional Resources

- [Figma MCP Documentation](https://www.figma.com/developers/docs/mcp)
- [Playwright MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/playwright)
- [MCP Specification](https://modelcontextprotocol.io/)
- [VS Code MCP Integration](https://code.visualstudio.com/docs/copilot/model-context-protocol)

---

## Design System Integration

When using the Figma agent, you can create project-specific design rules:

1. Use the `/figma.design` agent
2. Include design system requirements in your prompt
3. The agent will use `create_design_system_rules` tool to generate rule files
4. Save output to `.github/agents/` or `.vscode/` for reuse

**Example Rule File**:
```markdown
## Figma MCP Integration Rules
- Use components from `src/app/shared/components`
- Replace Tailwind with SCSS variables from `src/styles/theme.css`
- Follow Angular component structure
- Use project's color tokens: `--primary-color`, `--secondary-color`
- Reuse existing buttons, cards, and typography components
```

---

## Updates

**Last Updated**: November 19, 2025

**Changelog**:
- Initial MCP configuration
- Added Playwright MCP server
- Added Figma remote and desktop MCP servers
- Created Figma design agent
