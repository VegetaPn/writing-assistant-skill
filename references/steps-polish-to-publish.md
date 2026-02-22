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

> **If Autonomous Mode:** content-research-writer 调用失败时，记录失败原因和影响到 Execution Log 和 Autonomous Decision Log（标注：降级为 AI 自行润色）。AI 自行根据已编译的 technique-aware instructions 润色草稿，产出 polished.md。这是自主模式的设计决策——失败时"记录 + 尽力继续"，而非"报告 + 等待"。跳过 Experience Check，记录 "Autonomous mode — no interaction"。

> **Experience Check:** After presenting polished draft to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker with output filename. **Update Execution Log** (Step 6 Log: polishing instructions summary, main changes, friction). Proceed to Step 7.

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

> **If Autonomous Mode:** 默认跳过整个 Step 7（不生成配图），在 Execution Log 记录"自主模式 — 跳过配图"，直接进入 Step 8（final.md 仅含文字）。如用户在初始指令中明确要求配图，则尝试调用 baoyu-xhs-images；调用失败 → 记录失败原因和影响到 Execution Log 和 Autonomous Decision Log，在执行摘要的"跳过/失败项"中标注"配图生成失败"，继续进入 Step 8。跳过 Experience Check，记录 "Autonomous mode — no interaction"。

> **Experience Check:** After presenting illustrations to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. **Update Execution Log** (Step 7 Log: image count, positions, friction). Proceed to Step 8.

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

> **If Autonomous Mode:** 跳过"等待用户确认"环节。创建 final.md 后，直接记录文件路径和图片位置到 Execution Log，然后继续到 Step 9。跳过 Experience Check，记录 "Autonomous mode — no interaction"。

> **Experience Check:** After presenting the final article to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **⚠️ STOP: 不得直接跳到 Step 10。** 即使用户在此步说"发布"，也必须先执行 Step 9。Step 9 是审稿缓冲层，确保用户在发布前正式审阅最终图文排版。

> **End:** Update progress tracker with output filename. **Update Execution Log** (Step 8 Log: image-text combination approach, user feedback summary, friction). Proceed to Step 9.

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

> **If Autonomous Mode (9a):** AI 自行审阅最终文章，不询问修改意见。如发现明显问题（格式错误、内容不完整等），自行修正并记录到 Autonomous Decision Log。

**9b. Platform Adaptation (Optional):**

Ask: "Would you like to adapt this article for another platform?"

> **If Autonomous Mode (9b):** 根据用户初始消息中的意图决定是否适配。用户要求了多平台适配 → 执行 content-adapter；未要求 → 跳过。不询问用户。记录决策到 Autonomous Decision Log。

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

> **If Autonomous Mode (9c):** 根据用户初始消息中的发布意图 + 自主能力边界评估：用户要求发布且发布路径可自主完成（API/CLI + 已有凭证）→ 进入 Step 10；用户要求发布但路径不可自主完成（需登录/扫码）→ 跳过发布，在执行摘要中标注"发布需用户手动完成"；用户未要求发布 → 跳过 Step 10。记录决策到 Autonomous Decision Log。

> **Experience Check:** Review all user feedback in this step. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. **Update Execution Log** (Step 9 Log: user revision requests, platforms adapted, publishing decision, friction). Proceed to Step 10 if publishing, or conclude session.

## Step 10: Publish (Optional)

> **Start:** Read progress tracker. Update Step 10 status to in-progress.

If the user wants to publish, invoke the appropriate skill:

**For 小红书 (Xiaohongshu):**
```
Invoke: xiaohongshu skill
MCP tool: publish_content (title, content, images)
```
Ensure the xiaohongshu MCP server is running on localhost:18060 before publishing.

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

> **If Autonomous Mode:** 评估发布路径是否可自主完成：
> - API/CLI 且已有凭证（cookie/token 可用）→ 执行发布，记录结果到 Execution Log
> - 发布失败 → 记录失败原因到 Execution Log 和 Autonomous Decision Log，在执行摘要中标注"发布失败，需用户手动处理"
> - 需要用户登录/扫码 → 跳过发布，在执行摘要中标注"发布需用户手动完成"并给出所需信息（文件路径、目标平台、所需操作）

> **End:** Update progress tracker with publication result. **Update Execution Log** (Step 10 Log: platform published to, result, friction).

**发布后数据记录提醒（不可省略）：**

发布成功后，向用户展示以下提醒：

