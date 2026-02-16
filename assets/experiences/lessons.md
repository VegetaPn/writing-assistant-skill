# Lessons Learned

> 从经验案例中提炼的规则。所有 skill 在执行前应检查此文件中的相关经验。
> 由 experience-tracker "总结经验" 命令从 cases/ 目录中自动提炼更新。

---

## 工具使用规则

- **bird CLI 使用 Chrome cookie**：用户使用 Chrome 登录 X/Twitter，调用 bird 时使用 `--cookie-source chrome` 参数，不要使用默认的 Safari (来源: 实践经验)

## 流程相关

- **严格按进度文件步骤顺序执行**：不要跳步骤，不要在没看进度文件的情况下开始工作 (来源: cases/2026-02-16-follow-progress-steps.md)

## 风格相关

- **不要默认使用 Dan Koe 风格**：Dan Koe 风格（英文、西方视角）不适合中文平台内容创作，除非用户明确要求 (来源: cases/2026-02-16-dan-koe-style-mismatch.md)
- **避免"过去几个月"等不精确时间表述**：使用更模糊但自然的表达如"过去的一段时间里"，避免给出具体但虚假的时间范围 (来源: cases/2026-02-16-vague-time-expression.md)

## 内容相关

- **案例选择要贴近目标读者**：避免使用读者不熟悉或认知有偏差的案例（如 Manus AI），优先选择目标读者日常能接触到的案例 (来源: cases/2026-02-16-manus-ai-case-unsuitable.md)

## 标题相关

- **标题中的数字要有说服力**：避免"3个"、"5个"等太小的数字（显得单薄）；避免"月入百万"等夸张数字（显得虚假）；标题整体不能有明显的 AI 生成感 (来源: cases/2026-02-16-title-feedback.md)