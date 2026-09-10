#!/usr/bin/env python3
"""
Andy's Coming! — Toy Story AI Robot STL Generator
Generates ready-to-3D-print binary STL files for all chassis parts.
No external CAD software required.
"""

import math
import os
import struct

def write_binary_stl(filename, triangles, name="part"):
    """Writes a list of triangles ((nx,ny,nz), (v1x,v1y,v1z), (v2x,v2y,v2z), (v3x,v3y,v3z)) to binary STL."""
    header = f"AndyRobot {name}".ljust(80, " ").encode("ascii")[:80]
    num_triangles = len(triangles)
    
    with open(filename, "wb") as f:
        f.write(header)
        f.write(struct.pack("<I", num_triangles))
        for normal, v1, v2, v3 in triangles:
            f.write(struct.pack("<3f", *normal))
            f.write(struct.pack("<3f", *v1))
            f.write(struct.pack("<3f", *v2))
            f.write(struct.pack("<3f", *v3))
            f.write(struct.pack("<H", 0))

def calc_normal(p1, p2, p3):
    """Calculates outward unit normal for triangle (p1, p2, p3)."""
    ux, uy, uz = p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]
    vx, vy, vz = p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]
    nx = uy * vz - uz * vy
    ny = uz * vx - ux * vz
    nz = ux * vy - uy * vx
    length = math.sqrt(nx * nx + ny * ny + nz * nz)
    if length > 1e-9:
        return (nx / length, ny / length, nz / length)
    return (0.0, 0.0, 1.0)

def add_quad(triangles, v1, v2, v3, v4):
    """Adds a quad composed of two counter-clockwise triangles."""
    n1 = calc_normal(v1, v2, v3)
    triangles.append((n1, v1, v2, v3))
    n2 = calc_normal(v1, v3, v4)
    triangles.append((n2, v1, v3, v4))

def add_box(triangles, x0, x1, y0, y1, z0, z1):
    """Adds a solid axis-aligned bounding box."""
    # Bottom (z0)
    add_quad(triangles, (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0))
    # Top (z1)
    add_quad(triangles, (x0, y0, z1), (x0, y1, z1), (x1, y1, z1), (x1, y0, z1))
    # Front (-Y: y0)
    add_quad(triangles, (x0, y0, z0), (x0, y0, z1), (x1, y0, z1), (x1, y0, z0))
    # Back (+Y: y1)
    add_quad(triangles, (x1, y1, z0), (x1, y1, z1), (x0, y1, z1), (x0, y1, z0))
    # Left (-X: x0)
    add_quad(triangles, (x0, y1, z0), (x0, y1, z1), (x0, y0, z1), (x0, y0, z0))
    # Right (+X: x1)
    add_quad(triangles, (x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0))

def add_cylinder(triangles, cx, cy, z0, z1, radius, segments=32):
    """Adds a solid cylinder along Z."""
    pts_bot = []
    pts_top = []
    for i in range(segments):
        theta = 2.0 * math.pi * i / segments
        px = cx + radius * math.cos(theta)
        py = cy + radius * math.sin(theta)
        pts_bot.append((px, py, z0))
        pts_top.append((px, py, z1))
    
    # Side quads
    for i in range(segments):
        nxt = (i + 1) % segments
        add_quad(triangles, pts_bot[i], pts_bot[nxt], pts_top[nxt], pts_top[i])
        
    # Caps
    center_bot = (cx, cy, z0)
    center_top = (cx, cy, z1)
    for i in range(segments):
        nxt = (i + 1) % segments
        # Bottom cap (normal -Z)
        n_bot = (0.0, 0.0, -1.0)
        triangles.append((n_bot, center_bot, pts_bot[nxt], pts_bot[i]))
        # Top cap (normal +Z)
        n_top = (0.0, 0.0, 1.0)
        triangles.append((n_top, center_top, pts_top[i], pts_top[nxt]))

def add_tube(triangles, cx, cy, z0, z1, r_in, r_out, segments=32):
    """Adds a hollow tubular ring."""
    bot_in, bot_out, top_in, top_out = [], [], [], []
    for i in range(segments):
        theta = 2.0 * math.pi * i / segments
        c, s = math.cos(theta), math.sin(theta)
        bot_in.append((cx + r_in * c, cy + r_in * s, z0))
        bot_out.append((cx + r_out * c, cy + r_out * s, z0))
        top_in.append((cx + r_in * c, cy + r_in * s, z1))
        top_out.append((cx + r_out * c, cy + r_out * s, z1))
    
    for i in range(segments):
        nxt = (i + 1) % segments
        # Outer surface
        add_quad(triangles, bot_out[i], bot_out[nxt], top_out[nxt], top_out[i])
        # Inner surface (inward normal)
        add_quad(triangles, bot_in[nxt], bot_in[i], top_in[i], top_in[nxt])
        # Bottom rim
        add_quad(triangles, bot_out[nxt], bot_out[i], bot_in[i], bot_in[nxt])
        # Top rim
        add_quad(triangles, top_out[i], top_out[nxt], top_in[nxt], top_in[i])

