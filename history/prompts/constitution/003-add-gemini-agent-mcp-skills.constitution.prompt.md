---
id: "003"
title: "Add Gemini Agent and MCP Skills"
stage: "constitution"
date: "2026-01-10"
surface: "agent"
model: "sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "Claude Code User"
command: "/sp.constitution update my constitution i have created some skills: context7-efficient, openai-agents-gemini, mcp-todo-skill, mcp-sdk. You should use these skills when you work with these technologies especially for agents logic you should use openai-agents-gemini and when you work with mcp you should mcp-sdk / mcp-todo-skill"
labels: ["constitution","skills","agents","gemini","mcp"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - ".specify/memory/constitution.md"
tests: []
---

## Prompt

update my consitution i have created some skills

context7-efficient
openai-agents-gemini
mcp-todo-skill
mcp-sdk

you should use these skills when you work with these technologies especially for agents logic you should use openai-agents-gemini
and when you work with mcp you should mcp-sdk / mcp-todo-skill

its very important to use this skill

## Response snapshot

Updated constitution from v1.1.0 to v1.2.0 with new skills guidance:
- Added openai-agents-gemini skill for OpenAI Agents SDK with Gemini patterns
- Added mcp-sdk skill for Model Context Protocol development
- Added mcp-todo-skill for MCP-based todo management tools
- Updated Principle VIII with organized skill categories and usage priority
- Updated monorepo structure in Principle VI to reflect new skills
- Version bump: MINOR (new skills and expanded guidance)

## Outcome

- ✅ Impact: Constitution updated to mandate skill usage for specific technology areas
- 🧪 Tests: None required (constitution update)
- 📁 Files: Modified `.specify/memory/constitution.md`
- 🔁 Next prompts: None
- 🧠 Reflection: User emphasized importance of using the correct skills for agent and MCP work

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment: N/A
