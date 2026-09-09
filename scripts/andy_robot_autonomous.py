#!/usr/bin/env python3
"""
Andy's Coming! — Full Autonomous Toy Story AI Robot Controller
Integrates:
 - Local Gemma LLM via llama.cpp
 - Offline Piper TTS voice synthesis
 - openWakeWord ("Andy's Coming!") real-time audio detection
 - MPU6050 6-DOF IMU tilt/shake tripwire
 - Instant mechanical limp drop via 0% PWM on SG90 servo
"""

import os
import sys
import time
import smbus
import threading
import subprocess
import RPi.GPIO as GPIO
from openwakeword.model import Model

# ==============================================================================
# 1. HARDWARE PIN DEFINITIONS (Conflict-Free Architecture)
# ==============================================================================
SERVO_PIN = 12    # BCM 12 (Physical Pin 32) - Hardware PWM0 for SG90 Servo
LED_PIN = 17      # BCM 17 (Physical Pin 11) - Red Eye LEDs (via 220Ω resistor)
IN1 = 23          # BCM 23 (Physical Pin 16) - Left Motor Forward
IN2 = 24          # BCM 24 (Physical Pin 18) - Left Motor Reverse
IN3 = 25          # BCM 25 (Physical Pin 22) - Right Motor Forward
IN4 = 26          # BCM 26 (Physical Pin 37) - Right Motor Reverse
DRV_SLP = 16      # BCM 16 (Physical Pin 36) - DRV8833 Sleep Enable Pin
BTN_WAKE = 22     # BCM 22 (Physical Pin 15) - Tactile Chest Button (Active LOW)

# I2C Configuration for MPU6050 IMU
MPU6050_ADDR = 0x68
PWR_MGMT_1 = 0x6B
ACCEL_ZOUT_H = 0x3F

# State tracking
is_alive = True
is_speaking = False

# ==============================================================================
# 2. GPIO & PERIPHERAL INITIALIZATION
# ==============================================================================
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Setup Output Pins
GPIO.setup([LED_PIN, IN1, IN2, IN3, IN4, DRV_SLP], GPIO.OUT)
GPIO.setup(SERVO_PIN, GPIO.OUT)