# =========================================================================
# Part 1: Upper Torso Shell
# Outer: 86 x 86 x 62mm, Wall: 2.4mm, Interior: 81.2 x 81.2 x 59.6mm
# Top SG90 Servo Pocket: 23.2 x 12.5mm
# Pi 5 M2.5 Standoffs: 58.0 x 49.0mm spacing, H=10mm
# =========================================================================
def build_upper_torso():
    triangles = []
    w, d, h = 86.0, 86.0, 62.0
    wall = 2.4
    
    hw, hd = w / 2.0, d / 2.0
    
    # 4 Exterior Walls
    # Front wall (-Y)
    add_box(triangles, -hw, hw, -hd, -hd + wall, 0, h)
    # Back wall (+Y)
    add_box(triangles, -hw, hw, hd - wall, hd, 0, h)
    # Left wall (-X)
    add_box(triangles, -hw, -hw + wall, -hd + wall, hd - wall, 0, h)
    # Right wall (+X) with Pi 5 I/O Port Window (y: -26 to 26, z: 8 to 28)
    # Bottom section below port
    add_box(triangles, hw - wall, hw, -hd + wall, hd - wall, 0, 8.0)
    # Top section above port
    add_box(triangles, hw - wall, hw, -hd + wall, hd - wall, 28.0, h)
    # Front corner section
    add_box(triangles, hw - wall, hw, -hd + wall, -26.0, 8.0, 28.0)
    # Rear corner section
    add_box(triangles, hw - wall, hw, 26.0, hd - wall, 8.0, 28.0)
    
    # Top Ceiling Plate with SG90 Servo cutout (23.2 x 12.5 mm)
    servo_w, servo_d = 23.2, 12.5
    hsw, hsd = servo_w / 2.0, servo_d / 2.0
    
    # Ceiling panels surrounding servo cutout
    add_box(triangles, -hw, hw, hd - wall, hd, h - wall, h) # back rim
    add_box(triangles, -hw, hw, hsd, hd - wall, h - wall, h) # back-mid
    add_box(triangles, -hw, hw, -hd + wall, -hsd, h - wall, h) # front-mid
    add_box(triangles, -hw, -hsw, -hsd, hsd, h - wall, h) # left of servo
    add_box(triangles, hsw, hw, -hsd, hsd, h - wall, h) # right of servo
    
    # 4 Raspberry Pi 5 Mounting Standoff Bosses (Spacing 58.0mm X, 49.0mm Y)
    pi_x, pi_y = 58.0 / 2.0, 49.0 / 2.0
    for sx in (-pi_x, pi_x):
        for sy in (-pi_y, pi_y):
            # Boss tube: OD 6.4mm (r=3.2), ID 2.4mm (r=1.2 for M2.5 screw), height 10mm
            add_tube(triangles, sx, sy, 0, 10.0, 1.2, 3.2, segments=24)

    # Front button decorative bezel rings (2x 12mm buttons at X = -16, +16, Z = 31)
    add_tube(triangles, -16.0, -hd, 25.0, 37.0, 6.0, 7.5, segments=24)
    add_tube(triangles, 16.0, -hd, 25.0, 37.0, 6.0, 7.5, segments=24)

    return triangles

# =========================================================================
# Part 2: Lower Chassis Base
# Outer: 86 x 86 x 28mm
# 18650 Battery Cavity: 80 x 44 x 26mm (for 2S holder 76x42x20mm)
# Rear Switch: 19 x 13mm
# Interlocking Lip: 80.2 x 80.2 x 4mm (snug fit into 81.2mm torso)
# =========================================================================
def build_lower_chassis():
    triangles = []
    w, d, h = 86.0, 86.0, 28.0
    hw, hd = w / 2.0, d / 2.0
    floor_thick = 3.0
    
    # Solid Bottom Floor
    add_box(triangles, -hw, hw, -hd, hd, 0, floor_thick)
    
    # Left & Right Battery Bay Side Supports
    add_box(triangles, -hw, -40.0, -hd, hd, floor_thick, h)
    add_box(triangles, 40.0, hw, -hd, hd, floor_thick, h)
    
    # Front & Rear Cross Walls
    add_box(triangles, -40.0, 40.0, hd - 4.0, hd, floor_thick, h)
    add_box(triangles, -40.0, 40.0, -hd, -hd + 4.0, floor_thick, h)
    
    # Interlocking Lip (Top perimeter that slides inside upper torso: 80.2mm x 80.2mm, height 4mm)
    lip_w, lip_d = 80.2, 80.2
    hlw, hld = lip_w / 2.0, lip_d / 2.0
    lip_wall = 2.0
    
    add_box(triangles, -hlw, hlw, -hld, -hld + lip_wall, h, h + 4.0)
    add_box(triangles, -hlw, hlw, hld - lip_wall, hld, h, h + 4.0)
    add_box(triangles, -hlw, -hlw + lip_wall, -hld + lip_wall, hld - lip_wall, h, h + 4.0)
    add_box(triangles, hlw - lip_wall, hlw, -hld + lip_wall, hld - lip_wall, h, h + 4.0)

    # N20 Motor Side Mounting Tabs (Left & Right side, at Z=4 to 20mm)
    add_box(triangles, -hw - 4.0, -hw, -12.0, 12.0, 4.0, 20.0)
    add_box(triangles, hw, hw + 4.0, -12.0, 12.0, 4.0, 20.0)

    return triangles

