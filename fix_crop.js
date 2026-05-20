const sharp = require('sharp');

async function processLogo() {
  try {
    const inputPath = '/Users/sandhikshyanroy/.gemini/antigravity/brain/81eefd00-8ba3-4dfb-ad17-78d4049a8d29/playmetric_icon_5_darkmode_1779048651201.png';
    const outputPath = 'public/logo.png';
    
    // We want the D-shape without the text.
    // Last time we used: left: 200, top: 220, width: 624, height: 500
    // Height 500 included the top of the text. Let's reduce height to 440.
    // Also, if the text is there, we can just crop it tighter at the bottom.
    
    const { data, info } = await sharp(inputPath)
      .extract({ left: 200, top: 220, width: 624, height: 440 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Make dark background transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      
      if (brightness < 20) {
        data[i + 3] = 0; // completely transparent
      } else if (brightness < 40) {
        data[i + 3] = Math.floor((brightness - 20) / 20 * 255); // anti-aliasing fade
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);

    console.log("Successfully recropped the D-shape logo!");
  } catch (error) {
    console.error("Error with sharp:", error);
  }
}

processLogo();
