#!/bin/bash
# Script to apply the Architecture Diagram fix to the wiki

set -e

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
    cd "$WIKI_DIR"
    git pull origin master
    cd ..
else
    echo "📦 Cloning wiki repository..."
    git clone https://github.com/onenoly1010/quantum-pi-forge-site.wiki.git
fi

# Apply the fix
echo "✏️  Applying fix to Architecture Diagram..."
cp wiki-fixes/Architecture-Diagram-FIXED.md "$WIKI_DIR/Architecture‐Diagram.md.md"

# Show the changes
cd "$WIKI_DIR"
echo ""
echo "📊 Changes made:"
git diff "Architecture‐Diagram.md.md" || true

# Commit and push
echo ""
read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add "Architecture‐Diagram.md.md"
    git commit -m "Fix architecture diagram rendering by closing Mermaid code block

- Added missing closing backticks for Mermaid code block
- Removed extraneous content from other wiki pages
- Added proper Related Resources section

Fixes: Non-rendering architecture diagram issue"
    
    echo "🚀 Pushing changes to wiki..."
    git push origin master
    echo ""
    echo "✅ Fix applied successfully!"
    echo "🌐 View the updated page at: https://github.com/onenoly1010/quantum-pi-forge-site/wiki/Architecture%E2%80%90Diagram"
else
    echo "⏸️  Changes not committed. You can review them in $WIKI_DIR"
fi

cd ..
