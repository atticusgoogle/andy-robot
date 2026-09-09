# Andy's Coming! Toy Story AI Robot — Materials Shopping List

> **Master Bill of Materials Checklist**  
> Total Estimated Cost: **$249.00 USD**  
> All 25 components verified for physical fit, 7.4V battery compatibility, and Raspberry Pi 5 pinout architecture.

---

### 1. Compute, Cooling & Storage

- [ ] **[Raspberry Pi 5 (8GB RAM)](https://www.adafruit.com/product/5813)** — **$80.00** *(Adafruit / CanaKit)*  
  *Spec*: 8GB RAM mandatory for local Gemma 2B LLM + openWakeWord inference in memory.
- [ ] **[Raspberry Pi Active Cooler](https://www.adafruit.com/product/5815)** — **$5.00** *(Adafruit / PiShop)*  
  *Spec*: Aluminum heatsink + PWM fan; mandatory to prevent CPU thermal throttling.
- [ ] **[SanDisk 64GB/128GB Extreme MicroSD (A2 / V30)](https://www.amazon.com/s?k=SanDisk+64GB+Extreme+microSDXC+A2+V30)** — **$15.00** *(Amazon)*  
  *Spec*: A2 rating provides high random 4KB read IOPS for fast model loading (~$12–$15).

---

### 2. Vision & Audio Components

- [ ] **[Raspberry Pi Camera Module 3 (Wide 120°)](https://www.adafruit.com/product/5658)** — **$35.00** *(Adafruit / PiShop)*  
  *Spec*: 12MP autofocus with 120° ultra-wide field of view for desk and room scanning.
- [ ] **[22-Pin to 15-Pin Mini Pi 5 Camera Ribbon Cable (200mm)](https://www.adafruit.com/product/5818)** — **$3.50** *(Adafruit PID 5818)*  
  *Spec*: **MANDATORY**: Adapts the Pi 5's mini 22-pin CSI pitch to Camera Module 3's 15-pin plug.
- [ ] **[INMP441 I2S MEMS Microphone Board](https://www.amazon.com/s?k=INMP441+I2S+microphone+module)** — **$3.50** *(Amazon)*  
  *Spec*: Digital I2S interface; zero motor hum or analog noise for openWakeWord background listening.
- [ ] **[MAX98357A I2S Mono 3W Class D Amp](https://www.adafruit.com/product/3006)** — **$4.00** *(Adafruit)*  
  *Spec*: Integrated DAC/Amp directly driven by Raspberry Pi 5 digital GPIO pins.
- [ ] **[4Ω 3W 40mm Enclosed Cavity Speaker](https://www.adafruit.com/product/3968)** — **$4.00** *(Adafruit / Amazon)*  
  *Spec*: Fits inside rear torso grill; sealed resonant chamber produces authentic 1990s plastic toy acoustics.

---

### 3. Locomotion & Neck Actuators

- [ ] **[SG90 9g Analog Micro Servo](https://www.adafruit.com/product/169)** — **$3.00** *(Adafruit)*  
  *Spec*: **Must be ANALOG!** Cutting PWM duty cycle to 0 drops holding torque for authentic limp flop.
- [ ] **[2× N20 Micro Metal Gearmotors (6V 100RPM)](https://www.pololu.com/product/2361)** — **$8.00 pair** *(Pololu / Amazon)*  
  *Spec*: High-torque micro metal planetary gearboxes with 3mm D-shafts for tank treads.
- [ ] **[DRV8833 Dual H-Bridge Motor Driver](https://www.pololu.com/product/2130)** — **$3.00** *(Pololu / Adafruit)*  
  *Spec*: Low RDS(on) MOSFETs; VM wired directly to raw 7.4V battery to isolate motor noise from the Pi 5.
- [ ] **[Pololu 30T Track and Wheel Set](https://www.pololu.com/product/1415)** (or **[Adafruit PID 2726](https://www.adafruit.com/product/2726)**) — **$14.00** *(Pololu / Adafruit)*  
  *Spec*: **30mm–32mm diameter wheels with 3mm D-shaft hubs** (2 drive sprockets + 4 idlers) + continuous rubber silicone tracks.

---

### 4. Sensors & Face/Chest Interface

- [ ] **[MPU6050 6-DOF IMU Sensor (I2C)](https://www.adafruit.com/product/3886)** — **$3.00** *(Adafruit / Amazon)*  
  *Spec*: Detects when robot is lifted by handle, shaken, table vibration, or approaching cliff desk edge.
- [ ] **[2× 10mm Diffused Red LEDs + 220Ω Resistors](https://www.adafruit.com/product/4202)** — **$1.50** *(Adafruit)*  
  *Spec*: Jumbo diffused red glowing robot eyes on GPIO 17; instant black on play dead.
- [ ] **[2× 6×6mm Panel Tactile Switches](https://www.adafruit.com/product/367)** — **$0.50** *(Adafruit)*  
  *Spec*: Mounted behind green chest arrow buttons; click to wake/revive robot from dead state.

---

### 5. Power & Battery Management

- [ ] **[2× 18650 High-Discharge Li-ion Cells (Molicel P28A 35A)](https://www.18650batterystore.com/products/molicel-p28a)** — **$14.00 pair** *(18650BatteryStore)*  
  *Spec*: 2S 7.4V nominal, 2800mAh, 35A discharge; prevents voltage sag under simultaneous CPU and motor loads.
- [ ] **[2S 18650 Dual Battery Holder with Wire Leads](https://www.amazon.com/s?k=2S+18650+battery+holder+with+leads)** — **$2.00** *(Amazon)*  
  *Spec*: **SAFETY**: Solderless, spring-loaded series battery enclosure with 22AWG leads.
- [ ] **[2S 10A–15A Li-ion BMS Protection Board](https://www.amazon.com/s?k=2S+10A+bms+protection+board)** — **$3.00** *(Amazon)*  
  *Spec*: Overcharge (8.4V), under-voltage (<6.0V), and short-circuit hardware cutoff.
- [ ] **[5V 5A High-Efficiency Buck Converter](https://www.pololu.com/product/2851)** — **$5.00** *(Pololu / Amazon)*  
  *Spec*: Synchronous step-down; calibrate trim pot to **5.10V** before plugging into Pi 5 Pins 2/4 and servo.
- [ ] **[Mini SPST Rocker Switch (3A+)](https://www.adafruit.com/product/3221)** — **$1.00** *(Adafruit)*  
  *Spec*: Physical master battery kill switch mounted to rear chassis.
- [ ] **[Type-C 2S 8.4V Li-ion Boost Charger Board](https://www.amazon.com/s?k=Type-C+2S+8.4V+boost+charger+board)** — **$2.50** *(Amazon)*  
  *Spec*: Step-up charging module; recharges 2S battery pack via standard USB-C phone charger.

---

### 6. Aesthetics, Hardware & Cables

- [ ] **[80mm Clear Acrylic Sphere Halves](https://www.amazon.com/s?k=80mm+clear+acrylic+fillable+ornament+balls)** — **$3.00** *(Amazon)*  
  *Spec*: Clear canopy protecting camera lens and glowing red eye LEDs.
- [ ] **[PLA 3D Printing Filament (Blue, Red, Yellow, Green)](https://www.amazon.com/s?k=Polymaker+PolyLite+PLA+filament+1.75mm)** — **$25.00** *(Amazon / Polymaker)*  
  *Spec*: Multi-color retro toy aesthetic straight from print bed with zero painting needed.
- [ ] **[M2.5 & M2 Brass Standoff + Screw Kit](https://www.amazon.com/s?k=M2.5+M2+brass+standoff+screw+kit)** — **$8.00** *(Amazon)*  
  *Spec*: Hardware kit for PCB, active cooler, motor bracket, and chassis mounting.
- [ ] **[DuPont Jumper Wires (40-Pin F-to-F & F-to-M)](https://www.adafruit.com/product/1950)** — **$2.50** *(Adafruit)*  
  *Spec*: 20cm ribbon jumpers for GPIO pin-to-sensor interconnections.

---

### Total Estimated Cost: **$249.00 USD**
