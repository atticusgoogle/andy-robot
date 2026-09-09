/**
 * Andy's Coming! — Interactive Master Wiring Architecture & Pi 5 Pinout
 */

(function () {
  'use strict';

  const GPIO_PINS = [
    // [PhysicalPin, BcmName, Type, TargetDevice, WireColor, Details]
    { pin: 1, bcm: '3.3V Power', type: '3v3', target: 'MPU6050 & INMP441 VCC', wire: '#f59e0b', desc: 'Provides clean 3.3V reference power for low-voltage sensor logic.' },
    { pin: 2, bcm: '5V Power (IN)', type: '5v', target: '5V 5A Buck Converter (+5.1V)', wire: '#ef4444', desc: 'Main 5.1V regulated power input from buck converter rail.' },
    { pin: 3, bcm: 'GPIO 2 (SDA1)', type: 'i2c', target: 'MPU6050 SDA Pin', wire: '#38bdf8', desc: 'I2C Serial Data line. Detects robot tilt, orientation, and shake.' },
    { pin: 4, bcm: '5V Power (IN)', type: '5v', target: '5V 5A Buck Converter (+5.1V)', wire: '#ef4444', desc: 'Second 5V pin, tied together on PCB for high current capacity.' },
    { pin: 5, bcm: 'GPIO 3 (SCL1)', type: 'i2c', target: 'MPU6050 SCL Pin', wire: '#38bdf8', desc: 'I2C Serial Clock line (100kHz standard bus).' },
    { pin: 6, bcm: 'Ground', type: 'gnd', target: 'Common Ground Bus', wire: '#1e293b', desc: 'System ground reference. Tied to battery, buck, and motor GND.' },
    { pin: 7, bcm: 'GPIO 4', type: 'gpio', target: 'Optional Aux / Test', wire: '#10b981', desc: 'General purpose I/O, available for peripheral expansion.' },
    { pin: 8, bcm: 'GPIO 14 (TXD)', type: 'gpio', target: 'Serial Console TX', wire: '#10b981', desc: 'UART Debug TX for headless setup.' },
    { pin: 9, bcm: 'Ground', type: 'gnd', target: 'Common Ground Bus', wire: '#1e293b', desc: 'System ground point.' },
    { pin: 10, bcm: 'GPIO 15 (RXD)', type: 'gpio', target: 'Serial Console RX', wire: '#10b981', desc: 'UART Debug RX.' },
    { pin: 11, bcm: 'GPIO 17', type: 'gpio', target: 'Red Eye LEDs (via 220Ω)', wire: '#dc2626', desc: 'Drives the dual 10mm red LEDs. HIGH = glowing eyes, LOW = instant black.' },
    { pin: 12, bcm: 'GPIO 18 (PCM_CLK)', type: 'i2s', target: 'I2S Bit Clock (BCLK)', wire: '#a855f7', desc: 'I2S Digital Audio Bit Clock line shared by INMP441 Mic and MAX98357A Amp.' },
    { pin: 13, bcm: 'GPIO 27', type: 'gpio', target: 'Left Chest Tactile Button', wire: '#10b981', desc: 'Configured with internal pull-up. Active LOW on press.' },
    { pin: 14, bcm: 'Ground', type: 'gnd', target: 'Common Ground Bus', wire: '#1e293b', desc: 'System ground point.' },
    { pin: 15, bcm: 'GPIO 22', type: 'gpio', target: 'Right Chest Tactile Button', wire: '#10b981', desc: 'Tactile chest button to revive robot from play-dead mode.' },
    { pin: 16, bcm: 'GPIO 23', type: 'gpio', target: 'DRV8833 IN1 (Left Fwd)', wire: '#10b981', desc: 'Controls left track forward direction.' },
    { pin: 17, bcm: '3.3V Power', type: '3v3', target: 'Aux Sensor Power', wire: '#f59e0b', desc: 'Secondary 3.3V rail.' },
    { pin: 18, bcm: 'GPIO 24', type: 'gpio', target: 'DRV8833 IN2 (Left Rev)', wire: '#10b981', desc: 'Controls left track reverse direction.' },
    { pin: 19, bcm: 'GPIO 10 (SPI MOSI)', type: 'gpio', target: 'Unused / Reserved', wire: '#64748b', desc: 'SPI bus.' },
    { pin: 20, bcm: 'Ground', type: 'gnd', target: 'Common Ground Bus', wire: '#1e293b', desc: 'System ground point.' },
    { pin: 21, bcm: 'GPIO 9 (SPI MISO)', type: 'gpio', target: 'Unused / Reserved', wire: '#64748b', desc: 'SPI bus.' },
    { pin: 22, bcm: 'GPIO 25', type: 'gpio', target: 'DRV8833 IN3 (Right Fwd)', wire: '#10b981', desc: 'Controls right track forward direction.' },
    { pin: 23, bcm: 'GPIO 11 (SPI SCLK)', type: 'gpio', target: 'Unused / Reserved', wire: '#64748b', desc: 'SPI clock.' },
    { pin: 24, bcm: 'GPIO 8 (SPI CE0)', type: 'gpio', target: 'Unused / Reserved', wire: '#64748b', desc: 'SPI chip enable.' },
    { pin: 25, bcm: 'Ground', type: 'gnd', target: 'Common Ground Bus', wire: '#1e293b', desc: 'System ground point.' },
    { pin: 26, bcm: 'GPIO 7 (SPI CE1)', type: 'gpio', target: 'Unused / Reserved', wire: '#64748b', desc: 'SPI chip enable.' },
    { pin: 27, bcm: 'ID_SD', type: 'i2c', target: 'EEPROM I2C Data', wire: '#38bdf8', desc: 'HAT ID EEPROM data.' },
    { pin: 28, bcm: 'ID_SC', type: 'i2c', target: 'EEPROM I2C Clock', wire: '#38bdf8', desc: 'HAT ID EEPROM clock.' },
    { pin: 29, bcm: 'GPIO 5', type: 'gpio', target: 'Aux / Status LED', wire: '#10b981', desc: 'General purpose I/O.' },
    { pin: 30, bcm: 'Ground', type: 'gnd', target: 'Common Ground Bus', wire: '#1e293b', desc: 'System ground point.' },
    { pin: 31, bcm: 'GPIO 6', type: 'gpio', target: 'Aux / Mic Gain', wire: '#10b981', desc: 'General purpose I/O.' },
    { pin: 32, bcm: 'GPIO 12 (PWM0)', type: 'pwm', target: 'SG90 Servo Signal (Orange)', wire: '#f97316', desc: 'Hardware 50Hz PWM0 channel. 7.5% duty = center, 0% duty = instant limp flop!' },
    { pin: 33, bcm: 'GPIO 13 (PWM1)', type: 'pwm', target: 'Aux PWM', wire: '#f97316', desc: 'Secondary PWM channel.' },
    { pin: 34, bcm: 'Ground', type: 'gnd', target: 'Common Ground Bus', wire: '#1e293b', desc: 'System ground point.' },
    { pin: 35, bcm: 'GPIO 19 (I2S FS)', type: 'i2s', target: 'MAX98357A LRC & INMP441 WS', wire: '#a855f7', desc: 'Word Select / LR Clock (44.1kHz / 22kHz sampling frame).' },
    { pin: 36, bcm: 'GPIO 16', type: 'gpio', target: 'DRV8833 SLEEP Pin', wire: '#10b981', desc: 'Pulls DRV8833 out of low-power sleep mode (HIGH).' },
    { pin: 37, bcm: 'GPIO 26', type: 'gpio', target: 'DRV8833 IN4 (Right Rev)', wire: '#10b981', desc: 'Controls right track reverse direction.' },
    { pin: 38, bcm: 'GPIO 20 (I2S DIN)', type: 'i2s', target: 'INMP441 SD (Data Out to Pi)', wire: '#a855f7', desc: 'Serial audio in from microphone to Pi ALSA capture.' },
    { pin: 39, bcm: 'Ground', type: 'gnd', target: 'Common Ground Bus', wire: '#1e293b', desc: 'System ground point.' },
    { pin: 40, bcm: 'GPIO 21 (I2S DOUT)', type: 'i2s', target: 'MAX98357A DIN (Data In)', wire: '#a855f7', desc: 'Serial audio out from Pi Piper TTS to 3W speaker amp.' }
  ];

  function init() {
    renderArchitectureSvg('all');
    renderGpioPinout();
    bindFilterButtons();
  }

  function renderArchitectureSvg(filter) {
    const wrap = document.getElementById('circuitDiagramWrap');
    if (!wrap) return;

    // Build SVG diagram
    const svgHtml = `
      <svg viewBox="0 0 980 440" xmlns="http://www.w3.org/2000/svg" class="circuit-svg">
        <defs>
          <linearGradient id="gradPi" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#15803d" />
            <stop offset="100%" stop-color="#166534" />
          </linearGradient>
          <linearGradient id="gradBat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#065f46" />
            <stop offset="100%" stop-color="#047857" />
          </linearGradient>
          <linearGradient id="gradBuck" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#991b1b" />
            <stop offset="100%" stop-color="#b91c1c" />
          </linearGradient>
          <linearGradient id="gradMotor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b45309" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Background grid -->
        <g stroke="#1a2436" stroke-width="0.8" opacity="0.4">
          <line x1="0" y1="50" x2="980" y2="50"/>
          <line x1="0" y1="120" x2="980" y2="120"/>
          <line x1="0" y1="200" x2="980" y2="200"/>
          <line x1="0" y1="280" x2="980" y2="280"/>
          <line x1="0" y1="360" x2="980" y2="360"/>
        </g>

        <!-- 1. POWER SUPPLY SOURCE (LEFT) -->
        <g class="circuit-block c-power" opacity="${filter === 'all' || filter === 'power' ? '1' : '0.2'}">
          <rect x="20" y="50" width="160" height="90" rx="8" fill="url(#gradBat)" stroke="#10b981" stroke-width="2"/>
          <text x="100" y="80" text-anchor="middle" fill="#fff" font-weight="bold" font-size="13">2S 18650 Li-ion</text>
          <text x="100" y="100" text-anchor="middle" fill="#a7f3d0" font-size="11">7.4V Nom &bull; 10A BMS</text>
          <text x="100" y="122" text-anchor="middle" fill="#6ee7b7" font-size="10">Molicel P28A High-Discharge</text>

          <!-- Master Switch -->
          <rect x="50" y="180" width="100" height="45" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="100" y="202" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">SPST Switch</text>
          <text x="100" y="217" text-anchor="middle" fill="#94a3b8" font-size="9">Master Kill 3A+</text>
          
          <!-- Wire Bat to Switch -->
          <line x1="100" y1="140" x2="100" y2="180" stroke="#f59e0b" stroke-width="3"/>
        </g>

        <!-- 2. POWER REGULATION & MOTOR DRIVER SPLIT -->
        <g class="circuit-block c-power" opacity="${filter === 'all' || filter === 'power' ? '1' : '0.2'}">
          <!-- 5V 5A Buck Converter -->
          <rect x="230" y="50" width="160" height="90" rx="8" fill="url(#gradBuck)" stroke="#ef4444" stroke-width="2"/>
          <text x="310" y="80" text-anchor="middle" fill="#fff" font-weight="bold" font-size="13">5V 5A Buck DCDC</text>
          <text x="310" y="100" text-anchor="middle" fill="#fecaca" font-size="11">Calibrated to 5.10V</text>
          <text x="310" y="122" text-anchor="middle" fill="#fca5a5" font-size="9">Pi 5 + SG90 Servo Rail</text>

          <!-- DRV8833 Motor Driver -->
          <rect x="230" y="230" width="160" height="90" rx="8" fill="url(#gradMotor)" stroke="#f59e0b" stroke-width="2"/>
          <text x="310" y="260" text-anchor="middle" fill="#fff" font-weight="bold" font-size="13">DRV8833 H-Bridge</text>
          <text x="310" y="280" text-anchor="middle" fill="#fef3c7" font-size="11">VM = 7.4V Raw Battery</text>
          <text x="310" y="302" text-anchor="middle" fill="#fde68a" font-size="9">Dual N20 Motor Control</text>

          <!-- Power split lines from switch -->
          <path d="M 150 202 L 190 202 L 190 95 L 230 95" stroke="#f59e0b" stroke-width="3" fill="none"/>
          <path d="M 190 202 L 190 275 L 230 275" stroke="#f59e0b" stroke-width="3" fill="none"/>
        </g>

        <!-- 3. MAIN COMPUTE: RASPBERRY PI 5 (CENTER) -->
        <g class="circuit-block c-compute" opacity="${filter === 'all' || filter === 'power' || filter === 'audio' || filter === 'motion' || filter === 'sensors' ? '1' : '0.2'}">
          <rect x="440" y="40" width="260" height="300" rx="10" fill="url(#gradPi)" stroke="#22c55e" stroke-width="2"/>
          <text x="570" y="70" text-anchor="middle" fill="#fff" font-weight="800" font-size="16">Raspberry Pi 5 (8GB)</text>
          <text x="570" y="90" text-anchor="middle" fill="#bbf7d0" font-size="11">Active Cooler &bull; 64GB A2 MicroSD</text>

          <!-- Embedded Pi sub-modules -->
          <rect x="460" y="110" width="100" height="50" rx="5" fill="#14532d" stroke="#4ade80" stroke-width="1"/>
          <text x="510" y="132" text-anchor="middle" fill="#fff" font-weight="bold" font-size="10">Local Gemma AI</text>
          <text x="510" y="148" text-anchor="middle" fill="#86efac" font-size="9">llama.cpp 4-bit</text>

          <rect x="580" y="110" width="100" height="50" rx="5" fill="#14532d" stroke="#4ade80" stroke-width="1"/>
          <text x="630" y="132" text-anchor="middle" fill="#fff" font-weight="bold" font-size="10">OpenWakeWord</text>
          <text x="630" y="148" text-anchor="middle" fill="#86efac" font-size="9">"Andy's coming!"</text>

          <!-- 40 Pin GPIO strip representation -->
          <rect x="460" y="180" width="220" height="140" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
          <text x="570" y="200" text-anchor="middle" fill="#38bdf8" font-weight="bold" font-size="11">40-PIN GPIO HEADER</text>
          
          <text x="470" y="225" fill="#ef4444" font-family="monospace" font-size="10">Pin 2/4: 5.1V IN</text>
          <text x="470" y="245" fill="#1e293b" font-family="monospace" font-size="10" stroke="#64748b" stroke-width="0.3">Pin 6: Common GND</text>
          <text x="470" y="265" fill="#f97316" font-family="monospace" font-size="10">Pin 12: SG90 PWM</text>
          <text x="470" y="285" fill="#dc2626" font-family="monospace" font-size="10">Pin 11: Eye LEDs</text>
          <text x="470" y="305" fill="#10b981" font-family="monospace" font-size="10">Pins 16/18/22/37: DRV8833</text>

          <text x="585" y="225" fill="#38bdf8" font-family="monospace" font-size="10">Pins 3/5: I2C (IMU)</text>
          <text x="585" y="245" fill="#a855f7" font-family="monospace" font-size="10">Pins 35/38/40: I2S</text>
          <text x="585" y="265" fill="#10b981" font-family="monospace" font-size="10">Pins 13/15: Buttons</text>
          <text x="585" y="285" fill="#cbd5e1" font-family="monospace" font-size="10">CSI: 22-pin Camera 3</text>
        </g>

        <!-- 5.1V Power Line from Buck to Pi 5 -->
        <g class="circuit-wire c-power" opacity="${filter === 'all' || filter === 'power' ? '1' : '0.2'}">
          <path d="M 390 95 L 440 95" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
          <text x="415" y="88" fill="#ef4444" font-size="9" font-weight="bold" text-anchor="middle">5.1V</text>
        </g>

        <!-- 4. PERIPHERALS & ACTUATORS (RIGHT) -->

        <!-- SG90 Servo -->
        <g class="circuit-block c-motion" opacity="${filter === 'all' || filter === 'motion' ? '1' : '0.2'}">
          <rect x="760" y="30" width="190" height="60" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="855" y="52" text-anchor="middle" fill="#fff" font-weight="bold" font-size="12">SG90 Micro Servo</text>
          <text x="855" y="70" text-anchor="middle" fill="#bae6fd" font-size="9">Neck Actuator &bull; Analog Limp Secret</text>
          <!-- Signal wire from Pin 12 -->
          <path d="M 700 195 L 730 195 L 730 60 L 760 60" stroke="#f97316" stroke-width="2.5" fill="none"/>
        </g>

        <!-- Red Eye LEDs -->
        <g class="circuit-block c-sensors" opacity="${filter === 'all' || filter === 'sensors' ? '1' : '0.2'}">
          <rect x="760" y="105" width="190" height="55" rx="6" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.5"/>
          <text x="855" y="126" text-anchor="middle" fill="#fff" font-weight="bold" font-size="12">2&times; 10mm Red LEDs</text>
          <text x="855" y="144" text-anchor="middle" fill="#fecaca" font-size="9">via 220Ω Resistor &bull; Instant Cut</text>
          <!-- Wire from Pin 11 -->
          <path d="M 700 215 L 740 215 L 740 132 L 760 132" stroke="#dc2626" stroke-width="2" fill="none"/>
        </g>

        <!-- Digital Audio: INMP441 Mic + MAX98357A Amp + Speaker -->
        <g class="circuit-block c-audio" opacity="${filter === 'all' || filter === 'audio' ? '1' : '0.2'}">
          <rect x="760" y="175" width="190" height="75" rx="6" fill="#581c87" stroke="#c084fc" stroke-width="1.5"/>
          <text x="855" y="196" text-anchor="middle" fill="#fff" font-weight="bold" font-size="12">I2S Digital Audio</text>
          <text x="855" y="214" text-anchor="middle" fill="#e9d5ff" font-size="9">INMP441 Mic &bull; MAX98357A Amp</text>
          <text x="855" y="232" text-anchor="middle" fill="#d8b4fe" font-size="9">40mm 3W Enclosed Torso Speaker</text>
          <!-- Wire from I2S Pins -->
          <path d="M 700 245 L 760 245" stroke="#a855f7" stroke-width="2.5" fill="none"/>
        </g>

        <!-- MPU6050 IMU -->
        <g class="circuit-block c-sensors" opacity="${filter === 'all' || filter === 'sensors' ? '1' : '0.2'}">
          <rect x="760" y="265" width="190" height="55" rx="6" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
          <text x="855" y="286" text-anchor="middle" fill="#fff" font-weight="bold" font-size="12">MPU6050 6-DOF IMU</text>
          <text x="855" y="304" text-anchor="middle" fill="#bfdbfe" font-size="9">I2C (SDA/SCL) &bull; Tilt / Shake Trigger</text>
          <!-- Wire from I2C Pins -->
          <path d="M 700 285 L 760 285" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
        </g>

        <!-- 2x N20 Motors & Treads -->
        <g class="circuit-block c-motion" opacity="${filter === 'all' || filter === 'motion' ? '1' : '0.2'}">
          <rect x="760" y="335" width="190" height="60" rx="6" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
          <text x="855" y="356" text-anchor="middle" fill="#fff" font-weight="bold" font-size="12">2&times; N20 Metal Motors</text>
          <text x="855" y="374" text-anchor="middle" fill="#fde68a" font-size="9">6V 100RPM &bull; Continuous Treads</text>
          <!-- Wire from DRV8833 -->
          <path d="M 390 305 L 430 305 L 430 370 L 760 370" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,2" fill="none"/>
        </g>

        <!-- COMMON GROUND BUS BAR AT BOTTOM -->
        <g class="circuit-block c-power" opacity="${filter === 'all' || filter === 'power' ? '1' : '0.2'}">
          <rect x="40" y="405" width="900" height="18" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
          <text x="490" y="418" text-anchor="middle" fill="#9ca3af" font-weight="bold" font-size="10">COMMON GROUND STAR BUS (Pi GND + Battery GND + DRV8833 GND + SG90 GND + Sensors GND)</text>
        </g>
      </svg>
    `;

    wrap.innerHTML = svgHtml;
  }

  function renderGpioPinout() {
    const board = document.getElementById('gpioBoard');
    if (!board) return;

    let leftRows = '';
    let centerSpine = '';
    let rightRows = '';

    for (let i = 0; i < GPIO_PINS.length; i += 2) {
      const pLeft = GPIO_PINS[i];     // Odd pin (1, 3, 5...)
      const pRight = GPIO_PINS[i + 1]; // Even pin (2, 4, 6...)

      leftRows += `
        <div class="pin-row-left" data-pin="${pLeft.pin}" onclick="window.inspectPin(${pLeft.pin})">
          <span class="pin-lbl">${pLeft.bcm}</span>
          <span class="pin-num">${pLeft.pin}</span>
          <span class="pin-dot dot-${pLeft.type}"></span>
        </div>
      `;

      centerSpine += `
        <div class="pin-center-spine">|</div>
      `;

      rightRows += `
        <div class="pin-row-right" data-pin="${pRight.pin}" onclick="window.inspectPin(${pRight.pin})">
          <span class="pin-dot dot-${pRight.type}"></span>
          <span class="pin-num">${pRight.pin}</span>
          <span class="pin-lbl">${pRight.bcm}</span>
        </div>
      `;
    }

    board.innerHTML = `
      <div class="gpio-col-left">${leftRows}</div>
      <div class="gpio-col-center">${centerSpine}</div>
      <div class="gpio-col-right">${rightRows}</div>
    `;

    // Default inspect Pin 12 (PWM for servo limp drop)
    inspectPin(12);
  }

  function inspectPin(pinNumber) {
    const pinObj = GPIO_PINS.find(p => p.pin === pinNumber);
    if (!pinObj) return;

    // Highlight row
    document.querySelectorAll('.pin-row-left, .pin-row-right').forEach(r => {
      r.classList.remove('active');
      if (parseInt(r.dataset.pin, 10) === pinNumber) {
        r.classList.add('active');
      }
    });

    // Update panel
    const badge = document.getElementById('pinBadge');
    const title = document.getElementById('pinTitle');
    const desc = document.getElementById('pinDesc');
    const physical = document.getElementById('pinPhysical');
    const bcm = document.getElementById('pinBcm');
    const target = document.getElementById('pinTarget');
    const voltage = document.getElementById('pinVoltage');

    if (badge) badge.textContent = `PIN ${pinObj.pin} • ${pinObj.type.toUpperCase()}`;
    if (title) title.textContent = `${pinObj.bcm} — ${pinObj.target}`;
    if (desc) desc.textContent = pinObj.desc;
    if (physical) physical.textContent = `Physical Pin ${pinObj.pin}`;
    if (bcm) bcm.textContent = pinObj.bcm;
    if (target) target.textContent = pinObj.target;
    if (voltage) {
      if (pinObj.type === '5v') voltage.textContent = '5.1V Regulated Bus';
      else if (pinObj.type === '3v3') voltage.textContent = '3.3V Logic Output';
      else if (pinObj.type === 'gnd') voltage.textContent = '0V Reference Ground';
      else voltage.textContent = '3.3V GPIO Logic Level';
    }
  }
  window.inspectPin = inspectPin;

  function bindFilterButtons() {
    document.querySelectorAll('.wiring-filter-controls .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wiring-filter-controls .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderArchitectureSvg(btn.dataset.circuit);
      });
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