> "建议过几天数据稳定后，告诉我各平台数据（阅读量、点赞等），直接说「记录数据」即可。"

Then proceed to **流程自检**.

## 流程自检 + 复盘（不可跳过）

> 在标记会话完成之前，必须执行自检和复盘。自检确保流程完整性，复盘从执行记录中发现可改进的问题。

### Part 1: 自检（Checklist Audit）

> 1. **读取进度文件**，逐步检查所有 checkbox
> 2. **标记遗漏**：如果发现任何应勾未勾的 checkbox：
>    - 如果是确实执行了但忘记标记 → 补标并注明"自检时补标"
>    - 如果是确实跳过了 → 在 Session Notes 中记录原因，并询问用户是否需要补做
> 3. **检查 Corrections Log**：确认所有 correction 都有 Case File，没有 Pending
> 4. **检查 Step 9**：确认 Step 9 所有子步骤已执行（Step 9 不可跳过）

### Part 2: 复盘（Execution Review）

> **目的**: 审阅整个会话的 Execution Log，识别流程和方法论中的问题，录入经验系统。
>
> 5. **通读 Execution Log**：从 Step 1 到 Step 10，逐步审阅 AI 的执行记录
> 6. **识别问题**，重点关注以下维度：
>    - **流程遗漏**: 某个步骤或子步骤被跳过，不应该跳过
>    - **参考未用**: 有可用的参考库内容但没使用，或使用了不相关的参考
>    - **技巧脱节**: 选了技巧但实际写作中没体现（Step 2 选了，Step 3-6 没用）
>    - **工具问题**: 依赖不可用、命令失败、工具返回空结果
>    - **质量问题**: 产出不符合预期（AI 味重、结构松散、不符合平台规范）
>    - **效率问题**: 重复操作、不必要的搜索、上下文在步骤间丢失
> 7. **记录到进度文件**的"复盘记录"区域：
>    ```
>    | # | 问题描述 | 类型 | 记录到 |
>    |---|---------|------|--------|
>    | 1 | Step 2 搜索了 references/techniques/ 但 Step 3 写正文时没有应用 Content Funnel 原则 | 技巧脱节 | cases/2026-02-18-technique-disconnect.md |
>    ```
> 8. **将问题录入经验系统**：
>    - 对每个发现的问题，使用 `skills/experience-tracker.md` 的格式创建 case file
>    - Case 的 `Skill/Step` 字段标注"流程复盘"
>    - Case 的 `Root Cause` 分类使用上方的问题类型
>    - 更新 `assets/experiences/lessons.md` (`WRITE:user`)，将问题提炼为规则
>    - 例："Step 2 选择了 Content Funnel 技巧后，Step 3-6 每步开头必须重新读取该技巧的 Practice Guide 并检查是否在正文中体现。"
> 9. **向用户报告**自检 + 复盘结果：
>    - "自检完成，所有步骤已执行。" 或 "自检发现以下遗漏：{list}。需要补做吗？"
>    - "复盘发现 N 个可改进的问题：{简要列表}。已记录到经验库。"
>    - 如果没发现问题："复盘完成，本次流程执行顺畅，未发现明显问题。"
> 10. **更新进度文件**的"流程自检 + 复盘"区域，记录自检时间、自检结果、复盘发现问题数

> **If Autonomous Mode:** 标准自检 + 复盘照常执行（审阅 Execution Log、识别问题、记录到经验系统）。额外完成以下步骤：
> 1. 填写 progress tracker 中的"自主模式执行摘要"（文章标题、目标平台、完成状态、关键决策 Top 3-5、产出文件、跳过/失败项、建议复查点）
> 2. 复盘中发现的流程问题照常记录到经验系统（cases/ + lessons.md）
> 3. 多篇/批量场景：每篇各自完成自检 + 复盘 + 执行摘要；全部完成后，生成总体摘要（完成几篇、各篇标题和平台、产出文件路径、全局失败汇总、跨篇经验传递情况）
> 4. **⚠️ 执行 Completion Gate 核对**：逐项检查 G1-G7（多篇加 G8-G9），在 progress tracker 的 Completion Gate Checklist 中逐项勾选。**全部通过才能停止。任何一项未通过，必须回到对应步骤补完，然后重新核对。**
> 5. Completion Gate 全部通过后 → 向用户呈现执行摘要（自主模式下这是最终输出，用户据此审阅所有决策和产出）

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
