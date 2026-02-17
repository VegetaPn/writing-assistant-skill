# Three-Level Reference System Protocol

Assets (`assets/`) and references (`references/`) follow a three-level hierarchy. Each level has the same directory structure; content merges on read, with lower levels overriding higher levels on conflict.

## Level Definitions

| Level | Location | Purpose |
|-------|----------|---------|
| **System** | `{skill-dir}/assets/`, `{skill-dir}/references/` | Skill 自带默认值。安装到 `.claude/skills/` 后原封不动，不修改 |
| **User** | `{project-root}/assets/`, `{project-root}/references/` | 用户个人积累（经验、选题、对标、自己添加的参考） |
| **Project** | `outputs/{topic-slug}/assets/`, `outputs/{topic-slug}/references/` | 单篇文章特定的 override（按需创建） |

- `{skill-dir}` = skill 安装路径，即 `.claude/skills/writing-assistant/`（或开发时的仓库根目录）
- `{project-root}` = 用户的项目工作目录

## READ Protocol (`READ:3L`)

Every time you read a file under `assets/` or `references/`, check **all three levels** in order:

1. **System** — `{skill-dir}/assets/...` or `{skill-dir}/references/...`
2. **User** — `{project-root}/assets/...` or `{project-root}/references/...`
3. **Project** — `outputs/{topic-slug}/assets/...` or `outputs/{topic-slug}/references/...`

**Merge rules:**
- Concatenate content from all levels that exist, annotating each section with its source level: `[system]`, `[user]`, `[project]`
- On conflict (same key/entry), lower level wins: **project > user > system**
- If a level doesn't exist for that path, skip it silently

Shorthand: **`READ:3L`** means "apply the three-level read protocol."

## WRITE Protocol

Each write operation targets a specific level. Default is user-level unless specified otherwise.

| Write Target | Shorthand | When to Use |
|-------------|-----------|-------------|
| User level | `WRITE:user` | General accumulation — experiences, topics, benchmarks, new reference patterns |
| Project level | `WRITE:project` | Article-specific overrides — corrections that only apply to this article |
| System level | (never at runtime) | Only during skill development |

Shorthand: **`WRITE:user`** or **`WRITE:project`** after each write path.

## Quick Reference Table

| Path | Read | Default Write |
|------|------|---------------|
| `assets/experiences/lessons.md` | `READ:3L` | `WRITE:user` (universal) or `WRITE:project` (article-specific) |
| `assets/experiences/cases/` | `READ:3L` | `WRITE:user` |
| `assets/topics/inbox.md` | `READ:user` | `WRITE:user` |
| `assets/topics/developing/` | `READ:user` | `WRITE:user` |
| `assets/topics/benchmarks/` | `READ:3L` | `WRITE:user` |
| `references/authors/` | `READ:3L` | `WRITE:user` |
| `references/by-element/` | `READ:3L` | `WRITE:user` |
| `references/techniques/` | `READ:3L` | `WRITE:user` |
