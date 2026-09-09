/**
 * Andy's Coming! — Toy Story AI Robot 3D Assembly & Hardware Visualizer
 * Powered by Three.js (WebGL)
 */

(function () {
  'use strict';

  let scene, camera, renderer, controls;
  let container;
  let robotMasterGroup;
  let subassemblies = {};
  let wireGroup;
  let eyeLights = [];
  let isSpinning = false;
  let shellMode = 'solid'; // 'solid', 'transparent', 'wireframe'
  let showWires = false;
  let explodedProgress = 0; // 0.0 to 1.0
  let currentHeadAngle = 0;
  let targetHeadAngle = 0;
  let raycaster, mouse;
  let clickableParts = [];
  let hoveredMesh = null;

  // Assembly layer definitions with exploded Y-offsets
  const LAYER_OFFSETS = {
    treads: { y: 0, z: 0 },
    motors: { y: 0.4, z: 0 },
    powerDeck: { y: 1.1, z: 0 },
    speaker: { y: 1.4, z: -0.8 },
    pi5Deck: { y: 2.2, z: 0 },
    torsoShell: { y: 3.4, z: 0 },
    neckServo: { y: 4.6, z: 0 },
    cameraMount: { y: 5.2, z: 0.3 },
    headEyes: { y: 6.0, z: 0 },
    acrylicDome: { y: 7.2, z: 0 }
  };

  // Materials palette
  const materials = {
    torsoBlue: new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.35,
      metalness: 0.1,
      name: 'TorsoShell'
    }),
    treadRed: new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.6,
      metalness: 0.05
    }),
    wheelYellow: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
      metalness: 0.15
    }),
    brassMotor: new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.8
    }),
    circuitGreen: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.4,
      metalness: 0.2
    }),
    circuitRed: new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.4,
      metalness: 0.2
    }),
    circuitBlue: new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.4,
      metalness: 0.2
    }),
    circuitPurple: new THREE.MeshStandardMaterial({
      color: 0x7e22ce,
      roughness: 0.4,
      metalness: 0.2
    }),
    chipBlack: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.4
    }),
    coolerSilver: new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.2,
      metalness: 0.7
    }),
    batteryGreen: new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.3,
      metalness: 0.1
    }),
    servoBlue: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    }),
    chestGreen: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.2,
      emissive: 0x065f46,
      emissiveIntensity: 0.6
    }),
    ledEyeActive: new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.1,
      metalness: 0.1,
      emissive: 0xff0000,
      emissiveIntensity: 1.5
    }),
    ledEyeDead: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.1,
      emissive: 0x000000,
      emissiveIntensity: 0.0
    }),
    domeClear: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1.0,
      transparent: true,
      roughness: 0.08,
      ior: 1.49, // Acrylic refraction
      reflectivity: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    })
  };

  function init() {
    container = document.getElementById('robot3dCanvasContainer');
    if (!container || typeof THREE === 'undefined') {
      console.warn('Three.js container or library unavailable.');
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 640;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e16);
    scene.fog = new THREE.FogExp2(0x0a0e16, 0.03);

    // Camera — focused directly on the robot's hardware core
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(5.5, 4.0, 7.2);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't flip below floor
      controls.minDistance = 2.5;
      controls.maxDistance = 18;
      controls.target.set(0, 1.8, 0); // Focus on mid-torso / Pi 5 stack
      controls.update();
    }

    // Lights
    setupLighting();

    // Floor Workbench Grid
    setupFloor();

    // Build the Robot 3D Hierarchy
    buildRobot();

    // Internal Wires
    buildWiringHarness();

    // Default to 35% Exploded Inspection View so internal layers are clearly separated on first load!
    setExplodedProgress(0.35);

    // Raycasting for interactive part clicking
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // Responsive ResizeObserver for pixel-perfect aspect ratio without any stretching
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        onWindowResize();
      });
      ro.observe(container);
    }
    window.addEventListener('resize', onWindowResize);
    setTimeout(onWindowResize, 100);
    setTimeout(onWindowResize, 400);

    // Bind UI buttons
    bindUIControls();

    // Start render loop
    animate();
  }

  function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(8, 14, 10);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    dirLight1.shadow.bias = -0.0002;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.45);
    dirLight2.position.set(-8, 6, -6);
    scene.add(dirLight2);

    // Workshop warm underlight
    const warmBounce = new THREE.DirectionalLight(0xf59e0b, 0.25);
    warmBounce.position.set(0, -5, 4);
    scene.add(warmBounce);
  }

  function setupFloor() {
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0e131d,
      roughness: 0.85,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.25;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle maker grid
    const grid = new THREE.GridHelper(24, 24, 0x1e293b, 0x141d2c);
    grid.position.y = -1.24;
    scene.add(grid);
  }

  function registerPart(mesh, layerKey, partId, partName) {
    mesh.userData = { layerKey, partId, partName };
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    clickableParts.push(mesh);
  }

  function buildRobot() {
    robotMasterGroup = new THREE.Group();
    scene.add(robotMasterGroup);

    // ================= 1. TREADS & CHASSIS BASE =================
    const treadGroup = new THREE.Group();
    treadGroup.userData.baseY = -0.8;
    treadGroup.userData.baseZ = 0;
    subassemblies.treads = treadGroup;
    robotMasterGroup.add(treadGroup);

    // Left & Right Red Track Housings
    [-1.3, 1.3].forEach((xSide, i) => {
      const trackHousingGeo = new THREE.BoxGeometry(0.65, 0.7, 2.6);
      const trackHousing = new THREE.Mesh(trackHousingGeo, materials.treadRed);
      trackHousing.position.set(xSide, 0, 0);
      registerPart(trackHousing, 'treads', 'treads', 'Continuous Track Housing');
      treadGroup.add(trackHousing);

      // Yellow Wheels (3 per track)
      [-0.8, 0, 0.8].forEach(zPos => {
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.72, 18);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheel = new THREE.Mesh(wheelGeo, materials.wheelYellow);
        wheel.position.set(xSide, 0, zPos);
        registerPart(wheel, 'treads', 'treads', 'Track Wheel Bogie');
        treadGroup.add(wheel);

        // Center hub cap
        const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.76, 12);
        hubGeo.rotateZ(Math.PI / 2);
        const hub = new THREE.Mesh(hubGeo, materials.chipBlack);
        hub.position.set(xSide, 0, zPos);
        treadGroup.add(hub);
      });

      // Rubber track cleats
      for (let k = -1.1; k <= 1.1; k += 0.22) {
        const cleatGeo = new THREE.BoxGeometry(0.68, 0.06, 0.08);
        const cleatTop = new THREE.Mesh(cleatGeo, materials.chipBlack);
        cleatTop.position.set(xSide, 0.36, k);
        treadGroup.add(cleatTop);

        const cleatBottom = new THREE.Mesh(cleatGeo, materials.chipBlack);
        cleatBottom.position.set(xSide, -0.36, k);
        treadGroup.add(cleatBottom);
      }
    });

    // Central Lower Belly Pan (connects treads)
    const bellyPanGeo = new THREE.BoxGeometry(2.0, 0.25, 2.1);
    const bellyPan = new THREE.Mesh(bellyPanGeo, materials.torsoBlue);
    bellyPan.position.set(0, -0.15, 0);
    registerPart(bellyPan, 'treads', 'chassis', 'Lower Belly Pan');
    treadGroup.add(bellyPan);

    // ================= 2. MOTORS & DRV8833 =================
    const motorGroup = new THREE.Group();
    motorGroup.userData.baseY = -0.45;
    motorGroup.userData.baseZ = 0;
    subassemblies.motors = motorGroup;
    robotMasterGroup.add(motorGroup);

    // Dual N20 Micro Metal Gearmotors
    [-0.75, 0.75].forEach(xSide => {
      const motorBodyGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.55, 12);
      motorBodyGeo.rotateZ(Math.PI / 2);
      const motorBody = new THREE.Mesh(motorBodyGeo, materials.brassMotor);
      motorBody.position.set(xSide * 0.7, 0, 0.2);
      registerPart(motorBody, 'motors', 'n20', 'N20 Micro Metal Gearmotor');
      motorGroup.add(motorBody);

      // Gearbox brass head
      const gearBoxGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
      const gearBox = new THREE.Mesh(gearBoxGeo, materials.brassMotor);
      gearBox.position.set(xSide * 0.95, 0, 0.2);
      motorGroup.add(gearBox);
    });

    // DRV8833 Dual H-Bridge Motor Driver
    const drvPcbGeo = new THREE.BoxGeometry(0.55, 0.05, 0.65);
    const drvPcb = new THREE.Mesh(drvPcbGeo, materials.circuitRed);
    drvPcb.position.set(0, 0.05, -0.4);
    registerPart(drvPcb, 'motors', 'drv8833', 'DRV8833 Dual H-Bridge Driver');
    motorGroup.add(drvPcb);

    const drvIcGeo = new THREE.BoxGeometry(0.25, 0.06, 0.25);
    const drvIc = new THREE.Mesh(drvIcGeo, materials.chipBlack);
    drvIc.position.set(0, 0.1, -0.4);
    motorGroup.add(drvIc);

    // ================= 3. POWER DECK (18650 Cells, BMS, Buck Converter) =================
    const powerGroup = new THREE.Group();
    powerGroup.userData.baseY = -0.15;
    powerGroup.userData.baseZ = 0;
    subassemblies.powerDeck = powerGroup;
    robotMasterGroup.add(powerGroup);

    // Dual 18650 Battery Cells (Green wrapped)
    [-0.32, 0.32].forEach(xSide => {
      const cellGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.45, 16);
      cellGeo.rotateX(Math.PI / 2);
      const cell = new THREE.Mesh(cellGeo, materials.batteryGreen);
      cell.position.set(xSide, 0.1, 0.2);
      registerPart(cell, 'powerDeck', '18650', 'Molicel P28A 18650 Cell (7.4V Pack)');
      powerGroup.add(cell);

      // Nickel terminal
      const termGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12);
      termGeo.rotateX(Math.PI / 2);
      const term = new THREE.Mesh(termGeo, materials.coolerSilver);
      term.position.set(xSide, 0.1, 0.95);
      powerGroup.add(term);
    });

    // 2S BMS Protection Board
    const bmsGeo = new THREE.BoxGeometry(0.85, 0.04, 0.35);
    const bms = new THREE.Mesh(bmsGeo, materials.circuitGreen);
    bms.position.set(0, 0.12, 1.0);
    registerPart(bms, 'powerDeck', 'bms', '2S 10A-15A Li-ion BMS Board');
    powerGroup.add(bms);

    // 5V 5A High-Efficiency Buck Converter (Calibrated 5.1V)
    const buckGeo = new THREE.BoxGeometry(0.8, 0.05, 0.5);
    const buck = new THREE.Mesh(buckGeo, materials.circuitRed);
    buck.position.set(0, 0.12, -0.6);
    registerPart(buck, 'powerDeck', 'buck', '5V 5A Step-Down Buck Converter (5.1V Output)');
    powerGroup.add(buck);

    // Toroidal inductor & blue trim pot on buck converter
    const inductorGeo = new THREE.TorusGeometry(0.1, 0.05, 8, 16);
    const inductor = new THREE.Mesh(inductorGeo, materials.coolerSilver);
    inductor.position.set(-0.2, 0.2, -0.6);
    powerGroup.add(inductor);

    const potGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const pot = new THREE.Mesh(potGeo, materials.servoBlue);
    pot.position.set(0.22, 0.2, -0.6);
    powerGroup.add(pot);

    // ================= 4. SPEAKER MODULE =================
    const speakerGroup = new THREE.Group();
    speakerGroup.userData.baseY = 0.2;
    speakerGroup.userData.baseZ = 0;
    subassemblies.speaker = speakerGroup;
    robotMasterGroup.add(speakerGroup);

    const speakerConeGeo = new THREE.CylinderGeometry(0.42, 0.3, 0.25, 20);
    speakerConeGeo.rotateX(Math.PI / 2);
    const speakerCone = new THREE.Mesh(speakerConeGeo, materials.chipBlack);
    speakerCone.position.set(0, 0.2, -0.9);
    registerPart(speakerCone, 'speaker', 'speaker', '40mm 3W Enclosed Speaker');
    speakerGroup.add(speakerCone);

    // MAX98357A I2S Mono 3W Amp Board
    const ampPcbGeo = new THREE.BoxGeometry(0.35, 0.04, 0.35);
    const ampPcb = new THREE.Mesh(ampPcbGeo, materials.circuitPurple);
    ampPcb.position.set(0.65, 0.2, -0.85);
    registerPart(ampPcb, 'speaker', 'max98357a', 'MAX98357A I2S 3W Mono Amp');
    speakerGroup.add(ampPcb);

    // ================= 5. RASPBERRY PI 5 + ACTIVE COOLER =================
    const pi5Group = new THREE.Group();
    pi5Group.userData.baseY = 0.55;
    pi5Group.userData.baseZ = 0;
    subassemblies.pi5Deck = pi5Group;
    robotMasterGroup.add(pi5Group);

    // Pi 5 Deck Plate
    const deckGeo = new THREE.BoxGeometry(1.9, 0.08, 2.0);
    const deckPlate = new THREE.Mesh(deckGeo, materials.chipBlack);
    deckPlate.position.set(0, 0, 0);
    pi5Group.add(deckPlate);

    // Pi 5 Main PCB (Green)
    const piPcbGeo = new THREE.BoxGeometry(1.5, 0.05, 1.8);
    const piPcb = new THREE.Mesh(piPcbGeo, materials.circuitGreen);
    piPcb.position.set(0, 0.12, 0);
    registerPart(piPcb, 'pi5Deck', 'pi5', 'Raspberry Pi 5 (8GB RAM)');
    pi5Group.add(piPcb);

    // Active Cooler Heatsink (Silver Fins)
    const heatsinkGeo = new THREE.BoxGeometry(0.85, 0.16, 0.95);
    const heatsink = new THREE.Mesh(heatsinkGeo, materials.coolerSilver);
    heatsink.position.set(-0.15, 0.24, -0.15);
    registerPart(heatsink, 'pi5Deck', 'cooler', 'Raspberry Pi Active Cooler Heatsink');
    pi5Group.add(heatsink);

    // Mini Fan Shroud & Hub
    const fanHubGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16);
    const fanHub = new THREE.Mesh(fanHubGeo, materials.chipBlack);
    fanHub.position.set(-0.15, 0.28, -0.15);
    pi5Group.add(fanHub);

    // 40-Pin GPIO Header
    const gpioHeaderGeo = new THREE.BoxGeometry(0.18, 0.16, 1.1);
    const gpioHeader = new THREE.Mesh(gpioHeaderGeo, materials.chipBlack);
    gpioHeader.position.set(0.65, 0.22, 0);
    registerPart(gpioHeader, 'pi5Deck', 'gpio', 'Raspberry Pi 5 40-Pin GPIO Header');
    pi5Group.add(gpioHeader);

    // Pi 5 Ports (USB 3.0 / Ethernet)
    const portUsbGeo = new THREE.BoxGeometry(0.35, 0.24, 0.45);
    const portUsb = new THREE.Mesh(portUsbGeo, materials.coolerSilver);
    portUsb.position.set(0.3, 0.26, 0.95);
    pi5Group.add(portUsb);

    const portEthGeo = new THREE.BoxGeometry(0.38, 0.28, 0.48);
    const portEth = new THREE.Mesh(portEthGeo, materials.coolerSilver);
    portEth.position.set(-0.35, 0.28, 0.95);
    pi5Group.add(portEth);

    // MicroSD Card Slot & Card
    const sdGeo = new THREE.BoxGeometry(0.25, 0.03, 0.3);
    const sd = new THREE.Mesh(sdGeo, materials.chipBlack);
    sd.position.set(0, 0.08, -0.92);
    registerPart(sd, 'pi5Deck', 'microsd', 'MicroSD A2 / V30 Card (OS & Gemma Models)');
    pi5Group.add(sd);

    // ================= 6. UPPER TORSO & CHEST BUTTONS =================
    const torsoGroup = new THREE.Group();
    torsoGroup.userData.baseY = 1.35;
    torsoGroup.userData.baseZ = 0;
    subassemblies.torsoShell = torsoGroup;
    robotMasterGroup.add(torsoGroup);

    // Royal Blue 3D-Printed Torso Outer Shell
    const torsoShellGeo = new THREE.BoxGeometry(2.0, 1.45, 2.0);
    const torsoShell = new THREE.Mesh(torsoShellGeo, materials.torsoBlue);
    torsoShell.position.set(0, 0, 0);
    registerPart(torsoShell, 'torsoShell', 'torso', '3D-Printed Upper Torso Shell (Royal Blue PLA)');
    torsoGroup.add(torsoShell);

    // Dual Green Chest Arrow Buttons (Tactile UI)
    [-0.38, 0.38].forEach((xSide, idx) => {
      const btnBezelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
      btnBezelGeo.rotateX(Math.PI / 2);
      const btnBezel = new THREE.Mesh(btnBezelGeo, materials.chipBlack);
      btnBezel.position.set(xSide, 0.05, 1.02);
      torsoGroup.add(btnBezel);

      const btnFaceGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.12, 16);
      btnFaceGeo.rotateX(Math.PI / 2);
      const btnFace = new THREE.Mesh(btnFaceGeo, materials.chestGreen);
      btnFace.position.set(xSide, 0.05, 1.05);
      registerPart(btnFace, 'torsoShell', 'buttons', `Tactile Chest Button ${idx === 0 ? 'Left (<)' : 'Right (>)'}`);
      torsoGroup.add(btnFace);
    });

    // Front Microphone Acoustic Slot & INMP441 Board
    const micSlotGeo = new THREE.BoxGeometry(0.25, 0.08, 0.1);
    const micSlot = new THREE.Mesh(micSlotGeo, materials.chipBlack);
    micSlot.position.set(0, -0.4, 1.01);
    torsoGroup.add(micSlot);

    const inmpPcbGeo = new THREE.BoxGeometry(0.3, 0.3, 0.04);
    const inmpPcb = new THREE.Mesh(inmpPcbGeo, materials.circuitPurple);
    inmpPcb.position.set(0, -0.4, 0.88);
    registerPart(inmpPcb, 'torsoShell', 'inmp441', 'INMP441 I2S MEMS Microphone');
    torsoGroup.add(inmpPcb);

    // Internal MPU6050 6-DOF IMU Board
    const imuPcbGeo = new THREE.BoxGeometry(0.4, 0.04, 0.45);
    const imuPcb = new THREE.Mesh(imuPcbGeo, materials.circuitBlue);
    imuPcb.position.set(-0.55, -0.2, 0);
    registerPart(imuPcb, 'torsoShell', 'mpu6050', 'MPU6050 6-DOF IMU Sensor');
    torsoGroup.add(imuPcb);

    // ================= 7. NECK SERVO & CAMERA MOUNT =================
    const neckGroup = new THREE.Group();
    neckGroup.userData.baseY = 2.25;
    neckGroup.userData.baseZ = 0;
    subassemblies.neckServo = neckGroup;
    robotMasterGroup.add(neckGroup);

    // SG90 Micro Servo (Blue Body)
    const servoGeo = new THREE.BoxGeometry(0.38, 0.65, 0.65);
    const servoMesh = new THREE.Mesh(servoGeo, materials.servoBlue);
    servoMesh.position.set(0, 0, 0);
    registerPart(servoMesh, 'neckServo', 'sg90', 'SG90 9g Analog Micro Servo (Neck Actuator)');
    neckGroup.add(servoMesh);

    // Servo Output Gear / White Horn
    const hornGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 14);
    const hornMesh = new THREE.Mesh(hornGeo, materials.coolerSilver);
    hornMesh.position.set(0, 0.38, 0.12);
    neckGroup.add(hornMesh);

    // ================= 8. CAMERA MODULE 3 & 22-PIN CSI CABLE =================
    const camGroup = new THREE.Group();
    camGroup.userData.baseY = 2.65;
    camGroup.userData.baseZ = 0.25;
    subassemblies.cameraMount = camGroup;
    robotMasterGroup.add(camGroup);

    // Camera PCB (Green)
    const camPcbGeo = new THREE.BoxGeometry(0.55, 0.55, 0.06);
    const camPcb = new THREE.Mesh(camPcbGeo, materials.circuitGreen);
    camPcb.position.set(0, 0.1, 0.2);
    registerPart(camPcb, 'cameraMount', 'camera', 'Pi Camera Module 3 (Wide 120° FOV)');
    camGroup.add(camPcb);

    // Camera Lens
    const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 16);
    lensGeo.rotateX(Math.PI / 2);
    const lens = new THREE.Mesh(lensGeo, materials.chipBlack);
    lens.position.set(0, 0.1, 0.28);
    camGroup.add(lens);

    // Mini 22-Pin CSI Ribbon Cable (White flat cable)
    const ribbonGeo = new THREE.BoxGeometry(0.35, 0.8, 0.015);
    const ribbon = new THREE.Mesh(ribbonGeo, materials.coolerSilver);
    ribbon.position.set(0, -0.4, 0.18);
    registerPart(ribbon, 'cameraMount', 'csi-cable', '22-Pin Mini Pi 5 CSI Ribbon Cable');
    camGroup.add(ribbon);

    // ================= 9. HEAD BASE & DUAL 10mm DIFFUSED RED LED EYES =================
    const headGroup = new THREE.Group();
    headGroup.userData.baseY = 2.95;
    headGroup.userData.baseZ = 0;
    subassemblies.headEyes = headGroup;
    robotMasterGroup.add(headGroup);

    // Head Base Disc (Mounted to servo horn)
    const headBaseGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.12, 24);
    const headBase = new THREE.Mesh(headBaseGeo, materials.torsoBlue);
    headBase.position.set(0, 0, 0);
    registerPart(headBase, 'headEyes', 'headBase', 'Head Base Plate (Servo Mounted)');
    headGroup.add(headBase);

    // Eye Goggle Bracket (Vintage retro cylinders)
    const goggleBridgeGeo = new THREE.BoxGeometry(0.85, 0.28, 0.22);
    const goggleBridge = new THREE.Mesh(goggleBridgeGeo, materials.chipBlack);
    goggleBridge.position.set(0, 0.28, 0.05);
    headGroup.add(goggleBridge);

    // Dual 10mm Diffused Red LEDs
    eyeLights = [];
    [-0.38, 0.38].forEach((xSide, idx) => {
      // Chrome socket collar
      const collarGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 18);
      collarGeo.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeo, materials.coolerSilver);
      collar.position.set(xSide, 0.28, 0.05);
      headGroup.add(collar);

      // Diffused red LED bulb
      const ledGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const ledMesh = new THREE.Mesh(ledGeo, materials.ledEyeActive);
      ledMesh.position.set(xSide, 0.28, 0.26);
      registerPart(ledMesh, 'headEyes', 'leds', `10mm Diffused Red LED Eye (${idx === 0 ? 'Left' : 'Right'})`);
      headGroup.add(ledMesh);

      // Emissive PointLight for authentic toy robot eye glow
      const eyeLight = new THREE.PointLight(0xff2222, 1.8, 2.5);
      eyeLight.position.set(xSide, 0.28, 0.35);
      headGroup.add(eyeLight);
      eyeLights.push({ mesh: ledMesh, light: eyeLight });
    });

    // ================= 10. 80mm CLEAR ACRYLIC DOME CANOPY =================
    const domeGroup = new THREE.Group();
    domeGroup.userData.baseY = 3.35;
    domeGroup.userData.baseZ = 0;
    subassemblies.acrylicDome = domeGroup;
    robotMasterGroup.add(domeGroup);

    // Half Sphere Clear Dome (Phi/Theta cut to half-dome)
    const domeGeo = new THREE.SphereGeometry(1.05, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, materials.domeClear);
    domeMesh.position.set(0, 0, 0);
    registerPart(domeMesh, 'acrylicDome', 'dome', '80mm Clear Acrylic Bubble Dome Canopy');
    domeGroup.add(domeMesh);

    // Dome bottom locking rim
    const rimGeo = new THREE.CylinderGeometry(1.06, 1.06, 0.1, 32);
    const rimMesh = new THREE.Mesh(rimGeo, materials.coolerSilver);
    rimMesh.position.set(0, 0, 0);
    domeGroup.add(rimMesh);
  }

  function buildWiringHarness() {
    wireGroup = new THREE.Group();
    wireGroup.visible = false;
    robotMasterGroup.add(wireGroup);

    const wireSpecs = [
      // 5.1V Regulated Bus (Red) - Buck to Pi 5 Pin 2
      { color: 0xef4444, pts: [new THREE.Vector3(0.2, 0.15, -0.6), new THREE.Vector3(0.5, 0.3, -0.3), new THREE.Vector3(0.65, 0.8, 0)] },
      // Common Ground Bus (Black) - Buck GND to Pi 5 Pin 6
      { color: 0x1e293b, pts: [new THREE.Vector3(-0.2, 0.15, -0.6), new THREE.Vector3(0.3, 0.3, -0.2), new THREE.Vector3(0.65, 0.8, 0.15)] },
      // Raw 7.4V to DRV8833 VM Pin (Red/Yellow)
      { color: 0xf59e0b, pts: [new THREE.Vector3(0, 0.1, 0.95), new THREE.Vector3(0, -0.2, 0.2), new THREE.Vector3(0, -0.35, -0.3)] },
      // SG90 Servo PWM Signal (Orange) - Pi Pin 12 to Servo
      { color: 0xf97316, pts: [new THREE.Vector3(0.65, 0.8, 0.3), new THREE.Vector3(0.4, 1.5, 0.2), new THREE.Vector3(0.1, 2.2, 0.1)] },
      // I2S Bus to INMP441 & Amp (Purple)
      { color: 0xa855f7, pts: [new THREE.Vector3(0.65, 0.8, -0.3), new THREE.Vector3(0.2, 1.0, 0.4), new THREE.Vector3(0, 0.95, 0.85)] },
      // I2C Bus to MPU6050 (Blue)
      { color: 0x38bdf8, pts: [new THREE.Vector3(0.65, 0.8, -0.1), new THREE.Vector3(-0.2, 1.1, 0.1), new THREE.Vector3(-0.5, 1.15, 0)] },
      // LED Eyes (Red Wire) - Pi Pin 11 to Resistor to Eyes
      { color: 0xdc2626, pts: [new THREE.Vector3(0.65, 0.8, 0.2), new THREE.Vector3(0.3, 2.0, 0.1), new THREE.Vector3(0, 3.2, 0.2)] }
    ];

    wireSpecs.forEach(spec => {
      const curve = new THREE.CatmullRomCurve3(spec.pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.022, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.3,
        metalness: 0.1
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      wireGroup.add(tube);
    });
  }

  function setExplodedProgress(val) {
    explodedProgress = Math.max(0, Math.min(1, val));

    // Update each layer's position based on explodedProgress
    for (const [key, group] of Object.entries(subassemblies)) {
      if (!group) continue;
      const offset = LAYER_OFFSETS[key];
      if (!offset) continue;

      const targetY = group.userData.baseY + offset.y * explodedProgress;
      const targetZ = group.userData.baseZ + offset.z * explodedProgress;

      group.position.y = targetY;
      group.position.z = targetZ;
    }

    // Hide or dim wires during high explode to avoid visual clutter
    if (wireGroup) {
      wireGroup.position.y = explodedProgress * 0.5;
    }
  }

  function setShellMode(mode) {
    shellMode = mode;
    const torsoMesh = materials.torsoBlue;

    if (mode === 'transparent') {
      torsoMesh.transparent = true;
      torsoMesh.opacity = 0.28;
      torsoMesh.wireframe = false;
    } else if (mode === 'wireframe') {
      torsoMesh.transparent = true;
      torsoMesh.opacity = 0.8;
      torsoMesh.wireframe = true;
    } else {
      torsoMesh.transparent = false;
      torsoMesh.opacity = 1.0;
      torsoMesh.wireframe = false;
    }
  }

  function setWiresVisible(visible) {
    showWires = visible;
    if (wireGroup) {
      wireGroup.visible = showWires;
    }
  }

  function setRobotBehavioralState(state) {
    const isAlive = state === 'alive';

    // 1. Eyes LED & Light Glow
    eyeLights.forEach(item => {
      if (isAlive) {
        item.mesh.material = materials.ledEyeActive;
        item.light.intensity = 1.8;
      } else {
        item.mesh.material = materials.ledEyeDead;
        item.light.intensity = 0.0;
      }
    });

    // 2. Neck Limp Drop
    if (subassemblies.headEyes && subassemblies.neckServo) {
      if (isAlive) {
        targetHeadAngle = 0;
        subassemblies.headEyes.rotation.x = 0;
        subassemblies.headEyes.rotation.z = 0;
      } else {
        // Limp drop forward and slightly sideways (plastic flop)
        targetHeadAngle = 0.65; // ~37 degrees forward
        subassemblies.headEyes.rotation.x = 0.72;
        subassemblies.headEyes.rotation.z = 0.18;
      }
    }

    // Update HUD
    const hudState = document.getElementById('hudState');
    const hudPwm = document.getElementById('hudPwm');
    const hudLeds = document.getElementById('hudLeds');
    const hudTorque = document.getElementById('hudTorque');

    if (hudState) hudState.textContent = isAlive ? 'ALIVE' : 'PLAY DEAD (LIMP)';
    if (hudPwm) hudPwm.textContent = isAlive ? '7.5% (Center 50Hz)' : '0% (TORQUE CUT)';
    if (hudLeds) hudLeds.textContent = isAlive ? 'ON (DIFFUSED RED)' : 'OFF (0V SILENT)';
    if (hudTorque) hudTorque.textContent = isAlive ? '1.8 kg·cm ACTIVE' : '0.0 kg·cm (GRAVITY DROP)';
  }

  function setCameraPreset(preset) {
    if (!camera || !controls) return;
    switch (preset) {
      case 'front':
        camera.position.set(0, 2.2, 7.6);
        controls.target.set(0, 1.8, 0);
        break;
      case 'side':
        camera.position.set(7.6, 2.2, 0);
        controls.target.set(0, 1.8, 0);
        break;
      case 'top':
        camera.position.set(0, 9.5, 0.1);
        controls.target.set(0, 1.0, 0);
        break;
      case 'iso':
      case 'reset':
      default:
        camera.position.set(5.5, 4.0, 7.2);
        controls.target.set(0, 1.8, 0);
        break;
    }
    controls.update();
  }

  function onPointerMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onPointerDown(event) {
    onPointerMove(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableParts, true);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const data = clickedMesh.userData;
      if (data && data.partName) {
        highlightPart(data.partId, data.layerKey, data.partName);
      }
    }
  }

  function highlightPart(partId, layerKey, partName) {
    // Flash inspect card
    if (window.inspectComponentById) {
      window.inspectComponentById(partId, layerKey);
    }
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || 800;
    const height = rect.height || container.clientHeight || 640;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, true);
  }

  function bindUIControls() {
    // Exploded Slider
    const slider = document.getElementById('explodedSlider');
    const valText = document.getElementById('explodedValueText');
    if (slider) {
      slider.value = 35;
      if (valText) valText.textContent = '35% (Inspection Mode)';
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        setExplodedProgress(val / 100);
        if (valText) {
          if (val === 0) valText.textContent = '0% (Assembled)';
          else if (val === 100) valText.textContent = '100% (Fully Exploded)';
          else valText.textContent = `${Math.round(val)}% (Expanded Stack)`;
        }
        document.querySelectorAll('.exploded-quick-presets .pill-btn').forEach(b => {
          b.classList.toggle('active', b.textContent.includes(Math.round(val) + '%'));
        });
      });
    }

    // Shell Toggle
    const btnShell = document.getElementById('btnToggleShell');
    if (btnShell) {
      btnShell.addEventListener('click', () => {
        if (shellMode === 'solid') {
          setShellMode('transparent');
          btnShell.innerHTML = '<span class="icon">&#9634;</span> Shell: Transparent';
        } else if (shellMode === 'transparent') {
          setShellMode('wireframe');
          btnShell.innerHTML = '<span class="icon">&#9634;</span> Shell: Wireframe';
        } else {
          setShellMode('solid');
          btnShell.innerHTML = '<span class="icon">&#9634;</span> Shell: Solid';
        }
      });
    }

    // Wires Toggle
    const btnWires = document.getElementById('btnToggleWires');
    if (btnWires) {
      btnWires.addEventListener('click', () => {
        showWires = !showWires;
        setWiresVisible(showWires);
        btnWires.innerHTML = `<span class="icon">&#8660;</span> Wires: ${showWires ? 'Visible' : 'Hidden'}`;
        btnWires.classList.toggle('active', showWires);
      });
    }

    // Auto Rotate
    const btnSpin = document.getElementById('btnToggleSpin');
    if (btnSpin) {
      btnSpin.addEventListener('click', () => {
        isSpinning = !isSpinning;
        btnSpin.classList.toggle('active', isSpinning);
      });
    }

    // Camera preset buttons
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setCameraPreset(btn.dataset.cam);
      });
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    if (controls) controls.update();

    // Auto rotation if active
    if (isSpinning && robotMasterGroup) {
      robotMasterGroup.rotation.y += 0.008;
    }

    // Alive subtle idle head scanning
    if (window.robotApp && window.robotApp.currentState === 'alive' && subassemblies.headEyes) {
      const time = Date.now() * 0.0015;
      subassemblies.headEyes.rotation.y = Math.sin(time) * 0.35;
    }

    renderer.render(scene, camera);
  }

  // Global helper for quick presets
  window.setExplodedView = function (percent) {
    const slider = document.getElementById('explodedSlider');
    const valText = document.getElementById('explodedValueText');
    if (slider) slider.value = percent;
    setExplodedProgress(percent / 100);
    if (valText) {
      if (percent === 0) valText.textContent = '0% (Assembled)';
      else if (percent === 100) valText.textContent = '100% (Fully Exploded)';
      else valText.textContent = `${percent}% (Expanded Stack)`;
    }
    document.querySelectorAll('.exploded-quick-presets .pill-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.includes(percent + '%'));
    });
  };

  // Expose to window for external coordination
  window.robot3d = {
    init,
    setExplodedProgress,
    setShellMode,
    setWiresVisible,
    setRobotBehavioralState,
    setCameraPreset,
    materials
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