# =========================================================================
# Part 3: Head Assembly Disc & Turntable
# Diameter: 78mm, Thickness: 4mm
# Snap Collar for 80mm Dome: OD 79.2mm, ID 75.0mm, H=6mm
# Eye Sockets: 2x 10.2mm holes for diffused red LEDs
# Camera 3 Bracket: 26 x 4 x 18mm with 8mm lens aperture
# SG90 Horn Mount Pocket: 14 x 5 x 3mm
# =========================================================================
def build_head_assembly():
    triangles = []
    radius = 39.0 # 78mm dia
    base_h = 4.0
    
    # Head Turntable Base Disc
    add_cylinder(triangles, 0, 0, 0, base_h, radius, segments=48)
    
    # Snap Collar for 80mm Acrylic Dome (OD 79.2mm, ID 75.0mm, H=6mm from base)
    add_tube(triangles, 0, 0, base_h, base_h + 6.0, 37.5, 39.6, segments=48)
    
    # 2x 10mm Diffused Red LED Eye Sockets (at X = -16, +16, Y = 8)
    # Height = 14mm, OD 13.0mm (r=6.5), ID 10.2mm (r=5.1)
    add_tube(triangles, -16.0, 8.0, base_h, base_h + 14.0, 5.1, 6.5, segments=24)
    add_tube(triangles, 16.0, 8.0, base_h, base_h + 14.0, 5.1, 6.5, segments=24)
    
    # Pi Camera Module 3 Vertical Upright Mount (26mm wide, 4mm thick, 18mm high)
    # Located at center Y = 10mm
    cam_w, cam_t, cam_h = 26.0, 4.0, 18.0
    add_box(triangles, -cam_w / 2.0, cam_w / 2.0, 10.0, 10.0 + cam_t, base_h, base_h + cam_h)
    
    # Central Horn Mount Stiffener Block
    add_cylinder(triangles, 0, 0, base_h, base_h + 3.0, 8.0, segments=24)

    return triangles

# =========================================================================
# Part 4: N20 Micro Metal Gearmotor Bracket (Print 2x)
# Clamp Size: 24 x 14 x 14mm
# Motor pocket: 12.2 x 10.2mm, Length 16mm
# M2 mounting screw holes
# =========================================================================
def build_motor_bracket():
    triangles = []
    # Base
    add_box(triangles, -12, 12, -7, 7, 0, 2.5)
    # Left vertical upright
    add_box(triangles, -12, -6.1, -7, 7, 2.5, 14.0)
    # Right vertical upright
    add_box(triangles, 6.1, 12, -7, 7, 2.5, 14.0)
    # Top clamping lip
    add_box(triangles, -12, 12, -7, 7, 12.0, 14.0)
    # Mounting ears with hole for M2 screw
    add_cylinder(triangles, -15, 0, 0, 2.5, 4.0, segments=16)
    add_cylinder(triangles, 15, 0, 0, 2.5, 4.0, segments=16)

    return triangles

# =========================================================================
# Part 5: Chest Arrow Buttons (Print 2x)
# 11.6mm Diameter button cap, 6mm height
# Raised chevron arrow indicator
# Plunger post on back for 6x6mm tactile switch
# =========================================================================
def build_chest_buttons():
    triangles = []
    for offset_x in (-8.0, 8.0):
        # Cylindrical button face (dia 11.6mm, r=5.8mm, height 6mm)
        add_cylinder(triangles, offset_x, 0, 0, 6.0, 5.8, segments=32)
        # Raised chevron arrow on button face
        add_box(triangles, offset_x - 1.5, offset_x + 1.5, -3.5, 3.5, 6.0, 7.2)
        # Rear plunger pin to contact 6x6mm tactile microswitch
        add_cylinder(triangles, offset_x, 0, -5.0, 0, 2.0, segments=16)

    return triangles

def main():
    out_dir = os.path.join(os.path.dirname(__file__), "stl")
    os.makedirs(out_dir, exist_ok=True)
    
    parts = [
        ("upper_torso.stl", build_upper_torso(), "UpperTorsoShell"),
        ("lower_chassis.stl", build_lower_chassis(), "LowerChassisBase"),
        ("head_assembly.stl", build_head_assembly(), "HeadTurntableAssembly"),
        ("motor_bracket.stl", build_motor_bracket(), "N20MotorBracket"),
        ("chest_buttons.stl", build_chest_buttons(), "ChestArrowButtons"),
    ]
    
    print("Generating binary STL 3D models for Andy Robot...")
    for filename, triangles, name in parts:
        path = os.path.join(out_dir, filename)
        write_binary_stl(path, triangles, name)
        size_kb = os.path.getsize(path) / 1024.0
        print(f"  Generated {filename} ({len(triangles)} triangles, {size_kb:.1f} KB)")
        
    print("\nAll 3D STL files successfully generated in cad/stl/")

if __name__ == "__main__":
    main()
