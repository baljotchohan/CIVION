from PIL import Image, ImageDraw, ImageFont
import math
import os

# CONSTANTS
CANVAS_SIZE = 1000
CENTER_X, CENTER_Y = CANVAS_SIZE // 2, CANVAS_SIZE // 2
LOGO_COLOR = "#8b5cf6"  # Purple
NAVY_COLOR = "#0f172a"  # Navy
CORE_RADIUS = 75
NODE_RADIUS = 25
ORBIT_RADIUS = 180
NUM_NODES = 6
STROKE_WIDTH = 4

def create_logo(mode='RGBA', bg_color=(0, 0, 0, 0), size=CANVAS_SIZE, include_text=True):
    """Creates a CIVION logo image."""
    scale = size / CANVAS_SIZE
    img = Image.new(mode, (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    center = (size // 2, size // 2 if not include_text else size // 2 - 50 * scale)
    
    # Draw connections
    nodes = []
    for i in range(NUM_NODES):
        angle = math.radians(i * (360 / NUM_NODES) - 90)
        nx = center[0] + (ORBIT_RADIUS * scale) * math.cos(angle)
        ny = center[1] + (ORBIT_RADIUS * scale) * math.sin(angle)
        nodes.append((nx, ny))
        draw_connection_line(draw, center, (nx, ny), LOGO_COLOR, int(2 * scale))
        
    # Draw core
    draw_core(draw, center, CORE_RADIUS * scale, LOGO_COLOR, int(STROKE_WIDTH * scale))
    
    # Draw nodes
    draw_nodes(draw, nodes, NODE_RADIUS * scale, LOGO_COLOR, int((STROKE_WIDTH - 1) * scale))
    
    if include_text:
        draw_text(draw, "CIVION", (size // 2, center[1] + (ORBIT_RADIUS + 100) * scale), 72 * scale, LOGO_COLOR)
        
    return img

def draw_core(draw, center, radius, color, stroke):
    """Draws the central hexagon core."""
    points = []
    for i in range(6):
        angle = math.radians(i * 60 - 90)
        px = center[0] + radius * math.cos(angle)
        py = center[1] + radius * math.sin(angle)
        points.append((px, py))
    draw.polygon(points, outline=color, width=stroke)

def draw_nodes(draw, nodes, radius, color, stroke):
    """Draws the orbiting nodes."""
    for nx, ny in nodes:
        bbox = [nx - radius, ny - radius, nx + radius, ny + radius]
        draw.ellipse(bbox, outline=color, width=stroke)

def draw_connection_line(draw, start, end, color, stroke):
    """Draws a line from start to end."""
    draw.line([start, end], fill=color, width=stroke)

def draw_text(draw, text, position, font_size, color):
    """Draws the text below the logo."""
    try:
        # Try to find a common system font
        font_paths = [
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "Arial.ttf"
        ]
        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, int(font_size))
                break
        if not font:
            font = ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()
        
    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text((position[0] - w/2, position[1] - h/2), text, font=font, fill=color)

def main():
    print("Generating CIVION logo versions...")
    
    # 1. Full Logo
    full = create_logo(include_text=True)
    full.save("civion_logo_full.png", quality=95)
    
    # 2. Mark Only
    mark = create_logo(include_text=False)
    mark.save("civion_logo_mark.png", quality=95)
    
    # 3. Favicon
    favicon = create_logo(size=256, include_text=False)
    favicon.save("civion_logo_favicon.png", quality=95)
    
    # 4. Monochrome Black
    black_mark = create_logo(include_text=False)
    # Convert pixels manually or use point transform for monochrome
    pixels = black_mark.load()
    for y in range(black_mark.size[1]):
        for x in range(black_mark.size[0]):
            r, g, b, a = pixels[x, y]
            if a > 0: pixels[x, y] = (0, 0, 0, a)
    black_mark.save("civion_logo_monochrome_black.png", quality=95)
    
    # 5. High Res
    hires = create_logo(size=2000, include_text=True)
    hires.save("civion_logo_hires.png", quality=95)
    
    print("All versions generated successfully.")

if __name__ == "__main__":
    main()
