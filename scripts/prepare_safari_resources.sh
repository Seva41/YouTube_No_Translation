#!/bin/bash
set -e

# --- Base variables ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
PROJECT_NAME="YouTube No Translation"
SAFARI_DIR="$ROOT_DIR/safari/$PROJECT_NAME/$PROJECT_NAME"
ICON_SRC="$ROOT_DIR/assets/images/icon_1024.png"
APPICONSET="$SAFARI_DIR/Assets.xcassets/AppIcon.appiconset"
ACCENTCOLOR="$SAFARI_DIR/Assets.xcassets/AccentColor.colorset"
LARGEICON="$SAFARI_DIR/Assets.xcassets/LargeIcon.imageset"


# --- Initial validations ---
if [ ! -f "$ICON_SRC" ]; then
  echo "Source icon not found at $ICON_SRC"
  exit 1
fi

# --- Prepare icon and color directories ---
rm -rf "$APPICONSET"
mkdir -p "$APPICONSET" "$ACCENTCOLOR" "$LARGEICON"

# --- Create AccentColor.colorset ---
cat > "$ACCENTCOLOR/Contents.json" <<EOF
{
  "colors" : [
    {
      "idiom" : "universal",
      "color" : {
        "color-space" : "srgb",
        "components" : {
          "red" : "1.0",
          "green" : "0.0",
          "blue" : "0.0",
          "alpha" : "1.0"
        }
      }
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOF
echo "AccentColor.colorset created."

# --- Generate App Icons ---
declare -a ICON_SIZES=(
  "16 1" "16 2" "32 1" "32 2" "128 1" "128 2"
  "256 1" "256 2" "512 1" "512 2"
)

for entry in "${ICON_SIZES[@]}"; do
  read -r base_size scale <<< "$entry"
  name="icon-${base_size}"
  [[ $scale == "2" ]] && name+="@2x"
  [[ $scale == "3" ]] && name+="@3x"

  px=$(awk "BEGIN {print int($base_size * $scale)}")
  [[ $base_size == *"."* ]] && px=$(printf "%.0f" "$px")

  sips -z "$px" "$px" "$ICON_SRC" --out "$APPICONSET/$name.png" >/dev/null
done
echo "Icons generated at $APPICONSET."

# --- Create AppIcon.appiconset Contents.json ---
cat > "$APPICONSET/Contents.json" <<EOF
{
  "images": [
    {
      "size": "16x16",
      "idiom": "mac",
      "filename": "icon-16.png",
      "scale": "1x"
    },
    {
      "size": "16x16",
      "idiom": "mac",
      "filename": "icon-16@2x.png",
      "scale": "2x"
    },
    {
      "size": "32x32",
      "idiom": "mac",
      "filename": "icon-32.png",
      "scale": "1x"
    },
    {
      "size": "32x32",
      "idiom": "mac",
      "filename": "icon-32@2x.png",
      "scale": "2x"
    },
    {
      "size": "128x128",
      "idiom": "mac",
      "filename": "icon-128.png",
      "scale": "1x"
    },
    {
      "size": "128x128",
      "idiom": "mac",
      "filename": "icon-128@2x.png",
      "scale": "2x"
    },
    {
      "size": "256x256",
      "idiom": "mac",
      "filename": "icon-256.png",
      "scale": "1x"
    },
    {
      "size": "256x256",
      "idiom": "mac",
      "filename": "icon-256@2x.png",
      "scale": "2x"
    },
    {
      "size": "512x512",
      "idiom": "mac",
      "filename": "icon-512.png",
      "scale": "1x"
    },
    {
      "size": "512x512",
      "idiom": "mac",
      "filename": "icon-512@2x.png",
      "scale": "2x"
    }
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
EOF
echo "AppIcon.appiconset Contents.json created."

# --- Create LargeIcon.imageset ---
cp "$ICON_SRC" "$LARGEICON/icon.png"
cat > "$LARGEICON/Contents.json" <<EOF
{
  "images" : [
    {
      "idiom" : "universal",
      "filename" : "icon.png",
      "scale" : "1x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOF
echo "LargeIcon.imageset created."

echo "Script completed successfully."
