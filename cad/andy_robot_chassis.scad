// ==========================================================================
// Andy's Coming! — Toy Story Robot Parametric 3D Printable Chassis (OpenSCAD)
// Open in OpenSCAD (free at openscad.org) and press F6 to render, F7 to export STL!
// ==========================================================================

// Choose which part to render and export:
part = "all"; // [all, torso, chassis, head, buttons, motor_bracket]

$fn = 48; // Circle smoothness

// Key Dimensions
TORSO_W = 86;
TORSO_D = 86;
TORSO_H = 62;
WALL_THICK = 2.4;

PI5_HOLE_X = 58.0;
PI5_HOLE_Y = 49.0;

DOME_DIAMETER = 80.0;
SERVO_W = 23.2;
SERVO_D = 12.5;

module upper_torso() {
    difference() {
        // Outer Body Shell (Royal Blue)
        hull() {
            translate([-TORSO_W/2+4, -TORSO_D/2+4, 0]) cylinder(r=4, h=TORSO_H);
            translate([TORSO_W/2-4, -TORSO_D/2+4, 0]) cylinder(r=4, h=TORSO_H);
            translate([-TORSO_W/2+4, TORSO_D/2-4, 0]) cylinder(r=4, h=TORSO_H);
            translate([TORSO_W/2-4, TORSO_D/2-4, 0]) cylinder(r=4, h=TORSO_H);
        }

        // Hollow Inside
        translate([-TORSO_W/2+WALL_THICK, -TORSO_D/2+WALL_THICK, -1])
            cube([TORSO_W - 2*WALL_THICK, TORSO_D - 2*WALL_THICK, TORSO_H - WALL_THICK]);

        // Top Opening for SG90 Servo
        translate([-SERVO_W/2, -SERVO_D/2, TORSO_H - 10])
            cube([SERVO_W, SERVO_D, 20]);

        // Front Chest Button Holes (2x 12mm circular apertures for green arrows)
        translate([-16, -TORSO_D/2 - 2, TORSO_H/2])
            rotate([-90, 0, 0]) cylinder(r=6, h=10);
        translate([16, -TORSO_D/2 - 2, TORSO_H/2])
            rotate([-90, 0, 0]) cylinder(r=6, h=10);

        // Front Microphone Acoustic Intake Port (INMP441 slot)
        translate([-6, -TORSO_D/2 - 2, 14])
            cube([12, 10, 4]);

        // Rear Speaker Vents (40mm circular grill)
        for (a = [-14:7:14]) {
            translate([a, TORSO_D/2 - 4, TORSO_H/2])
                rotate([90, 0, 0]) cylinder(r=2, h=10);
        }
    }

    // Pi 5 Standoff Posts (M2.5 brass heat-set or self-tapping holes)
    translate([0, 0, 6]) {
        for (dx = [-PI5_HOLE_X/2, PI5_HOLE_X/2]) {
            for (dy = [-PI5_HOLE_Y/2, PI5_HOLE_Y/2]) {
                translate([dx, dy, 0]) {
                    difference() {
                        cylinder(r=3.2, h=10);
                        cylinder(r=1.2, h=12); // Hole for M2.5 screw
                    }
                }
            }
        }
    }
}

module lower_chassis() {
    difference() {
        // Battery Tray & Base Plate
        hull() {
            translate([-TORSO_W/2+4, -TORSO_D/2+4, 0]) cylinder(r=4, h=28);
            translate([TORSO_W/2-4, -TORSO_D/2+4, 0]) cylinder(r=4, h=28);
            translate([-TORSO_W/2+4, TORSO_D/2-4, 0]) cylinder(r=4, h=28);
            translate([TORSO_W/2-4, TORSO_D/2-4, 0]) cylinder(r=4, h=28);
        }

        // Inner cavity for 2x 18650 Battery Holder (76mm x 42mm)
        translate([-40, -22, 3])
            cube([80, 44, 26]);

        // Rear Master Rocker Switch Cutout (19mm x 13mm rectangular hole)
        translate([-9.5, TORSO_D/2 - 5, 8])
            cube([19, 10, 13]);

        // USB-C Charger Port Cutout (9mm x 4mm)
        translate([TORSO_W/2 - 5, -4.5, 6])
            cube([10, 9, 4]);
    }

    // Alignment lip to interlock with upper torso
    translate([-TORSO_W/2 + WALL_THICK + 0.5, -TORSO_D/2 + WALL_THICK + 0.5, 27])
        difference() {
            cube([TORSO_W - 2*WALL_THICK - 1, TORSO_D - 2*WALL_THICK - 1, 4]);
            translate([2, 2, -1])
                cube([TORSO_W - 2*WALL_THICK - 5, TORSO_D - 2*WALL_THICK - 5, 6]);
        }
}

module head_assembly() {
    // Head Base Disc (Mounted on SG90 servo arm)
    difference() {
        union() {
            // Main round head plate
            cylinder(r=DOME_DIAMETER/2 - 1, h=4);
            
            // Outer collar groove for 80mm acrylic dome snap fit
            translate([0, 0, 4])
                difference() {
                    cylinder(r=DOME_DIAMETER/2 - 0.5, h=6);
                    cylinder(r=DOME_DIAMETER/2 - 2.8, h=7);
                }

            // Dual 10mm Diffused Red LED Eye Sockets
            translate([-16, 8, 4])
                cylinder(r=6.5, h=14);
            translate([16, 8, 4])
                cylinder(r=6.5, h=14);

            // Center Pi Camera Module 3 Mount
            translate([-13, 10, 4])
                cube([26, 4, 18]);
        }

        // Holes for 10mm LED eye lenses (10.2mm diameter)
        translate([-16, 8, -1])
            cylinder(r=5.1, h=22);
        translate([16, 8, -1])
            cylinder(r=5.1, h=22);

        // Camera lens viewing hole (8mm diameter)
        translate([0, 15, 14])
            rotate([90, 0, 0]) cylinder(r=4, h=10);

        // Center cutout for SG90 servo horn screw
        translate([0, 0, -1])
            cylinder(r=3.5, h=8);
        translate([-7, -2.5, -1])
            cube([14, 5, 3]); // Horn arm slot
    }
}

module chest_buttons() {
    // 2x Green Chevron Arrow Buttons (Accent Green PLA)
    for (x = [-12, 12]) {
        translate([x, 0, 0]) {
            cylinder(r=5.8, h=6);
            // Raised arrow on face
            translate([-2, -3, 6])
                linear_extrude(1.2)
                    polygon(points=[[0,0], [4,3], [0,6], [1.5,3]]);
        }
    }
}

module motor_bracket() {
    // N20 Micro Metal Gearmotor Mounting Bracket (Print 2x)
    difference() {
        cube([24, 14, 14]);
        // Motor body slot (12mm x 10mm)
        translate([2, -1, 2])
            cube([12.2, 16, 10.2]);
        // M2 screw holes
        translate([18, -1, 7])
            rotate([-90, 0, 0]) cylinder(r=1.1, h=16);
    }
}

// Render selector
if (part == "all") {
    upper_torso();
    translate([0, 0, -38]) lower_chassis();
    translate([0, 0, TORSO_H + 8]) head_assembly();
    translate([0, -TORSO_D/2 - 20, 0]) chest_buttons();
    translate([TORSO_W/2 + 20, 0, 0]) motor_bracket();
} else if (part == "torso") {
    upper_torso();
} else if (part == "chassis") {
    lower_chassis();
} else if (part == "head") {
    head_assembly();
} else if (part == "buttons") {
    chest_buttons();
} else if (part == "motor_bracket") {
    motor_bracket();
}
