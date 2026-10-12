
# Vidyora — Multimodal Ingestion Utilities

## Overview

Vidyora's ingestion utilities extract useful content from PDF documents and video files for downstream processing.

## Features

### PDF Ingestion
- Extracts text page by page.
- Detects and extracts some PDF tables.
- Saves extracted content as JSON.
- Converts extracted content into Markdown.

### Video Ingestion
- Extracts audio from video files as WAV.
- Samples video frames at regular intervals.
- Saves video metadata.
- Transcription is not currently included.

## Project Files

- `pdf_ingestion.py` — PDF text and table extraction.
- `markdown_chunks.py` — Converts extracted PDF content into Markdown.
- `video_ingestion.py` — Extracts video audio, frames, and metadata.
- `requirements.txt` — Python package dependencies.
- `extracted_output.json` — Generated PDF extraction output.
- `markdown_chunks.md` — Generated Markdown output.
- `video_output/` — Generated video processing outputs.

## Requirements

- Python
- FFmpeg installed and available in PATH
- Python packages listed in `requirements.txt`

## Setup

Create and activate a virtual environment if needed.

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

## Running the PDF Pipeline

Place `sample_clean.pdf` in the project folder.

Run:

```bash
python pdf_ingestion.py
python markdown_chunks.py
```

Outputs:
- `extracted_output.json`
- `markdown_chunks.md`

## Running the Video Pipeline

Place a supported video file in the project folder and ensure its path matches the input configured in `video_ingestion.py`.

Run:

```bash
python video_ingestion.py
```

The script generates extracted audio, sampled frames, and metadata in `video_output/`.

## Current Limitations

- Complex PDF tables may be extracted imperfectly.
- Scanned PDFs and image-based text may require OCR.
- Video transcription is not currently implemented.
- Frame sampling may miss important visual details between sampled frames.

## Testing

Test each script using a sample input and verify that the expected output files are created and contain meaningful data.