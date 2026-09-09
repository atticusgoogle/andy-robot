/**
 * Andy's Coming! — Toy Story AI Robot Workshop Master Application
 */

(function () {
  'use strict';

  // Master Bill of Materials (21 Items)
  const BOM_DATABASE = [
    {
      id: "pi5",
      name: "Raspberry Pi 5 (8GB RAM)",
      category: "compute",
      price: 80.00,
      qty: 1,
      specs: "Broadcom BCM2712 Quad Cortex-A76 @ 2.4GHz, 8GB LPDDR4X, Dual 4Kp60 HDMI, 2x 4-lane MIPI CSI/DSI",
      notes: "Required for local Gemma LLM inference. 8GB RAM ensures the 4-bit quantized model and openWakeWord model load comfortably into RAM alongside the Linux OS.",
      sourcing: "Official Raspberry Pi Reseller (Adafruit / SparkFun / CanaKit)",
      url: "https://www.adafruit.com/product/5813",
      vendor: "Adafruit",
      svgType: "pcb-green",
      crucial: true
    },
    {
      id: "cooler",
      name: "Raspberry Pi Active Cooler",
      category: "compute",
      price: 5.00,
      qty: 1,
      specs: "Aluminum heatsink with thermal pads + temperature-controlled PWM blower fan",
      notes: "Mandatory. Local LLM token generation pegs all 4 CPU cores at 100%. Without active cooling, the Pi 5 throttles down within 45 seconds.",
      sourcing: "Official Raspberry Pi accessory",
      url: "https://www.adafruit.com/product/5815",
      vendor: "Adafruit",
      svgType: "cooler-silver",
      crucial: true
    },
    {
      id: "microsd",
      name: "64GB/128GB MicroSD Card (A2 / V30)",
      category: "compute",
      price: 15.00,
      qty: 1,
      specs: "A2 App Performance rating, V30 Video Speed, 160MB/s Read speed",
      notes: "A2 class rating is critical for high 4KB random read IOPS when loading large Gemma GGUF model weights into RAM on boot.",
      sourcing: "SanDisk Extreme / Samsung EVO Select",
      url: "https://www.amazon.com/dp/B09X7CFLDF",
      vendor: "Amazon",
      svgType: "sd-card",
      crucial: true
    },
    {
      id: "camera",
      name: "Raspberry Pi Camera Module 3 (Wide)",
      category: "vision-audio",
      price: 35.00,
      qty: 1,
      specs: "12MP Sony IMX708, 120° Ultra-Wide FOV, Autofocus, HDR support",
      notes: "The 120° wide FOV lets the robot see your entire desk and doorway. TRAP: Pi 5 has a 22-pin mini CSI port; you MUST buy a 22-pin to 15-pin mini ribbon cable!",
      sourcing: "Raspberry Pi Camera 3 Wide",
      url: "https://www.adafruit.com/product/5658",
      vendor: "Adafruit",
      svgType: "camera-module",
      crucial: true
    },
    {
      id: "inmp441",
      name: "INMP441 I2S MEMS Microphone Board",
      category: "vision-audio",
      price: 3.50,
      qty: 1,
      specs: "Digital I2S interface, 61 dBA SNR, omnidirectional, 24-bit PCM",
      notes: "Digital I2S completely bypasses the noisy analog 3.5mm jack. Delivers crystal-clear speech capture directly to openWakeWord with zero motor hum.",
      sourcing: "INMP441 MEMS Omnidirectional I2S Mic",
      url: "https://www.amazon.com/dp/B08L7VBDW7",
      vendor: "Amazon",
      svgType: "i2s-mic",
      crucial: true
    },
    {
      id: "max98357a",
      name: "MAX98357A I2S Mono 3W Class D Amp",
      category: "vision-audio",
      price: 4.00,
      qty: 1,
      specs: "3.2W into 4Ω at 5V, digital I2S input, integrated DAC, 92% efficiency",
      notes: "Takes digital PCM audio from Pi GPIO pins and drives the internal 4Ω speaker directly. No external DAC or soundcard needed.",
      sourcing: "Adafruit #3006 / MAX98357A breakout",
      url: "https://www.adafruit.com/product/3006",
      vendor: "Adafruit",
      svgType: "amp-purple",
      crucial: true
    },
    {
      id: "speaker",
      name: "4Ω 3W 40mm Enclosed Speaker",
      category: "vision-audio",
      price: 4.00,
      qty: 1,
      specs: "40mm diameter circular diaphragm, built-in acoustic resonant cavity, 4 Ohm",
      notes: "Fits snugly inside the rear torso grill. Acoustic cavity provides that authentic vintage 1990s toy robot voice resonance.",
      sourcing: "Mini 40mm 4Ω Enclosed Speaker",
      url: "https://www.adafruit.com/product/3968",
      vendor: "Adafruit",
      svgType: "speaker-cone",
      crucial: false
    },
    {
      id: "sg90",
      name: "SG90 9g Analog Micro Servo",
      category: "motion",
      price: 3.00,
      qty: 1,
      specs: "9g weight, 1.8 kg·cm torque @ 4.8V, 50Hz PWM control, analog circuitry",
      notes: "THE SIGNATURE MECHANIC SECRET: Must be the ANALOG SG90! Cutting PWM duty cycle to 0 drops holding torque instantly, letting gravity pull the head limp.",
      sourcing: "TowerPro SG90 (Analog Type)",
      url: "https://www.adafruit.com/product/169",
      vendor: "Adafruit",
      svgType: "servo-blue",
      crucial: true
    },
    {
      id: "n20",
      name: "2× N20 Micro Metal Gearmotors (6V 100RPM)",
      category: "motion",
      price: 8.00,
      qty: 2,
      specs: "All-metal planetary gearbox, 6V nominal (runs on 7.4V), 100 RPM, 3mm D-shaft",
      notes: "High reduction gearbox produces massive torque to spin rubber tank treads on carpets without stalling.",
      sourcing: "Pololu Micro Metal Gearmotor 100:1 / Amazon N20 pair",
      url: "https://www.pololu.com/product/2361",
      vendor: "Pololu",
      svgType: "motor-brass",
      crucial: true
    },
    {
      id: "drv8833",
      name: "DRV8833 Dual H-Bridge Motor Driver",
      category: "motion",
      price: 3.00,
      qty: 1,
      specs: "Dual MOSFET H-Bridge, 1.5A per channel (2A peak), 2.7V to 10.8V motor VM",
      notes: "Low internal resistance MOSFETs ensure no voltage drop. VM is wired directly to raw 7.4V battery to isolate motor electrical noise from the Pi 5.",
      sourcing: "Pololu DRV8833 Carrier / Adafruit #3297",
      url: "https://www.pololu.com/product/2130",
      vendor: "Pololu",
      svgType: "driver-red",
      crucial: true
    },
    {
      id: "treads",
      name: "Mini Continuous Rubber Track & Wheel Kit (30mm–32mm Wheels)",
      category: "motion",
      price: 14.00,
      qty: 1,
      specs: "30mm–32mm diameter wheels (3mm D-shaft bore) + 2× continuous rubber caterpillar tracks (14–16mm wide, 30T)",
      notes: "WHEEL SIZING SPEC: Buy 30mm-32mm (1.20 to 1.26 inch) diameter wheels with 3mm D-shaft hubs so the drive sprockets press-fit directly onto the N20 gearmotors! Setup uses 6 wheels total (2 drive sprockets on motors + 4 idler/bogie wheels on axles). Recommended: Pololu 30T Track Set (Pololu #1415 or Adafruit PID 2726).",
      sourcing: "Pololu 30T Track Set / Adafruit PID 2726 / Amazon Mini Track Kit",
      url: "https://www.pololu.com/product/1415",
      vendor: "Pololu",
      svgType: "treads-track",
      crucial: false
    },
    {
      id: "mpu6050",
      name: "MPU6050 6-DOF IMU Sensor (I2C)",
      category: "sensors-ui",
      price: 3.00,
      qty: 1,
      specs: "3-axis accelerometer + 3-axis gyroscope, onboard DMP, I2C interface (0x68)",
      notes: "Detects when you lift the robot by its handle or when Andy enters with heavy footsteps, triggering the emergency play-dead drop.",
      sourcing: "GY-521 MPU-6050 6-DOF sensor breakout",
      url: "https://www.adafruit.com/product/3886",
      vendor: "Adafruit",
      svgType: "sensor-blue",
      crucial: true
    },
    {
      id: "leds",
      name: "2× 10mm Diffused Red LEDs + 220Ω Resistors",
      category: "sensors-ui",
      price: 1.50,
      qty: 2,
      specs: "10mm round jumbo diffused red lens, forward voltage 2.0V @ 20mA",
      notes: "Circular retro glowing robot eyes. Connected to GPIO 17. Cutting the pin to LOW cuts the eyes to total darkness instantly.",
      sourcing: "Adafruit 10mm Diffused Red LEDs (Pack of 5)",
      url: "https://www.adafruit.com/product/4202",
      vendor: "Adafruit",
      svgType: "led-red",
      crucial: true
    },
    {
      id: "buttons",
      name: "2× 6×6mm Panel Tactile Switches",
      category: "sensors-ui",
      price: 0.50,
      qty: 2,
      specs: "6x6mm momentary tactile push-buttons, through-hole, click feel",
      notes: "Mounted behind the 3D-printed green chest arrows. Pressing the chest button wakes the robot up from play-dead mode.",
      sourcing: "Adafruit 6mm Tactile Button Switches",
      url: "https://www.adafruit.com/product/367",
      vendor: "Adafruit",
      svgType: "tactile-btn",
      crucial: false
    },
    {
      id: "18650",
      name: "2× 18650 High-Discharge Li-ion (Molicel P28A)",
      category: "power",
      price: 14.00,
      qty: 2,
      specs: "3.7V nominal per cell (7.4V 2S), 2800mAh, 35A continuous discharge",
      notes: "CRITICAL: Do NOT use cheap flashlight batteries! When Pi 5 runs Gemma and motors stall, current spikes to 4A. High-discharge cells prevent voltage sag.",
      sourcing: "Molicel P28A 18650 2800mAh 35A Battery",
      url: "https://www.18650batterystore.com/products/molicel-p28a",
      vendor: "18650BatteryStore",
      svgType: "battery-pair",
      crucial: true
    },
    {
      id: "bms",
      name: "2S 10A–15A Li-ion BMS Protection Board",
      category: "power",
      price: 3.00,
      qty: 1,
      specs: "2-Series battery management, 8.4V charge cutoff, 6.0V low-voltage cutoff, short circuit cutoff",
      notes: "Safeguards lithium cells from over-discharging or accidental shorts during prototyping.",
      sourcing: "2S 10A Li-ion BMS protection board",
      url: "https://www.amazon.com/dp/B07K6GLS1Z",
      vendor: "Amazon",
      svgType: "bms-board",
      crucial: true
    },
    {
      id: "buck",
      name: "5V 5A High-Efficiency Buck Converter",
      category: "power",
      price: 5.00,
      qty: 1,
      specs: "Synchronous step-down regulator, 7V-24V in -> 5.1V out @ 5A continuous",
      notes: "CALIBRATION MANDATORY: Use a digital multimeter to adjust trim pot until output reads exactly 5.10V before plugging into the Pi 5.",
      sourcing: "Pololu 5V 5A Step-Down Voltage Regulator",
      url: "https://www.pololu.com/product/2851",
      vendor: "Pololu",
      svgType: "buck-converter",
      crucial: true
    },
    {
      id: "switch",
      name: "Mini SPST Rocker Switch (3A+)",
      category: "power",
      price: 1.00,
      qty: 1,
      specs: "Single-Pole Single-Throw toggle, rated 250VAC 3A / 12V 6A",
      notes: "Physical master kill switch mounted to the rear chassis. Completely isolates battery power when charging or storing.",
      sourcing: "Adafruit Panel Mount SPST Rocker Switch",
      url: "https://www.adafruit.com/product/3221",
      vendor: "Adafruit",
      svgType: "rocker-switch",
      crucial: false
    },
    {
      id: "dome",
      name: "80mm Clear Acrylic Fillable Ornament Sphere",
      category: "aesthetic",
      price: 3.00,
      qty: 1,
      specs: "80mm diameter clear polystyrene/acrylic half-dome, snap fit",
      notes: "Vintage Toy Story bubble canopy protecting the glowing red LED eyes and camera lens.",
      sourcing: "Clear Acrylic Plastic Fillable Ornament Balls (80mm)",
      url: "https://www.amazon.com/dp/B07H83S82M",
      vendor: "Amazon",
      svgType: "acrylic-dome",
      crucial: false
    },
    {
      id: "filament",
      name: "PLA Filament Spools (Blue, Red, Yellow, Green)",
      category: "aesthetic",
      price: 25.00,
      qty: 1,
      specs: "1.75mm PLA or PETG (Royal Blue, Signal Red, Sunshine Yellow, Lime Green)",
      notes: "Printing in distinct colors gives an authentic retro toy finish straight off the print bed with zero painting required.",
      sourcing: "Polymaker PolyLite PLA 1.75mm",
      url: "https://www.amazon.com/dp/B07PGZ5S6Z",
      vendor: "Amazon",
      svgType: "spool-filament",
      crucial: false
    },
    {
      id: "fasteners",
      name: "M2.5 & M2 Standoff + Screw Assortment",
      category: "aesthetic",
      price: 8.00,
      qty: 1,
      specs: "Brass threaded hex standoffs (M2.5 x 6mm/10mm), M2.5 pan-head screws, M2 motor mount screws",
      notes: "Crucial for mounting Pi 5, active cooler, buck converter, and N20 motor brackets securely to the 3D-printed chassis.",
      sourcing: "M2.5 & M2 Brass Standoffs and Screws Kit",
      url: "https://www.amazon.com/dp/B07D7824T2",
      vendor: "Amazon",
      svgType: "screw-kit",
      crucial: false
    },
    {
      id: "csi-cable",
      name: "22-Pin Mini Pi 5 CSI Camera Ribbon Cable (200mm)",
      category: "vision-audio",
      price: 3.50,
      qty: 1,
      specs: "22-pin 0.5mm pitch to 15-pin 1.0mm pitch flexible flat ribbon cable, 200mm length",
      notes: "CRITICAL: The Camera Module 3 in the box includes an older 15-pin cable that physically WILL NOT fit the Pi 5. You MUST buy this 22-pin adapter cable.",
      sourcing: "Raspberry Pi Camera Cable Mini (22-pin) to Standard (15-pin)",
      url: "https://www.adafruit.com/product/5806",
      vendor: "Adafruit",
      svgType: "camera-module",
      crucial: true
    },
    {
      id: "battery-holder",
      name: "2S 18650 Dual Battery Holder with Wire Leads",
      category: "power",
      price: 2.00,
      qty: 1,
      specs: "2-slot series 18650 plastic enclosure with gold-plated spring terminals and 22AWG red/black leads",
      notes: "SAFETY MANDATORY: Never attempt to solder wires directly onto raw 18650 lithium cells. This holder gives secure, solderless battery contact.",
      sourcing: "2x 18650 Series Battery Holder with Lead Wires",
      url: "https://www.amazon.com/dp/B07PBW2P6X",
      vendor: "Amazon",
      svgType: "battery-pair",
      crucial: true
    },
    {
      id: "usb-charger",
      name: "Type-C 2S 8.4V Li-ion Boost Charger Board",
      category: "power",
      price: 2.50,
      qty: 1,
      specs: "5V USB-C input -> 8.4V 1A CC/CV step-up charge management module with status LED",
      notes: "Turns the robot into a convenient rechargeable toy. Plugs into any standard phone USB-C charger to charge the 2S battery pack safely through the BMS.",
      sourcing: "Type-C 2S 8.4V Step-up Lithium Battery Charger Board",
      url: "https://www.amazon.com/dp/B0B5ZJ7M7V",
      vendor: "Amazon",
      svgType: "buck-converter",
      crucial: true
    },
    {
      id: "dupont-wires",
      name: "DuPont Jumper Wires (40-Pin F-to-F & F-to-M)",
      category: "aesthetic",
      price: 2.50,
      qty: 1,
      specs: "20cm 40-strand ribbon cable with female-to-female and female-to-male headers",
      notes: "Required for hooking up the INMP441, MAX98357A, MPU6050, DRV8833, and LEDs to the Pi 5 GPIO header.",
      sourcing: "Premium Female/Female and Female/Male Jumper Wires",
      url: "https://www.adafruit.com/product/1950",
      vendor: "Adafruit",
      svgType: "screw-kit",
      crucial: true
    }
  ];

  // Layer Stacking List for Assembly Inspector
  const ASSEMBLY_LAYERS = [
    { id: 'treads', num: 1, name: 'Continuous Tracks & Drive Chassis', partId: 'treads', role: 'Foundation tank crawler base with dual red casings and 6 yellow wheels' },
    { id: 'motors', num: 2, name: 'Dual N20 Motors & DRV8833 Driver', partId: 'n20', role: 'All-metal gearboxes with direct 7.4V battery power feed' },
    { id: 'powerDeck', num: 3, name: '2S 18650 Battery, BMS & 5.1V Buck', partId: 'buck', role: 'Regulated 5.1V 5A power rail and protected high-discharge cells' },
    { id: 'speaker', num: 4, name: '40mm Speaker & MAX98357A I2S Amp', partId: 'speaker', role: 'Enclosed acoustic torso speaker chamber with rear sound vents' },
    { id: 'pi5Deck', num: 5, name: 'Raspberry Pi 5 + Active Cooler & MicroSD', partId: 'pi5', role: 'Main compute core running local Gemma 4-bit AI and openWakeWord' },
    { id: 'torsoShell', num: 6, name: 'Royal Blue Torso, Buttons & INMP441 Mic', partId: 'buttons', role: 'Front-facing acoustic mic intake slot and dual green chest switches' },
    { id: 'neckServo', num: 7, name: 'SG90 Analog Servo & Pi Camera Module 3', partId: 'sg90', role: 'Neck pivot with 0% PWM instant limp flop and 120° FOV camera' },
    { id: 'headEyes', num: 8, name: 'Dual 10mm Diffused Red LEDs & Head Base', partId: 'leds', role: 'Vintage glowing circular robot eyes and servo mounting disc' },
    { id: 'acrylicDome', num: 9, name: '80mm Clear Acrylic Bubble Dome', partId: 'dome', role: 'Protective clear canopy sealing the head mechanism' }
  ];

  // Beginner Guide Steps Data
  const GUIDE_STEPS = [
    {
      step: 1,
      title: 'Step 1: Compute & Operating System Prep',
      lead: 'Preparing the brain: flashing 64-bit Raspberry Pi OS Lite, configuring hardware interfaces, attaching cooling, and connecting the 22-pin camera.',
      blocks: [
        {
          title: '1. Flash Raspberry Pi OS Lite (64-bit)',
          text: 'Download and run Raspberry Pi Imager on your computer. Choose Raspberry Pi 5 as the device, Raspberry Pi OS Lite (64-bit) as the OS, and select your A2-rated MicroSD card. Click "Edit Settings" to enable SSH, set your username (e.g., pi), configure your local Wi-Fi network, and set your hostname to andy-robot.'
        },
        {
          title: '2. Mount the Active Cooler Heatsink',
          text: 'Remove the protective plastic film from the thermal pads on the bottom of the Raspberry Pi Active Cooler. Align the spring-loaded push pins with the two dedicated mounting holes on the Pi 5 PCB. Push down until they click securely into place. Finally, plug the tiny 4-pin fan cable into the dedicated fan header located near the top-right of the board.'
        },
        {
          title: '3. The 22-Pin CSI Mini Ribbon Cable Connection',
          text: 'TRAP ALERT: The Pi 5 does not use the older 15-pin camera connector. It features two 22-pin mini MIPI connectors (CAM/DISP 0 and CAM/DISP 1). Gently lift the black collar on CAM/DISP 0, insert the 22-pin ribbon cable with the metal contacts facing the HDMI ports (inward), and press the locking collar down.',
          callout: {
            title: 'Critical Gotcha: Cable Orientation',
            text: 'Inserting the ribbon cable backwards will cause the camera to not be detected by libcamera. The silver contact pins must face towards the Pi 5 micro-HDMI connectors!'
          }
        },
        {
          title: '4. Enable Hardware Interfaces & I2S Overlays',
          text: 'Once booted and connected via SSH, run `sudo raspi-config` to enable I2C and SPI. Then add the necessary audio overlays to your boot configuration:',
          codeTitle: '/boot/firmware/config.txt (Edit with sudo nano)',
          code: `# Enable I2C and Camera
dtparam=i2c_arm=on
camera_auto_detect=1

# Enable I2S Digital Audio (INMP441 Mic + MAX98357A Amp)
dtoverlay=hifiberry-dac
dtoverlay=googlevoicehat-soundcard`
        }
      ],
      checklist: [
        'Flashed 64-bit Pi OS Lite to A2 MicroSD card',
        'Clipped Active Cooler with thermal pads onto Pi 5',
        'Plugged 22-pin mini CSI cable into CAM/DISP 0',
        'Verified camera with `rpicam-still -o test.jpg`',
        'Enabled I2C and I2S overlays in config.txt'
      ]
    },
    {
      step: 2,
      title: 'Step 2: The Offline Software Stack Setup',
      lead: 'Compiling llama.cpp on ARM64, downloading the 4-bit quantized Gemma weights, setting up Piper TTS for offline toy speech, and configuring openWakeWord.',
      blocks: [
        {
          title: '1. Build llama.cpp with ARM64 CPU Optimizations',
          text: 'We compile llama.cpp natively on the Pi 5 so it leverages ARM NEON and dot-product vector instructions:',
          codeTitle: 'Bash Terminal (SSH into Pi 5)',
          code: `sudo apt-get update && sudo apt-get install -y build-essential cmake git libasound2-dev python3-pip
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && cmake -B build -DGGML_CPU=ON && cmake --build build --config Release -j4`
        },
        {
          title: '2. Download Gemma 4-Bit Edge Model Weights',
          text: 'Download the instruction-tuned GGUF model. The 4-bit quantized version uses under 1.8GB of RAM, leaving ample memory for audio buffers and OS caching:',
          codeTitle: 'Bash Terminal',
          code: `mkdir -p ~/models && cd ~/models
# Download Gemma instruction-tuned Q4_K_M GGUF
wget -O gemma-edge-q4.gguf https://huggingface.co/google/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf`
        },
        {
          title: '3. Install Piper TTS (Fast Offline Toy Voice)',
          text: 'Piper runs entirely on-device with zero internet latency, generating 22kHz speech audio in under 120ms:',
          codeTitle: 'Bash Terminal',
          code: `cd ~ && wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_arm64.tar.gz
tar -xvf piper_arm64.tar.gz
# Download a lightweight voice model
wget https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json`
        },
        {
          title: '4. Install openWakeWord Engine',
          text: 'openWakeWord listens continuously for the phrase "Andy\'s coming!" using minimal CPU power (~4% on a single core):',
          codeTitle: 'Bash Terminal',
          code: `pip3 install openwakeword pyaudio RPi.GPIO`
        }
      ],
      checklist: [
        'Compiled llama.cpp natively with cmake',
        'Downloaded Gemma 4-bit GGUF model to ~/models',
        'Verified Piper TTS produces speech via aplay',
        'Installed openWakeWord and verified mic capture'
      ]
    },
    {
      step: 3,
      title: 'Step 3: Power & Wiring Integration',
      lead: 'The most important step for a first-time robotics builder: calibrating voltage, wiring common ground, and preventing motor brownouts.',
      blocks: [
        {
          title: '1. Calibrate the Buck Converter to Exactly 5.10V',
          text: 'NEVER connect battery leads directly to the Raspberry Pi. Solder the 2S battery pack leads to the BMS board, and solder the BMS output to the input of the 5V 5A buck converter. Before connecting the Pi, grab your digital multimeter, turn the tiny screw on the blue potentiometer, and adjust until your meter reads exactly 5.10V DC.',
          callout: {
            title: 'Why 5.10V instead of 5.00V?',
            text: 'Under heavy AI inference and motor bursts, wire resistance causes a slight voltage drop. Setting the rail to 5.10V keeps the Pi 5 comfortably above the 4.85V undervoltage warning threshold.'
          }
        },
        {
          title: '2. Tie Grounds into a Single Star Ground Bus',
          text: 'Connect Pi GND (Pin 6/14/20), the battery BMS GND, the DRV8833 motor driver GND, and the SG90 servo GND together into one common ground point. A floating ground causes erratic servo jitter and sensor lockups.'
        },
        {
          title: '3. Separate Motor Power from Compute Power',
          text: 'Feed regulated 5.1V power from the buck converter output to Pi 5 Pin 2/4 and the SG90 servo red wire. Feed raw 7.4V battery voltage directly to the VM pin of the DRV8833 motor driver. This isolates high-current inductive motor spikes from the Pi 5.'
        }
      ],
      checklist: [
        'Measured buck converter output with multimeter: verified 5.10V',
        'Tied all ground wires to common ground bus',
        'Verified VM pin on DRV8833 receives raw battery voltage',
        'Checked SPST master switch cuts power completely'
      ]
    },
    {
      step: 4,
      title: 'Step 4: Core Control Script (andy_robot.py)',
      lead: 'The master Python state engine coordinating the local LLM loop, audio synthesis, and the emergency instant limp drop.',
      blocks: [
        {
          title: 'Complete andy_robot.py Script',
          text: 'Here is the production script. It listens for the wake-word or sensor spikes, runs speech through Piper, and executes the signature physical limp flop:',
          codeTitle: '~/andy_robot.py (Python 3)',
          code: `import os
import subprocess
import time
import RPi.GPIO as GPIO
from openwakeword.model import Model

# Pin Definitions
SERVO_PIN = 12    # Hardware PWM0 (Physical Pin 32 - keeps Pin 12 free for I2S BCLK)
LED_PIN = 17      # Red Eye LEDs (Pin 11)
IN1, IN2 = 23, 24 # Left Motor (Pins 16 & 18)
IN3, IN4 = 25, 26 # Right Motor (Pins 22 & 37)
BTN_WAKE = 22     # Chest Revive Button

GPIO.setmode(GPIO.BCM)
GPIO.setup([LED_PIN, IN1, IN2, IN3, IN4], GPIO.OUT)
GPIO.setup(SERVO_PIN, GPIO.OUT)
GPIO.setup(BTN_WAKE, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# 50Hz PWM for SG90 servo
neck_servo = GPIO.PWM(SERVO_PIN, 50)
neck_servo.start(7.5) # Center position (7.5% duty cycle)
GPIO.output(LED_PIN, GPIO.HIGH) # Turn red eyes ON

# Load wake-word model
oww = Model(wakeword_models=["andy_coming"])

def emergency_play_dead():
    """Drops the robot completely lifeless in under 50ms."""
    print("[EMERGENCY] ANDY'S COMING! DROPPING LIMP.")
    
    # 1. Kill speech output immediately
    os.system("pkill -9 aplay")
    
    # 2. Cut motor power
    GPIO.output([IN1, IN2, IN3, IN4], GPIO.LOW)
    
    # 3. Kill red eye LEDs (instant black)
    GPIO.output(LED_PIN, GPIO.LOW)
    
    # 4. Drop servo torque: Setting duty cycle to 0 cuts holding torque
    # allowing gravity to pull the head forward with an authentic flop!
    neck_servo.ChangeDutyCycle(0)
    
    # Stay play-dead until chest button is pressed
    while GPIO.input(BTN_WAKE) == GPIO.HIGH:
        time.sleep(0.05)
        
    revive_alive()

def revive_alive():
    """Wakes the robot back to life."""
    print("✨ WAKING UP! Chest button pressed.")
    GPIO.output(LED_PIN, GPIO.HIGH)
    neck_servo.ChangeDutyCycle(7.5)
    time.sleep(0.3)
    speak_toy_voice("Coast is clear! Andy is gone.")

def speak_toy_voice(text):
    """Pipes text through Piper TTS directly to ALSA I2S audio."""
    cmd1 = f'echo "{text}" | ./piper/piper --model en_US-lessac-medium.onnx --output_raw'
    cmd2 = 'aplay -r 22050 -f S16_LE -t raw -D default'
    p1 = subprocess.Popen(cmd1, shell=True, stdout=subprocess.PIPE)
    subprocess.Popen(cmd2, shell=True, stdin=p1.stdout)`
        },
        {
          title: 'The Limp Servo Secret',
          text: 'Most beginners make the mistake of commanding the servo to move downward to simulate falling. That looks mechanical and robotic! By passing `ChangeDutyCycle(0)`, the analog SG90 stops energizing its internal motor coils. The head instantly drops under its own weight, flopping forward onto the chassis with authentic plastic recoil.'
        },
        {
          title: 'Autonomous Boot Service (Start Automatically Without SSH)',
          text: 'To make your robot an authentic autonomous toy, enable the systemd service so it boots into Alive Mode immediately when you flip the master rocker switch:',
          codeTitle: 'Bash Terminal (Enable Auto-Start Service)',
          code: `sudo cp /home/pi/andy-robot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable andy-robot.service
sudo systemctl start andy-robot.service`
        }
      ],
      checklist: [
        'Saved autonomous script to ~/andy_robot_autonomous.py',
        'Verified DRV8833 SLEEP pin is pulled HIGH to enable motors',
        'Tested emergency_play_dead() execution time (<50ms)',
        'Enabled andy-robot.service to auto-start on boot'
      ]
    },
    {
      step: 5,
      title: 'Step 5: 3D Printing & Physical Assembly',
      lead: 'Assembling the mechanical chassis, mounting motors and treads, insulating the acoustic chamber, and securing the clear acrylic dome.',
      blocks: [
        {
          title: '1. Parametric 3D Printable Chassis Files (OpenSCAD)',
          text: 'The complete printable model is located at `cad/andy_robot_chassis.scad`. Open it in the free app OpenSCAD (openscad.org), choose a component from the top dropdown (`torso`, `chassis`, `head`, `buttons`, `motor_bracket`), and hit F6 (Render) followed by F7 (Export STL). Slice with 3 perimeters and 20% gyroid infill.'
        },
        {
          title: '2. Mount N20 Motors & Treads',
          text: 'Slide each N20 motor into the lower red track casings and secure with M2 screws. Press the yellow drive wheels firmly onto the 3mm D-shafts, install the idler wheels with M2.5 shoulder screws, and stretch the rubber tracks over the wheel assemblies.'
        },
        {
          title: '3. Acoustic Chamber Foam Barrier',
          text: 'CRITICAL TRAP: When the speaker talks, internal chassis vibrations can resonate directly into the INMP441 microphone, causing the wake-word model to misfire or loop. Use a piece of closed-cell foam or hot glue to acoustically seal the speaker compartment from the upper torso microphone intake port.'
        },
        {
          title: '4. Mount the SG90 Servo & Head Disc',
          text: 'Center the SG90 servo electronically before mounting by sending a 7.5% duty cycle pulse. Once centered, screw the white single-arm horn onto the output spline. Bolt the circular blue head base plate directly to the servo horn with two M2 screws.'
        },
        {
          title: '5. Wire Eye LEDs & Snap Acrylic Dome',
          text: 'Solder the two 10mm diffused red LEDs in parallel with a 220Ω series resistor. Insert them into the head eye collars. Route the thin wire leads down through the central hollow servo pivot into the torso. Finally, snap the 80mm clear acrylic half-dome over the head base rim.'
        }
      ],
      checklist: [
        'Exported STLs from cad/andy_robot_chassis.scad',
        'Mounted N20 motors and verified smooth track rotation',
        'Installed acoustic foam barrier between speaker and mic',
        'Centered SG90 servo before attaching head base',
        'Snapped 80mm acrylic dome securely over red LED eyes'
      ]
    }
  ];

  // Application State
  const AppState = {
    currentState: 'alive', // 'alive' or 'dead'
    acquiredParts: new Set(),
    checkedSteps: new Set(),
    audioContext: null
  };

  // Quotes spoken during Alive mode
  const ALIVE_QUOTES = [
    "Andy's away at school! What should we explore on this desk today?",
    "Scanning room perimeter... Sector 4 is completely clear.",
    "Hey! Don't look at me like that, I'm just an ordinary toy.",
    "Did you hear that noise in the hallway? Keep your ears open!",
    "Desk inspection complete: pencils aligned, no humans detected.",
    "All systems nominal! Ready for secret adventures."
  ];

  function init() {
    loadSavedState();
    setupTabs();
    setupBOM();
    setupAssemblyInspector();
    setupSimulator();
    setupGuide();
    setupHeaderStateControls();
    updateBudgetStats();
  }

  // Load persistence
  function loadSavedState() {
    try {
      const savedParts = localStorage.getItem('andy_robot_acquired');
      if (savedParts) {
        AppState.acquiredParts = new Set(JSON.parse(savedParts));
      }
      const savedSteps = localStorage.getItem('andy_robot_steps');
      if (savedSteps) {
        AppState.checkedSteps = new Set(JSON.parse(savedSteps));
      }
    } catch (e) {
      console.warn('Storage not available', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem('andy_robot_acquired', JSON.stringify([...AppState.acquiredParts]));
      localStorage.setItem('andy_robot_steps', JSON.stringify([...AppState.checkedSteps]));
    } catch (e) {
      console.warn('Save failed', e);
    }
  }

  // Navigation Tabs
  function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = document.getElementById(tab.dataset.tab);
        if (targetPane) {
          targetPane.classList.add('active');
        }

        // Trigger 3D canvas resize if assembly tab selected
        if (tab.dataset.tab === 'tab-3d-assembly' && window.robot3d) {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 50);
        }
      });
    });
  }

  // ==================== TAB 2: BOM CATALOG ====================
  function setupBOM() {
    renderBomGrid(BOM_DATABASE);

    // Search filter
    const searchInput = document.getElementById('bomSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const activeCategory = document.querySelector('#bomCategoryPills .filter-pill.active')?.dataset.category || 'all';
        filterBom(query, activeCategory);
      });
    }

    // Category pills
    const pills = document.querySelectorAll('#bomCategoryPills .filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        filterBom(query, pill.dataset.category);
      });
    });
  }

  function filterBom(query, category) {
    const filtered = BOM_DATABASE.filter(item => {
      const matchCat = category === 'all' || item.category === category;
      const matchQuery = !query ||
        item.name.toLowerCase().includes(query) ||
        item.specs.toLowerCase().includes(query) ||
        item.notes.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
    renderBomGrid(filtered);
  }

  function renderBomGrid(items) {
    const grid = document.getElementById('bomPartsGrid');
    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-dim);">No parts match your filter.</div>`;
      return;
    }

    grid.innerHTML = items.map(item => {
      const isAcquired = AppState.acquiredParts.has(item.id);
      return `
        <div class="bom-card ${isAcquired ? 'acquired' : ''}" id="card-${item.id}">
          <div class="bom-card-thumb">
            <span class="category-tag">${item.category}</span>
            <div class="acquired-checkbox-wrap">
              <label style="font-size: 0.72rem; color: #a7f3d0; display: flex; align-items: center; gap: 4px; cursor: pointer; background: rgba(0,0,0,0.6); padding: 3px 6px; border-radius: 4px;">
                <input type="checkbox" ${isAcquired ? 'checked' : ''} onchange="window.toggleAcquired('${item.id}')">
                Got it
              </label>
            </div>
            ${generateComponentSvg(item.svgType)}
          </div>
          <div class="bom-card-body">
            <h4 class="bom-item-title">${item.name}</h4>
            <div class="bom-item-specs">${item.specs}</div>
            <div class="bom-item-notes">${item.notes}</div>
          </div>
          <div class="bom-card-footer">
            <span class="bom-price">$${item.price.toFixed(2)} ${item.qty > 1 ? `(${item.qty}×)` : ''}</span>
            <div class="bom-card-actions">
              ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-buy btn-sm" title="Order on ${item.vendor || 'Vendor'}">Buy (${item.vendor || 'Store'}) &rarr;</a>` : ''}
              <button class="btn btn-secondary btn-sm" onclick="window.inspectComponentById('${item.id}')">Specs</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function toggleAcquired(partId) {
    if (AppState.acquiredParts.has(partId)) {
      AppState.acquiredParts.delete(partId);
    } else {
      AppState.acquiredParts.add(partId);
    }
    saveState();
    updateBudgetStats();

    const card = document.getElementById(`card-${partId}`);
    if (card) {
      card.classList.toggle('acquired', AppState.acquiredParts.has(partId));
    }
  }
  window.toggleAcquired = toggleAcquired;

  function updateBudgetStats() {
    const totalCount = BOM_DATABASE.length;
    const totalCost = BOM_DATABASE.reduce((acc, item) => acc + item.price, 0);
    let acquiredPrice = 0;
    let acquiredCount = 0;

    BOM_DATABASE.forEach(item => {
      if (AppState.acquiredParts.has(item.id)) {
        acquiredPrice += item.price;
        acquiredCount++;
      }
    });

    const percent = totalCount > 0 ? Math.round((acquiredCount / totalCount) * 100) : 0;

    const totalElem = document.getElementById('bomEstimatedTotalPrice');
    const priceElem = document.getElementById('bomAcquiredPrice');
    const barElem = document.getElementById('bomProgressBar');
    const countElem = document.getElementById('bomAcquiredCount');

    if (totalElem) totalElem.textContent = `$${totalCost.toFixed(2)}`;
    if (priceElem) priceElem.textContent = `$${acquiredPrice.toFixed(2)}`;
    if (barElem) barElem.style.width = `${percent}%`;
    if (countElem) countElem.textContent = `${acquiredCount} of ${totalCount} parts checked (${percent}%)`;
  }

  // Component Technical SVG Generator
  function generateComponentSvg(type) {
    switch (type) {
      case 'pcb-green':
        return `
          <svg viewBox="0 0 160 100" width="130" height="85">
            <rect x="10" y="10" width="140" height="80" rx="6" fill="#15803d" stroke="#22c55e" stroke-width="2"/>
            <rect x="20" y="25" width="45" height="45" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
            <circle cx="42" cy="47" r="14" fill="#1e293b"/>
            <rect x="75" y="20" width="16" height="55" rx="2" fill="#0f172a"/>
            <rect x="100" y="15" width="45" height="22" rx="2" fill="#64748b"/>
            <rect x="100" y="45" width="45" height="22" rx="2" fill="#64748b"/>
            <text x="80" y="93" fill="#bbf7d0" font-family="monospace" font-size="8" text-anchor="middle">RASPBERRY PI 5</text>
          </svg>`;
      case 'cooler-silver':
        return `
          <svg viewBox="0 0 140 100" width="110" height="80">
            <rect x="15" y="15" width="110" height="70" rx="4" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
            <circle cx="70" cy="50" r="26" fill="#1e293b"/>
            <circle cx="70" cy="50" r="10" fill="#475569"/>
            <line x1="30" y1="20" x2="30" y2="80" stroke="#94a3b8" stroke-width="2"/>
            <line x1="42" y1="20" x2="42" y2="80" stroke="#94a3b8" stroke-width="2"/>
            <line x1="98" y1="20" x2="98" y2="80" stroke="#94a3b8" stroke-width="2"/>
            <line x1="110" y1="20" x2="110" y2="80" stroke="#94a3b8" stroke-width="2"/>
          </svg>`;
      case 'camera-module':
        return `
          <svg viewBox="0 0 140 110" width="110" height="85">
            <rect x="40" y="10" width="60" height="60" rx="4" fill="#15803d" stroke="#4ade80" stroke-width="1.5"/>
            <circle cx="70" cy="40" r="20" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
            <circle cx="70" cy="40" r="8" fill="#1e3a8a"/>
            <!-- 22 pin ribbon cable -->
            <rect x="52" y="70" width="36" height="35" fill="#f1f5f9" stroke="#cbd5e1"/>
            <line x1="56" y1="80" x2="56" y2="105" stroke="#94a3b8" stroke-width="1"/>
            <line x1="64" y1="80" x2="64" y2="105" stroke="#94a3b8" stroke-width="1"/>
            <line x1="72" y1="80" x2="72" y2="105" stroke="#94a3b8" stroke-width="1"/>
            <line x1="80" y1="80" x2="80" y2="105" stroke="#94a3b8" stroke-width="1"/>
          </svg>`;
      case 'servo-blue':
        return `
          <svg viewBox="0 0 140 100" width="110" height="80">
            <rect x="35" y="30" width="70" height="50" rx="3" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
            <rect x="20" y="45" width="100" height="10" rx="2" fill="#0369a1"/>
            <circle cx="85" cy="24" r="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
            <circle cx="85" cy="24" r="4" fill="#64748b"/>
            <text x="70" y="60" fill="#fff" font-family="monospace" font-size="9" text-anchor="middle" font-weight="bold">SG90 9g</text>
          </svg>`;
      case 'motor-brass':
        return `
          <svg viewBox="0 0 150 90" width="120" height="75">
            <rect x="15" y="30" width="75" height="35" rx="3" fill="#d4af37" stroke="#b45309" stroke-width="1.5"/>
            <rect x="90" y="25" width="30" height="45" rx="2" fill="#ca8a04" stroke="#a16207" stroke-width="2"/>
            <rect x="120" y="43" width="20" height="8" fill="#94a3b8"/>
            <text x="52" y="52" fill="#451a03" font-family="monospace" font-size="9" text-anchor="middle" font-weight="bold">N20 6V</text>
          </svg>`;
      case 'driver-red':
        return `
          <svg viewBox="0 0 120 100" width="95" height="80">
            <rect x="25" y="15" width="70" height="70" rx="4" fill="#b91c1c" stroke="#ef4444" stroke-width="2"/>
            <rect x="42" y="35" width="36" height="30" rx="2" fill="#0f172a"/>
            <text x="60" y="54" fill="#fca5a5" font-family="monospace" font-size="8" text-anchor="middle" font-weight="bold">DRV8833</text>
          </svg>`;
      case 'treads-track':
        return `
          <svg viewBox="0 0 150 90" width="120" height="75">
            <rect x="15" y="20" width="120" height="50" rx="25" fill="#991b1b" stroke="#dc2626" stroke-width="3"/>
            <circle cx="45" cy="45" r="16" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
            <circle cx="75" cy="45" r="16" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
            <circle cx="105" cy="45" r="16" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          </svg>`;
      case 'led-red':
        return `
          <svg viewBox="0 0 120 90" width="95" height="75">
            <circle cx="60" cy="40" r="24" fill="#ef4444" stroke="#7f1d1d" stroke-width="2"/>
            <circle cx="60" cy="40" r="12" fill="#fca5a5" opacity="0.6"/>
            <line x1="52" y1="64" x2="52" y2="85" stroke="#94a3b8" stroke-width="3"/>
            <line x1="68" y1="64" x2="68" y2="85" stroke="#94a3b8" stroke-width="3"/>
          </svg>`;
      case 'battery-pair':
        return `
          <svg viewBox="0 0 130 90" width="105" height="75">
            <rect x="25" y="15" width="35" height="65" rx="4" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
            <rect x="37" y="10" width="11" height="5" fill="#94a3b8"/>
            <rect x="70" y="15" width="35" height="65" rx="4" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
            <rect x="82" y="10" width="11" height="5" fill="#94a3b8"/>
            <text x="65" y="52" fill="#052e16" font-family="monospace" font-size="9" text-anchor="middle" font-weight="bold">18650 2S</text>
          </svg>`;
      case 'buck-converter':
        return `
          <svg viewBox="0 0 140 90" width="110" height="75">
            <rect x="15" y="15" width="110" height="60" rx="4" fill="#991b1b" stroke="#ef4444" stroke-width="2"/>
            <circle cx="50" cy="45" r="14" fill="#334155" stroke="#64748b" stroke-width="2"/>
            <rect x="85" y="35" width="20" height="20" rx="2" fill="#0284c7"/>
            <circle cx="95" cy="45" r="4" fill="#d4af37"/>
            <text x="70" y="70" fill="#fecaca" font-family="monospace" font-size="8" text-anchor="middle">5.10V BUCK</text>
          </svg>`;
      default:
        return `
          <svg viewBox="0 0 100 80" width="80" height="65">
            <rect x="10" y="10" width="80" height="60" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2"/>
            <circle cx="50" cy="40" r="16" fill="#334155"/>
          </svg>`;
    }
  }

  // ==================== TAB 1: ASSEMBLY INSPECTOR ====================
  function setupAssemblyInspector() {
    const list = document.getElementById('assemblyLayerList');
    if (!list) return;

    list.innerHTML = ASSEMBLY_LAYERS.map((layer, index) => {
      return `
        <button class="layer-item-btn ${index === 4 ? 'active' : ''}" data-layer="${layer.id}" onclick="window.inspectLayer('${layer.id}')">
          <div>
            <span class="layer-num">#${layer.num}</span>
            <span>${layer.name}</span>
          </div>
          <span style="font-size: 0.75rem; opacity: 0.6;">&rarr;</span>
        </button>
      `;
    }).join('');

    // Default inspect Pi 5 deck
    inspectComponentById('pi5', 'pi5Deck');
  }

  function inspectLayer(layerId) {
    const layer = ASSEMBLY_LAYERS.find(l => l.id === layerId);
    if (!layer) return;

    document.querySelectorAll('.layer-item-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.layer === layerId);
    });

    inspectComponentById(layer.partId, layerId);
  }
  window.inspectLayer = inspectLayer;

  function inspectComponentById(partId, layerKey) {
    const item = BOM_DATABASE.find(b => b.id === partId);
    if (!item) return;

    const badge = document.getElementById('inspectPartBadge');
    const title = document.getElementById('inspectPartTitle');
    const imgWrap = document.getElementById('inspectPartImage');
    const role = document.getElementById('inspectPartRole');
    const power = document.getElementById('inspectPartPower');
    const conn = document.getElementById('inspectPartConn');
    const mount = document.getElementById('inspectPartMount');
    const notes = document.getElementById('inspectPartNotes');

    if (badge) badge.textContent = `${item.category.toUpperCase()} • $${item.price.toFixed(2)}`;
    if (title) title.textContent = item.name;
    if (imgWrap) imgWrap.innerHTML = generateComponentSvg(item.svgType);
    if (role) role.textContent = item.specs;
    if (notes) notes.innerHTML = `<strong>Maker Guidance:</strong> ${item.notes}`;

    // Link jump to BOM tab
    const jumpBtn = document.getElementById('btnJumpToBom');
    if (jumpBtn) {
      jumpBtn.onclick = () => {
        const tabBtn = document.querySelector('.nav-tab[data-tab="tab-bom-visual"]');
        if (tabBtn) tabBtn.click();
        setTimeout(() => {
          const card = document.getElementById(`card-${item.id}`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.boxShadow = '0 0 0 3px #38bdf8';
            setTimeout(() => { card.style.boxShadow = ''; }, 1800);
          }
        }, 100);
      };
    }

    // Direct Buy Link
    const buyBtn = document.getElementById('btnBuyComponent');
    if (buyBtn) {
      if (item.url) {
        buyBtn.href = item.url;
        buyBtn.textContent = `Buy on ${item.vendor || 'Vendor'} ($${item.price.toFixed(2)}) \u2192`;
        buyBtn.style.display = 'inline-flex';
      } else {
        buyBtn.style.display = 'none';
      }
    }
  }
  window.inspectComponentById = inspectComponentById;

  // ==================== TAB 4: SIMULATOR ====================
  function setupSimulator() {
    // Triggers
    document.getElementById('triggerWakeWord')?.addEventListener('click', () => triggerEvent('wake-word'));
    document.getElementById('triggerFootsteps')?.addEventListener('click', () => triggerEvent('footsteps'));
    document.getElementById('triggerLight')?.addEventListener('click', () => triggerEvent('light-change'));
    document.getElementById('triggerShake')?.addEventListener('click', () => triggerEvent('gyro-shake'));

    // Chest buttons
    document.getElementById('rigChestBtn1')?.addEventListener('click', () => wakeUpRobot('Chest Left Button Pressed'));
    document.getElementById('rigChestBtn2')?.addEventListener('click', () => wakeUpRobot('Chest Right Button Pressed'));

    // Periodic speech bubble cycling when alive
    setInterval(() => {
      if (AppState.currentState === 'alive') {
        const bubble = document.getElementById('rigSpeechBubble');
        if (bubble) {
          const randomQuote = ALIVE_QUOTES[Math.floor(Math.random() * ALIVE_QUOTES.length)];
          bubble.textContent = `"${randomQuote}"`;
        }
      }
    }, 6500);
  }

  function setupHeaderStateControls() {
    document.getElementById('btnAndyEmergency')?.addEventListener('click', () => {
      triggerEvent('manual-emergency');
    });

    document.getElementById('btnWakeUp')?.addEventListener('click', () => {
      wakeUpRobot('Header Wake Button');
    });
  }

  function triggerEvent(eventType) {
    if (AppState.currentState === 'dead') {
      logSimEvent(`[WARN] Robot already in PLAY DEAD MODE. Press chest button to wake up.`, 'log-warn');
      return;
    }

    let reason = "Andy's Coming!";
    if (eventType === 'wake-word') reason = 'OpenWakeWord: "Andy\'s coming!" detected (conf: 0.94)';
    else if (eventType === 'footsteps') reason = 'INMP441: Audio volume spike > 84dB (heavy footsteps)';
    else if (eventType === 'light-change') reason = 'Camera 3: Sudden exposure shift (door opened)';
    else if (eventType === 'gyro-shake') reason = 'MPU6050: Gyro jerk > 2.4g (robot picked up)';

    setRobotState('dead', reason);
  }

  function wakeUpRobot(source) {
    if (AppState.currentState === 'alive') {
      logSimEvent(`[INFO] Robot is already active in ALIVE MODE.`, 'log-info');
      return;
    }
    setRobotState('alive', source);
  }

  function setRobotState(state, reason) {
    AppState.currentState = state;
    const isAlive = state === 'alive';

    // Update Header
    const badge = document.getElementById('headerStateBadge');
    if (badge) {
      badge.dataset.state = state;
      badge.querySelector('.status-label').textContent = isAlive ? 'ALIVE MODE' : 'PLAY DEAD MODE';
    }

    // Update Simulator Badge
    const simBadge = document.getElementById('simLiveBadge');
    const simName = document.getElementById('simStateName');
    if (simBadge) simBadge.dataset.state = state;
    if (simName) simName.textContent = isAlive ? 'STATE: ALIVE MODE' : 'STATE: PLAY DEAD MODE (LIMP)';

    // Update Avatar Rig CSS
    const rig = document.getElementById('robotRig');
    if (rig) {
      rig.classList.toggle('play-dead', !isAlive);
    }

    // Update 3D Model in Three.js
    if (window.robot3d && window.robot3d.setRobotBehavioralState) {
      window.robot3d.setRobotBehavioralState(state);
    }

    // Sound FX & Speech Synthesis
    playAudioFx(isAlive ? 'wake' : 'dead');

    // Telemetry and Code Sync
    updateTelemetry(isAlive);

    // Logging
    if (isAlive) {
      logSimEvent(`[WAKE] ${reason} -> Eyes ON, Servo active, Piper TTS speech ready.`, 'log-system');
    } else {
      logSimEvent(`[ALARM] ${reason} -> EMERGENCY PLAY DEAD EXECUTED!`, 'log-alert');
      logSimEvent(`[OVERRIDE] os.system("pkill -9 aplay") -> Killed audio speech`, 'log-info');
      logSimEvent(`[HARDWARE] neck_servo.ChangeDutyCycle(0) -> Head dropped limp by gravity`, 'log-info');
      logSimEvent(`[HARDWARE] GPIO.output(LED_PIN, LOW) -> Red eyes cut black`, 'log-info');
    }
  }

  function updateTelemetry(isAlive) {
    const pwm = document.getElementById('telPwm');
    const pwmBar = document.getElementById('telPwmBar');
    const torque = document.getElementById('telTorque');
    const torqueBar = document.getElementById('telTorqueBar');
    const leds = document.getElementById('telLeds');
    const ledsBar = document.getElementById('telLedsBar');
    const motors = document.getElementById('telMotors');
    const motorsBar = document.getElementById('telMotorsBar');
    const term = document.getElementById('simCodeTerminal');

    if (isAlive) {
      if (pwm) pwm.textContent = '7.5% (50Hz Center)';
      if (pwmBar) pwmBar.style.width = '50%';
      if (torque) torque.textContent = '1.8 kg·cm (HOLDING)';
      if (torqueBar) torqueBar.style.width = '100%';
      if (leds) leds.textContent = '3.3V (20mA Active)';
      if (ledsBar) ledsBar.style.width = '100%';
      if (motors) motors.textContent = 'STANDBY (PWM Ready)';
      if (motorsBar) motorsBar.style.width = '30%';

      if (term) {
        term.innerHTML = `
<span class="cm"># [ALIVE MODE] Listening for triggers...</span>
<span class="kn">while</span> <span class="kc">True</span>:
    prediction = oww_model.predict(audio_chunk)
    <span class="kn">if</span> prediction[<span class="s2">"andy_coming"</span>] &gt; <span class="mf">0.65</span>:
        <span class="nf">emergency_play_dead</span>()
    <span class="kn">elif</span> imu.detect_shake():
        <span class="nf">emergency_play_dead</span>()
        `;
      }
    } else {
      if (pwm) pwm.textContent = '0.0% (DUTY CYCLE 0)';
      if (pwmBar) pwmBar.style.width = '0%';
      if (torque) torque.textContent = '0.0 kg·cm (LIMP GRAVITY DROP)';
      if (torqueBar) torqueBar.style.width = '0%';
      if (leds) leds.textContent = '0.0V (0mA OFF)';
      if (ledsBar) ledsBar.style.width = '0%';
      if (motors) motors.textContent = 'LOCKED OFF (LOW)';
      if (motorsBar) motorsBar.style.width = '0%';

      if (term) {
        term.innerHTML = `
<span class="cm"># [PLAY DEAD MODE] Frozen until button pressed!</span>
<span class="nf">def</span> <span class="nf">emergency_play_dead</span>():
    os.system(<span class="s2">"pkill -9 aplay"</span>)       <span class="cm"># Total audio silence</span>
    GPIO.output(IN_PINS, GPIO.LOW)       <span class="cm"># Cut motor power</span>
    GPIO.output(LED_PIN, GPIO.LOW)       <span class="cm"># Eyes cut to black</span>
    neck_servo.ChangeDutyCycle(<span class="mf">0</span>)        <span class="cm"># Head drops limp</span>
    <span class="kn">while</span> GPIO.input(BTN_PIN) == HIGH:
        time.sleep(<span class="mf">0.05</span>)                 <span class="cm"># Awaiting chest click</span>
        `;
      }
    }
  }

  function logSimEvent(msg, className) {
    const log = document.getElementById('simEventLog');
    if (!log) return;

    const d = new Date();
    const timeStr = d.toTimeString().split(' ')[0];
    const item = document.createElement('div');
    item.className = `log-entry ${className || ''}`;
    item.textContent = `[${timeStr}] ${msg}`;
    log.prepend(item);

    // Keep log tidy
    while (log.children.length > 25) {
      log.removeChild(log.lastChild);
    }
  }

  // Web Audio API Sound Generator (Zero External Dependencies)
  function playAudioFx(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!AppState.audioContext) {
        AppState.audioContext = new AudioCtx();
      }
      const ctx = AppState.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'dead') {
        // Instant power cut "click" + soft limp thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        // Joyful retro toy boot chime
        [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const start = ctx.currentTime + i * 0.08;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.25);
        });
      }
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Speak quote function for interactive capabilities cards
  function speakQuote(text) {
    if (AppState.currentState === 'dead') {
      wakeUpRobot('Voice quote trigger');
    }
    const bubble = document.getElementById('rigSpeechBubble');
    if (bubble) {
      bubble.textContent = `"${text}"`;
      bubble.style.opacity = '1';
    }
    playAudioFx('wake');
    logSimEvent(`[TOY APPRAISAL] "${text}"`, 'log-system');

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = 1.35;
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {}
  }
  window.speakQuote = speakQuote;

  // ==================== TAB 5: STEP-BY-STEP BUILD GUIDE ====================
  function setupGuide() {
    renderGuideStep(1);

    const stepBtns = document.querySelectorAll('.step-nav-btn');
    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        stepBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGuideStep(parseInt(btn.dataset.step, 10));
      });
    });
  }

  function renderGuideStep(stepNum) {
    const stepData = GUIDE_STEPS.find(s => s.step === stepNum);
    const card = document.getElementById('stepContentCard');
    if (!stepData || !card) return;

    let blocksHtml = stepData.blocks.map(b => {
      let extraHtml = '';
      if (b.callout) {
        extraHtml += `
          <div class="trap-callout">
            <h5>${b.callout.title}</h5>
            <p>${b.callout.text}</p>
          </div>
        `;
      }
      if (b.code) {
        extraHtml += `
          <div class="terminal-box">
            <div class="terminal-header">
              <span>${b.codeTitle || 'Terminal'}</span>
              <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${b.code.replace(/`/g, '\\`')}\`); this.textContent='Copied!'; setTimeout(()=>this.textContent='Copy', 1500);">Copy</button>
            </div>
            <pre><code>${escapeHtml(b.code)}</code></pre>
          </div>
        `;
      }

      return `
        <div class="instruction-block">
          <h4>${b.title}</h4>
          <p>${b.text}</p>
          ${extraHtml}
        </div>
      `;
    }).join('');

    let checklistHtml = `
      <div class="step-checklist">
        <div class="checklist-title">Step ${stepData.step} Verification Checklist</div>
        ${stepData.checklist.map((item, idx) => {
          const checkKey = `step_${stepData.step}_check_${idx}`;
          const isDone = AppState.checkedSteps.has(checkKey);
          return `
            <label class="check-item">
              <input type="checkbox" ${isDone ? 'checked' : ''} onchange="window.toggleStepCheck('${checkKey}')">
              <span>${item}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;

    card.innerHTML = `
      <h3 class="guide-step-title">${stepData.title}</h3>
      <p class="guide-step-lead">${stepData.lead}</p>
      ${blocksHtml}
      ${checklistHtml}
    `;
  }

  function toggleStepCheck(checkKey) {
    if (AppState.checkedSteps.has(checkKey)) {
      AppState.checkedSteps.delete(checkKey);
    } else {
      AppState.checkedSteps.add(checkKey);
    }
    saveState();
    updateGuideProgress();
  }
  window.toggleStepCheck = toggleStepCheck;

  function updateGuideProgress() {
    const text = document.getElementById('guideProgressText');
    if (text) {
      const totalChecks = 20; // 4 checks per step * 5 steps
      const done = AppState.checkedSteps.size;
      text.textContent = `${done} of ${totalChecks} tasks completed`;
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Export App for coordination
  window.robotApp = {
    init,
    currentState: AppState.currentState,
    triggerEvent,
    wakeUpRobot
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
