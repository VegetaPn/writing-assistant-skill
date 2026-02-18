# Steps 6-10: Polish to Publish — Detailed Instructions

> This document contains full instructions for the later workflow steps.
> SKILL.md contains a summary with key constraints; refer here for complete details.

## Step 6: Polish the Draft

> **Start:** Read progress tracker. Review selected techniques and target platform. Update Step 6 status to in-progress.

**【强制】使用 Skill 工具调用 content-research-writer**，不得手动润色代替。

**Before invoking the polishing skill, compile technique-aware instructions:**

1. **Target platform**: "{platform}" — apply platform-specific length, tone, and formatting rules
2. **Selected techniques**: List the techniques from Step 2 and their key principles
3. **Technique-specific polish checklist** (derive from selected techniques):
   - If Content Funnel (TOFU): "Ensure every paragraph passes the 'give it to your parents to read' test. Remove jargon. Strengthen emotional hooks. Make every section relatable."
   - If Content Funnel (MOFU): "Maintain depth and credibility. Add supporting evidence. Build trust through expertise demonstration."
4. **Author style reference** (if one was chosen in Step 2): key style characteristics to maintain
5. **Lessons from experience library**: any relevant rules from `assets/experiences/lessons.md` (`READ:3L`)

**Then invoke the skill:**

```
❌ 禁止：自己直接修改草稿文件来完成润色
✅ 正确：编译上述指令 → 使用 Skill 工具调用 content-research-writer → 技能产出 polished.md

Invoke: content-research-writer skill (via Skill tool)
Input: The initial or user-provided draft + technique-aware instructions compiled above
Output: {filename}-polished.md
```

The polished version should have:
- Improved structure and flow
- Better hooks and engagement
- Citations and research integration
- Professional writing quality
- **Technique principles applied throughout** (not just surface-level polish)
- **Platform-appropriate style and length**

> **Experience Check:** After presenting polished draft to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker with output filename. Proceed to Step 7.

## Step 7: Generate Illustrations

> **Start:** Read progress tracker. Update Step 7 status to in-progress.

**【强制】使用 Skill 工具调用 baoyu-xhs-images**，传入 polished.md 内容。技能会自动完成：内容分析 → 风格/布局选择 → outline 生成 → prompt 文件生成。然后根据 prompt 文件调用 generate-image 生成实际图片。

```
❌ 禁止：手动编写 outline.md 和 prompt 文件
✅ 正确：使用 Skill 工具调用 baoyu-xhs-images → 技能自动产出 outline + prompts → 再生成图片

Invoke: baoyu-xhs-images skill (via Skill tool)
Input: {filename}-polished.md content
Output: Generated outline, prompts, and images
```

**Image Guidelines:**
- Images should be appropriately spaced (not too dense, usually 3~5 images)
- Select key points that benefit from visual illustration
- Maintain balance between text and visuals

> **Experience Check:** After presenting illustrations to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. Proceed to Step 8.

## Step 8: Create Final Article

> **Start:** Read progress tracker. Update Step 8 status to in-progress.

Combine the polished content with generated images:

1. Take the {filename}-polished.md content
2. Insert images at appropriate positions
3. Ensure proper formatting and layout
4. Create final output: {filename}-final.md

**呈现最终文章（不可省略）：** 创建 final.md 后，必须：
1. 告知用户最终文件路径
2. 简要说明图片插入位置（哪张图在哪个段落）
3. **等待用户确认**再继续到 Step 9

用户确认可以是：明确说"好的/可以/继续"，或直接给出修改意见。不得在用户未回复时就标记 Experience Check 为完成。

> **Experience Check:** After presenting the final article to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **⚠️ STOP: 不得直接跳到 Step 10。** 即使用户在此步说"发布"，也必须先执行 Step 9。Step 9 是审稿缓冲层，确保用户在发布前正式审阅最终图文排版。

> **End:** Update progress tracker with output filename. Proceed to Step 9.

## Step 9: Review and Platform Adaptation

> **本步骤不可跳过。** 即使用户已表达发布意图（如"发布到微信"），仍需执行 9a（呈现总结 + 问修改意见）。如果用户确认无修改，可以快速通过 9b 和 9c 直接进入 Step 10。

> **Start:** Read progress tracker. Review target platform and all applied techniques. Update Step 9 status to in-progress.

After creating the final article, summarize the work completed and guide the user through review and optional adaptation.

**9a. Review:**

**Do not write a summary document**. Instead, provide a brief verbal summary covering:
- What was written and for which platform
- Which references and techniques were applied
- Key decisions made during the process

