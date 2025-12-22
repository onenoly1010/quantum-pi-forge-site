#!/bin/bash
# Script to apply the Architecture Diagram fix to the wiki

set -e
set -u

# Store the original directory
ORIGINAL_DIR="$(pwd)"

echo "🔧 Applying Architecture Diagram fix to wiki..."
echo ""

# Check if we're in the right directory
if [ ! -f "wiki-fixes/Architecture-Diagram-FIXED.md" ]; then
    echo "❌ Error: Please run this script from the repository root"
    exit 1
fi

# Clone or update wiki repository
WIKI_DIR="quantum-pi-forge-site.wiki"
if [ -d "$WIKI_DIR" ]; then
    echo "📦 Wiki repository already exists, updating..."
    cd "$WIKI_DIR" || exit 1
    git pull origin master || exit 1
    cd "$ORIGINAL_DIR" || exit 1
else
    echo "📦 Cloning wiki repository..."
    git clone https://github.com/onenoly1010/quantum-pi-forge-site.wiki.git || exit 1
fi

# Apply the fix
echo "✏️  Applying fix to Architecture Diagram..."
TARGET_FILE="Architecture‐Diagram.md.md"
cp "wiki-fixes/Architecture-Diagram-FIXED.md" "$WIKI_DIR/$TARGET_FILE"

# Show the changes
cd "$WIKI_DIR" || exit 1
echo ""
echo "📊 Changes made:"
if [ -f "$TARGET_FILE" ]; then
    git diff "$TARGET_FILE" || echo "Note: Could not show diff"
else
    echo "Warning: Target file not found after copy"
    exit 1
fi

# Commit and push
echo ""
read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add "$TARGET_FILE"
    git commit -m "Fix architecture diagram rendering by closing Mermaid code block" \
               -m "" \
               -m "- Add missing closing backticks for Mermaid code block" \
               -m "- Remove extraneous content from other wiki pages" \
               -m "- Add proper Related Resources section" \
               -m "" \
               -m "Fixes: Non-rendering architecture diagram issue"
    
    echo "🚀 Pushing changes to wiki..."
    git push origin master
    echo ""
    echo "✅ Fix applied successfully!"
    echo "🌐 View the updated page at: https://github.com/onenoly1010/quantum-pi-forge-site/wiki/Architecture%E2%80%90Diagram"
else
    echo "⏸️  Changes not committed. You can review them in $WIKI_DIR"
fi

cd "$ORIGINAL_DIR" || exit 1
