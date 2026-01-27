# Writing Assistant Skill

A comprehensive end-to-end writing workflow skill for Claude Code that transforms ideas, materials, or rough drafts into polished, illustrated articles ready for publication.

## Overview

Writing Assistant orchestrates a complete multi-step writing process from ideation to publication, helping users create professional content for blogs, articles, and social media platforms.

## Features

- **Multi-Mode Support**: Start from a topic idea, organized materials, or an existing draft
- **Interactive Clarification**: Intelligent questioning system to understand user intent and gather necessary details
- **Research Integration**: Automatic web research to supplement content with credible sources
- **Content Polishing**: Integration with content-research-writer for professional-grade refinement
- **Visual Enhancement**: Automatic illustration generation using baoyu-xhs-images
- **Multi-Platform Publishing**: Direct publishing to WeChat Official Account or X (Twitter)

## Installation

### For Claude Code

1. Download the `writing-assistant.skill` file
2. Install the skill:
   ```bash
   claude skill install writing-assistant.skill
   ```

### Manual Installation

1. Clone this repository or download the files
2. Copy `SKILL.md` to your Claude Code skills directory:
   ```bash
   cp SKILL.md ~/.claude/skills/writing-assistant/
   ```

## Usage

Invoke the skill in Claude Code:

```
/writing-assistant
```

Or ask Claude to help with writing tasks:
- "I want to write an article about..."
- "Help me polish this draft..."
- "I have some materials I want to turn into a blog post..."

## Workflow

### Step 1: Choose Your Starting Point

The skill supports three modes:

**Mode 1: Topic-Based**
- Start with just a topic or theme
- Best for brainstorming from scratch

**Mode 2: Materials-Based**
- Provide loosely organized notes, references, or research
- Ideal for organizing existing materials into coherent content

**Mode 3: Draft-Based**
- Start with an unpolished initial draft
- Perfect for refining and improving existing content

### Step 2: Interactive Clarification (Modes 1 & 2)

The skill will:
1. Analyze your provided content
2. Ask tailored, content-specific questions
3. Conduct supplementary research if needed
4. Organize everything into an initial draft

### Step 3: Polish & Refine

Uses the `content-research-writer` skill to:
- Improve structure and flow
- Enhance hooks and engagement
- Add citations and research
- Elevate writing quality

### Step 4: Add Illustrations

Uses the `baoyu-xhs-images` skill to:
- Generate appropriate visuals
- Create infographic-style images
- Enhance key points with visual elements

### Step 5: Final Assembly

Combines polished content with generated images into a publication-ready article.

### Step 6: Publish (Optional)

Direct publishing support for:
- **WeChat Official Account** (微信公众号) via `baoyu-post-to-wechat`
- **X/Twitter** via `baoyu-post-to-x` or `x-article-publisher`

## Dependencies

This skill integrates with the following Claude Code skills:

- `content-research-writer` - For content polishing and refinement
- `baoyu-xhs-images` - For generating illustrations
- `baoyu-post-to-wechat` - For WeChat publishing (optional)
- `baoyu-post-to-x` or `x-article-publisher` - For X/Twitter publishing (optional)

## File Naming Convention

The workflow uses consistent naming:
- Initial draft: `{topic-or-title}.md`
- Polished version: `{topic-or-title}-polished.md`
- Final version: `{topic-or-title}-final.md`

## Best Practices

1. **Be Patient with Questions**: Take time to thoroughly answer clarifying questions for best results
2. **Provide Context**: The more context you provide, the better the output
3. **Review at Each Stage**: Check the draft, polished version, and final article before publishing
4. **Image Balance**: Images should enhance, not overwhelm the content
5. **Platform Considerations**: Review platform-specific requirements before publishing

## Examples

### Starting from a Topic

```
User: I want to write about the future of AI in healthcare
Skill: [Asks clarifying questions about audience, angle, key points]
User: [Provides answers]
Skill: [Researches, drafts, polishes, adds images, creates final article]
```

### Refining Existing Materials

```
User: I have some notes about my recent conference experience
Skill: [Asks for file path, analyzes materials, clarifies gaps]
User: [Provides additional context]
Skill: [Organizes into draft, polishes, enhances with images]
```

### Polishing a Draft

```
User: I wrote this draft but it needs work [provides file]
Skill: [Directly proceeds to polishing and enhancement]
```

## File Structure

```
writing-assistant-skill/
├── README.md           # This file
├── SKILL.md            # Skill definition for Claude Code
└── writing-assistant.skill  # Packaged skill file
```

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## License

MIT License

## Author

[VegetaPn GitHub](https://github.com/VegetaPn)

## Changelog

### Version 1.0.0
- Initial release
- Support for three starting modes (topic, materials, draft)
- Integration with content-research-writer and baoyu-xhs-images
- Publishing support for WeChat and X platforms
