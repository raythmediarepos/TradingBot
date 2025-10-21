const fs = require('fs');
const path = require('path');

// This script helps you convert the bee SVG to PNG formats
// You'll need to install sharp: npm install --save-dev sharp

async function generateFavicons() {
  try {
    const sharp = require('sharp');
    
    const svgBuffer = fs.readFileSync(
      path.join(__dirname, '../public/bee-icon.svg')
    );

    // Generate 16x16 favicon
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(__dirname, '../public/favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16.png');

    // Generate 32x32 favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    // Generate Apple touch icon (180x180)
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');

    // Generate favicon.ico (32x32)
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFormat('ico')
      .toFile(path.join(__dirname, '../public/favicon.ico'));
    console.log('✓ Generated favicon.ico');

    console.log('\n🎉 All favicons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n⚠️  Sharp is not installed. Please run:');
      console.log('   npm install --save-dev sharp\n');
      console.log('   Then run this script again: node scripts/generate-favicons.js\n');
      
      console.log('📝 Alternative: Use an online converter:');
      console.log('   1. Go to https://realfavicongenerator.net/');
      console.log('   2. Upload public/bee-icon.svg');
      console.log('   3. Generate and download favicons');
      console.log('   4. Extract to public/ folder\n');
    } else {
      console.error('Error generating favicons:', error);
    }
  }
}

generateFavicons();

