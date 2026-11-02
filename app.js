/* =========================================================
   DJI AIR 3S — INTERACTIVE TEARDOWN LAB
   Procedural Three.js model + interaction system
   ========================================================= */

(function () {
  "use strict";

  if (!window.THREE) {
    const status = document.getElementById("introStatus");
    if (status) status.textContent = "Three.js 加载失败";
    return;
  }

  /* ---------------------------------------------------------
     Data
     --------------------------------------------------------- */

  const PARTS = [
    {
      id: "gimbal",
      num: "01",
      name: "双摄云台",
      en: "DUAL-CAMERA GIMBAL",
      category: "影像系统",
      labelSpec: "50MP 双摄 · 4K/60 HDR",
      labelOffset: { x: 158, y: 104 },
      desc: "双摄云台集成 <strong>1 英寸 CMOS 广角主摄</strong>与 <strong>1/1.3 英寸中长焦镜头</strong>，由三轴机械增稳机构承载。广角与 70 mm 中长焦协同，覆盖从风光到特写的完整焦段。",
      channels: ["1\" CMOS", "70 mm 中长焦", "三轴增稳", "4K/60 HDR"],
      specs: [
        ["广角传感器", "1 英寸 CMOS"],
        ["广角等效焦距", "24 mm"],
        ["广角光圈", "f/1.8"],
        ["中长焦传感器", "1/1.3 英寸 CMOS"],
        ["中长焦等效焦距", "70 mm"],
        ["中长焦光圈", "f/2.8"],
        ["照片像素", "50 MP + 48 MP"],
        ["最大视频规格", "4K / 60fps HDR"],
      ],
      explode: { x: 0, y: -1.0, z: 0.34 },
    },
    {
      id: "vision",
      num: "02",
      name: "全向视觉系统",
      en: "OMNIDIRECTIONAL VISION & LiDAR",
      category: "感知系统",
      labelSpec: "前向 LiDAR · 六向视觉",
      labelOffset: { x: -150, y: 104 },
      desc: "前向 <strong>激光雷达</strong>与全向双目视觉融合，在低光环境下仍可构建可靠的空间感知。下视补光灯与多路传感器共同完成精准悬停、避障与返航。",
      channels: ["前向 LiDAR", "全向双目", "夜景避障", "下视补光"],
      specs: [
        ["前向感知", "LiDAR + 双目视觉"],
        ["感知范围", "0.5 – 18 m"],
        ["全向视觉", "六向双目感知"],
        ["辅助照明", "下视补光灯"],
        ["夜景避障", "支持"],
        ["起降辅助", "精准降落"],
      ],
      explode: { x: 0, y: -0.24, z: 1.28 },
    },
    {
      id: "battery",
      num: "03",
      name: "智能飞行电池",
      en: "INTELLIGENT FLIGHT BATTERY",
      category: "能源系统",
      labelSpec: "4276 mAh · 45 min",
      labelOffset: { x: 150, y: -104 },
      desc: "4S 锂离子智能电池，容量 <strong>4276 mAh / 64.96 Wh</strong>。内置电芯均衡与自放电保护，为双摄云台、图传与全向感知提供最长 45 分钟续航。",
      channels: ["4276 mAh", "64.96 Wh", "4S Li-ion", "45 分钟"],
      specs: [
        ["电池容量", "4276 mAh"],
        ["电池能量", "64.96 Wh"],
        ["标称电压", "14.76 V"],
        ["电池架构", "4S Li-ion"],
        ["最长飞行时间", "45 分钟"],
        ["充电方式", "支持 PD 快充"],
        ["智能管理", "自放电 / 电芯均衡"],
        ["安装方式", "顶部快拆锁扣"],
      ],
      explode: { x: 0, y: 1.58, z: -0.13 },
    },
    {
      id: "core",
      num: "04",
      name: "航电与图传核心",
      en: "FLIGHT CONTROLLER & O4 CORE",
      category: "航电系统",
      labelSpec: "O4 图传 · 42 GB 存储",
      labelOffset: { x: -145, y: -116 },
      desc: "飞控、电子调速与 <strong>O4 高清图传</strong>高度集成于机身核心。内置 42 GB 存储与双频天线系统，可传输 1080p / 60fps 实时画面。",
      channels: ["O4 图传", "20 km FCC", "42 GB", "2T4R"],
      specs: [
        ["图传系统", "O4"],
        ["最远图传距离", "20 km (FCC)"],
        ["内置存储", "42 GB"],
        ["天线架构", "2T4R 双频"],
        ["实时画面", "1080p / 60fps"],
        ["卫星定位", "GPS + Galileo + BeiDou"],
        ["飞控冗余", "双 IMU / 双气压计"],
        ["机内总线", "高速 CAN / UART"],
      ],
      explode: { x: 0, y: 1.0, z: -0.03 },
    },
    {
      id: "frontArms",
      num: "05",
      name: "前机臂总成",
      en: "FORWARD FOLDING ARMS",
      category: "结构系统",
      labelSpec: "折叠式 · 集成 O4 天线",
      labelOffset: { x: -172, y: 12 },
      desc: "前机臂采用折叠式结构，内部集成 <strong>O4 双频天线</strong>与减振走线。机臂展开后由机械锁扣固定，为前向电机提供稳定的动力基座。",
      channels: ["折叠结构", "O4 天线", "机械锁扣", "复合材质"],
      specs: [
        ["结构形式", "折叠式前机臂"],
        ["集成天线", "O4 双频"],
        ["主体材质", "高强度复合材料"],
        ["锁止方式", "机械折叠锁扣"],
        ["维护方式", "模块化拆装"],
      ],
      explode: null,
    },
    {
      id: "rearArms",
      num: "06",
      name: "后机臂总成",
      en: "REAR FOLDING ARMS",
      category: "结构系统",
      labelSpec: "折叠锁止 · 复合材料",
      labelOffset: { x: 172, y: 16 },
      desc: "后机臂与前机臂形成对称的升力布局，折叠后可显著缩小收纳体积。高强度复合材料兼顾刚度与重量，在高速机动中抑制机臂形变。",
      channels: ["后向折叠", "轻量化", "高刚度", "模块化"],
      specs: [
        ["结构形式", "折叠式后机臂"],
        ["主体材质", "高强度复合材料"],
        ["锁止方式", "机械折叠锁扣"],
        ["展开状态", "对称升力布局"],
        ["维护方式", "模块化拆装"],
      ],
      explode: null,
    },
    {
      id: "motors",
      num: "07",
      name: "无刷电机",
      en: "BRUSHLESS MOTOR × 4",
      category: "动力系统",
      labelSpec: "无刷驱动 ×4 · FOC 电调",
      labelOffset: { x: 158, y: -48 },
      desc: "四枚高功率密度无刷电机配合 FOC 电子调速器，提供敏捷的推力响应。电机外壳与桨座一体化设计，兼顾散热、动平衡与快速维护。",
      channels: ["无刷 ×4", "FOC 电调", "高推力", "动平衡"],
      specs: [
        ["电机配置", "4 × 无刷直流"],
        ["驱动方式", "FOC 电子调速"],
        ["最大上升速度", "10 m/s"],
        ["最大下降速度", "10 m/s"],
        ["桨座", "快拆式桨座"],
        ["散热", "铝合金导热结构"],
      ],
      explode: null,
    },
    {
      id: "props",
      num: "08",
      name: "低噪螺旋桨",
      en: "LOW-NOISE PROPELLERS",
      category: "动力系统",
      labelSpec: "三叶桨 ×4 · 低噪设计",
      labelOffset: { x: -160, y: -72 },
      desc: "低噪三叶螺旋桨经过空气动力学优化，降低高频噪声并提升气动效率。对角桨叶同向、相邻反向旋转，抵消反扭矩并保持机体稳定。",
      channels: ["三叶桨", "低噪翼型", "快拆", "复合纤维"],
      specs: [
        ["数量", "4 组 × 3 叶"],
        ["桨叶类型", "低噪快拆桨"],
        ["旋转方向", "对角同向 / 相邻反向"],
        ["材质", "轻质复合纤维"],
        ["更换方式", "快拆桨座"],
      ],
      explode: null,
    },
    {
      id: "body",
      num: "09",
      name: "轻量化机身",
      en: "LIGHTWEIGHT AIRFRAME",
      category: "结构系统",
      base: true,
      labelSpec: "724 g · 折叠机身",
      labelOffset: { x: -150, y: 46 },
      desc: "机身以空气动力学轮廓包裹电池舱、航电核心与云台接口，整机重量仅 <strong>724 g</strong>。折叠后体积紧凑，展开后形成稳定的四旋翼力系。",
      channels: ["724 g", "折叠机身", "复合结构", "空气动力学"],
      specs: [
        ["起飞重量", "724 g"],
        ["折叠尺寸", "214.7 × 106.2 × 88.4 mm"],
        ["展开尺寸", "325.8 × 258.8 × 106.2 mm"],
        ["机身材料", "轻量化复合材料"],
        ["最大抗风速度", "12 m/s"],
        ["工作温度", "-10°C 至 40°C"],
      ],
      explode: null,
    },
  ];

  const PART_MAP = Object.fromEntries(PARTS.map((part) => [part.id, part]));
  const SEPARABLE_PARTS = PARTS.filter((part) => !part.base);

  /* ---------------------------------------------------------
     DOM
     --------------------------------------------------------- */

  const dom = {
    viewport: document.getElementById("viewport"),
    canvasHost: document.getElementById("canvasHost"),
    labelLayer: document.getElementById("labelLayer"),
    leaderLayer: document.getElementById("leaderLayer"),
    hoverTag: document.getElementById("hoverTag"),
    hoverTagName: document.getElementById("hoverTagName"),
    reticle: document.getElementById("reticle"),
    componentList: document.getElementById("componentList"),
    progressRing: document.getElementById("progressRing"),
    progressValue: document.getElementById("progressValue"),
    separationLabel: document.getElementById("separationLabel"),
    separationReadout: document.getElementById("separationReadout"),
    detailPanel: document.getElementById("detailPanel"),
    detailIndex: document.getElementById("detailIndex"),
    detailContent: document.getElementById("detailContent"),
    detailClose: document.getElementById("detailClose"),
    inventoryPanel: document.getElementById("inventoryPanel"),
    inventoryToggle: document.getElementById("inventoryToggle"),
    inventoryClose: document.getElementById("inventoryClose"),
    explodeAllBtn: document.getElementById("explodeAllBtn"),
    resetBtn: document.getElementById("resetBtn"),
    autoRotateBtn: document.getElementById("autoRotateBtn"),
    viewResetBtn: document.getElementById("viewResetBtn"),
    orbitReadout: document.getElementById("orbitReadout"),
    zoomReadout: document.getElementById("zoomReadout"),
    intro: document.getElementById("intro"),
    introBar: document.getElementById("introBar"),
    introPercent: document.getElementById("introPercent"),
    introStatus: document.getElementById("introStatus"),
  };

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    selected: null,
    hovered: null,
    allExploded: false,
    autoRotate: !reduceMotion,
    dragging: false,
    pinching: false,
    moved: 0,
    introDone: false,
    introStart: performance.now(),
    revealStart: 0,
    reveal: 0,
    viewFit: 0,
    safeArea: null,
    pointer: { x: 0, y: 0 },
    target: {},
    progress: {},
    velocity: {},
  };

  PARTS.forEach((part) => {
    state.target[part.id] = false;
    state.progress[part.id] = 0;
    state.velocity[part.id] = 0;
  });

  const sceneParts = {};
  PARTS.forEach((part) => {
    sceneParts[part.id] = {
      movables: [],
      outlines: [],
      anchor: null,
      roots: [],
      label: null,
      leader: null,
    };
  });

  const labelCache = {};
  const spinners = [];
  const spinDiscs = [];
  const pointerMap = new Map();

  let pinchStartDistance = 0;
  let pinchStartRadius = 0;
  let radicleSeed = 0x1a2b3c4d;
  let hoverFrame = 0;

  /* ---------------------------------------------------------
     Three.js core
     --------------------------------------------------------- */

  let renderer;
  let scene;
  let camera;
  let droneGroup;
  let particleField;
  let particleFieldTwo;
  let floorMaterial;
  let platformRingGroup;
  let keyLight;
  let pmremGenerator;
  let selectionHalo;
  let selectionLight;

  const haloScales = {
    gimbal: 1.15,
    vision: 1.02,
    battery: 2.15,
    core: 1.35,
    frontArms: 1.8,
    rearArms: 1.8,
    motors: 1.1,
    props: 1.55,
    body: 2.7,
  };

  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

  const cameraRig = {
    az: 0.6,
    polar: 1.205,
    radius: 9.72,
    tAz: 0.6,
    tPolar: 1.205,
    tRadius: 9.72,
    target: new THREE.Vector3(0, -0.02, 0),
    homeAz: 0.6,
    homePolar: 1.205,
    homeRadius: 9.72,
  };

  const env = {
    backgroundTop: new THREE.Color("#05090d"),
  };

  const tempVec = new THREE.Vector3();
  const tempVec2 = new THREE.Vector3();

  const outlineMaterials = {
    hover: new THREE.MeshBasicMaterial({
      color: 0xa9f4ff,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    selected: new THREE.MeshBasicMaterial({
      color: 0x60e9ff,
      transparent: true,
      opacity: 0.82,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  };

  const materials = {};

  /* ---------------------------------------------------------
     Utilities
     --------------------------------------------------------- */

  function random() {
    radicleSeed = (radicleSeed * 1664525 + 1013904223) >>> 0;
    return radicleSeed / 4294967296;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothstep(min, max, value) {
    const x = clamp((value - min) / (max - min), 0, 1);
    return x * x * (3 - 2 * x);
  }

  function makeRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    const w = Math.max(0.001, width);
    const h = Math.max(0.001, height);
    const r = clamp(radius, 0.001, Math.min(w, h) / 2);
    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }

  function roundedBoxGeometry(width, height, depth, radius = 0.06) {
    const r = clamp(radius, 0.001, Math.min(width, height, depth) / 2 - 0.0005);
    const innerW = Math.max(0.001, width - r * 2);
    const innerH = Math.max(0.001, height - r * 2);
    const shape = makeRoundedRectShape(innerW, innerH, Math.max(0.001, r * 0.62));
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.001, depth - r * 2),
      bevelEnabled: true,
      bevelThickness: r,
      bevelSize: r,
      bevelSegments: 4,
      curveSegments: 10,
      steps: 1,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  }

  function loftGeometry(sections, radialSegments = 56, exponent = 3.0, capped = true) {
    const vertices = [];
    const uvs = [];
    const indices = [];
    const n = Math.max(3, radialSegments);

    sections.forEach((section, sIndex) => {
      for (let i = 0; i < n; i += 1) {
        const angle = (i / n) * Math.PI * 2;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const sx = Math.sign(c) * Math.pow(Math.abs(c), 2 / exponent);
        const sy = Math.sign(s) * Math.pow(Math.abs(s), 2 / exponent);
        vertices.push(section.w * sx, section.y + section.h * sy, section.z);
        uvs.push(i / n, sIndex / (sections.length - 1));
      }
    });

    for (let s = 0; s < sections.length - 1; s += 1) {
      for (let i = 0; i < n; i += 1) {
        const next = (i + 1) % n;
        const a = s * n + i;
        const b = (s + 1) * n + i;
        const c = (s + 1) * n + next;
        const d = s * n + next;
        indices.push(a, d, b);
        indices.push(d, c, b);
      }
    }

    if (capped) {
      const firstSection = sections[0];
      const lastSection = sections[sections.length - 1];

      const firstCenter = vertices.length / 3;
      vertices.push(0, firstSection.y, firstSection.z);
      uvs.push(0.5, 0.5);
      for (let i = 0; i < n; i += 1) {
        const next = (i + 1) % n;
        indices.push(firstCenter, next, i);
      }

      const lastCenter = vertices.length / 3;
      vertices.push(0, lastSection.y, lastSection.z);
      uvs.push(0.5, 0.5);
      const offset = (sections.length - 1) * n;
      for (let i = 0; i < n; i += 1) {
        const next = (i + 1) % n;
        indices.push(lastCenter, offset + i, offset + next);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function createRadialTexture(inner, outer, size = 128) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(0.45, inner);
    gradient.addColorStop(1, outer);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function makeTextTexture(text, options = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = options.width || 512;
    canvas.height = options.height || 128;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fontSize = options.fontSize || 82;
    const weight = options.weight || 600;
    const family = options.family || '"Bahnschrift", "Arial Narrow", Arial, sans-serif';
    ctx.font = `${weight} ${fontSize}px ${family}`;
    ctx.fillStyle = options.color || "rgba(235, 247, 250, 0.8)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + (options.offsetY || 0));
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
    return texture;
  }

  function makeTextPlane(text, options = {}) {
    const texture = makeTextTexture(text, options);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: options.opacity === undefined ? 0.8 : options.opacity,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(options.planeWidth || 0.48, options.planeHeight || 0.12), material);
  }

  function setVertexTint(geometry, topColor, bottomColor) {
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const top = new THREE.Color(topColor);
    const bottom = new THREE.Color(bottomColor);
    const mixed = new THREE.Color();
    const minY = -0.35;
    const maxY = 0.38;

    for (let i = 0; i < position.count; i += 1) {
      const y = position.getY(i);
      const t = smoothstep(minY, maxY, y);
      mixed.copy(bottom).lerp(top, t);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }

  function makePartRoot(id, parent = droneGroup) {
    const group = new THREE.Group();
    group.userData.partId = id;
    parent.add(group);
    sceneParts[id].roots.push(group);
    return group;
  }

  function setPartAnchor(id, object) {
    sceneParts[id].anchor = object;
  }

  function addOutline(mesh, partId) {
    if (!partId) return;
    const outline = new THREE.Mesh(mesh.geometry, outlineMaterials.hover);
    outline.scale.setScalar(1.034);
    outline.userData.noPick = true;
    outline.visible = false;
    outline.castShadow = false;
    outline.receiveShadow = false;
    outline.renderOrder = 3;
    outline.raycast = function () {};
    mesh.add(outline);
    sceneParts[partId].outlines.push({ mesh: outline, baseScale: 1.034 });
  }

  function addMesh(parent, geometry, material, partId, options = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = options.castShadow !== false;
    mesh.receiveShadow = options.receiveShadow !== false;
    parent.add(mesh);
    if (options.outline !== false && partId) addOutline(mesh, partId);
    return mesh;
  }

  function addMovable(partId, object, offset, rotOffset) {
    const movable = {
      object,
      basePos: object.position.clone(),
      baseRot: object.rotation.clone(),
      offset: new THREE.Vector3(offset.x || 0, offset.y || 0, offset.z || 0),
      rotOffset: new THREE.Vector3(
        rotOffset ? rotOffset.x || 0 : 0,
        rotOffset ? rotOffset.y || 0 : 0,
        rotOffset ? rotOffset.z || 0 : 0
      ),
    };
    sceneParts[partId].movables.push(movable);
    return movable;
  }

  /* ---------------------------------------------------------
     Materials
     --------------------------------------------------------- */

  function makeMaterials() {
    materials.body = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      color: 0xffffff,
      metalness: 0.16,
      roughness: 0.59,
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
      envMapIntensity: 0.52,
    });

    materials.bodyDark = new THREE.MeshPhysicalMaterial({
      color: 0x111519,
      metalness: 0.38,
      roughness: 0.52,
      clearcoat: 0.2,
      clearcoatRoughness: 0.42,
      envMapIntensity: 0.7,
    });

    materials.silver = new THREE.MeshPhysicalMaterial({
      color: 0x939ba2,
      metalness: 0.78,
      roughness: 0.3,
      clearcoat: 0.42,
      clearcoatRoughness: 0.28,
      envMapIntensity: 1.15,
    });

    materials.arm = new THREE.MeshPhysicalMaterial({
      color: 0x51575d,
      metalness: 0.22,
      roughness: 0.59,
      clearcoat: 0.12,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.58,
    });

    materials.armDark = new THREE.MeshPhysicalMaterial({
      color: 0x1c2227,
      metalness: 0.48,
      roughness: 0.48,
      envMapIntensity: 0.82,
    });

    materials.battery = new THREE.MeshPhysicalMaterial({
      color: 0x555a5f,
      metalness: 0.14,
      roughness: 0.64,
      clearcoat: 0.14,
      clearcoatRoughness: 0.56,
      envMapIntensity: 0.48,
    });

    materials.batteryTop = new THREE.MeshPhysicalMaterial({
      color: 0x5e6367,
      metalness: 0.1,
      roughness: 0.66,
      clearcoat: 0.12,
      clearcoatRoughness: 0.58,
      envMapIntensity: 0.45,
    });

    materials.rubber = new THREE.MeshStandardMaterial({
      color: 0x0c0f12,
      metalness: 0.05,
      roughness: 0.86,
    });

    materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0x03080c,
      metalness: 0.92,
      roughness: 0.075,
      clearcoat: 1,
      clearcoatRoughness: 0.035,
      envMapIntensity: 1.9,
    });

    materials.gimbalBody = new THREE.MeshPhysicalMaterial({
      color: 0x1b2025,
      metalness: 0.78,
      roughness: 0.24,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.45,
    });

    materials.lens = new THREE.MeshPhysicalMaterial({
      color: 0x031420,
      metalness: 0.65,
      roughness: 0.055,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      iridescence: 0.65,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [80, 380],
      envMapIntensity: 2.2,
    });

    materials.lensInner = new THREE.MeshPhysicalMaterial({
      color: 0x061f36,
      metalness: 0.4,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.01,
      iridescence: 0.9,
      iridescenceIOR: 1.45,
      envMapIntensity: 2.4,
    });

    materials.lensRim = new THREE.MeshStandardMaterial({
      color: 0x0b0d10,
      metalness: 0.9,
      roughness: 0.22,
    });

    materials.gold = new THREE.MeshPhysicalMaterial({
      color: 0xbd9150,
      metalness: 0.95,
      roughness: 0.23,
      clearcoat: 0.5,
      envMapIntensity: 1.5,
    });

    materials.copper = new THREE.MeshStandardMaterial({
      color: 0x9d5a3d,
      metalness: 0.9,
      roughness: 0.3,
      envMapIntensity: 1.1,
    });

    materials.motor = new THREE.MeshPhysicalMaterial({
      color: 0x545b62,
      metalness: 0.88,
      roughness: 0.27,
      clearcoat: 0.8,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.4,
    });

    materials.motorDark = new THREE.MeshPhysicalMaterial({
      color: 0x12161a,
      metalness: 0.82,
      roughness: 0.3,
      clearcoat: 0.45,
      envMapIntensity: 1.15,
    });

    materials.prop = new THREE.MeshPhysicalMaterial({
      color: 0x1d242a,
      metalness: 0.42,
      roughness: 0.54,
      clearcoat: 0.2,
      clearcoatRoughness: 0.38,
      side: THREE.DoubleSide,
      envMapIntensity: 0.85,
    });

    materials.propTip = new THREE.MeshStandardMaterial({
      color: 0xff7137,
      metalness: 0.18,
      roughness: 0.48,
      emissive: 0x3a1204,
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide,
    });

    materials.pcb = new THREE.MeshPhysicalMaterial({
      color: 0x09221e,
      metalness: 0.38,
      roughness: 0.48,
      clearcoat: 0.25,
      envMapIntensity: 1.0,
    });

    materials.chip = new THREE.MeshPhysicalMaterial({
      color: 0x080b0d,
      metalness: 0.5,
      roughness: 0.4,
      clearcoat: 0.15,
      envMapIntensity: 1.1,
    });

    materials.trace = new THREE.MeshStandardMaterial({
      color: 0xc79a56,
      metalness: 0.9,
      roughness: 0.28,
      envMapIntensity: 1.2,
    });

    materials.ledCyan = new THREE.MeshBasicMaterial({ color: 0x88efff, toneMapped: false });
    materials.ledGreen = new THREE.MeshBasicMaterial({ color: 0x8cffbe, toneMapped: false });
    materials.ledAmber = new THREE.MeshBasicMaterial({ color: 0xffb65e, toneMapped: false });
    materials.ledRed = new THREE.MeshBasicMaterial({ color: 0xff6f5f, toneMapped: false });
    materials.lidarGlow = new THREE.MeshBasicMaterial({
      color: 0xff5c4d,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });

    materials.sensor = new THREE.MeshPhysicalMaterial({
      color: 0x030a10,
      metalness: 0.8,
      roughness: 0.08,
      clearcoat: 1,
      envMapIntensity: 1.6,
    });

    materials.cyanGlass = new THREE.MeshBasicMaterial({
      color: 0x6be8ff,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });

    materials.bladeDisc = new THREE.MeshBasicMaterial({
      color: 0x9beeff,
      transparent: true,
      opacity: 0.026,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
  }

  /* ---------------------------------------------------------
     Environment, lights and stage
     --------------------------------------------------------- */

  function initRenderer() {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-label", "DJI Air 3S 三维模型，可拖拽旋转与点击拆解");
    dom.canvasHost.appendChild(renderer.domElement);
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04080c, 0.0225);

    camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 80);
    camera.position.set(5.3, 4.4, 7.3);
    updateCameraProjection();

    droneGroup = new THREE.Group();
    droneGroup.rotation.y = -0.2;
    scene.add(droneGroup);

    makeMaterials();
    createEnvironment();
    createLights();
    createStage();
    buildDrone();
    createParticles();
    createSelectionHalo();

    scene.updateMatrixWorld(true);
  }

  function createEnvironment() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
    base.addColorStop(0, "#020508");
    base.addColorStop(0.32, "#07111a");
    base.addColorStop(0.48, "#294554");
    base.addColorStop(0.54, "#0b151c");
    base.addColorStop(1, "#010204");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const coolGlow = ctx.createRadialGradient(690, 195, 8, 690, 195, 240);
    coolGlow.addColorStop(0, "rgba(211, 249, 255, 0.95)");
    coolGlow.addColorStop(0.12, "rgba(123, 223, 245, 0.52)");
    coolGlow.addColorStop(0.48, "rgba(38, 111, 131, 0.2)");
    coolGlow.addColorStop(1, "rgba(4, 7, 10, 0)");
    ctx.fillStyle = coolGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const warmGlow = ctx.createRadialGradient(193, 278, 8, 193, 278, 230);
    warmGlow.addColorStop(0, "rgba(255, 190, 118, 0.7)");
    warmGlow.addColorStop(0.2, "rgba(175, 108, 53, 0.26)");
    warmGlow.addColorStop(1, "rgba(5, 7, 10, 0)");
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(205, 245, 255, 0.5)";
    for (let i = 0; i < 5; i += 1) {
      const w = 28 + random() * 120;
      const x = 120 + random() * 800;
      const h = 1 + random() * 3;
      ctx.fillRect(x, 90 + random() * 210, w, h);
    }

    ctx.fillStyle = "rgba(9, 19, 25, 0.6)";
    ctx.fillRect(0, 315, canvas.width, 26);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTarget = pmremGenerator.fromEquirectangular(texture);
    scene.environment = envTarget.texture;
    texture.dispose();
  }

  function createLights() {
    const hemi = new THREE.HemisphereLight(0xc7edff, 0x040609, 0.75);
    scene.add(hemi);

    keyLight = new THREE.DirectionalLight(0xe6f8ff, 2.42);
    keyLight.position.set(5.6, 8.2, 5.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1536, 1536);
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 24;
    keyLight.shadow.bias = -0.00015;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);

    const rim = new THREE.DirectionalLight(0x49c8ff, 2.25);
    rim.position.set(-5.8, 2.4, -5.4);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0x8dc8ff, 0.8);
    fill.position.set(-2.5, 4.2, 5.8);
    scene.add(fill);

    const warm = new THREE.PointLight(0xffa453, 23, 12, 2);
    warm.position.set(4.3, 0.2, 2.7);
    scene.add(warm);

    const cyan = new THREE.PointLight(0x3ad9ff, 29, 10, 2);
    cyan.position.set(-4.2, 0.7, 1.9);
    scene.add(cyan);

    const under = new THREE.PointLight(0x2fa4c7, 28, 8, 2);
    under.position.set(0, -1.35, 1.8);
    scene.add(under);
  }

  function createStage() {
    const floorGeometry = new THREE.PlaneGeometry(60, 60, 1, 1);
    floorMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x63dff8) },
        uColorDeep: { value: new THREE.Color(0x0d5265) },
      },
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorld = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uColorDeep;
        varying vec3 vWorld;

        void main() {
          float dist = length(vWorld.xz);
          float fade = 1.0 - smoothstep(3.0, 17.5, dist);

          vec2 coord = vWorld.xz * 0.5;
          vec2 gridCell = abs(fract(coord - 0.5) - 0.5) / 0.0075;
          float grid = 1.0 - min(min(gridCell.x, gridCell.y), 1.0);

          float ring = smoothstep(0.025, 0.0, abs(dist - 3.18));
          float fineRing = smoothstep(0.014, 0.0, abs(dist - 2.64));
          float scanPos = mod(uTime * 1.7, 15.0);
          float scan = smoothstep(0.32, 0.0, abs(dist - scanPos)) * 0.72;

          float haze = exp(-dist * 0.4) * 0.16;
          float alpha = (grid * 0.15 + ring * 0.5 + fineRing * 0.25 + scan * 0.32 + haze) * fade;
          vec3 color = mix(uColorDeep, uColor, 0.35 + ring * 0.65);

          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.74;
    scene.add(floor);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(3.22, 3.45, 0.12, 96, 1, false),
      new THREE.MeshPhysicalMaterial({
        color: 0x10171d,
        metalness: 0.9,
        roughness: 0.32,
        clearcoat: 0.4,
        clearcoatRoughness: 0.25,
        envMapIntensity: 0.85,
      })
    );
    platform.position.y = -1.65;
    platform.receiveShadow = true;
    platform.castShadow = false;
    scene.add(platform);

    const platformTop = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0x0b1217,
        metalness: 0.76,
        roughness: 0.36,
        transparent: true,
        opacity: 0.94,
        envMapIntensity: 0.85,
      })
    );
    platformTop.rotation.x = -Math.PI / 2;
    platformTop.position.y = -1.588;
    platformTop.receiveShadow = true;
    scene.add(platformTop);

    const glowTexture = createRadialTexture("rgba(88, 226, 255, 0.42)", "rgba(88, 226, 255, 0)", 256);
    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(7.4, 7.4),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    );
    glowPlane.rotation.x = -Math.PI / 2;
    glowPlane.position.y = -1.573;
    scene.add(glowPlane);

    const shadowTexture = createRadialTexture("rgba(0, 0, 0, 0.86)", "rgba(0, 0, 0, 0)", 256);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 4.5),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        toneMapped: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.57;
    scene.add(shadowPlane);

    platformRingGroup = new THREE.Group();
    platformRingGroup.position.y = -1.576;
    scene.add(platformRingGroup);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x68e4ff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const ringMaterialDim = ringMaterial.clone();
    ringMaterialDim.opacity = 0.09;

    const ringGeometry = new THREE.RingGeometry(2.73, 2.745, 128);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    platformRingGroup.add(ring);

    const ringOuter = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.012, 128), ringMaterialDim);
    ringOuter.rotation.x = -Math.PI / 2;
    platformRingGroup.add(ringOuter);

    const arcMaterial = new THREE.MeshBasicMaterial({
      color: 0x88eeff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    for (let i = 0; i < 5; i += 1) {
      const arc = new THREE.Mesh(
        new THREE.RingGeometry(2.35, 2.37, 80, 1, i * 1.22, 0.45 + (i % 2) * 0.3),
        arcMaterial.clone()
      );
      arc.material.opacity = 0.12 + i * 0.035;
      arc.rotation.x = -Math.PI / 2;
      platformRingGroup.add(arc);
    }

    const crossMaterial = new THREE.LineBasicMaterial({
      color: 0x75deef,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const crossPoints = [
      new THREE.Vector3(-3.1, 0.005, 0),
      new THREE.Vector3(3.1, 0.005, 0),
      new THREE.Vector3(0, 0.005, -3.1),
      new THREE.Vector3(0, 0.005, 3.1),
    ];
    const crossGeometry = new THREE.BufferGeometry().setFromPoints(crossPoints);
    const crossLine = new THREE.LineSegments(crossGeometry, crossMaterial);
    platformRingGroup.add(crossLine);
  }

  function createSelectionHalo() {
    const texture = createRadialTexture("rgba(126, 242, 255, 0.62)", "rgba(54, 190, 220, 0)", 128);
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0x89f2ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    selectionHalo = new THREE.Sprite(material);
    selectionHalo.visible = false;
    selectionHalo.renderOrder = 4;
    scene.add(selectionHalo);

    selectionLight = new THREE.PointLight(0x5fe6ff, 0, 3.4, 2);
    scene.add(selectionLight);
  }

  function updateSelectionHalo(time) {
    if (!selectionHalo) return;
    if (!state.selected || !sceneParts[state.selected] || !sceneParts[state.selected].anchor) {
      selectionHalo.visible = false;
      if (selectionLight) selectionLight.intensity = 0;
      return;
    }
    const anchor = sceneParts[state.selected].anchor;
    anchor.getWorldPosition(tempVec2);
    const scale = haloScales[state.selected] || 1.4;
    selectionHalo.position.copy(tempVec2);
    selectionHalo.scale.setScalar(scale * (1 + Math.sin(time * 2.2) * 0.035));
    selectionHalo.material.opacity = 0.16 + Math.sin(time * 2.2) * 0.035;
    selectionHalo.visible = true;

    selectionLight.position.copy(tempVec2);
    selectionLight.intensity = 6 + Math.sin(time * 2.2) * 1.6;
  }

  function createParticles() {
    const particleTexture = createRadialTexture("rgba(154, 242, 255, 1)", "rgba(39, 140, 170, 0)", 64);

    function makeParticleCloud(count, radiusMin, radiusMax, height, opacity, size) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const angle = random() * Math.PI * 2;
        const radius = radiusMin + random() * (radiusMax - radiusMin);
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = -1.2 + random() * height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        size,
        map: particleTexture,
        color: 0x7feaff,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        toneMapped: false,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      return points;
    }

    particleField = makeParticleCloud(180, 4.2, 15, 7, 0.38, 0.028);
    particleFieldTwo = makeParticleCloud(70, 2.8, 7.5, 4.5, 0.25, 0.04);
  }

  /* ---------------------------------------------------------
     Drone assembly
     --------------------------------------------------------- */

  function buildDrone() {
    buildBody();
    buildBattery();
    buildCore();
    buildGimbal();
    buildVision();
    buildArms();
  }

  function buildBody() {
    const group = makePartRoot("body");
    addMovable("body", group, { x: 0, y: 0, z: 0 });

    const sections = [
      { z: -1.23, w: 0.3, h: 0.13, y: -0.01 },
      { z: -1.15, w: 0.57, h: 0.21, y: 0.0 },
      { z: -0.97, w: 0.73, h: 0.265, y: 0.006 },
      { z: -0.65, w: 0.815, h: 0.297, y: 0.012 },
      { z: -0.15, w: 0.855, h: 0.312, y: 0.014 },
      { z: 0.38, w: 0.822, h: 0.302, y: 0.008 },
      { z: 0.7, w: 0.735, h: 0.268, y: -0.006 },
      { z: 0.95, w: 0.62, h: 0.218, y: -0.024 },
      { z: 1.12, w: 0.47, h: 0.165, y: -0.044 },
      { z: 1.21, w: 0.34, h: 0.11, y: -0.055 },
    ];
    const bodyGeometry = loftGeometry(sections, 64, 5.0, true);
    setVertexTint(bodyGeometry, "#686e73", "#14181b");
    const body = addMesh(group, bodyGeometry, materials.body, "body");

    const underbelly = addMesh(
      group,
      roundedBoxGeometry(1.12, 0.075, 1.7, 0.032),
      materials.bodyDark,
      "body",
      { castShadow: false }
    );
    underbelly.position.set(0, -0.275, -0.03);

    const noseCap = addMesh(
      group,
      roundedBoxGeometry(0.79, 0.225, 0.12, 0.045),
      materials.bodyDark,
      "body",
      { outline: false }
    );
    noseCap.position.set(0, -0.045, 1.155);
    noseCap.rotation.x = -0.03;

    const chin = addMesh(
      group,
      roundedBoxGeometry(0.66, 0.09, 0.3, 0.035),
      materials.bodyDark,
      "body",
      { outline: false }
    );
    chin.position.set(0, -0.245, 0.9);
    chin.rotation.x = 0.04;

    for (const side of [-1, 1]) {
      const skid = addMesh(
        group,
        roundedBoxGeometry(0.14, 0.075, 1.06, 0.03),
        materials.rubber,
        "body",
        { outline: false }
      );
      skid.position.set(side * 0.49, -0.36, 0.06);

      const frontFoot = addMesh(
        group,
        roundedBoxGeometry(0.12, 0.28, 0.2, 0.04),
        materials.armDark,
        "body",
        { outline: false }
      );
      frontFoot.position.set(side * 0.61, -0.35, 0.43);
      frontFoot.rotation.x = -0.22;
      frontFoot.rotation.z = side * 0.08;

      const frontPad = addMesh(
        group,
        roundedBoxGeometry(0.16, 0.055, 0.28, 0.025),
        materials.rubber,
        "body",
        { outline: false, castShadow: false }
      );
      frontPad.position.set(side * 0.63, -0.49, 0.46);
      frontPad.rotation.x = -0.07;

      const rearFoot = addMesh(
        group,
        roundedBoxGeometry(0.1, 0.14, 0.2, 0.03),
        materials.rubber,
        "body",
        { outline: false }
      );
      rearFoot.position.set(side * 0.57, -0.36, -0.82);
      rearFoot.rotation.x = 0.12;

      const ventMaterial = materials.rubber;
      for (let i = 0; i < 6; i += 1) {
        const vent = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.095, 0.032), ventMaterial);
        vent.position.set(side * 0.807, 0.072, -0.55 - i * 0.066);
        vent.rotation.z = side * 0.02;
        group.add(vent);
      }

      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.014, 1.32), materials.rubber);
      seam.position.set(side * 0.812, 0.245, -0.17);
      group.add(seam);

      const shoulder = addMesh(
        group,
        roundedBoxGeometry(0.065, 0.045, 0.78, 0.02),
        materials.armDark,
        "body",
        { outline: false, castShadow: false }
      );
      shoulder.position.set(side * 0.768, 0.238, 0.2);
      shoulder.rotation.z = side * -0.1;

      for (const armZ of [0.4, -0.42]) {
        const socket = addMesh(
          group,
          new THREE.CylinderGeometry(0.132, 0.132, 0.032, 24),
          materials.armDark,
          "body",
          { outline: false, castShadow: false }
        );
        socket.rotation.z = Math.PI / 2;
        socket.position.set(side * 0.822, 0.06, armZ);

        const socketRing = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.006, 6, 28), materials.silver);
        socketRing.rotation.y = Math.PI / 2;
        socketRing.position.set(side * 0.842, 0.06, armZ);
        group.add(socketRing);
      }

      const sideDecal = makeTextPlane("AIR 3S", {
        planeWidth: 0.48,
        planeHeight: 0.11,
        fontSize: 66,
        weight: 600,
        color: "rgba(216, 236, 240, 0.58)",
        opacity: 0.5,
      });
      sideDecal.position.set(side * 0.808, 0.105, -0.48);
      sideDecal.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      group.add(sideDecal);
    }

    const noseTrim = addMesh(
      group,
      roundedBoxGeometry(0.59, 0.045, 0.2, 0.02),
      materials.bodyDark,
      "body",
      { outline: false, castShadow: false }
    );
    noseTrim.position.set(0, 0.092, 1.105);
    noseTrim.rotation.x = -0.04;

    const brow = addMesh(
      group,
      roundedBoxGeometry(0.88, 0.018, 0.16, 0.008),
      materials.rubber,
      "body",
      { outline: false, castShadow: false }
    );
    brow.position.set(0, 0.294, 0.74);
    brow.rotation.x = 0.04;

    const visor = addMesh(
      group,
      roundedBoxGeometry(0.66, 0.024, 0.38, 0.018),
      materials.glass,
      "body",
      { outline: false, castShadow: false }
    );
    visor.position.set(0, 0.284, 0.62);
    visor.rotation.x = 0.145;

    const visorLine = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.008, 0.012), materials.rubber);
    visorLine.position.set(0, 0.304, 0.43);
    group.add(visorLine);

    const rearStatus = new THREE.Mesh(new THREE.CircleGeometry(0.018, 18), materials.ledGreen);
    rearStatus.position.set(0, 0.14, -1.232);
    rearStatus.rotation.x = 0.2;
    group.add(rearStatus);

    const batteryBayRim = addMesh(
      group,
      roundedBoxGeometry(1.19, 0.018, 1.64, 0.06),
      materials.bodyDark,
      "body",
      { outline: false, castShadow: false }
    );
    batteryBayRim.position.set(0, 0.324, -0.28);

    // top attachment points around the battery bay
    for (const x of [-0.53, 0.53]) {
      for (const z of [-0.92, 0.43]) {
        const point = addMesh(
          group,
          new THREE.CylinderGeometry(0.028, 0.028, 0.012, 16),
          materials.silver,
          "body",
          { outline: false }
        );
        point.position.set(x, 0.327, z);
      }
    }

    const anchor = new THREE.Object3D();
    anchor.position.set(0, 0.22, 0.05);
    group.add(anchor);
    setPartAnchor("body", anchor);

    body.name = "AIR 3S fuselage";
  }

  function buildBattery() {
    const group = makePartRoot("battery");
    addMovable("battery", group, { x: 0, y: 1.58, z: -0.13 }, { x: -0.05, y: 0, z: 0.02 });

    const shell = addMesh(
      group,
      roundedBoxGeometry(1.13, 0.155, 1.58, 0.065),
      materials.battery,
      "battery"
    );
    shell.position.set(0, 0.4075, -0.28);

    const basePlate = addMesh(
      group,
      roundedBoxGeometry(1.0, 0.022, 1.42, 0.02),
      materials.bodyDark,
      "battery",
      { outline: false, castShadow: false }
    );
    basePlate.position.set(0, 0.328, -0.28);

    const topPlate = addMesh(
      group,
      roundedBoxGeometry(0.8, 0.012, 1.22, 0.022),
      materials.batteryTop,
      "battery",
      { outline: false }
    );
    topPlate.position.set(0, 0.489, -0.28);

    const spine = addMesh(
      group,
      roundedBoxGeometry(0.16, 0.012, 1.08, 0.009),
      materials.batteryTop,
      "battery",
      { outline: false }
    );
    spine.position.set(0, 0.499, -0.28);

    for (const side of [-1, 1]) {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.1, 1.38), materials.rubber);
      seam.position.set(side * 0.566, 0.4075, -0.28);
      group.add(seam);

      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.065, 0.3), materials.bodyDark);
      grip.position.set(side * 0.57, 0.412, -0.62);
      group.add(grip);
    }

    const frontLatch = addMesh(
      group,
      roundedBoxGeometry(0.28, 0.06, 0.085, 0.022),
      materials.bodyDark,
      "battery",
      { outline: false }
    );
    frontLatch.position.set(0, 0.397, 0.5);

    const logo = makeTextPlane("DJI", {
      planeWidth: 0.42,
      planeHeight: 0.13,
      fontSize: 96,
      weight: 700,
      color: "rgba(29, 35, 39, 0.82)",
      opacity: 0.85,
    });
    logo.position.set(0, 0.505, 0.08);
    logo.rotation.x = -Math.PI / 2;
    group.add(logo);

    const batteryLabel = makeTextPlane("INTELLIGENT FLIGHT BATTERY", {
      planeWidth: 0.53,
      planeHeight: 0.042,
      fontSize: 32,
      weight: 500,
      color: "rgba(28, 35, 39, 0.68)",
      opacity: 0.85,
    });
    batteryLabel.position.set(0, 0.505, -0.3);
    batteryLabel.rotation.x = -Math.PI / 2;
    group.add(batteryLabel);

    for (let i = 0; i < 4; i += 1) {
      const led = new THREE.Mesh(new THREE.CircleGeometry(0.01, 14), materials.ledGreen);
      led.position.set(0.29, 0.503, -0.53 - i * 0.07);
      led.rotation.x = -Math.PI / 2;
      group.add(led);

      const ledRing = new THREE.Mesh(new THREE.RingGeometry(0.017, 0.021, 18), materials.bodyDark);
      ledRing.position.copy(led.position);
      ledRing.position.y -= 0.002;
      ledRing.rotation.x = -Math.PI / 2;
      group.add(ledRing);
    }

    const powerButton = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 24), materials.bodyDark);
    powerButton.position.set(-0.29, 0.503, -0.72);
    group.add(powerButton);

    const powerRing = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.0035, 6, 32), materials.ledCyan);
    powerRing.position.set(-0.29, 0.509, -0.72);
    powerRing.rotation.x = -Math.PI / 2;
    group.add(powerRing);

    const anchor = new THREE.Object3D();
    anchor.position.set(0, 0.52, -0.28);
    group.add(anchor);
    setPartAnchor("battery", anchor);
  }

  function buildCore() {
    const group = makePartRoot("core");
    addMovable("core", group, { x: 0, y: 1.02, z: -0.02 }, { x: 0.05, y: 0, z: 0 });

    const bay = addMesh(
      group,
      roundedBoxGeometry(1.02, 0.018, 1.46, 0.025),
      materials.bodyDark,
      "core",
      { outline: false, castShadow: false }
    );
    bay.position.set(0, 0.354, -0.2);

    const pcb = addMesh(
      group,
      roundedBoxGeometry(0.77, 0.026, 1.0, 0.018),
      materials.pcb,
      "core",
      { castShadow: false }
    );
    pcb.position.set(0, 0.368, -0.22);

    const chipLayout = [
      { x: -0.19, z: -0.38, w: 0.16, h: 0.045, d: 0.16 },
      { x: 0.16, z: -0.14, w: 0.23, h: 0.035, d: 0.18 },
      { x: -0.16, z: 0.14, w: 0.1, h: 0.028, d: 0.12 },
      { x: 0.19, z: 0.32, w: 0.14, h: 0.05, d: 0.12 },
    ];
    chipLayout.forEach((chip) => {
      const mesh = addMesh(
        group,
        roundedBoxGeometry(chip.w, chip.h, chip.d, 0.008),
        materials.chip,
        "core",
        { outline: false, castShadow: false }
      );
      mesh.position.set(chip.x, 0.391 + chip.h / 2, -0.22 + chip.z);
    });

    for (let i = 0; i < 5; i += 1) {
      const trace = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.004, 0.2 + random() * 0.34),
        materials.trace
      );
      trace.position.set(-0.32 + i * 0.15, 0.383, -0.23 + (random() - 0.5) * 0.4);
      trace.rotation.y = (random() - 0.5) * 0.4;
      group.add(trace);
    }

    for (let i = 0; i < 4; i += 1) {
      const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.035, 18), materials.copper);
      coil.position.set(-0.25 + i * 0.16, 0.393, 0.23);
      group.add(coil);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.055, 14), materials.silver);
      cap.position.set(-0.25 + i * 0.16, 0.405, 0.23);
      group.add(cap);
    }

    for (const point of [
      [-0.28, 0.387, 0.02],
      [0.29, 0.387, -0.33],
      [0.05, 0.387, -0.46],
    ]) {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), materials.ledCyan);
      led.position.set(point[0], point[1], point[2]);
      group.add(led);
    }

    const ribbonPoints = [
      new THREE.Vector3(-0.32, 0.392, -0.42),
      new THREE.Vector3(-0.43, 0.36, -0.2),
      new THREE.Vector3(-0.4, 0.33, 0.03),
      new THREE.Vector3(-0.3, 0.36, 0.23),
    ];
    const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPoints);
    const ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(ribbonCurve, 32, 0.012, 6, false),
      materials.amber || materials.ledAmber
    );
    ribbon.material = new THREE.MeshStandardMaterial({ color: 0x8f5b30, roughness: 0.6 });
    group.add(ribbon);

    const coreLabel = makeTextPlane("O4", {
      planeWidth: 0.15,
      planeHeight: 0.08,
      fontSize: 72,
      weight: 600,
      color: "rgba(177, 238, 227, 0.55)",
      opacity: 0.7,
    });
    coreLabel.position.set(0.25, 0.387, 0.1);
    coreLabel.rotation.x = -Math.PI / 2;
    group.add(coreLabel);

    const anchor = new THREE.Object3D();
    anchor.position.set(0, 0.45, -0.22);
    group.add(anchor);
    setPartAnchor("core", anchor);
  }

  function buildGimbal() {
    const group = makePartRoot("gimbal");
    group.position.z = -0.1;
    addMovable("gimbal", group, { x: 0, y: -1.0, z: 0.34 }, { x: 0.08, y: 0, z: 0 });

    const mount = addMesh(
      group,
      roundedBoxGeometry(0.44, 0.12, 0.42, 0.045),
      materials.bodyDark,
      "gimbal"
    );
    mount.position.set(0, -0.31, 1.04);

    for (const x of [-0.16, 0.16]) {
      for (const z of [0.9, 1.18]) {
        const damper = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 10), materials.rubber);
        damper.position.set(x, -0.37, z);
        group.add(damper);
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.07, 10), materials.silver);
        pin.position.set(x, -0.4, z);
        group.add(pin);
      }
    }

    const yawMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.13, 0.075, 28), materials.gimbalBody);
    yawMotor.position.set(0, -0.45, 1.18);
    group.add(yawMotor);

    const yawRing = new THREE.Mesh(new THREE.TorusGeometry(0.096, 0.009, 8, 40), materials.gold);
    yawRing.position.set(0, -0.412, 1.18);
    yawRing.rotation.x = -Math.PI / 2;
    group.add(yawRing);

    const yokeLeft = addMesh(
      group,
      roundedBoxGeometry(0.075, 0.43, 0.15, 0.028),
      materials.gimbalBody,
      "gimbal"
    );
    yokeLeft.position.set(-0.32, -0.59, 1.18);
    yokeLeft.rotation.z = -0.09;

    const yokeRight = yokeLeft.clone();
    yokeRight.position.x = 0.32;
    yokeRight.rotation.z = 0.09;
    group.add(yokeRight);

    const head = addMesh(
      group,
      roundedBoxGeometry(0.62, 0.55, 0.34, 0.1),
      materials.gimbalBody,
      "gimbal"
    );
    head.position.set(0, -0.74, 1.21);

    const face = addMesh(
      group,
      roundedBoxGeometry(0.55, 0.47, 0.075, 0.075),
      materials.bodyDark,
      "gimbal",
      { outline: false }
    );
    face.position.set(0, -0.74, 1.39);

    for (const side of [-1, 1]) {
      const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.075, 24), materials.gimbalBody);
      pivot.rotation.z = Math.PI / 2;
      pivot.position.set(side * 0.31, -0.74, 1.21);
      group.add(pivot);

      const pivotRing = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.006, 6, 28), materials.gold);
      pivotRing.position.set(side * 0.35, -0.74, 1.21);
      pivotRing.rotation.y = Math.PI / 2;
      group.add(pivotRing);
    }

    const lensData = [
      { y: -0.625, radius: 0.142, barrel: 0.14, gold: true },
      { y: -0.858, radius: 0.101, barrel: 0.11, gold: false },
    ];

    lensData.forEach((lens) => {
      const barrel = addMesh(
        group,
        new THREE.CylinderGeometry(lens.radius * 1.03, lens.radius * 1.1, lens.barrel, 40),
        materials.lensRim,
        "gimbal"
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, lens.y, 1.445);

      const inner = new THREE.Mesh(
        new THREE.CylinderGeometry(lens.radius * 0.84, lens.radius * 0.84, 0.03, 36),
        materials.gimbalBody
      );
      inner.rotation.x = Math.PI / 2;
      inner.position.set(0, lens.y, 1.512);
      group.add(inner);

      const glass = new THREE.Mesh(new THREE.CircleGeometry(lens.radius * 0.75, 40), materials.lens);
      glass.position.set(0, lens.y, 1.529);
      group.add(glass);

      const innerGlass = new THREE.Mesh(new THREE.CircleGeometry(lens.radius * 0.45, 36), materials.lensInner);
      innerGlass.position.set(0, lens.y, 1.534);
      group.add(innerGlass);

      const glint = new THREE.Mesh(new THREE.CircleGeometry(lens.radius * 0.11, 16), materials.cyanGlass);
      glint.position.set(-lens.radius * 0.16, lens.y + lens.radius * 0.17, 1.537);
      group.add(glint);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(lens.radius * 0.91, 0.008, 8, 48), materials.gold);
      rim.position.set(0, lens.y, 1.532);
      group.add(rim);

      if (lens.gold) {
        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(lens.radius * 1.06, 0.006, 6, 48), materials.gold);
        outerRing.position.set(0, lens.y, 1.503);
        group.add(outerRing);
      }
    });

    const lensDivider = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.012, 0.012), materials.bodyDark);
    lensDivider.position.set(0, -0.742, 1.434);
    group.add(lensDivider);

    const cameraLogo = makeTextPlane("DJI", {
      planeWidth: 0.12,
      planeHeight: 0.032,
      fontSize: 92,
      weight: 700,
      color: "rgba(207, 218, 221, 0.55)",
      opacity: 0.72,
    });
    cameraLogo.position.set(-0.19, -0.49, 1.433);
    group.add(cameraLogo);

    const sensorDot = new THREE.Mesh(new THREE.CircleGeometry(0.013, 12), materials.ledCyan);
    sensorDot.position.set(0.2, -0.5, 1.457);
    group.add(sensorDot);

    const micSlot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.008, 0.012), materials.rubber);
    micSlot.position.set(0, -0.455, 1.445);
    group.add(micSlot);

    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, -0.37, 1.08),
      new THREE.Vector3(-0.25, -0.5, 1.03),
      new THREE.Vector3(-0.29, -0.68, 1.1),
      new THREE.Vector3(-0.23, -0.74, 1.16),
    ]);
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 28, 0.011, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x06090b, roughness: 0.7 })
    );
    group.add(cable);

    const anchor = new THREE.Object3D();
    anchor.position.set(0, -0.79, 1.42);
    group.add(anchor);
    setPartAnchor("gimbal", anchor);
  }

  function buildVision() {
    const group = makePartRoot("vision");
    group.position.z = -0.115;
    addMovable("vision", group, { x: 0, y: -0.24, z: 1.28 }, { x: 0.02, y: 0, z: 0 });

    const bar = addMesh(
      group,
      roundedBoxGeometry(0.88, 0.195, 0.15, 0.052),
      materials.bodyDark,
      "vision"
    );
    bar.position.set(0, -0.005, 1.345);
    bar.rotation.x = -0.035;

    const face = addMesh(
      group,
      roundedBoxGeometry(0.79, 0.14, 0.045, 0.032),
      materials.glass,
      "vision",
      { outline: false }
    );
    face.position.set(0, -0.005, 1.432);
    face.rotation.x = -0.035;

    const lidar = new THREE.Mesh(new THREE.CircleGeometry(0.047, 28), materials.sensor);
    lidar.position.set(0, -0.092, 1.455);
    lidar.rotation.x = -0.035;
    group.add(lidar);

    const lidarRing = new THREE.Mesh(new THREE.TorusGeometry(0.053, 0.007, 8, 32), materials.ledRed);
    lidarRing.position.set(0, -0.092, 1.459);
    lidarRing.rotation.x = -0.035;
    group.add(lidarRing);

    const lidarCore = new THREE.Mesh(new THREE.CircleGeometry(0.018, 20), materials.lidarGlow);
    lidarCore.position.set(0, -0.092, 1.462);
    lidarCore.rotation.x = -0.035;
    group.add(lidarCore);

    for (const x of [-0.29, 0.29]) {
      const eye = new THREE.Mesh(new THREE.CircleGeometry(0.043, 24), materials.sensor);
      eye.position.set(x, 0.036, 1.455);
      eye.rotation.x = -0.035;
      group.add(eye);

      const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.049, 0.005, 6, 24), materials.silver);
      eyeRing.position.set(x, 0.036, 1.458);
      eyeRing.rotation.x = -0.035;
      group.add(eyeRing);

      const glint = new THREE.Mesh(new THREE.CircleGeometry(0.0075, 10), materials.ledCyan);
      glint.position.set(x - 0.01, 0.047, 1.461);
      group.add(glint);
    }

    for (const x of [-0.38, 0.38]) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.01, 0.01), materials.rubber);
      marker.position.set(x, 0.074, 1.43);
      group.add(marker);
    }

    const anchor = new THREE.Object3D();
    anchor.position.set(0, -0.04, 1.45);
    group.add(anchor);
    setPartAnchor("vision", anchor);
  }

  function buildArms() {
    const configs = [
      { partId: "frontArms", sign: -1, zRoot: 0.4, xMotor: -1.6, zMotor: 0.87, representative: "front-left" },
      { partId: "frontArms", sign: 1, zRoot: 0.4, xMotor: 1.6, zMotor: 0.87, representative: null },
      { partId: "rearArms", sign: -1, zRoot: -0.42, xMotor: -1.65, zMotor: -0.96, representative: null },
      { partId: "rearArms", sign: 1, zRoot: -0.42, xMotor: 1.65, zMotor: -0.96, representative: "rear-right" },
    ];

    let motorAnchorSet = false;
    let propAnchorSet = false;

    configs.forEach((config, index) => {
      const rootX = config.sign * 0.775;
      const rootZ = config.zRoot;
      const dx = config.xMotor - rootX;
      const dz = config.zMotor - rootZ;
      const length = Math.sqrt(dx * dx + dz * dz);
      const yaw = Math.atan2(dx, dz);

      const arm = new THREE.Group();
      arm.userData.partId = config.partId;
      arm.position.set(rootX, 0.055, rootZ);
      arm.rotation.y = yaw;
      droneGroup.add(arm);
      sceneParts[config.partId].roots.push(arm);

      const beamGeometry = roundedBoxGeometry(0.3, 0.105, length, 0.042);
      const positionAttr = beamGeometry.getAttribute("position");
      for (let i = 0; i < positionAttr.count; i += 1) {
        const z = positionAttr.getZ(i);
        const t = clamp((z + length / 2) / length, 0, 1);
        const taper = 1 - t * 0.34;
        positionAttr.setX(i, positionAttr.getX(i) * taper);
        positionAttr.setY(i, positionAttr.getY(i) * (1 - t * 0.1));
      }
      beamGeometry.translate(0, 0, length / 2);
      beamGeometry.computeVertexNormals();

      const beam = addMesh(arm, beamGeometry, materials.arm, config.partId);
      beam.position.y = 0.045;

      const underside = addMesh(
        arm,
        roundedBoxGeometry(0.205, 0.026, length * 0.9, 0.025),
        materials.armDark,
        config.partId,
        { outline: false }
      );
      underside.position.set(0, -0.045, length * 0.5);

      const armSpine = addMesh(
        arm,
        roundedBoxGeometry(0.055, 0.018, length * 0.72, 0.012),
        materials.silver,
        config.partId,
        { outline: false, castShadow: false }
      );
      armSpine.position.set(0, 0.128, length * 0.6);

      const rootFairing = addMesh(
        arm,
        roundedBoxGeometry(0.37, 0.16, 0.4, 0.065),
        materials.arm,
        config.partId
      );
      rootFairing.position.set(0, 0.005, 0.2);

      const armAccent = makeTextPlane("AIR 3S", {
        planeWidth: 0.34,
        planeHeight: 0.075,
        fontSize: 62,
        weight: 600,
        color: "rgba(255, 127, 66, 0.82)",
        opacity: 0.85,
      });
      armAccent.position.set(0, 0.106, length * 0.62);
      armAccent.rotation.x = -Math.PI / 2;
      armAccent.rotation.z = -Math.PI / 2;
      arm.add(armAccent);

      const cable = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.005, length * 0.58),
        new THREE.MeshStandardMaterial({ color: 0x7b4a2c, roughness: 0.6 })
      );
      cable.position.set(0.055, 0.112, length * 0.48);
      cable.rotation.z = 0.02;
      arm.add(cable);

      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.175, 26), materials.armDark);
      hinge.position.set(0, 0.015, 0.02);
      arm.add(hinge);

      const hingeCap = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 8, 32), materials.silver);
      hingeCap.rotation.x = Math.PI / 2;
      hingeCap.position.set(0, 0.103, 0.02);
      arm.add(hingeCap);

      const hingeDot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), materials.silver);
      hingeDot.rotation.x = -Math.PI / 2;
      hingeDot.position.set(0, 0.108, 0.02);
      arm.add(hingeDot);

      const armLed = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.007, 0.09), config.sign < 0 ? materials.ledRed : materials.ledGreen);
      armLed.position.set(0, 0.12, 0.23);
      arm.add(armLed);

      addMovable(
        config.partId,
        arm,
        {
          x: config.sign * 0.53,
          y: 0.16,
          z: config.partId === "frontArms" ? 0.22 : -0.22,
        },
        { x: 0, y: config.sign * 0.11, z: 0 }
      );

      if (
        (config.partId === "frontArms" && config.sign < 0) ||
        (config.partId === "rearArms" && config.sign > 0)
      ) {
        const anchor = new THREE.Object3D();
        anchor.position.set(0, 0.15, length * 0.55);
        arm.add(anchor);
        setPartAnchor(config.partId, anchor);
      }

      buildMotorAndProp(arm, config, length, index, (motorAnchor, propAnchor) => {
        if (config.partId === "frontArms" && config.sign > 0 && !motorAnchorSet) {
          setPartAnchor("motors", motorAnchor);
          motorAnchorSet = true;
        }
        if (config.partId === "frontArms" && config.sign < 0 && !propAnchorSet) {
          setPartAnchor("props", propAnchor);
          propAnchorSet = true;
        }
      });
    });
  }

  function buildMotorAndProp(arm, config, armLength, index, anchorsCallback) {
    const motor = new THREE.Group();
    motor.userData.partId = "motors";
    motor.position.set(0, 0.02, armLength - 0.015);
    arm.add(motor);
    sceneParts.motors.roots.push(motor);

    const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.225, 0.075, 28), materials.bodyDark);
    mount.position.y = 0.02;
    mount.castShadow = true;
    motor.add(mount);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.085, 32), materials.motorDark);
    base.position.y = 0.09;
    base.castShadow = true;
    motor.add(base);

    const bell = addMesh(
      motor,
      new THREE.CylinderGeometry(0.168, 0.182, 0.145, 36),
      materials.motor,
      "motors"
    );
    bell.position.y = 0.185;

    const copperRing = new THREE.Mesh(new THREE.TorusGeometry(0.153, 0.012, 8, 44), materials.copper);
    copperRing.position.y = 0.245;
    copperRing.rotation.x = -Math.PI / 2;
    motor.add(copperRing);

    const topRing = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.009, 8, 40), materials.silver);
    topRing.position.y = 0.253;
    topRing.rotation.x = -Math.PI / 2;
    motor.add(topRing);

    const ledRing = new THREE.Mesh(new THREE.TorusGeometry(0.204, 0.005, 6, 44), materials.ledCyan);
    ledRing.position.y = 0.059;
    ledRing.rotation.x = -Math.PI / 2;
    motor.add(ledRing);

    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.055, 0.012), materials.bodyDark);
      vent.position.set(Math.cos(angle) * 0.174, 0.12, Math.sin(angle) * 0.174);
      vent.rotation.y = -angle;
      motor.add(vent);
    }

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 20), materials.silver);
    shaft.position.y = 0.28;
    motor.add(shaft);

    const prop = new THREE.Group();
    prop.userData.partId = "props";
    prop.position.set(0, 0.285, 0);
    motor.add(prop);
    sceneParts.props.roots.push(prop);

    const spinner = new THREE.Group();
    spinner.rotation.y = random() * Math.PI * 2;
    prop.add(spinner);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.092, 0.055, 28), materials.motorDark);
    hub.position.y = 0.02;
    hub.castShadow = true;
    spinner.add(hub);

    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.075, 0.032, 24), materials.motor);
    hubCap.position.y = 0.06;
    spinner.add(hubCap);

    const bladeGeometry = createBladeGeometry();
    for (let i = 0; i < 3; i += 1) {
      const bladeGroup = new THREE.Group();
      bladeGroup.rotation.y = (i / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeometry, materials.prop);
      blade.rotation.x = -Math.PI / 2 + 0.14;
      blade.position.y = 0.025;
      blade.scale.set(0.9, 1.26, 1);
      blade.castShadow = true;
      blade.receiveShadow = true;
      bladeGroup.add(blade);
      addOutline(blade, "props");

      const tip = new THREE.Mesh(createBladeTipGeometry(), materials.propTip);
      tip.rotation.x = -Math.PI / 2 + 0.14;
      tip.scale.set(0.9, 1.26, 1);
      tip.position.set(0, 0.027, 0);
      tip.castShadow = false;
      bladeGroup.add(tip);

      spinner.add(bladeGroup);
    }

    const disc = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.62, 56), materials.bladeDisc);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.035;
    spinner.add(disc);
    spinDiscs.push(disc);

    const direction = index % 2 === 0 ? 1 : -1;
    spinners.push({ object: spinner, direction });

    addMovable("motors", motor, { x: 0, y: 0.56, z: 0 }, null);
    addMovable("props", prop, { x: 0, y: 1.04, z: 0 }, { x: 0, y: 0.12 * direction, z: 0 });

    const motorAnchor = new THREE.Object3D();
    motorAnchor.position.set(0, 0.21, 0.08);
    motor.add(motorAnchor);

    const propAnchor = new THREE.Object3D();
    propAnchor.position.set(0, 0.12, 0.15);
    prop.add(propAnchor);

    if (anchorsCallback) anchorsCallback(motorAnchor, propAnchor);
  }

  function createBladeGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0.07, -0.012);
    shape.bezierCurveTo(0.16, 0.012, 0.34, 0.09, 0.52, 0.086);
    shape.bezierCurveTo(0.63, 0.082, 0.7, 0.05, 0.735, 0.012);
    shape.bezierCurveTo(0.69, -0.026, 0.59, -0.065, 0.43, -0.073);
    shape.bezierCurveTo(0.28, -0.08, 0.14, -0.06, 0.07, -0.024);
    shape.lineTo(0.07, -0.012);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.007,
      bevelSize: 0.005,
      bevelSegments: 2,
      curveSegments: 10,
      steps: 1,
    });
    geometry.computeVertexNormals();
    return geometry;
  }

  function createBladeTipGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0.5, 0.082);
    shape.bezierCurveTo(0.6, 0.08, 0.68, 0.05, 0.73, 0.012);
    shape.bezierCurveTo(0.69, -0.023, 0.6, -0.06, 0.47, -0.071);
    shape.bezierCurveTo(0.54, -0.045, 0.59, -0.011, 0.6, 0.012);
    shape.bezierCurveTo(0.61, 0.038, 0.56, 0.068, 0.5, 0.082);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.021,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.002,
      bevelSegments: 1,
      curveSegments: 8,
      steps: 1,
    });
    geometry.computeVertexNormals();
    return geometry;
  }

  /* ---------------------------------------------------------
     UI — inventory, labels, details
     --------------------------------------------------------- */

  function buildInventory() {
    dom.componentList.innerHTML = PARTS.map((part) => `
      <button class="component-item" type="button" role="listitem" data-part="${part.id}" aria-label="查看${part.name}">
        <span class="item-index">${part.num}</span>
        <span class="item-copy">
          <b>${part.name}</b>
          <small>${part.en}</small>
        </span>
        <span class="item-state"><i></i><em>${part.base ? "基准" : "装配"}</em></span>
      </button>
    `).join("");
  }

  function buildLabels() {
    PARTS.forEach((part) => {
      const label = document.createElement("div");
      label.className = "part-label";
      label.dataset.part = part.id;
      label.innerHTML = `
        <span class="label-index">${part.num}</span>
        <span class="label-copy">
          <b>${part.name}</b>
          <small>${part.labelSpec}</small>
        </span>
      `;
      dom.labelLayer.appendChild(label);

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "leader-group");
      group.dataset.part = part.id;
      group.style.opacity = "0";

      const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      glowPath.setAttribute("class", "leader-path leader-path--glow");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "leader-path");
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "leader-dot");
      dot.setAttribute("r", "2.4");
      const terminal = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      terminal.setAttribute("class", "leader-terminal");
      terminal.setAttribute("r", "1.8");

      group.appendChild(glowPath);
      group.appendChild(path);
      group.appendChild(dot);
      group.appendChild(terminal);
      dom.leaderLayer.appendChild(group);

      const cached = {
        el: label,
        group,
        path,
        glowPath,
        dot,
        terminal,
        width: 180,
        height: 38,
      };
      labelCache[part.id] = cached;
      sceneParts[part.id].label = cached;

      requestAnimationFrame(() => {
        cached.width = label.offsetWidth || 180;
        cached.height = label.offsetHeight || 38;
      });
    });
  }

  function getOverviewHTML() {
    return `
      <div class="ov-kicker">PRODUCT / 2026</div>
      <h2 class="ov-title">AIR <em>3S</em></h2>
      <p class="ov-sub">DUAL-CAMERA FLAGSHIP · TEARDOWN SPEC</p>
      <p class="ov-desc">双摄轻旗舰，将 1 英寸主摄、70 mm 中长焦与全向感知系统收进 724 g 的折叠机身。点击任意模块，逐层查看结构。</p>

      <div class="ov-blueprint" aria-hidden="true">
        <svg viewBox="0 0 300 112">
          <g transform="translate(150 55)">
            <path class="bp-dim" d="M-68 -38H68M-68 42H68M-76 -38V42M76 -38V42"/>
            <path class="bp-line" d="M-44 -13C-33 -19 -15 -21 4 -20C24 -20 39 -16 48 -10C54 -6 54 2 47 7C38 13 20 16 2 16C-16 16 -34 13 -44 8C-50 4 -50 -9 -44 -13Z"/>
            <path class="bp-line" d="M-33 -14L-60 -30M33 -14L60 -30M-33 12L-60 28M33 12L60 28"/>
            <circle class="bp-line" cx="-62" cy="-32" r="12"/>
            <circle class="bp-line" cx="62" cy="-32" r="12"/>
            <circle class="bp-line" cx="-62" cy="30" r="12"/>
            <circle class="bp-line" cx="62" cy="30" r="12"/>
            <path class="bp-line" d="M-62 -44V-20M-74 -32H-50M62 -44V-20M50 -32H74M-62 18V42M-74 30H-50M62 18V42M50 30H74"/>
            <path class="bp-line" d="M43 2L51 0L50 7L42 8Z"/>
            <circle class="bp-hot" cx="47" cy="3" r="1.8"/>
            <circle class="bp-hot" cx="47" cy="7" r="1.2"/>
            <path class="bp-line" d="M-26 7L26 7M-26 10L26 10"/>
            <path class="bp-dim" d="M-10 -23H10M0 -27V27"/>
            <text class="bp-text" x="-72" y="50">214.7 MM</text>
            <text class="bp-text" x="24" y="-23">CAMERA</text>
            <text class="bp-text" x="-44" y="36">AIRFRAME</text>
          </g>
        </svg>
      </div>

      <div class="ov-spec-grid">
        <div class="ov-spec"><span>起飞重量</span><b>724<small>g</small></b></div>
        <div class="ov-spec"><span>最长飞行</span><b>45<small>min</small></b></div>
        <div class="ov-spec"><span>主摄</span><b>1<small>inch</small></b></div>
      </div>

      <button class="detail-cta" type="button" data-detail-action="all">
        <span>开始结构拆解<small>BEGIN TEARDOWN SEQUENCE</small></span>
        <b>→</b>
      </button>
      <div class="ov-note">本页面基于公开规格制作，仅用于结构可视化演示；所有三维部件均由代码实时生成。</div>
    `;
  }

  function getPartHTML(part) {
    const exploded = !!state.target[part.id] || (state.allExploded && !part.base);
    const specRows = part.specs.map(([label, value]) => `
      <div class="spec-row"><span>${label}</span><b>${value}</b></div>
    `).join("");

    let actions;
    if (part.base) {
      actions = `
        <button class="action-button action-button--primary" type="button" data-detail-action="all">${state.allExploded ? "收回全部部件" : "全部拆解"}</button>
        <button class="action-button" type="button" data-detail-action="close">返回总览</button>
      `;
    } else {
      actions = `
        <button class="action-button action-button--primary" type="button" data-detail-action="toggle">${exploded ? "装回此部件" : "拆解此部件"}</button>
        <button class="action-button" type="button" data-detail-action="all">${state.allExploded ? "收回全部" : "全部拆解"}</button>
      `;
    }

    return `
      <div class="part-heading">
        <div class="part-heading__copy">
          <div class="part-overline">MODULE ${part.num} / ${part.category}</div>
          <h2 class="part-title">${part.name}</h2>
          <p class="part-en">${part.en}</p>
        </div>
        <span class="part-number">${part.num}</span>
      </div>

      <p class="part-desc">${part.desc}</p>
      <div class="part-channel">${part.channels.map((channel) => `<span>${channel}</span>`).join("")}</div>

      <div class="spec-list">${specRows}</div>

      <div class="part-status ${exploded ? "is-exploded" : ""}">
        <span class="part-status__label"><i></i>${part.base ? "结构基准 / BASE FRAME" : exploded ? "已分离 / SEPARATED" : "装配状态 / ASSEMBLED"}</span>
        <span class="part-status__meter"><i></i></span>
      </div>

      <div class="detail-actions">${actions}</div>
      <div class="mini-note"><span>TIP</span>拖拽旋转视角，滚轮缩放；再次点击部件可快速装回。</div>
    `;
  }

  function renderDetail(animate = true) {
    const part = state.selected ? PART_MAP[state.selected] : null;
    dom.detailIndex.textContent = part ? `MODULE ${part.num} / 09` : "TOTAL / OVERVIEW";
    dom.detailContent.innerHTML = part ? getPartHTML(part) : getOverviewHTML();

    if (animate) {
      dom.detailContent.classList.remove("is-switching");
      // Force a reflow so the entry animation can restart.
      void dom.detailContent.offsetWidth;
      dom.detailContent.classList.add("is-switching");
    }

    if (window.innerWidth <= 1180) {
      dom.detailPanel.classList.toggle("is-open", !!part);
    }
    computeSafeArea();
  }

  function refreshUI() {
    state.allExploded = SEPARABLE_PARTS.every((part) => state.target[part.id]);

    const items = dom.componentList.querySelectorAll(".component-item");
    items.forEach((item) => {
      const id = item.dataset.part;
      const part = PART_MAP[id];
      const isSelected = state.selected === id;
      const isExploded = !!state.target[id];
      item.classList.toggle("is-selected", isSelected);
      item.classList.toggle("is-exploded", isExploded);

      const stateEl = item.querySelector(".item-state");
      if (stateEl) {
        let label = part.base ? "基准" : "装配";
        if (isSelected) label = "详情";
        else if (isExploded) label = "已拆";
        stateEl.innerHTML = `<i></i><em>${label}</em>`;
      }
    });

    dom.explodeAllBtn.classList.toggle("is-rassemble", state.allExploded);
    const primaryTitle = dom.explodeAllBtn.querySelector(".dock-copy b");
    const primarySub = dom.explodeAllBtn.querySelector(".dock-copy small");
    if (primaryTitle) primaryTitle.textContent = state.allExploded ? "全部装回" : "全部拆解";
    if (primarySub) primarySub.textContent = state.allExploded ? "REASSEMBLE ALL" : "EXPLODE ALL";

    dom.autoRotateBtn.classList.toggle("is-active", state.autoRotate);
    dom.autoRotateBtn.setAttribute("aria-pressed", String(state.autoRotate));

    updateHighlight();
    renderDetail();
    updateMeter(true);
  }

  function updateMeter(force = false) {
    let progressSum = 0;
    SEPARABLE_PARTS.forEach((part) => {
      progressSum += clamp(state.progress[part.id], 0, 1);
    });
    const percent = Math.round((progressSum / SEPARABLE_PARTS.length) * 100);
    if (!force && percent === state._lastPercent) return;
    state._lastPercent = percent;

    dom.progressValue.textContent = String(percent);
    dom.progressRing.style.setProperty("--progress", String(percent));
    dom.separationReadout.textContent = `${percent}%`;

    let label = "整机状态 / ASSEMBLED";
    if (percent >= 99) label = "完全分离 / FULL TEARDOWN";
    else if (percent > 0) label = "局部拆解 / PARTIAL";
    dom.separationLabel.textContent = label;
  }

  function setAutoRotate(value) {
    state.autoRotate = value;
    dom.autoRotateBtn.classList.toggle("is-active", value);
    dom.autoRotateBtn.setAttribute("aria-pressed", String(value));
  }

  function clearSelection() {
    if (state.selected === null) return;
    state.selected = null;
    state.hovered = null;
    dom.detailPanel.classList.remove("is-open");
    refreshUI();
  }

  function selectPart(id, source = "scene") {
    if (!PART_MAP[id]) return;

    if (window.innerWidth <= 1180 && source === "list") {
      dom.inventoryPanel.classList.remove("is-open");
      dom.inventoryToggle.setAttribute("aria-expanded", "false");
    }

    if (state.allExploded) {
      state.selected = id;
      setAutoRotate(false);
      dom.inventoryPanel.classList.remove("is-open");
      dom.inventoryToggle.setAttribute("aria-expanded", "false");
      refreshUI();
      return;
    }

    if (state.selected === id && state.target[id] && !PART_MAP[id].base) {
      state.target[id] = false;
    } else {
      SEPARABLE_PARTS.forEach((part) => {
        state.target[part.id] = part.id === id;
      });
      state.selected = id;
      if (!PART_MAP[id].base) state.target[id] = true;
    }

    setAutoRotate(false);
    if (source === "scene") dom.inventoryPanel.classList.remove("is-open");
    dom.inventoryToggle.setAttribute("aria-expanded", "false");
    refreshUI();
  }

  function toggleSelectedPart() {
    const id = state.selected;
    if (!id) return;
    const part = PART_MAP[id];
    if (part.base) {
      toggleAllExploded();
      return;
    }

    if (!state.allExploded && !state.target[id]) {
      SEPARABLE_PARTS.forEach((item) => {
        state.target[item.id] = false;
      });
    }
    state.target[id] = !state.target[id];
    setAutoRotate(false);
    refreshUI();
  }

  function toggleAllExploded() {
    if (state.allExploded) {
      SEPARABLE_PARTS.forEach((part) => {
        state.target[part.id] = false;
      });
    } else {
      SEPARABLE_PARTS.forEach((part) => {
        state.target[part.id] = true;
      });
    }
    setAutoRotate(false);
    refreshUI();
  }

  function resetAll() {
    PARTS.forEach((part) => {
      state.target[part.id] = false;
    });
    state.selected = null;
    state.hovered = null;
    state.allExploded = false;
    dom.inventoryPanel.classList.remove("is-open");
    dom.detailPanel.classList.remove("is-open");
    refreshUI();
  }

  function resetCamera() {
    cameraRig.tAz = cameraRig.homeAz;
    cameraRig.tPolar = cameraRig.homePolar;
    cameraRig.tRadius = cameraRig.homeRadius;
    setAutoRotate(false);
  }

  function updateHighlight() {
    PARTS.forEach((part) => {
      const outlines = sceneParts[part.id].outlines;
      const isSelected = state.selected === part.id;
      const isHovered = state.hovered === part.id && !isSelected;
      outlines.forEach(({ mesh }) => {
        mesh.visible = isSelected || isHovered;
        mesh.material = isSelected ? outlineMaterials.selected : outlineMaterials.hover;
      });
    });

    if (state.dragging) {
      dom.canvasHost.style.cursor = "grabbing";
    } else if (state.hovered) {
      dom.canvasHost.style.cursor = "pointer";
    } else {
      dom.canvasHost.style.cursor = "grab";
    }
  }

  /* ---------------------------------------------------------
     Labels and leader lines
     --------------------------------------------------------- */

  function computeSafeArea() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let area = { left: 18, right: w - 18, top: 94, bottom: h - 128 };

    if (w > 1180) {
      const invRect = dom.inventoryPanel.getBoundingClientRect();
      const detRect = dom.detailPanel.getBoundingClientRect();
      area.left = Math.max(area.left, invRect.right + 16);
      area.right = Math.min(area.right, detRect.left - 16);
      area.top = 104;
      area.bottom = h - 138;
    } else {
      area.left = 12;
      area.right = w - 12;
      area.top = 82;
      area.bottom = h - 112;
    }

    if (w > 1180 && area.right - area.left < 320) {
      area.left = Math.max(12, area.left - 40);
      area.right = Math.min(w - 12, area.right + 40);
    }

    state.safeArea = area;
  }

  function updateLabels(time) {
    const area = state.safeArea || { left: 18, right: window.innerWidth - 18, top: 94, bottom: window.innerHeight - 128 };
    const isMobile = window.innerWidth <= 620;
    const visibleParts = [];

    PARTS.forEach((part, index) => {
      const cached = labelCache[part.id];
      const anchor = sceneParts[part.id].anchor;
      if (!cached || !anchor) return;

      const progress = state.progress[part.id];
      let visible = state.selected === part.id || progress > 0.06 || (state.allExploded && part.base);
      if (isMobile) visible = state.selected === part.id;
      if (!visible) {
        cached.el.classList.remove("is-visible", "is-active");
        cached.group.style.opacity = "0";
        return;
      }

      anchor.getWorldPosition(tempVec);
      tempVec.project(camera);

      if (tempVec.z > 1 || tempVec.z < -1) {
        cached.el.classList.remove("is-visible", "is-active");
        cached.group.style.opacity = "0";
        return;
      }

      const anchorX = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
      const anchorY = (-tempVec.y * 0.5 + 0.5) * window.innerHeight;
      const active = state.selected === part.id;

      visibleParts.push({
        part,
        cached,
        anchorX,
        anchorY,
        active,
        index,
        desiredX: anchorX + part.labelOffset.x,
        desiredY: anchorY + part.labelOffset.y,
      });
    });

    visibleParts.sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return a.index - b.index;
    });

    const selectedEntry = visibleParts.find((entry) => entry.part.id === state.selected);
    if (selectedEntry) {
      const size = clamp((haloScales[state.selected] || 1.4) * 45, 46, 134);
      dom.reticle.style.setProperty("--size", `${size.toFixed(0)}px`);
      dom.reticle.style.left = `${selectedEntry.anchorX.toFixed(2)}px`;
      dom.reticle.style.top = `${selectedEntry.anchorY.toFixed(2)}px`;
      dom.reticle.classList.add("is-visible");
    } else {
      dom.reticle.classList.remove("is-visible");
    }

    const placed = [];

    visibleParts.forEach((entry) => {
      const { cached, part } = entry;
      const width = cached.width || 180;
      const height = cached.height || 38;
      const halfW = width / 2;
      const halfH = height / 2;
      const minX = area.left + halfW;
      const maxX = area.right - halfW;
      const minY = area.top + halfH;
      const maxY = area.bottom - halfH;
      let finalX = clamp(entry.desiredX, minX, maxX);
      let finalY = clamp(entry.desiredY, minY, maxY);

      for (let attempt = 0; attempt < 26; attempt += 1) {
        const direction = attempt % 2 === 0 ? 1 : -1;
        const step = Math.ceil(attempt / 2) * (height + 9);
        const candidateY = clamp(finalY + direction * step, minY, maxY);
        const rect = {
          left: finalX - halfW - 7,
          right: finalX + halfW + 7,
          top: candidateY - halfH - 6,
          bottom: candidateY + halfH + 6,
        };
        const collision = placed.some(
          (other) =>
            rect.left < other.right &&
            rect.right > other.left &&
            rect.top < other.bottom &&
            rect.bottom > other.top
        );
        if (!collision) {
          finalY = candidateY;
          break;
        }
        finalY = candidateY;
      }

      const rect = {
        left: finalX - halfW - 7,
        right: finalX + halfW + 7,
        top: finalY - halfH - 6,
        bottom: finalY + halfH + 6,
      };
      placed.push(rect);

      cached.el.style.left = `${finalX.toFixed(1)}px`;
      cached.el.style.top = `${finalY.toFixed(1)}px`;
      cached.el.classList.add("is-visible");
      cached.el.classList.toggle("is-active", entry.active);
      cached.group.style.opacity = "1";

      const onRight = finalX >= entry.anchorX;
      const edgeX = onRight ? finalX - halfW - 1 : finalX + halfW + 1;
      const dx = edgeX - entry.anchorX;
      const c1x = entry.anchorX + dx * 0.42;
      const c2x = edgeX - dx * 0.18;
      const pathData = `M ${entry.anchorX.toFixed(2)} ${entry.anchorY.toFixed(2)} C ${c1x.toFixed(2)} ${entry.anchorY.toFixed(
        2
      )}, ${c2x.toFixed(2)} ${finalY.toFixed(2)}, ${edgeX.toFixed(2)} ${finalY.toFixed(2)}`;

      cached.path.setAttribute("d", pathData);
      cached.glowPath.setAttribute("d", pathData);
      cached.dot.setAttribute("cx", edgeX.toFixed(2));
      cached.dot.setAttribute("cy", finalY.toFixed(2));
      cached.terminal.setAttribute("cx", entry.anchorX.toFixed(2));
      cached.terminal.setAttribute("cy", entry.anchorY.toFixed(2));

      cached.path.classList.toggle("is-active", entry.active);
      cached.glowPath.classList.toggle("is-active", entry.active);
      cached.dot.classList.toggle("is-active", entry.active);
      cached.terminal.classList.toggle("is-active", entry.active);
    });

    // Hide line groups that are not in the visible set.
    PARTS.forEach((part) => {
      const cached = labelCache[part.id];
      if (!cached) return;
      if (!visibleParts.some((entry) => entry.part.id === part.id)) {
        cached.group.style.opacity = "0";
      }
    });

    if (state.selected) {
      outlineMaterials.selected.opacity = 0.58 + Math.sin(time * 3.0) * 0.16;
    }
  }

  /* ---------------------------------------------------------
     Picking and camera interaction
     --------------------------------------------------------- */

  function getPartIdFromObject(object) {
    let current = object;
    while (current && current !== scene) {
      if (current.userData && current.userData.partId) return current.userData.partId;
      current = current.parent;
    }
    return null;
  }

  function raycastAt(clientX, clientY) {
    if (!renderer) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    scene.updateMatrixWorld(true);
    const intersects = raycaster.intersectObject(droneGroup, true);
    for (let i = 0; i < intersects.length; i += 1) {
      const hit = intersects[i];
      if (hit.object.userData.noPick) continue;
      const partId = getPartIdFromObject(hit.object);
      if (partId) return { partId, point: hit.point, object: hit.object };
    }
    return null;
  }

  function setHovered(id, source = "scene") {
    if (state.hovered === id) return;
    state.hovered = id;
    updateHighlight();
    if (id) {
      const part = PART_MAP[id];
      dom.hoverTagName.textContent = part.name;
      dom.hoverTag.classList.add("is-visible");
    } else {
      dom.hoverTag.classList.remove("is-visible");
    }
    if (source === "scene" && id) {
      dom.hoverTag.style.left = `${state.pointer.x}px`;
      dom.hoverTag.style.top = `${state.pointer.y}px`;
    }
  }

  function updateHover(clientX, clientY) {
    state.pointer.x = clientX;
    state.pointer.y = clientY;
    if (state.dragging || state.pinching) {
      setHovered(null);
      dom.hoverTag.classList.remove("is-visible");
      return;
    }
    if (hoverFrame) return;
    hoverFrame = requestAnimationFrame(() => {
      hoverFrame = 0;
      const hit = raycastAt(state.pointer.x, state.pointer.y);
      setHovered(hit ? hit.partId : null);
      if (state.hovered) {
        dom.hoverTag.style.left = `${state.pointer.x}px`;
        dom.hoverTag.style.top = `${state.pointer.y}px`;
      }
    });
  }

  function setupPointerControls() {
    const host = dom.canvasHost;

    host.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      host.setPointerCapture?.(event.pointerId);
      pointerMap.set(event.pointerId, { x: event.clientX, y: event.clientY });
      state.moved = 0;
      state.dragging = true;
      state.pinching = pointerMap.size > 1;
      setHovered(null);
      dom.hoverTag.classList.remove("is-visible");

      if (pointerMap.size === 2) {
        const [a, b] = Array.from(pointerMap.values());
        pinchStartDistance = Math.hypot(a.x - b.x, a.y - b.y);
        pinchStartRadius = cameraRig.tRadius;
        state.pinching = true;
      }

      dom.canvasHost.classList.add("is-dragging");
      updateHighlight();
    });

    host.addEventListener("pointermove", (event) => {
      const previous = pointerMap.get(event.pointerId);
      if (!previous) {
        updateHover(event.clientX, event.clientY);
        return;
      }

      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      pointerMap.set(event.pointerId, { x: event.clientX, y: event.clientY });
      state.pointer.x = event.clientX;
      state.pointer.y = event.clientY;
      state.moved += Math.abs(dx) + Math.abs(dy);

      if (pointerMap.size >= 2) {
        const [a, b] = Array.from(pointerMap.values());
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchStartDistance > 0) {
          cameraRig.tRadius = clamp((pinchStartRadius * pinchStartDistance) / Math.max(20, distance), 6.2, 16);
        }
        state.pinching = true;
        return;
      }

      if (state.moved > 3) {
        setAutoRotate(false);
        state.dragging = true;
      }

      cameraRig.tAz -= dx * 0.0043;
      cameraRig.tPolar = clamp(cameraRig.tPolar + dy * 0.0035, 0.5, 1.47);
      setHovered(null);
      dom.hoverTag.classList.remove("is-visible");
    });

    const onPointerEnd = (event) => {
      const wasSingle = pointerMap.size === 1;
      const pointer = pointerMap.get(event.pointerId);
      pointerMap.delete(event.pointerId);

      if (wasSingle && state.moved < 7 && pointer) {
        const hit = raycastAt(event.clientX, event.clientY);
        if (hit) {
          selectPart(hit.partId, "scene");
        } else if (state.selected) {
          clearSelection();
        }
      }

      if (pointerMap.size === 0) {
        state.dragging = false;
        state.pinching = false;
        dom.canvasHost.classList.remove("is-dragging");
        updateHighlight();
      } else if (pointerMap.size === 1) {
        state.pinching = false;
        state.dragging = true;
      }
    };

    host.addEventListener("pointerup", onPointerEnd);
    host.addEventListener("pointercancel", onPointerEnd);
    host.addEventListener("pointerleave", () => {
      if (!state.dragging) {
        setHovered(null);
        dom.hoverTag.classList.remove("is-visible");
      }
    });

    host.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        setAutoRotate(false);
        const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
        cameraRig.tRadius = clamp(cameraRig.tRadius + delta * 0.0016, 6.2, 16);
        setHovered(null);
        dom.hoverTag.classList.remove("is-visible");
      },
      { passive: false }
    );
  }

  function setupUI() {
    dom.componentList.addEventListener("click", (event) => {
      const item = event.target.closest(".component-item");
      if (!item) return;
      selectPart(item.dataset.part, "list");
    });

    dom.componentList.addEventListener("pointerover", (event) => {
      const item = event.target.closest(".component-item");
      if (!item) return;
      setHovered(item.dataset.part, "list");
    });

    dom.componentList.addEventListener("pointerout", (event) => {
      const item = event.target.closest(".component-item");
      const related = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest(".component-item") : null;
      if (item && item !== related) {
        setHovered(null, "list");
      }
    });

    dom.detailContent.addEventListener("click", (event) => {
      const button = event.target.closest("[data-detail-action]");
      if (!button) return;
      const action = button.dataset.detailAction;
      if (action === "toggle") toggleSelectedPart();
      if (action === "all") toggleAllExploded();
      if (action === "close") clearSelection();
    });

    dom.detailClose.addEventListener("click", clearSelection);
    dom.explodeAllBtn.addEventListener("click", toggleAllExploded);
    dom.resetBtn.addEventListener("click", resetAll);
    dom.viewResetBtn.addEventListener("click", resetCamera);
    dom.autoRotateBtn.addEventListener("click", () => setAutoRotate(!state.autoRotate));

    dom.inventoryToggle.addEventListener("click", () => {
      const open = dom.inventoryPanel.classList.toggle("is-open");
      dom.inventoryToggle.setAttribute("aria-expanded", String(open));
      if (open) dom.detailPanel.classList.remove("is-open");
    });

    dom.inventoryClose.addEventListener("click", () => {
      dom.inventoryPanel.classList.remove("is-open");
      dom.inventoryToggle.setAttribute("aria-expanded", "false");
    });

    dom.detailPanel.addEventListener("click", (event) => {
      // The detail panel itself should not pass clicks through to the canvas.
      event.stopPropagation();
    });

    window.addEventListener("keydown", (event) => {
      if (event.target.closest && event.target.closest("button, a, input, textarea")) return;
      if (event.code === "Space") {
        event.preventDefault();
        toggleAllExploded();
      } else if (event.key.toLowerCase() === "r") {
        resetAll();
      } else if (event.key.toLowerCase() === "a") {
        setAutoRotate(!state.autoRotate);
      } else if (event.key === "Escape") {
        clearSelection();
        dom.inventoryPanel.classList.remove("is-open");
        dom.inventoryToggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
  }

  function updateCameraProjection() {
    if (!camera) return;
    const aspect = window.innerWidth / window.innerHeight;
    // Keep a comfortable horizontal field of view in portrait layouts so the
    // full rotor span stays visible instead of clipping at the screen edges.
    const requiredVerticalFov = (2 * Math.atan(Math.tan((16 * Math.PI) / 180) / aspect) * 180) / Math.PI;
    camera.fov = clamp(requiredVerticalFov, 34, 63.5);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  function onResize() {
    if (!renderer || !camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    updateCameraProjection();
    computeSafeArea();
    Object.values(labelCache).forEach((cached) => {
      cached.width = cached.el.offsetWidth || 180;
      cached.height = cached.el.offsetHeight || 38;
    });
  }

  /* ---------------------------------------------------------
     Animation
     --------------------------------------------------------- */

  function updateCamera(dt) {
    if (state.autoRotate && state.introDone && !state.dragging && !state.pinching) {
      cameraRig.tAz += dt * 0.085;
    }

    const smoothing = 1 - Math.exp(-7.5 * dt);
    cameraRig.az += (cameraRig.tAz - cameraRig.az) * smoothing;
    cameraRig.polar += (cameraRig.tPolar - cameraRig.polar) * smoothing;
    cameraRig.radius += (cameraRig.tRadius - cameraRig.radius) * smoothing;

    const fitRadius = cameraRig.radius + state.viewFit * 2.7;
    const fitTargetY = cameraRig.target.y + state.viewFit * 0.26;
    const sinPolar = Math.sin(cameraRig.polar);
    camera.position.set(
      cameraRig.target.x + fitRadius * sinPolar * Math.sin(cameraRig.az),
      fitTargetY + fitRadius * Math.cos(cameraRig.polar),
      cameraRig.target.z + fitRadius * sinPolar * Math.cos(cameraRig.az)
    );
    camera.lookAt(cameraRig.target.x, fitTargetY, cameraRig.target.z);

    const degrees = ((cameraRig.az * 180) / Math.PI) % 360;
    const normalized = degrees < 0 ? degrees + 360 : degrees;
    dom.orbitReadout.textContent = `${String(Math.round(normalized)).padStart(3, "0")}°`;
    dom.zoomReadout.textContent = fitRadius.toFixed(1);
  }

  function updateExplode(dt) {
    PARTS.forEach((part) => {
      const target = state.target[part.id] ? 1 : 0;
      let progress = state.progress[part.id];

      // Frame-rate independent easing. This stays smooth on 120 Hz screens
      // and still completes in ~1.2 s when a low-power GPU drops frames.
      const speed = target > progress ? 5.6 : 6.4;
      progress += (target - progress) * (1 - Math.exp(-speed * dt));

      if (Math.abs(target - progress) < 0.00035) {
        progress = target;
      }

      state.velocity[part.id] = 0;
      state.progress[part.id] = progress;

      const visual = clamp(progress, -0.03, 1.055);
      sceneParts[part.id].movables.forEach((movable) => {
        movable.object.position.copy(movable.basePos).addScaledVector(movable.offset, visual);
        if (movable.rotOffset.lengthSq() > 0) {
          movable.object.rotation.set(
            movable.baseRot.x + movable.rotOffset.x * visual,
            movable.baseRot.y + movable.rotOffset.y * visual,
            movable.baseRot.z + movable.rotOffset.z * visual
          );
        }
      });
    });
  }

  function updateStage(dt, time) {
    if (floorMaterial) floorMaterial.uniforms.uTime.value = time;
    if (platformRingGroup) platformRingGroup.rotation.y += dt * 0.035;
    if (particleField) {
      particleField.rotation.y -= dt * 0.008;
      particleFieldTwo.rotation.y += dt * 0.012;
    }

    const revealEase = smoothstep(0, 1, state.reveal);
    const hover = reduceMotion ? 0 : Math.sin(time * 0.72) * 0.035;
    droneGroup.position.y = hover - (1 - revealEase) * 0.62;
    droneGroup.rotation.z = reduceMotion ? 0 : Math.sin(time * 0.5) * 0.006;
    droneGroup.rotation.y = -0.2 * (1 - revealEase);

    if (!state.introDone) {
      const elapsed = (performance.now() - state.introStart) / 1000;
      const percent = Math.min(100, Math.round(clamp(elapsed / 1.65, 0, 1) * 100));
      if (dom.introPercent.textContent !== String(percent).padStart(2, "0")) {
        dom.introPercent.textContent = String(percent).padStart(2, "0");
        dom.introBar.style.width = `${percent}%`;
        if (percent < 40) dom.introStatus.textContent = "正在生成程序化结构";
        else if (percent < 72) dom.introStatus.textContent = "校准双摄影像系统";
        else if (percent < 96) dom.introStatus.textContent = "建立部件交互索引";
        else dom.introStatus.textContent = "结构模型就绪";
      }

      if (percent >= 100 && elapsed > 1.95) {
        finishIntro();
      }
    } else {
      state.reveal = clamp((performance.now() - state.revealStart) / 1350, 0, 1);
    }

    const fitTarget = state.allExploded ? 1 : 0;
    state.viewFit += (fitTarget - state.viewFit) * (1 - Math.exp(-3.2 * dt));

    const propSpeed = reduceMotion ? 0 : state.selected === "props" || state.target.props ? 0.22 : 0.82;
    spinners.forEach((spinner, index) => {
      spinner.object.rotation.y += dt * propSpeed * spinner.direction * (1 + index * 0.03);
    });
    spinDiscs.forEach((disc, index) => {
      disc.material.opacity = 0.018 + Math.min(0.03, propSpeed * 0.004) + Math.sin(time * 2 + index) * 0.005;
    });

    outlineMaterials.selected.opacity = 0.8 + Math.sin(time * 3.1) * 0.12;
    sceneParts &&
      Object.values(sceneParts).forEach((part) => {
        if (state.selected && state.progress[state.selected] !== undefined) {
          // Selected outlines breathe more visibly.
          part.outlines.forEach(({ mesh, baseScale }) => {
            if (mesh.visible && mesh.material === outlineMaterials.selected) {
              mesh.scale.setScalar(baseScale + 0.006 + Math.sin(time * 3.1) * 0.005);
            } else {
              mesh.scale.setScalar(baseScale);
            }
          });
        }
      });
  }

  function finishIntro() {
    if (state.introDone) return;
    state.introDone = true;
    state.introStart = performance.now();
    state.revealStart = performance.now() - 140;
    dom.introBar.style.width = "100%";
    dom.introPercent.textContent = "100";
    dom.introStatus.textContent = "结构模型就绪";
    setTimeout(() => dom.intro.classList.add("is-done"), 120);
    setAutoRotate(!reduceMotion);
    if (reduceMotion) state.reveal = 1;
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    const time = clock.elapsedTime;

    updateStage(dt, time);
    updateExplode(dt);
    updateCamera(dt);
    scene.updateMatrixWorld(true);
    updateSelectionHalo(time);
    updateLabels(time);
    updateMeter();

    renderer.render(scene, camera);
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */

  function boot() {
    try {
      initRenderer();
      initScene();
      buildInventory();
      buildLabels();
      setupPointerControls();
      setupUI();
      computeSafeArea();
      refreshUI();
      renderDetail(false);
      dom.introBar.style.width = "0%";

      if (reduceMotion) {
        setTimeout(finishIntro, 220);
      }

      // Guarantee that the intro clears even if requestAnimationFrame is
      // throttled (background tab, low-power GPU or headless capture).
      setTimeout(finishIntro, 2550);

      // Direct-link teardown / part states used for capture and deep linking.
      const params = new URLSearchParams(window.location.search);
      if (params.get("exploded") === "1") {
        SEPARABLE_PARTS.forEach((part) => {
          state.target[part.id] = true;
          state.progress[part.id] = 1;
          state.velocity[part.id] = 0;
        });
        state.allExploded = true;
        state.viewFit = 1;
        setAutoRotate(false);
        refreshUI();
      }

      const requestedPart = params.get("part");
      if (requestedPart && PART_MAP[requestedPart]) {
        state.selected = requestedPart;
        if (!PART_MAP[requestedPart].base) {
          state.target[requestedPart] = true;
          state.progress[requestedPart] = 1;
        }
        setAutoRotate(false);
        refreshUI();
      }

      animate();
    } catch (error) {
      console.error("Air 3S teardown failed to initialize:", error);
      if (dom.introStatus) {
        dom.introStatus.textContent = `三维场景初始化失败：${error.message}`;
        dom.introStatus.style.color = "#ff8b83";
      }
      if (dom.introPercent) dom.introPercent.textContent = "!!";
    }
  }

  boot();
})();
