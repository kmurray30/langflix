# Subtitle Cache Directory

This directory stores cached subtitle files fetched from YouTube.

Each file is named by video ID (e.g., `dQw4w9WgXcQ.json`) and contains an array of subtitle segments.

## Format

```json
[
  {
    "startTime": 1.36,
    "endTime": 3.04,
    "text": "[♪♪♪]"
  }
]
```

## Usage

- Subtitles are fetched from YouTube on first request
- Cached files are used for subsequent requests
- To refresh subtitles, delete the cache file and reload the video

