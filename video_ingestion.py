
from pathlib import Path
import json
import subprocess
import shutil


def check_ffmpeg():
    """Check that FFmpeg is available."""
    if shutil.which("ffmpeg") is None:
        raise RuntimeError(
            "FFmpeg was not found. Check your Windows PATH."
        )


def ingest_video(video_path, output_dir="video_output",
                 frame_interval=30):
    """Extract audio and selected frames from a local video."""

    video_path = Path(video_path)

    if not video_path.is_file():
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    output_dir = Path(output_dir)
    frames_dir = output_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    check_ffmpeg()

    audio_path = output_dir / "audio.wav"

    # Extract mono audio at 16 kHz for speech transcription.
    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-vn",
        "-ac", "1",
        "-ar", "16000",
        str(audio_path)
    ], check=True, capture_output=True, text=True)

    # Capture one frame every frame_interval seconds.
    frame_pattern = frames_dir / "frame_%04d.jpg"

    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-vf", f"fps=1/{frame_interval}",
        "-q:v", "2",
        str(frame_pattern)
    ], check=True, capture_output=True, text=True)

    # Get the video's duration in seconds.
    probe = subprocess.run([
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json",
        str(video_path)
    ], check=True, capture_output=True, text=True)

    duration = float(
        json.loads(probe.stdout)["format"]["duration"]
    )

    frames = []
    for index, frame_path in enumerate(
        sorted(frames_dir.glob("frame_*.jpg"))
    ):
        frames.append({
            "file": str(frame_path),
            "timestamp_seconds": index * frame_interval
        })

    result = {
        "source_video": video_path.name,
        "duration_seconds": duration,
        "audio_file": str(audio_path),
        "frame_interval_seconds": frame_interval,
        "frames": frames
    }

    metadata_path = output_dir / "metadata.json"
    metadata_path.write_text(
        json.dumps(result, indent=2),
        encoding="utf-8"
    )

    return result


if __name__ == "__main__":
    try:
        result = ingest_video("sample_video.mp4")

        print("Vidyora video ingestion completed!")
        print("Video:", result["source_video"])
        print("Duration:", result["duration_seconds"], "seconds")
        print("Audio saved to:", result["audio_file"])
        print("Frames extracted:", len(result["frames"]))
        print("Metadata saved to: video_output/metadata.json")

    except FileNotFoundError as error:
        print("File error:", error)

    except subprocess.CalledProcessError as error:
        print("FFmpeg processing failed.")
        print(error.stderr[-2000:] if error.stderr else error)

    except Exception as error:
        print("Something went wrong:", error)