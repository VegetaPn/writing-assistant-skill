# Writing Assistant Skill

English | [简体中文](README.zh-CN.md)

A comprehensive end-to-end writing workflow skill for Claude Code that transforms ideas, materials, or rough drafts into polished, illustrated articles ready for publication.

## Overview

Writing Assistant orchestrates a complete multi-step writing process from ideation to publication, helping users create professional content for blogs, articles, and social media platforms.

## Features

- **Multi-Mode Support**: Start from a topic idea, organized materials, or an existing draft
- **Reference Library System**: Built-in library of writing styles, title patterns, opening techniques, and article structures for inspiration
- **Interactive Clarification**: Intelligent questioning system to understand user intent and gather necessary details
- **Element-Level Refinement**: Title, opening paragraph, and structure suggestions based on proven patterns
- **Research Integration**: Automatic web research to supplement content with credible sources
- **Content Polishing**: Integration with content-research-writer for professional-grade refinement
- **Visual Enhancement**: Automatic illustration generation using baoyu-xhs-images
- **Multi-Platform Publishing**: Direct publishing to WeChat Official Account or X (Twitter)

## Installation

### Option 1: Ask Claude Code to Install (Recommended)

Simply ask Claude Code to install this skill for you:

```
Install the writing-assistant skill from https://github.com/VegetaPn/writing-assistant-skill to my project directory
```

Claude will automatically download and set up the skill with all bundled dependencies.

### Option 2: Manual Installation

Download and extract the skill to your project:

```bash
# Download the latest version
curl -L https://github.com/VegetaPn/writing-assistant-skill/archive/refs/heads/main.zip -o writing-assistant-skill.zip

# Extract to your project's .claude/skills directory
mkdir -p .claude/skills
unzip writing-assistant-skill.zip -d .claude/skills/
mv .claude/skills/writing-assistant-skill-main .claude/skills/writing-assistant

# Clean up
rm writing-assistant-skill.zip
```

Alternatively, download manually:
1. Visit https://github.com/VegetaPn/writing-assistant-skill/archive/refs/heads/main.zip
2. Download and extract the ZIP file
3. Move the extracted folder to `.claude/skills/writing-assistant/` in your project directory

## Configuration

### Environment Setup for Image Generation

**Important**: The `baoyu-xhs-images` skill generates image descriptions and layouts. To convert these descriptions into actual images, you need the `generate-image` skill with OPENROUTER API access.

**If you want to generate actual images** (not just descriptions), follow these steps:

1. **Get an OPENROUTER API key**:
   - Visit [OpenRouter](https://openrouter.ai/)
   - Sign up or log in to your account
   - Generate an API key from your dashboard

2. **Create a `.env` file** in your project root:
   ```bash
   # Create .env file
   touch .env
   ```

3. **Add your OPENROUTER API key** to the `.env` file:
   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Verify the configuration**:
   ```bash
   # Check that .env exists and contains the key
   cat .env
   ```

**Security Note**: Add `.env` to your `.gitignore` to keep your API key secure:
```bash
echo ".env" >> .gitignore
```

**If you skip this configuration**: The workflow will still work, but Step 5 (illustration generation) will only produce text descriptions of images. You'll need to create the actual images manually or using other tools.

## Usage

Invoke the skill in Claude Code:

```
/writing-assistant
```

Or ask Claude to help with writing tasks:
- "I want to write an article about..."
- "Help me polish this draft..."
- "I have some materials I want to turn into a blog post..."

## Reference Library

The Reference Library (`references/`) provides style guidance, writing patterns, and inspiration. You can build and use it through natural conversation with Claude Code.

### Building Your Reference Library

Simply tell Claude Code what you want to add:

**Adding an author's writing style:**
- "Analyze Dan Koe's writing style and add it to my reference library"
- "Add this article to my references and extract the writing patterns"
- "Create a profile for {author name} based on these articles: {URLs or file paths}"

**Adding writing elements:**
- "Extract the title pattern from this article and add it to my titles reference"
- "Analyze this opening paragraph and save it as a reference"
- "Add this article structure as a template to my references"

**Organizing by topic:**
- "Save this article under the AI topic in my reference library"
- "Create a new topic folder for productivity articles"

### Using the Reference Library

During the writing workflow, the skill automatically searches your reference library. You can also explicitly request styles:

- "Write this article in Dan Koe's style"
- "Use the hypothesis-subversion title pattern from my references"
- "Apply the anxiety-resonance opening technique"
- "Show me what author styles I have available"
- "What title patterns do I have in my reference library?"

### Reference Library Structure

```
references/
├── authors/                    # Author profiles and articles
│   └── {author-name}/
│       ├── profile.md          # Writing style analysis
│       └── articles/           # Sample articles
│
├── by-element/                 # Writing elements (case-driven)
│   ├── titles/                 # Title patterns
│   ├── openings/               # Opening techniques
│   ├── structures/             # Article structures
│   └── hooks/                  # Engaging hooks
│
├── by-topic/                   # Topic-based examples
│
└── techniques/                 # Methodology-level guidance (principle-driven)
    └── psychology/             # Psychology-based methodologies
        ├── psychology-index.md # Methodology index (structured summary)
        ├── content-funnel.md   # Raw source material
        └── content-funnel.png  # Diagram
```

**Case Library vs Methodology Library:**
- `by-element/` (Case Library): What is this article's title, and why is it good
- `techniques/` (Methodology Library): What are the underlying principles of a good title, and how to systematically create great content

**Methodology Entry Format:**
Each methodology includes: Core Framework → Psychology Mechanism → Why It Works → Application Scenarios → Practice Guide → Case Study

## Dependencies

This skill requires several other skills to function. These dependencies are **bundled in the repository** for your convenience and will be automatically installed when needed.

### Automatic Installation

When you run `/writing-assistant`, the skill will automatically:
1. Check which dependencies are installed
2. Offer to install missing dependencies from bundled versions
3. Copy them to your project's `.claude/skills/` directory with your permission

This ensures a seamless experience without needing to manually hunt down and install each dependency.

### Required Skills

- **content-research-writer** - Polishes and refines content with professional writing quality
- **baoyu-xhs-images** - Generates illustration descriptions and layouts in Xiaohongshu style

### Optional Skills

- **generate-image** - Generates actual images from descriptions using AI models (requires OPENROUTER API key). **Important**: Without this skill, `baoyu-xhs-images` will only produce text descriptions of images, not actual image files.
- **baoyu-post-to-wechat** - Publishes to WeChat Official Account (微信公众号)
- **baoyu-post-to-x** - Publishes to X/Twitter

### Image Generation Requirements

To generate **actual images** (not just descriptions):
1. Install the `generate-image` skill (bundled in dependencies)
2. Configure OPENROUTER API key (see Configuration section above)

Without `generate-image`, the workflow will still work but Step 5 will only produce image descriptions that you'll need to create manually.

### Manual Installation

If automatic installation doesn't work or you prefer manual control, you can copy skills directly:

```bash
# From the writing-assistant repository root
# For project-local installation
mkdir -p .claude/skills
cp -r dependencies/content-research-writer .claude/skills/
cp -r dependencies/baoyu-xhs-images .claude/skills/

# Or for global installation (available to all projects)
cp -r dependencies/content-research-writer ~/.claude/skills/
cp -r dependencies/baoyu-xhs-images ~/.claude/skills/
```

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
├── README.md                # User documentation (English)
├── README.zh-CN.md          # User documentation (Chinese)
├── SKILL.md                 # Skill definition for Claude Code
├── writing-assistant.skill  # Packaged skill file
├── references/              # Reference library for style guidance
│   ├── authors/             # Author profiles and writing styles
│   ├── by-element/          # Writing elements (titles, openings, structures, hooks)
│   ├── by-topic/            # Topic-based article examples
│   └── techniques/          # Methodology-level guidance
│       └── psychology/      # Psychology-based methodologies
│           └── psychology-index.md  # Methodology index
└── dependencies/            # Bundled dependency skills
    ├── content-research-writer/
    ├── baoyu-xhs-images/
    ├── generate-image/
    ├── baoyu-post-to-wechat/
    └── baoyu-post-to-x/
```

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## License

MIT License

## Author

[VegetaPn GitHub](https://github.com/VegetaPn)

## Changelog

### Version 1.2.0 (2026-02-04)
- **Reference Library System**: Added `references/` directory with author profiles, writing elements, and topic examples
- **Style Guidance**: Search and apply writing styles from reference authors
- **Element-Level Refinement**: Refine titles, openings, and article structure based on proven patterns
- **Hook Integration**: Plan and integrate engaging hooks throughout the article

### Version 1.1.0 (2026-01-31)
- **Bundled Dependencies**: All required skills now included in the repository, including generate-image for actual image generation
- **Automatic Dependency Installation**: Skill automatically checks and installs missing dependencies to project directory
- **Improved User Experience**: Users no longer need to manually hunt down and install dependencies
- **Enhanced Documentation**: Comprehensive installation guide with multiple options, including OPENROUTER configuration instructions
- **Project-Local Installation**: Dependencies installed to `.claude/skills/` for project-specific setup
- **Image Generation Support**: Added generate-image skill and configuration guide for generating actual images

### Version 1.0.0
- Initial release
- Support for three starting modes (topic, materials, draft)
- Integration with content-research-writer and baoyu-xhs-images
- Publishing support for WeChat and X platforms