# Setup Tactile Chest Button with internal pull-up resistor
GPIO.setup(BTN_WAKE, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Wake up DRV8833 motor driver
GPIO.output(DRV_SLP, GPIO.HIGH)

# 50Hz PWM for SG90 servo (Neck Actuator)
neck_servo = GPIO.PWM(SERVO_PIN, 50)
neck_servo.start(7.5)  # 7.5% duty cycle = 90° center position

# Turn Red Eye LEDs ON
GPIO.output(LED_PIN, GPIO.HIGH)

# Initialize MPU6050 IMU via I2C Bus 1
try:
    bus = smbus.SMBus(1)
    bus.write_byte_data(MPU6050_ADDR, PWR_MGMT_1, 0) # Wake sensor up
    has_imu = True
    print("✅ MPU6050 IMU initialized.")
except Exception as e:
    has_imu = False
    print(f"⚠️ MPU6050 not detected: {e}. Shake trigger will use simulated fallback.")

# ==============================================================================
# 3. MOTOR & NECK ACTUATION HELPERS
# ==============================================================================
def stop_motors():
    GPIO.output([IN1, IN2, IN3, IN4], GPIO.LOW)

def drive_tracks(left_dir, right_dir, duration=0.6):
    """Simple skid-steer movement: 1=fwd, -1=rev, 0=stop"""
    if not is_alive:
        return
    GPIO.output(IN1, GPIO.HIGH if left_dir > 0 else GPIO.LOW)
    GPIO.output(IN2, GPIO.HIGH if left_dir < 0 else GPIO.LOW)
    GPIO.output(IN3, GPIO.HIGH if right_dir > 0 else GPIO.LOW)
    GPIO.output(IN4, GPIO.HIGH if right_dir < 0 else GPIO.LOW)
    time.sleep(duration)
    stop_motors()

def pan_head(angle_deg):
    """Sets neck servo angle (45° to 135°, 90° is center)."""
    if not is_alive:
        return
    duty = 2.5 + (angle_deg / 180.0) * 10.0
    neck_servo.ChangeDutyCycle(duty)

# ==============================================================================
# 4. AUDIO & LOCAL GEMMA LLM INTEGRATION
# ==============================================================================
def speak_toy_voice(text):
    """Pipes text through Piper TTS directly to ALSA I2S audio."""
    global is_speaking
    if not is_alive or not text:
        return
    is_speaking = True
    print(f"[ROBOT SPEAKS]: \"{text}\"")
    
    piper_cmd = (
        f'echo "{text}" | '
        f'/home/pi/piper/piper --model /home/pi/piper/en_US-lessac-medium.onnx --output_raw | '
        f'aplay -r 22050 -f S16_LE -t raw -D default'
    )
    p = subprocess.Popen(piper_cmd, shell=True)
    p.wait()
    is_speaking = False

def query_local_gemma(prompt):
    """Queries quantized Gemma model using llama.cpp CLI."""
    if not is_alive:
        return ""
    
    system_prompt = (
        "You are a secret vintage 1990s retro toy robot from Toy Story living on a desk. "
        "You secretly come alive when humans are away. Speak in short, playful, toy-like "
        "one-sentence quips. Never break character."
    )
    
    cmd = [
        "/home/pi/llama.cpp/build/bin/llama-cli",
        "-m", "/home/pi/models/gemma-edge-q4.gguf",
        "-p", f"<start_of_turn>user\n{system_prompt}\n{prompt}<end_of_turn>\n<start_of_turn>model\n",
        "-n", "45",
        "--temp", "0.7",
        "-t", "4",
        "-ngl", "0"
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=12)
        raw = res.stdout.strip()
        # Extract model response
        if "<start_of_turn>model" in raw:
            return raw.split("<start_of_turn>model")[-1].replace("<end_of_turn>", "").strip()
        return raw
    except Exception as e:
        print(f"LLM inference timeout: {e}")
        return "Desk perimeter is secure! Everything looks clear."

# ==============================================================================
# 5. THE SIGNATURE MECHANIC: "ANDY'S COMING!" EMERGENCY PLAY DEAD
# ==============================================================================
def emergency_play_dead(trigger_reason):
    """Instantly cuts all power, voice, and holding torque. Head flops limp!"""
    global is_alive
    if not is_alive:
        return
    is_alive = False
    
    print("\n" + "="*50)
    print(f"[EMERGENCY TRIGGER] ANDY'S COMING! TRIGGER: {trigger_reason}")
    print("="*50)
    
    # 1. Kill any speech immediately (<10ms)
    os.system("pkill -9 aplay > /dev/null 2>&1")
    
    # 2. Cut motor power immediately (treads freeze)
    stop_motors()
    
    # 3. Kill red eye LEDs (instant pitch black)
    GPIO.output(LED_PIN, GPIO.LOW)
    
    # 4. THE LIMP SECRET: Cut PWM duty cycle to 0
    # Cutting electrical PWM signal drops all holding torque to 0 N·cm.
    # Natural gravity immediately pulls the top-heavy head and acrylic dome forward!
    neck_servo.ChangeDutyCycle(0)
    
    print("[STATUS] Robot is completely limp and playing dead.")
    print("[REVIVE] Press physical green chest button to revive!\n")
    
    # Freeze until chest revive button is physically pressed
    while GPIO.input(BTN_WAKE) == GPIO.HIGH:
        time.sleep(0.05)
        
    revive_alive()

def revive_alive():
    """Restores the robot back to life when Andy leaves."""
    global is_alive
    print("✨ REVIVING: Chest button pressed. Coast is clear!")
    
    # 1. Turn red glowing eyes back ON
    GPIO.output(LED_PIN, GPIO.HIGH)
    
    # 2. Re-engage servo holding torque and re-center head
    neck_servo.ChangeDutyCycle(7.5)
    time.sleep(0.4)
    
    is_alive = True
    speak_toy_voice("Coast is clear! Andy is gone. Back to business!")

# ==============================================================================
# 6. SENSORY BACKGROUND LISTENERS
# ==============================================================================
def imu_monitoring_thread():
    """Continuously checks for sudden tilt, lift, or heavy footsteps."""
    while True:
        if is_alive and has_imu:
            try:
                # Read Z-axis high byte
                high = bus.read_byte_data(MPU6050_ADDR, ACCEL_ZOUT_H)
                # Normal 1g gravity reading is around ~16384 (raw)
                if high > 120 or high < 20: # Sudden jerk / pickup
                    emergency_play_dead("IMU Accelerometer Jerk (Robot Picked Up)")
            except Exception:
                pass
        time.sleep(0.08)

def wakeword_listening_thread():
    """Listens for 'Andy's coming!' using openWakeWord."""
    try:
        import pyaudio
        import numpy as np
        
        oww = Model(wakeword_models=["andy_coming"])
        p = pyaudio.PyAudio()
        stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1280)
        
        print("[AUDIO] Microphone listening for: \"Andy's coming!\"...")
        while True:
            if is_alive and not is_speaking:
                audio_data = np.frombuffer(stream.read(1280, exception_on_overflow=False), dtype=np.int16)
                prediction = oww.predict(audio_data)
                if prediction.get("andy_coming", 0) > 0.65:
                    emergency_play_dead("Wake-word Detected (\"Andy's Coming!\")")
            else:
                time.sleep(0.1)
    except Exception as e:
        print(f"WakeWord audio stream error: {e}")

# ==============================================================================
# 7. MAIN AUTONOMOUS LIVING BEHAVIOR LOOP
# ==============================================================================
def main():
    print("\n[SYSTEM] Toy Story AI Robot Booted & Active!")
    speak_toy_voice("I'm alive! Let's explore the desk.")
    
    # Launch sensory monitoring threads
    t1 = threading.Thread(target=imu_monitoring_thread, daemon=True)
    t2 = threading.Thread(target=wakeword_listening_thread, daemon=True)
    t1.start()
    t2.start()
    
    pan_angles = [65, 90, 115, 90]
    idx = 0
    
    try:
        while True:
            if is_alive and not is_speaking:
                # Look around
                pan_head(pan_angles[idx % len(pan_angles)])
                idx += 1
                
                # Autonomous curious desk commentary
                if idx % 8 == 0:
                    comment = query_local_gemma("Notice something interesting on the desk and comment on it.")
                    speak_toy_voice(comment)
                
                # Small tread crawl
                if idx % 12 == 0:
                    drive_tracks(1, 1, 0.4)
                
                time.sleep(2.5)
            else:
                time.sleep(0.2)
    except KeyboardInterrupt:
        print("\nStopping robot...")
    finally:
        stop_motors()
        neck_servo.stop()
        GPIO.cleanup()

if __name__ == "__main__":
    main()
