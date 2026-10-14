
import json
from pathlib import Path


def create_markdown_chunks(json_path, output_path):
    json_path = Path(json_path)
    output_path = Path(output_path)

    with json_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    markdown_parts = [
        f"# Extracted Content: {data.get('filename', 'Unknown PDF')}",
        "",
        f"Total pages: {data.get('total_pages', 0)}",
        "",
    ]

    pages = data.get("pages", [])

    for page in pages:
        page_number = page.get("page_number", page.get("page", "?"))
        text = page.get("text", "").strip()
        tables = page.get("tables", [])

        markdown_parts.extend([
            f"## Page {page_number}",
            "",
        ])

        if text:
            markdown_parts.extend([text, ""])

        for table_index, table in enumerate(tables, start=1):
            markdown_parts.extend([
                f"### Table {table_index}",
                "",
            ])

            if isinstance(table, list):
                for row in table:
                    if isinstance(row, list):
                        markdown_parts.append(
                            "| " + " | ".join(
                                str(cell) if cell is not None else ""
                                for cell in row
                            ) + " |"
                        )
                    else:
                        markdown_parts.append(f"- {row}")

                markdown_parts.append("")

            else:
                markdown_parts.extend([
                    "```text",
                    str(table),
                    "```",
                    "",
                ])

    output_path.write_text(
        "\n".join(markdown_parts),
        encoding="utf-8"
    )

    print(f"Markdown created: {output_path}")
    print(f"Pages processed: {len(pages)}")


if __name__ == "__main__":
    create_markdown_chunks(
        "extracted_output.json",
        "markdown_chunks.md"
    )