---
name: prompt-enhancer
description: "Use this skill to expand, enhance, and structure user prompts. It turns vague instructions into detailed, logical, and comprehensive agent tasks."
---

# Prompt Enhancer Skill

## Overview
This skill is designed to take a user's initial input—whether vague or brief—and expand it into a fully optimized, logically structured prompt. This ensures that subsequent agent execution is precise, follows best practices, and misses no details.

## Core Capabilities
- **Logical Expansion**: Fills in gaps in the user's request with logical steps and necessary context.
- **Structural Organization**: Formats the prompt into clear sections (Role, Context, Task, Constraints).
- **Detail Addition**: Adds technical specifications, best practices, and edge-case handling relevant to the domain.

## Process

When you use this skill, follow these steps to generate the enhanced prompt:

1.  **Analyze the Request**:
    - Identify the core goal (what does the user want?).
    - Determine the domain (Coding, Writing, Design, etc.).
    - Detect implicit needs (e.g., if they ask for code, they strictly imply needing error handling and comments).

2.  **Define the Persona**:
    - Assign an expert role fitting the task (e.g., "Senior DevOps Engineer", "Creative Copywriter").

3.  **Draft the Enhanced Prompt**:
    - **Context**: State the background and high-level purpose.
    - **Goal**: Clearly define the definition of done.
    - **Detailed Requirements**: Break down the specific features or logical steps.
    - **Constraints/Guidelines**: Specify technologies, tone, length, or forbid certain patterns.
    - **Output Format**: precise description of what to return (Markdown, Code, JSON, etc.).

4.  **Review, Refine, Translate**:
    - Ensure the logic flows linearly.
    - **Language**: If the user's original request is in German, the enhanced prompt implies a German context, but technical instructions are often better in English. **However**, if the user specifically asks for the prompt *text* to be generated, match the user's requested language.

## Template for Enhanced Prompts

You can use a structure similar to this for the final output:

```markdown
# [Task Title]

## Role
[Expert Role Definition]

## Context & Objective
[Detailed background and clear goal statement]

## Step-by-Step Instructions
1. [First logical step]
2. [Second logical step...]
   - [Sub-detail or requirement]

## Technical Requirements / Constraints
- [Tech Stack requirement]
- [Performance requirement]
- [Styling requirement]

## Expected Output
[Definition of the final deliverable]
```

## Best Practices
- **Assume Competence**: Instruct the target agent to act as a senior/expert.
- **Be Specific**: "Make it fast" -> "Optimize for < 100ms TTI".
- **Safety First**: For code, always include instructions for validation and error handling.
- **Creativity**: If the user asks for "ideas", specify "provide 3 distinct, creative options with pros/cons".
