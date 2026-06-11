from PIL import Image
import math

# Load the D-shaped logo
img = Image.open('/Users/sandhikshyanroy/.gemini/antigravity/brain/81eefd00-8ba3-4dfb-ad17-78d4049a8d29/playmetric_icon_5_darkmode_1779048651201.png').convert("RGBA")
width, height = img.size

# Crop to the top 75% to remove the text
# The text "PLAYMETRIC" is at the bottom
img = img.crop((150, 150, width-150, height-250))

# Make near-black pixels transparent
pixels = img.getdata()
new_data = []

# Background is roughly #09090b (9, 9, 11) or close to black.
# We'll calculate distance to black. If it's very dark, make it transparent.
# To ensure smooth edges, we can use alpha mapping.
for r, g, b, a in pixels:
    # Calculate luminance or just distance to black
    if r < 30 and g < 30 and b < 30:
        new_data.append((r, g, b, 0)) # transparent
    else:
        new_data.append((r, g, b, a))

img.putdata(new_data)
img.save('public/logo.png')
print("Image cropped and background removed.")
