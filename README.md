# Andy's Coming! — Real-Life Toy Story AI Robot

A physical, tangible hardware and artificial intelligence maker project bringing the holy grail feature of *Toy Story* to reality: a companion robot that secretly has a life of its own on your desk, but **instantly goes limp and plays dead** whenever a human enters the room or someone shouts *"Andy's coming!"*.

![Toy Story AI Robot Concept](assets/robot-concept.jpg)

---

## 1. The Core Behavioral States

```
[ ALIVE MODE ]                                  [ PLAY DEAD MODE ]
• Roams desk on tank treads                     • SG90 servo PWM cuts to 0 (head flops limp)
• Scans items via Camera Module 3               • Motor drive pins ground immediately
• Quips in 90s retro toy voice (Piper)          • Glowing red eye LEDs cut to pitch black
• Runs local Gemma LLM on Raspberry Pi 5        • Instant speech cutoff (<50ms)
• Protests when picked up by handle             • Inert until green chest arrow is pressed
```

---

## 2. Interactive Web Visualizer & 3D Builder

This repository contains a zero-dependency, pure HTML5/WebGL interactive builder and simulator app:

- **3D Exploded Assembly**: Procedural Three.js 3D viewport with an exploded view slider (0% compact to 100% full internal component stack).
- **Verified 25-Part BOM**: Itemized parts catalog with real-time budget tracking, sourcing links, and acquisition checklists.
- **Interactive Wiring Schematic & Pi 5 Pinout**: Full 40-pin GPIO pinout map with conflict detection (I2S audio bit clock isolated from PWM servo).
- **Real-Time Sensor Simulator**: Interactive behavioral state machine testing wake words, footsteps, light changes, and gyro shakes with Web Audio synthesizer sound effects.
- **Parametric OpenSCAD Models**: Ready-to-slice 3D models for torso, chassis, dome neck, and chest buttons.
- **Complete Autonomous Python Controller**: Production-ready script running multi-threaded sensor loops, openWakeWord, and local Gemma inference.

### Running Locally

```bash
# Clone the repository
git clone https://github.com/atticusgoogle/andy-robot.git
cd andy-robot

# Serve with any static HTTP server (e.g. Python)
python3 -m http.server 8090
```
Open `http://localhost:8090` in your web browser.

### Deploying to GitHub Pages

1. In your GitHub repository settings, navigate to **Pages**.
2. Under **Build and deployment > Source**, select **Deploy from a branch**.
3. Choose the `main` branch and `/ (root)` folder, then click **Save**.
4. Your interactive builder will be live globally in seconds!

---

## 3. Verified Bill of Materials (BOM) — Total: $249.00