Ask:
- "Would you like to make any revisions?"
- Handle revisions if requested (loop back to relevant step)

**9b. Platform Adaptation (Optional):**

Ask: "Would you like to adapt this article for another platform?"

If yes → read and invoke `skills/content-adapter.md`.

Pass to content-adapter:
- **Source file path**: the final article from this workflow (`outputs/{topic-slug}/{topic-slug}-final.md`)
- **Source platform**: the platform this article was written for (from Step 1)
- **Target platform(s)**: the platform(s) user wants to adapt to

Content-adapter handles the full adaptation process: core information extraction, platform search, title generation, content restructuring per platform spec, and quality check. When adapting to multiple platforms, content-adapter processes them one at a time, sharing the core extraction.

Output: `outputs/{topic-slug}/{topic-slug}-{platform}.md` (platform slug: wechat / xhs / x / douyin)

**9c. Publishing Decision:**

Ask:
- "Would you like to publish this article?"
- Present available publishing options based on installed dependencies

> **Experience Check:** Review all user feedback in this step. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. Proceed to Step 10 if publishing, or conclude session.

## Step 10: Publish (Optional)

> **Start:** Read progress tracker. Update Step 10 status to in-progress.

If the user wants to publish, invoke the appropriate skill:

**For 小红书 (Xiaohongshu):**
```
Invoke: xiaohongshu-mcp skill
Command: python scripts/xhs_client.py publish "{title}" "{content}" "{image_urls}"
```
Ensure the xiaohongshu-mcp local server is running before publishing.

**For WeChat Official Account:**
```
Invoke: baoyu-post-to-wechat skill
Input: {filename}-final.md and images
```

**For X (Twitter):**
```
Invoke: baoyu-post-to-x or x-article-publisher skill
Input: {filename}-final.md and images
```

Follow the publishing skill's workflow for platform-specific requirements.

> **End:** Update progress tracker with publication result.

**发布后数据记录提醒（不可省略）：**

发布成功后，向用户展示以下提醒：

> "建议过几天数据稳定后，告诉我各平台数据（阅读量、点赞等），直接说「记录数据」即可。"

Then proceed to **流程自检**.

## 流程完成自检（不可跳过）

> 在标记会话完成之前，必须执行以下自检：
>
> 1. **读取进度文件**，逐步检查所有 checkbox
> 2. **标记遗漏**：如果发现任何应勾未勾的 checkbox：
>    - 如果是确实执行了但忘记标记 → 补标并注明"自检时补标"
>    - 如果是确实跳过了 → 在 Session Notes 中记录原因，并询问用户是否需要补做
> 3. **检查 Corrections Log**：确认所有 correction 都有 Case File，没有 Pending
> 4. **检查 Step 9**：确认 Step 9 所有子步骤已执行（Step 9 不可跳过）
> 5. **向用户报告自检结果**：
>    - "自检完成，所有步骤已执行。" 或
>    - "自检发现以下遗漏：{list}。需要补做吗？"
> 6. **更新进度文件**的"流程自检"区域，记录自检时间和结果

## Best Practices

1. **Be Patient with Questions**: Take time in Step 3 to thoroughly understand the user's vision
2. **Research Thoughtfully**: Supplement user input with credible sources when gaps exist
3. **Preserve User Voice**: While polishing, maintain the user's intended tone and style
4. **Image Selection**: Be selective with images - quality and relevance over quantity
5. **Review Before Publishing**: Confirm the user is satisfied with the final article before publishing
6. **Use References as Inspiration, Not Templates**: The reference library provides patterns and techniques, not content to copy. Adapt them to the user's unique voice and topic.
7. **Let User Choose**: Always present reference-based suggestions as options, not requirements. The user has final say on title, opening, and structure.
8. **Style Consistency**: If a user chooses to reference a specific author's style, maintain that influence throughout the article for consistency.
9. **Apply Techniques Throughout, Not Just to Elements**: Writing techniques from `references/techniques/` should influence the entire article body — paragraph structure, language choices, emotional arc, example selection — not just the title and opening. Check the technique's Practice Guide at the paragraph level.
10. **Track Everything in the Progress File**: The progress tracker is your session memory. Read it before each step, update it after. This prevents skipped sub-steps and ensures corrections are captured.
11. **Choose the Right Write Level**: When recording experiences, benchmarks, or new reference patterns, always choose the correct target level. Universal lessons → `WRITE:user`. Article-specific overrides → `WRITE:project`. When in doubt, ask the user: "这条经验是通用的还是仅针对本文？"
