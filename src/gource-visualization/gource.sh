#!/bin/bash

# Uses Gource (http://gource.io) to generate a lossless PPM and a high quality MP4 visualizing the history of a Git repo.

# By Jayden Seric: https://gist.github.com/jaydenseric/df3263eb3c33856c11ce (edited)

# Install Gource and FFmpeg with Homebrew:
#   brew install gource
#   brew install ffmpeg

# Ensure this script can execute:
#   chmod +x gource.sh

# Use this script within the root directory of your Git repo.

# Usage:
#   <title> <logo path> <avatar directory> <output file base name>

# Example, assuming this script and assets are in ~/Desktop:
#   cd ~/Sites/my-project
#   ~/Desktop/gource.sh 'Project title' ~/Desktop/team-logo.png ~/Desktop/avatars my-project-visualization

# Adjust MP4 quality via the -crf parameter: 0 is lossless, 23 is FFmpeg default, and 51 is worst possible.

title=$1
output_file_name=$2

frame_rate=60

gource -r $frame_rate --multi-sampling --key --title "$title" --seconds-per-day .1 -1920x1080 -o ${output_file_name}.ppm
ffmpeg -r $frame_rate -f image2pipe -vcodec ppm -i ${output_file_name}.ppm -c:v libx264 -pix_fmt yuv420p -profile:v baseline -level 3.0 -crf 4 -preset veryslow -an -movflags +faststart -threads 0 ${output_file_name}.mp4