#!/usr/bin/env python3
"""解析 dontbesilent 聊赚钱 目录下的 .md 文件，提取标题、正文、tag。"""

import json
import os
import re
from pathlib import Path

INPUT_DIR = Path(__file__).resolve().parent.parent / "dependencies/extract-getnote-articles/dontbesilent 聊赚钱"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "dependencies/extract-getnote-articles"
ARTICLES_JSON = OUTPUT_DIR / "dontbesilent-articles.json"
TITLES_FILE = OUTPUT_DIR / "dontbesilent-titles.txt"


def parse_heading(heading_line: str) -> tuple[str, list[str]]:
    """从 '# 标题文字 #tag1 #tag2' 中分离标题和 tag。"""
    # 去掉开头的 '# '
    text = heading_line.lstrip("# ").strip()

    # 找到第一个 #tag 的位置（#后紧跟非空白字符）
    match = re.search(r"\s#(?=\S)", text)
    if match:
        title = text[: match.start()].strip()
        tag_part = text[match.start() :]
        tags = re.findall(r"#(\S+)", tag_part)
    else:
        title = text
        tags = []

    return title, tags


def parse_md_file(filepath: Path) -> dict:
    """解析单个 .md 文件，返回结构化数据。"""
    content = filepath.read_text(encoding="utf-8")
    lines = content.split("\n")

    # 第一行是标题行
    heading_line = lines[0] if lines else ""
    title, tags = parse_heading(heading_line)

    # 正文：跳过标题行、空行、原链接行、分隔线，取剩余内容
    body_lines = []
    past_separator = False
    for line in lines[1:]:
        if not past_separator:
            if line.strip() == "---":
                past_separator = True
            continue
        # 跳过紧跟 --- 后的空行
        if not body_lines and line.strip() == "":
            continue
        body_lines.append(line)

    body = "\n".join(body_lines).strip()

    return {
        "filename": filepath.name,
        "title": title,
        "tags": tags,
        "body": body,
    }


def main():
    md_files = sorted(INPUT_DIR.glob("*.md"))
    print(f"找到 {len(md_files)} 个 .md 文件")

    articles = [parse_md_file(f) for f in md_files]

    # 写入 JSON
    with open(ARTICLES_JSON, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    print(f"结构化数据已写入: {ARTICLES_JSON}")

    # 写入标题列表
    with open(TITLES_FILE, "w", encoding="utf-8") as f:
        for a in articles:
            f.write(a["title"] + "\n")
    print(f"标题列表已写入: {TITLES_FILE}")


if __name__ == "__main__":
    main()