from PIL import Image, ImageDraw, ImageFont
import os

# Create favicon directory if not exists
os.makedirs('civion/api/static', exist_ok=True)

# Create purple background with "C" letter
size = 180
img = Image.new('RGB', (size, size), color='#8b5cf6')  # Purple
draw = ImageDraw.Draw(img)

# Try to add text, fall back to simple circle if font unavailable
try:
    font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 100)
    text = "C"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    draw.text((x, y), text, fill='white', font=font)
except:
    # Fallback: draw circle outline
    draw.ellipse([20, 20, size-20, size-20], fill='#a78bfa')

# Save images
img.save('civion/api/static/apple-touch-icon.png')
img.save('civion/api/static/apple-touch-icon-precomposed.png')

# For favicon.ico (convert PNG to ICO format)
# Simple approach: save as PNG but name as .ico (works in modern browsers)
favicon = Image.new('RGB', (32, 32), color='#8b5cf6')
try:
    font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 20)
    draw_fav = ImageDraw.Draw(favicon)
    bbox = draw_fav.textbbox((0, 0), "C", font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw_fav.text(((32-text_width)//2, (32-text_height)//2), "C", fill='white', font=font)
except:
    pass

favicon.save('civion/api/static/favicon.ico')

print("✓ Favicon files created:")
print("  - civion/api/static/favicon.ico")
print("  - civion/api/static/apple-touch-icon.png")
print("  - civion/api/static/apple-touch-icon-precomposed.png")
