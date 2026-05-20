const sharp = require('sharp');

async function processLogo() {
  try {
    const inputPath = '/Users/sandhikshyanroy/.gemini/antigravity/brain/81eefd00-8ba3-4dfb-ad17-78d4049a8d29/playmetric_icon_5_darkmode_1779048651201.png';
    const outputPath = 'public/logo.png';
    
    // The image is likely 1024x1024
    // We want to crop out the text at the bottom.
    // Let's crop from x: 150, y: 150, width: 724, height: 624
    // Then we need to replace near-black with transparent. Sharp doesn't easily do threshold-based transparency replacement out of the box,
    // but we can just leave the dark background (it perfectly matches the dark mode CSS) or we can try to trim it.
    // Actually, if we just crop it, it will look fine because the background matches EXACTLY the sidebar background in dark mode.
    // Let's just crop it for now.
    await sharp(inputPath)
      .extract({ left: 150, top: 150, width: 724, height: 600 })
      .toFile(outputPath);
      
    console.log("Successfully cropped with sharp!");
  } catch (error) {
    console.error("Error with sharp:", error);
  }
}

processLogo();
