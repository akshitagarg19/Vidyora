
from pathlib import Path
import json
import pymupdf


def clean_cell(value):
    """Normalize an extracted table cell."""
    if value is None:
        return ""

    return " ".join(str(value).split()).strip()


def extract_pdf_content(pdf_path):
    """Extract text and detectable tables from a PDF."""

    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(
            f"PDF not found: {path.resolve()}"
        )

    document = pymupdf.open(path)
    pages_data = []

    try:
        for page_index, page in enumerate(document):
            print(
                f"Processing page {page_index + 1}/"
                f"{len(document)}..."
            )

            text = page.get_text("text").strip()
            tables_data = []

            try:
                table_finder = page.find_tables()

                for table_index, table in enumerate(
                    table_finder.tables
                ):
                    raw_rows = table.extract()
                    cleaned_rows = []

                    for row in raw_rows:
                        cleaned_row = [
                            clean_cell(cell) for cell in row
                        ]

                        # Ignore completely empty rows
                        if any(cleaned_row):
                            cleaned_rows.append(cleaned_row)

                    # Ignore tables with no meaningful content
                    nonempty_cells = sum(
                        bool(cell)
                        for row in cleaned_rows
                        for cell in row
                    )

                    if nonempty_cells >= 4:
                        tables_data.append({
                            "table_number": len(tables_data) + 1,
                            "rows": cleaned_rows
                        })

            except Exception as error:
                print(
                    f"Table extraction warning on page "
                    f"{page_index + 1}: {error}"
                )

            pages_data.append({
                "page_number": page_index + 1,
                "text": text,
                "tables": tables_data
            })

    finally:
        document.close()

    return {
        "filename": path.name,
        "total_pages": len(pages_data),
        "pages": pages_data
    }


def main():
    input_pdf = Path("sample_clean.pdf")
    output_json = Path("extracted_output.json")

    try:
        result = extract_pdf_content(input_pdf)

        with output_json.open(
            "w", encoding="utf-8"
        ) as file:
            json.dump(
                result,
                file,
                indent=2,
                ensure_ascii=False
            )

        total_tables = sum(
            len(page["tables"])
            for page in result["pages"]
        )

        pages_with_text = sum(
            bool(page["text"])
            for page in result["pages"]
        )

        print("\nPDF extraction completed!")
        print("PDF:", result["filename"])
        print("Pages:", result["total_pages"])
        print("Pages with text:", pages_with_text)
        print("Tables retained:", total_tables)
        print("JSON saved to:", output_json.resolve())

    except Exception as error:
        print("\nPDF extraction failed:", error)


if __name__ == "__main__":
    main()