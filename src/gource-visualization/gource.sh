#!/bin/bash

# Usage:
#   ./gource.sh <title> <output file base name>

title=$1
output_file_name=$2

frame_rate=60

# Gource rendering with OpenGL (using Xvfb to simulate the display)
gource -r $frame_rate --multi-sampling --key --title "$title" --seconds-per-day .1 -1920x1080 -o ${output_file_name}.ppm

# Convert to MP4 using FFmpeg
ffmpeg -r $frame_rate -f image2pipe -vcodec ppm -i ${output_file_name}.ppm -c:v libx264 -pix_fmt yuv420p -profile:v baseline -level 3.0 -crf 4 -preset veryslow -an -movflags +faststart -threads 0 ${output_file_name}.mp4