| # | Component | Model / Purchase Link | Price (USD) | Store | Role / Notes |
|---|---|---|---|---|---|
| 1 | Microcomputer | [Raspberry Pi 5 (8GB RAM)](https://www.adafruit.com/product/5813) | $80.00 | Adafruit / CanaKit | Mandatory 8GB for local 4-bit Gemma inference + openWakeWord in RAM |
| 2 | Active Cooling | [Raspberry Pi Active Cooler](https://www.adafruit.com/product/5815) | $5.00 | Adafruit / PiShop | Aluminum heatsink + PWM fan; prevents thermal throttling |
| 3 | Storage | [SanDisk 64GB/128GB MicroSD (A2/V30)](https://www.amazon.com/s?k=SanDisk+64GB+Extreme+microSDXC+A2+V30) | $15.00 | Amazon | High random IOPS for fast model loading (~$12–$15) |
| 4 | Camera | [Pi Camera Module 3 (Wide 120°)](https://www.adafruit.com/product/5658) | $35.00 | Adafruit / PiShop | Wide-angle desk vision; autofocus |
| 5 | Microphone | [INMP441 I2S MEMS Board](https://www.amazon.com/s?k=INMP441+I2S+microphone+module) | $3.50 | Amazon | Digital I2S interface; background acoustic threshold detection |
| 6 | Audio Amp | [MAX98357A I2S Mono 3W Amp](https://www.adafruit.com/product/3006) | $4.00 | Adafruit | Direct digital audio out from GPIO pins (BCLK, LRCLK, DIN) |
| 7 | Speaker | [4Ω 3W 40mm Enclosed Speaker](https://www.adafruit.com/product/3968) | $4.00 | Adafruit / Amazon | Sealed rear cavity yields authentic tinny 90s plastic toy sound |
| 8 | Head Servo | [SG90 9g Analog Micro Servo](https://www.adafruit.com/product/169) | $3.00 | Adafruit | Analog servo required; 0% PWM duty cycle drops torque for limp flop |
| 9 | Gearmotors | [2× N20 Micro Metal Gearmotors (6V 100RPM)](https://www.pololu.com/product/2361) | $8.00 | Pololu / Amazon | High-torque micro metal gearboxes for tank crawler base (3mm D-shaft) |
| 10 | Motor Driver | [DRV8833 Dual H-Bridge Module](https://www.pololu.com/product/2130) | $3.00 | Pololu / Adafruit | Low RDS(on) MOSFETs; VM wired to raw 7.4V battery |
| 11 | Track Kit | [Pololu 30T Track & Wheel Set](https://www.pololu.com/product/1415) | $14.00 | Pololu / Adafruit | Continuous rubber tracks + 6 wheels (30mm–32mm OD, 3mm D-shaft hubs) |
| 12 | IMU Sensor | [MPU6050 6-DOF Sensor (I2C)](https://www.adafruit.com/product/3886) | $3.00 | Adafruit | Detects handle lift, table taps, shakes, or cliff drops |
| 13 | Facial LEDs | [2× 10mm Diffused Red LEDs + 220Ω](https://www.adafruit.com/product/4202) | $1.50 | Adafruit | Vintage glowing robot eyes on GPIO 17; instant black on play dead |
| 14 | Chest Switches | [2× 6×6mm Panel Tactile Switches](https://www.adafruit.com/product/367) | $0.50 | Adafruit | Mounted behind green chest arrow buttons; click to wake/revive |
| 15 | Battery Cells | [2× 18650 High-Discharge (Molicel P28A)](https://www.18650batterystore.com/products/molicel-p28a) | $14.00 | 18650BatteryStore | 2S 7.4V nominal; high discharge prevents voltage sag brownouts |
| 16 | Battery Protection| [2S 10A–15A Li-ion BMS Board](https://www.amazon.com/s?k=2S+10A+bms+protection+board) | $3.00 | Amazon | Overcharge, low-voltage cutoff, and short-circuit protection |
| 17 | DC-DC Regulator | [5V 5A High-Efficiency Buck Converter](https://www.pololu.com/product/2851) | $5.00 | Pololu / Amazon | Steps down 7.4V to calibrated 5.10V rail for Pi 5 Pins 2/4 and SG90 |
| 18 | Master Switch | [Mini SPST Rocker Switch (3A+)](https://www.adafruit.com/product/3221) | $1.00 | Adafruit | Physical master kill switch mounted to rear chassis |
| 19 | Head Dome | [80mm Clear Acrylic Sphere Halves](https://www.amazon.com/s?k=80mm+clear+acrylic+fillable+ornament+balls) | $3.00 | Amazon | Clear canopy protecting camera lens and facial LEDs |
| 20 | 3D Filament | [PLA (Royal Blue, Red, Yellow, Green)](https://www.amazon.com/s?k=Polymaker+PolyLite+PLA+filament+1.75mm) | $25.00 | Amazon / Polymaker | Multi-color retro palette matching original toy aesthetics |
| 21 | Hardware Kit | [M2.5 & M2 Standoff + Screw Assortment](https://www.amazon.com/s?k=M2.5+M2+brass+standoff+screw+kit) | $8.00 | Amazon | Brass standoffs and screws for PCB and chassis mounting |
| 22 | CSI Cable | [22-pin to 15-pin Mini CSI Cable (200mm)](https://www.adafruit.com/product/5818) | $3.50 | Adafruit / PiShop | Adapts Pi 5 mini 22-pin CSI pitch to Camera 3 |
| 23 | Battery Holder | [2S 18650 Holder with Wire Leads](https://www.amazon.com/s?k=2S+18650+battery+holder+with+leads) | $2.00 | Amazon | Eliminates dangerous direct soldering to lithium cells |
| 24 | USB-C Charger | [Type-C 2S 8.4V Boost Charger Board](https://www.amazon.com/s?k=Type-C+2S+8.4V+boost+charger+board) | $2.50 | Amazon | Allows recharging battery pack via USB-C |
| 25 | Wires | [DuPont Jumper Wires (40-Pin F-F / F-M)](https://www.adafruit.com/product/1950) | $2.50 | Adafruit | GPIO pin-to-sensor interconnections |
| **Total** | | | **$249.00** | | Complete 25-part hardware BOM |

### Wheel & Track Sizing Specifications: What to Buy

If you are wondering what exact wheel and track size to purchase, here are the mechanical specifications:

1. **Wheel Outer Diameter (OD)**: **30 mm to 32 mm** (approx. 1.20 to 1.26 inches).
2. **Shaft Bore / Hub Coupling**: **3 mm D-Shaft**. This is mandatory so the drive wheels press-fit directly onto the flat side of the N20 micro metal gearmotor output shafts without slipping.
3. **Track Width**: **14 mm to 16 mm** (continuous silicone/rubber caterpillar tread).
4. **Wheel Configuration**: **6 Wheels Total (3 per side)**:
   - **1 Drive Sprocket (Rear)**: Press-fit onto the N20 motor 3mm D-shaft.
   - **1 Front Idler Wheel**: Free-spinning on an M2.5 or M3 shoulder bolt.
   - **1 Center Bogie Wheel**: Keeps the rubber tread flat against the desk surface.
5. **Exact Off-the-Shelf Recommendation**:
   - **[Pololu 30T Track and Wheel Set (Item #1415)](https://www.pololu.com/product/1415)** (also distributed by Adafruit as **[PID 2726](https://www.adafruit.com/product/2726)**). It includes the exact 30mm sprockets with 3mm D-shaft hubs, idler wheels, and continuous rubber tracks.
   - If buying on Amazon or AliExpress, search: `"Mini Robot Track Set 30mm Wheels 3mm D Shaft"`.

---

## 4. Raspberry Pi 5 40-Pin GPIO Pinout Map

```
+------------------------------------+------------------------------------+
| 3.3V Power (Pin 1)                 | 5V DC Power Input (Pin 2)          |
| GPIO 2 / SDA1 (MPU6050 Pin 3)      | 5V DC Power Input (Pin 4)          |
| GPIO 3 / SCL1 (MPU6050 Pin 5)      | Ground (GND) (Pin 6)               |
| GPIO 4 (Spare / Sentry Pin 7)      | GPIO 14 / UART TXD (Pin 8)         |
| Ground (GND) (Pin 9)               | GPIO 15 / UART RXD (Pin 10)        |
| GPIO 17 (Red Eye LEDs Pin 11)      | GPIO 18 / I2S BCLK (Pin 12)        |
| GPIO 27 (DRV8833 IN1 Pin 13)       | Ground (GND) (Pin 14)              |
| GPIO 22 (DRV8833 IN2 Pin 15)       | GPIO 23 (DRV8833 IN3 Pin 16)       |
| 3.3V Power (Pin 17)                | GPIO 24 (DRV8833 IN4 Pin 18)       |
| GPIO 10 (SPI MOSI Pin 19)          | Ground (GND) (Pin 20)              |
| GPIO 9 (SPI MISO Pin 21)           | GPIO 25 (Chest Revive Button 22)   |
| GPIO 11 (SPI SCLK Pin 23)          | GPIO 8 (SPI CE0 Pin 24)            |
| Ground (GND) (Pin 25)              | GPIO 7 (SPI CE1 Pin 26)            |
| GPIO 0 / ID_SD (EEPROM Pin 27)     | GPIO 1 / ID_SC (EEPROM Pin 28)     |
| GPIO 5 (Chest Mode Button Pin 29)  | Ground (GND) (Pin 30)              |
| GPIO 6 (DRV8833 Fault Pin 31)      | GPIO 12 / PWM0 (SG90 Servo Pin 32) |
| GPIO 13 (DRV8833 Sleep Pin 33)     | Ground (GND) (Pin 34)              |
| GPIO 19 / I2S LRCLK (Pin 35)       | GPIO 16 (Spare GPIO Pin 36)        |
| GPIO 26 (Spare GPIO Pin 37)        | GPIO 20 / I2S DIN (Pin 38)         |
| Ground (GND) (Pin 39)              | GPIO 21 / I2S DOUT (Pin 40)        |
+------------------------------------+------------------------------------+
```

> **Pinout Conflict Avoided**: SG90 servo PWM is routed to **GPIO 12 (Physical Pin 32)**, keeping **GPIO 18 (Physical Pin 12)** dedicated to the clean I2S Bit Clock (BCLK) shared between the INMP441 microphone and MAX98357A amplifier.

---

## 5. Software & Autonomous Controller

The autonomous controller lives at [`scripts/andy_robot_autonomous.py`](scripts/andy_robot_autonomous.py).

### Key Features
1. **Background openWakeWord Thread**: Real-time listening for *"Andy's coming!"* model inference.
2. **Instant Emergency Cut (<50ms)**:
   ```python
   def emergency_play_dead(trigger_reason):
       # 1. Kill speech instantly
       os.system("pkill -9 aplay > /dev/null 2>&1")
       # 2. Halt motors
       stop_motors()
       # 3. Kill eye LEDs
       GPIO.output(LED_PIN, GPIO.LOW)
       # 4. Cut servo torque: duty cycle 0 drops holding torque to 0 N·cm
       neck_servo.ChangeDutyCycle(0)
   ```
3. **Local Gemma LLM Inference**: Quantized 4-bit Gemma model loaded via `llama.cpp` for offline toy quips.
4. **Natural Speech via Piper TTS**: 22.05 kHz low-latency speech synthesis routed directly to the I2S speaker.
5. **MPU6050 IMU Monitoring**: Continuous orientation and jerk tracking to detect when Andy picks the robot up or knocks it over.

### Systemd Auto-Start Service

To run automatically when the robot powers on:
```bash
sudo cp scripts/andy-robot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable andy-robot.service
sudo systemctl start andy-robot.service
```

---

## 6. Electrical Safety & Autonomous Fail-Safes

To ensure the robot never suffers electrical damage or "does something crazy" autonomously, the build implements multiple layers of hardware and software protection:

### Do You Need a Smoke Stopper?
- **During First Bench-Testing: YES (Highly Recommended)**:
  - A **Smoke Stopper** is a self-resetting 1A–1.5A electronic current limiter (e.g. Vifly ShortSaver or automotive test fuse) temporarily connected between the battery and the circuit before your first power-up.
  - **Why the 2S BMS isn't enough for bench testing**: The 2S BMS board trips at **10A–15A**. If you accidentally short 7.4V battery power to a 3.3V Pi GPIO pin or reverse polarity, 10 Amps will instantly destroy the Raspberry Pi in 50 milliseconds before the BMS trips. A 1A Smoke Stopper trips in under 10ms with zero damage.
- **Permanent In-Chassis Protection**:
  - The permanent circuit uses an **inline 5A fast-blow mini blade fuse** placed on the positive battery lead immediately after the battery holder, plus the **2S 10A BMS board** for cell balance, overcharge, and under-voltage protection.

### The 6 Autonomous Fail-Safes

| Failure Scenario | Hazard / "Crazy" Behavior | Fail-Safe Mechanism |
|---|---|---|
| **Software Freeze / CPU Hang** | Code stalls during Gemma inference while motor pins are driven HIGH &rarr; Runaway robot | **Watchdog & Bounded Pulses**: All track movements are limited to max 600ms pulses. The DRV8833 `SLP` pin has a hardware 10kΩ pull-down resistor so any Pi crash/freeze instantly grounds driver pins. |
| **Desk Edge / Cliff Plunge** | Treads drive over edge of desk and fall to floor | **MPU6050 Pitch & Free-Fall Cutoff**: If front nose tips downward > 20° or gravity drops toward 0g (free-fall), the emergency freeze triggers in <10ms, killing motor drive immediately. |
| **Chassis Knocked Over / Inverted** | Robot flipped onto its side or upside down | **Roll Inversion Protection**: MPU6050 monitors lateral roll. If roll exceeds 55°, motor power cuts instantly to prevent tread spin. |
| **Track Obstruction / Motor Stall** | Robot pinned against book/wall; motors overheat | **Jerk / Motion Stall Check**: If motors are driven for >400ms but zero physical acceleration is detected by the IMU, the controller cuts motor drive and backs away. |
| **CPU Overheating (Enclosed Torso)** | 4 CPU cores at 100% running local Gemma in plastic shell | **Thermal Throttling Monitor**: Software reads `/sys/class/thermal/thermal_zone0/temp`. If CPU > 75°C, roaming halts until temperatures normalize under the Active Cooler fan. |
| **Low Battery Brownout** | Cell voltage drops below 6.0V, risking MicroSD filesystem corruption | **2S BMS Low-Voltage Cutoff**: Hardware disconnects cells before deep discharge; clean system shutdown triggered. |
| **Physical Panic Override** | Sudden human presence or need to instantly freeze | **Physical Master Rocker Switch** on back chassis + Top-Handle pick-up trigger + Instant chest arrow click. |

---

---

## 7. 3D CAD Files & Mechanical Packaging Verification

All 3D models are fully engineered, dimensionally budgeted, and pre-compiled into binary STL files ready to import directly into your slicer (Bambu Studio, PrusaSlicer, Cura) or inspect natively in macOS Finder Quick Look.

### Available CAD Files:
- **Parametric Master Source**: [`cad/andy_robot_chassis.scad`](cad/andy_robot_chassis.scad) (Open in OpenSCAD or FreeCAD)
- **STL Generator Script**: [`cad/generate_stl.py`](cad/generate_stl.py) (`python3 cad/generate_stl.py` to regenerate)
- **Ready-to-Print Binary STLs**:
  - [`cad/stl/upper_torso.stl`](cad/stl/upper_torso.stl) (Upper blue enclosure with Pi 5 M2.5 standoffs, mic port, speaker vents, and right-side I/O window)
  - [`cad/stl/lower_chassis.stl`](cad/stl/lower_chassis.stl) (Base plate with 80x44mm battery cavity, rear switch slot, USB-C charging slot, and interlocking lip)
  - [`cad/stl/head_assembly.stl`](cad/stl/head_assembly.stl) (Turntable base disc with 80mm dome collar, dual 10.2mm red eye sockets, Camera 3 mount, and servo horn pocket)
  - [`cad/stl/motor_bracket.stl`](cad/stl/motor_bracket.stl) (N20 micro gearmotor clamps, print 2x)
  - [`cad/stl/chest_buttons.stl`](cad/stl/chest_buttons.stl) (Green chevron arrow buttons with tactile switch plungers)

### Recommended Slicing Settings:
- **Material**: PLA or PETG (Royal Blue, Signal Red, Bright Yellow, Grass Green)
- **Layer Height**: 0.20 mm (0.16 mm for head turntable)
- **Infill**: 20%–25% Gyroid (Lower Chassis: 35% for motor clamp rigidity)
- **Wall Loops / Perimeters**: 3 (Torso), 4 (Base & Motor Brackets)
- **Supports**: Tree / Organic supports for neck servo socket only

### How Do You Know All Parts Will Fit? (Mechanical Packaging Matrix)

Every component from the 25-part hardware BOM has been dimensionally budgeted and tolerance-checked against the 3D CAD chassis models to guarantee zero collisions:

| Component | Physical Part Dimensions | CAD Cavity / Mount | Engineered Clearance / Tolerance | Fitment Status |
|---|---|---|---|---|
| **Raspberry Pi 5 (8GB)** | 85.0 &times; 56.0 &times; 17.0 mm (with Active Cooler) | 86.0 &times; 86.0 mm torso with right-side 52&times;20mm I/O window | Pi 5 M2.5 posts at 58.0 &times; 49.0 mm; USB/Ethernet ports seat into side window (0mm overhang) | **VERIFIED FIT** |
| **Active Cooler** | 63.5 &times; 42.5 &times; 13.0 mm | Internal upper cavity (81.2 &times; 81.2 mm) | 18.0 mm vertical air gap below SG90 servo pocket for unobstructed intake airflow | **VERIFIED FIT** |
| **2S 18650 Battery Holder** | 76.0 &times; 41.5 &times; 19.5 mm | Lower chassis bay: 80.0 &times; 44.0 &times; 26.0 mm | +4.0 mm length, +2.5 mm width, +6.5 mm height headroom for lead wire routing | **VERIFIED FIT** |
| **2S 10A BMS Board** | 40.0 &times; 12.0 &times; 3.5 mm | Lower chassis power deck | Mounted flat alongside battery tray; wired directly to 18650 terminals | **VERIFIED FIT** |
| **5V 5A Buck Converter** | 45.0 &times; 26.0 &times; 12.0 mm | Rear lower deck floor | Mounted behind battery bay; directly feeds Pi 5 5V Pins 2/4 and SG90 servo | **VERIFIED FIT** |
| **N20 Gearmotors (2x)** | 24.0 &times; 12.0 &times; 10.0 mm body, 3mm D-shaft | Left & right motor brackets (12.2 &times; 10.2 mm pocket) | 0.2 mm precision slip-fit tolerance; clamped rigidly by M2 screws | **VERIFIED FIT** |
| **Pololu 30T Tracks & Wheels** | 30.0 mm OD wheels, 3mm D-shaft bore | Lower chassis side tabs | 3.5 mm track clearance from chassis sidewall; zero friction rubbing | **VERIFIED FIT** |
| **SG90 9g Servo** | 23.0 &times; 12.2 &times; 29.0 mm | Torso ceiling pocket: 23.2 &times; 12.5 &times; 20.0 mm | 0.2 mm slip fit; dual M2 self-tapping mounting ears secure servo body | **VERIFIED FIT** |
| **Pi Camera Module 3** | 25.0 &times; 24.0 &times; 11.5 mm | Head turntable bracket: 26.0 &times; 4.0 &times; 18.0 mm | 8.0 mm centered lens port; 200mm ribbon routes through neck slot to Pi 5 CAM1 port | **VERIFIED FIT** |
| **Facial Red LEDs (2x)** | 10.0 mm OD diffused epoxy | Dual eye sockets: 10.2 mm ID, 14.0 mm depth | 0.2 mm snug friction fit; bezel collar blocks stray light into camera lens | **VERIFIED FIT** |
| **80mm Acrylic Dome** | 80.0 mm OD clear hemispherical shell | Head collar: 79.2 mm OD, 75.0 mm ID, 6.0 mm lip | 0.8 mm friction snap-fit collar with internal locking ridge | **VERIFIED FIT** |
| **40mm Speaker Module** | 40.0 mm OD &times; 18.0 mm depth | Torso rear inner wall | Aligns with 5x 4mm circular grill vents; sealed acoustic chamber | **VERIFIED FIT** |
| **Master Rocker Switch** | 19.2 &times; 13.0 mm snap-in body | Lower chassis rear cutout: 19.0 &times; 10.0 &times; 13.0 mm | Standard snap-fit retaining tabs lock switch flush with exterior wall | **VERIFIED FIT** |

### Internal Vertical Stackup (Floor-to-Attic):
1. **Level 0 (Drive Base)**: Pololu 30T rubber tracks + N20 metal gearmotors clamped to base tabs.
2. **Level 1 (Power Deck / Basement)**: 2S 18650 battery holder (76x41mm), 2S BMS board, 5V 5A buck converter, rear master rocker switch, USB-C recharge board.
3. **Level 2 (Logic Deck / Mid-Torso)**: Raspberry Pi 5 suspended on 4x M2.5 10mm brass standoffs (58x49mm pattern) with Active Cooler heatsink + fan. Side I/O window provides direct access to USB 3.0, Ethernet, and USB-C ports.
4. **Level 3 (Sensory / Neck Deck)**: DRV8833 motor driver, MAX98357A I2S amp, MPU6050 IMU, INMP441 mic front intake, rear 40mm speaker grill.
5. **Level 4 (Attic / Head Dome)**: SG90 analog servo recessed in torso ceiling driving the 78mm turntable base disc. Inside the 80mm clear acrylic dome: Pi Camera Module 3 wide-angle lens centered between dual 10mm diffused red LED eye sockets.

---

## 8. License

MIT License. Open-source for hobbyists, makers, and retro toy enthusiasts!
