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
    """Creates a CIVION logo image with high-fidelity anti-aliasing."""
    oversample = 4
    canvas_size = size * oversample
    scale = canvas_size / CANVAS_SIZE
    
    img = Image.new(mode, (canvas_size, canvas_size), bg_color)
    draw = ImageDraw.Draw(img)
    
    center = (canvas_size // 2, canvas_size // 2 if not include_text else canvas_size // 2 - 50 * scale)
    
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
        draw_text(draw, "CIVION", (canvas_size // 2, center[1] + (ORBIT_RADIUS + 100) * scale), 72 * scale, LOGO_COLOR)
        
    # Downscale for smooth anti-aliasing
    final_img = img.resize((size, size), resample=Image.Resampling.LANCZOS)
    return final_img

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
    print("Generating and deploying CIVION logo versions...")
    
    static_dir = os.path.join("civion", "api", "static")
    os.makedirs(static_dir, exist_ok=True)
    
    # 1. Full Logo (For reference/high-res use)
    full = create_logo(include_text=True)
    full.save("civion_logo_full.png", quality=95)
    
    # 2. Mark Only (Dashboard Sidebar & System)
    mark = create_logo(include_text=False)
    mark.save(os.path.join(static_dir, "logo.png"), quality=95)
    mark.save("civion_logo_mark.png", quality=95)
    
    # Save to UI public map
    ui_public_dir = os.path.join("ui", "public")
    if os.path.exists("ui"):
        os.makedirs(ui_public_dir, exist_ok=True)
        mark.save(os.path.join(ui_public_dir, "logo.png"), quality=95)
    
    # 3. Favicons & Touch Icons
    # Standard PNG Favicon
    favicon_png = create_logo(size=32, include_text=False)
    favicon_png.save(os.path.join(static_dir, "favicon.png"))
    
    # Apple Touch Icons (180x180)
    apple_icon = create_logo(size=180, include_text=False)
    apple_icon.save(os.path.join(static_dir, "apple-touch-icon.png"))
    apple_icon.save(os.path.join(static_dir, "apple-touch-icon-precomposed.png"))
    
    # Multi-size ICO
    ico_sizes = [16, 32, 48, 64]
    ico_imgs = [create_logo(size=s, include_text=False) for s in ico_sizes]
    ico_imgs[0].save(
        os.path.join(static_dir, "favicon.ico"),
        format='ICO',
        append_images=ico_imgs[1:]
    )
    
    # 4. Monochrome Black (Export/System)
    black_mark = create_logo(include_text=False)
    pixels = black_mark.load()
    for y in range(black_mark.size[1]):
        for x in range(black_mark.size[0]):
            r, g, b, a = pixels[x, y]
            if a > 0: pixels[x, y] = (0, 0, 0, a)
    black_mark.save("civion_logo_monochrome_black.png", quality=95)
    
    # 5. High Res
    hires = create_logo(size=2000, include_text=True)
    hires.save("civion_logo_hires.png", quality=95)
    
    print(f"✓ All versions generated and deployed to {static_dir}")

if __name__ == "__main__":
    main()
