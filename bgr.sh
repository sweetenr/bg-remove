#!/bin/bash

# Folder containing images

IMAGE_FOLDER="/path/to/image/folder"

# API details

API_URL="https://example.com/api/processImage"

API_KEY="YOUR_API_KEY_HERE"

# Check if `jq` is installed (used for parsing JSON)

if ! command -v jq &> /dev/null

then

    echo "Error: jq is not installed. Please install jq to parse JSON."

    exit 1

fi

# Iterate through each image in the folder

for image in "$IMAGE_FOLDER"/*.jpg; do

    echo "Processing $image ..."

    # Send the image to the web service using curl

    response=$(curl -s -X POST "$API_URL" \

        -H "Authorization: Bearer $API_KEY" \

        -F "image=@$image")

    # Parse the result from the response using jq

    result=$(echo "$response" | jq -r '.result')

    echo "Result for $image: $result"

done

echo "All images processed."