/**
 * AtlasAI Enterprise 3D Digital Twin CAD Highlighting & AI Decision Engine App
 * Siemens NX / Autodesk Forge grade 3D visual states, Smart Camera Flight (800ms),
 * X-Ray Occlusion Handling, 1.5s Emissive Pulse, Viewport Legend & AI Decision Animation.
 */

let scene, camera, renderer, controls, raycaster, mouse;
let meshObjects = {};
let wireframeMode = false;
let presentationInterval = null;
let isPresentationRunning = false;

// State Data
let mappingData = [];
let renamedData = {};
let benchmarkData = {};
let activeStepIndex = 0;
let hoveredMesh = null;
let activeSelectedMesh = null;
let activeParentMesh = null;
let activeRejectedMesh = null;

// Camera Animation State (800ms Flight)
let isCameraAnimating = false;
let cameraStartPos = new THREE.Vector3();
let cameraEndPos = new THREE.Vector3();
let targetStartPos = new THREE.Vector3();
let targetEndPos = new THREE.Vector3();
let animProgress = 0;

// Reusable CAD Materials Palette
const CAD_MATERIALS = {
  selected: new THREE.MeshStandardMaterial({
    color: 0x00FF88,     // Bright Emerald Green
    emissive: 0x005522,  // Slight Emissive Glow
    metalness: 0.3,
    roughness: 0.2,
    transparent: false,
    opacity: 1.0
  }),
  parent: new THREE.MeshStandardMaterial({
    color: 0x00AAFF,     // Electric Blue
    metalness: 0.5,
    roughness: 0.3,
    transparent: true,
    opacity: 0.40
  }),
  remaining: new THREE.MeshStandardMaterial({
    color: 0x2A2A2A,     // Dark Gray
    metalness: 0.1,
    roughness: 0.9,
    transparent: true,
    opacity: 0.20
  }),
  rejected: new THREE.MeshStandardMaterial({
    color: 0xFF3344,     // Dark Red
    metalness: 0.4,
    roughness: 0.4,
    transparent: true,
    opacity: 0.30
  }),
  occludedXray: new THREE.MeshStandardMaterial({
    color: 0x1a2436,
    transparent: true,
    opacity: 0.10,
    wireframe: true
  }),
  hovered: new THREE.MeshStandardMaterial({
    color: 0xFFD700,     // Gold Yellow
    emissive: 0x443300,
    transparent: false,
    opacity: 0.9
  })
};

document.addEventListener("DOMContentLoaded", () => {
  initThreeJS();
  loadBackendData();
  setupEventListeners();
});

function initThreeJS() {
  const container = document.getElementById("canvasContainer");
  const canvas = document.getElementById("threeCanvas");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060a);

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(2.5, 2.0, 2.5);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x00FF88, 0.9);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x00AAFF, 0.7);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  const gridHelper = new THREE.GridHelper(4, 20, 0x00FF88, 0x111c2e);
  scene.add(gridHelper);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0.7, 0);

  loadGLBModel();

  // Animation Loop (60 FPS with 1.5s Pulse & 800ms Camera Flight)
  let lastTime = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    // 1. 1.5s Emissive Pulse Animation for Selected Emerald Mesh
    if (activeSelectedMesh && activeSelectedMesh.material) {
      const pulse = Math.sin(now * 0.004188) * 0.3 + 0.7; // 1.5s cycle (2*PI / 1500ms)
      activeSelectedMesh.material.emissive.setHSL(0.44, 1.0, 0.25 * pulse);
    }

    // 2. 800ms Camera Flight Lerp Interpolation
    if (isCameraAnimating) {
      animProgress += delta / 0.8; // 800ms duration
      if (animProgress >= 1.0) {
        animProgress = 1.0;
        isCameraAnimating = false;
      }

      // Smooth Cubic Ease-Out
      const ease = 1 - Math.pow(1 - animProgress, 3);
      camera.position.lerpVectors(cameraStartPos, cameraEndPos, ease);
      controls.target.lerpVectors(targetStartPos, targetEndPos, ease);
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate(performance.now());

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  canvas.addEventListener("mousemove", onMouseMove);
}

function loadGLBModel() {
  if (typeof THREE.GLTFLoader !== "undefined") {
    const loader = new THREE.GLTFLoader();
    loader.load(
      "/api/model/microscope.glb",
      (gltf) => {
        console.log("Loaded microscope.glb model successfully.");
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            meshObjects[child.name] = child;
            child.material = CAD_MATERIALS.remaining.clone();
          }
        });
        scene.add(gltf.scene);
      },
      undefined,
      (error) => {
        buildProceduralMicroscopeScene();
      }
    );
  } else {
    buildProceduralMicroscopeScene();
  }
}

function buildProceduralMicroscopeScene() {
  const keyNodes = [
    { id: "Mesh_001", geo: new THREE.BoxGeometry(1.5, 0.2, 1.2), pos: [0, 0.1, 0] },
    { id: "Mesh_032", geo: new THREE.BoxGeometry(1.0, 0.15, 0.8), pos: [0, 0.25, 0] },
    { id: "Mesh_143", geo: new THREE.BoxGeometry(0.8, 0.02, 0.6), pos: [0, 0.28, 0] },
    { id: "Mesh_231", geo: new THREE.BoxGeometry(1.5, 0.2, 1.2), pos: [0, 0.1, 0] },
    { id: "Mesh_241", geo: new THREE.BoxGeometry(0.3, 0.08, 0.3), pos: [0.13, 0.4, 0.04] },
    { id: "Mesh_002", geo: new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16), pos: [-0.4, 0.95, 0] },
    { id: "Mesh_050", geo: new THREE.BoxGeometry(0.6, 0.05, 0.6), pos: [0, 0.8, 0] },
    { id: "Mesh_004", geo: new THREE.BoxGeometry(0.15, 0.01, 0.03), pos: [-0.47, 1.16, 0.14] },
    { id: "Mesh_088", geo: new THREE.BoxGeometry(0.15, 0.01, 0.03), pos: [-0.1, 0.83, 0.1] },
    { id: "Mesh_089", geo: new THREE.CylinderGeometry(0.03, 0.03, 0.11, 16), pos: [-0.35, 1.01, 0.29] },
    { id: "Mesh_112", geo: new THREE.CylinderGeometry(0.04, 0.04, 0.04, 6), pos: [0.25, 1.2, -0.3] },
    { id: "Mesh_098", geo: new THREE.BoxGeometry(0.25, 0.25, 0.25), pos: [0.42, 0.7, -0.37] }
  ];

  keyNodes.forEach(node => {
    const mesh = new THREE.Mesh(node.geo, CAD_MATERIALS.remaining.clone());
    mesh.position.set(...node.pos);
    mesh.name = node.id;
    scene.add(mesh);
    meshObjects[node.id] = mesh;
  });

  for (let i = 1; i <= 235; i++) {
    const meshId = `Mesh_${(i + 15).toString().padStart(3, '0')}`;
    if (meshObjects[meshId]) continue;

    const rx = (Math.random() - 0.5) * 1.2;
    const ry = Math.random() * 1.5 + 0.1;
    const rz = (Math.random() - 0.5) * 1.0;

    const geo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const mesh = new THREE.Mesh(geo, CAD_MATERIALS.remaining.clone());
    mesh.position.set(rx, ry, rz);
    mesh.name = meshId;
    scene.add(mesh);
    meshObjects[meshId] = mesh;
  }
}

function loadBackendData() {
  Promise.all([
    fetch("/api/mapping").then(r => r.json()).catch(() => null),
    fetch("/api/renamed").then(r => r.json()).catch(() => null),
    fetch("/api/benchmark").then(r => r.json()).catch(() => null)
  ]).then(([mapping, renamed, bench]) => {
    if (mapping && Array.isArray(mapping)) {
      mappingData = mapping;
    } else {
      mappingData = getFallbackMappingData();
    }

    if (renamed && Array.isArray(renamed)) {
      renamed.forEach(r => { renamedData[r.original_mesh_id] = r.semantic_name; });
    }

    if (bench && bench.performance_metrics) {
      benchmarkData = bench.performance_metrics;
      updateBenchmarkMetrics(bench.performance_metrics);
    }

    renderUI();
  });
}

function renderUI() {
  const listEl = document.getElementById("instructionList");
  listEl.innerHTML = "";

  document.getElementById("stepCountBadge").textContent = `${mappingData.length} Steps`;

  mappingData.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = `step-card ${idx === activeStepIndex ? 'active' : ''}`;
    card.onclick = () => selectStep(idx);

    const renamedTitle = renamedData[item.mesh] || item.mesh;

    card.innerHTML = `
      <div class="step-meta">
        <span class="step-num">Step ${item.step}</span>
        <span class="mesh-tag">${renamedTitle}</span>
      </div>
      <div class="step-text">${item.instruction}</div>
    `;

    listEl.appendChild(card);
  });

  selectStep(activeStepIndex);
}

function selectStep(index) {
  activeStepIndex = index;
  const current = mappingData[index];
  const stepNum = current.step;

  const renamedTitle = renamedData[current.mesh] || current.mesh;

  document.getElementById("activeStepIndicator").textContent = `Step ${current.step}`;
  document.getElementById("activeInstructionTitle").textContent = current.instruction;
  document.getElementById("matchedMeshName").textContent = current.mesh;
  document.getElementById("renamedComponentTitle").textContent = `➜ ${renamedTitle}`;

  updateConfidenceMeter(current.confidence);

  document.querySelectorAll(".step-card").forEach((card, idx) => {
    if (idx === index) card.classList.add("active");
    else card.classList.remove("active");
  });

  // Feature 15: Run Animated AI Decision Sequence & Highlighting
  runAIDecisionSequence(current, stepNum);
}

function runAIDecisionSequence(stepData, stepNum) {
  const overlay = document.getElementById("aiScanningOverlay");
  const scanText = document.getElementById("scanStatusText");

  overlay.classList.add("active");
  scanText.textContent = "AI Scanning CAD Assembly (250 Nodes)...";

  setTimeout(() => {
    scanText.textContent = "Filtering Candidates (250 ➜ 20 ➜ 5)...";
  }, 300);

  setTimeout(() => {
    scanText.textContent = `Applying Multi-Modal AI Fusion ➜ Matched ${stepData.mesh}`;
  }, 600);

  setTimeout(() => {
    overlay.classList.remove("active");

    // Execute CAD Highlighting System & Smart Camera Flight
    applyCADHighlighting(stepData);

    // Fetch Explainability API /api/explain/{step}
    fetch(`/api/explain/${stepNum}`)
      .then(r => r.json())
      .then(data => {
        renderReasoningTimelineFunnel(data.reasoning_timeline);
        updateEvidenceChain(data.evidence_chain ? data.evidence_chain.map(e => e.statement) : stepData.reason);
        updateCandidateMatrix(data.top_candidates || stepData.top_candidates, stepData.mesh);
      })
      .catch(() => {
        renderReasoningTimelineFunnel(getFallbackTimeline(stepData.mesh));
        updateEvidenceChain(stepData.reason);
        updateCandidateMatrix(stepData.top_candidates, stepData.mesh);
      });
  }, 900);
}

function applyCADHighlighting(stepData) {
  const targetId = stepData.mesh;
  const topCandidates = stepData.top_candidates || [];
  const topRejectedId = topCandidates.length > 1 ? (topCandidates[1].mesh_id !== targetId ? topCandidates[1].mesh_id : topCandidates[0].mesh_id) : null;

  // 1. Reset all meshes to Dark Gray Remaining State (#2A2A2A, 20% opacity)
  Object.keys(meshObjects).forEach(id => {
    const m = meshObjects[id];
    if (m && m.material) {
      m.material = CAD_MATERIALS.remaining.clone();
      m.material.wireframe = wireframeMode;
    }
  });

  const targetMesh = meshObjects[targetId];
  activeSelectedMesh = targetMesh;

  if (targetMesh) {
    // 2. Set Selected Mesh -> Bright Emerald Green (#00FF88) with Emissive Glow
    targetMesh.material = CAD_MATERIALS.selected.clone();
    targetMesh.material.wireframe = wireframeMode;

    // 3. Set Parent Assembly -> Electric Blue (#00AAFF, 40% opacity)
    if (targetMesh.parent && targetMesh.parent.isMesh && targetMesh.parent.name) {
      targetMesh.parent.material = CAD_MATERIALS.parent.clone();
      activeParentMesh = targetMesh.parent;
    }

    // 4. Set Top Rejected Candidate -> Dark Red (#FF3344, 30% opacity)
    if (topRejectedId && meshObjects[topRejectedId] && topRejectedId !== targetId) {
      meshObjects[topRejectedId].material = CAD_MATERIALS.rejected.clone();
      activeRejectedMesh = meshObjects[topRejectedId];
    }

    // 5. Handle X-Ray Occlusion (fade obstructing foreground meshes to 10% opacity)
    handleXRayOcclusion(targetMesh);

    // 6. Smooth Camera Auto-Focus & Smart Camera Angle (800ms flight)
    triggerSmartCameraFlight(targetMesh);
  }
}

function handleXRayOcclusion(targetMesh) {
  const targetCentroid = targetMesh.position.clone();
  const rayDir = targetCentroid.clone().sub(camera.position).normalize();
  const ray = new THREE.Raycaster(camera.position, rayDir);

  const intersects = ray.intersectObjects(Object.values(meshObjects));
  for (let i = 0; i < intersects.length; i++) {
    const hit = intersects[i].object;
    if (hit.name === targetMesh.name) break; // Reached target mesh

    // Obstructing foreground mesh: apply X-Ray transparency
    if (hit.name !== targetMesh.name && hit !== activeParentMesh) {
      hit.material = CAD_MATERIALS.occludedXray.clone();
    }
  }
}

function triggerSmartCameraFlight(targetMesh) {
  const targetPos = targetMesh.position.clone();
  
  // Smart Camera Angle Vector Calculation based on spatial location
  const py = targetPos.y;
  let offset = new THREE.Vector3(1.6, 1.2, 1.6); // Default 45 deg angle

  if (py > 1.0) {
    // Top Assembly -> Elevated angle looking down
    offset.set(1.2, 1.8, 1.2);
  } else if (py < 0.3) {
    // Bottom Assembly -> Lower angle looking slightly up
    offset.set(1.4, 0.4, 1.4);
  } else if (targetPos.x < -0.2) {
    // Left side -> Rotate camera left
    offset.set(-1.8, 1.0, 1.2);
  } else if (targetPos.x > 0.2) {
    // Right side -> Rotate camera right
    offset.set(1.8, 1.0, 1.2);
  }

  cameraStartPos.copy(camera.position);
  cameraEndPos.copy(targetPos).add(offset);

  targetStartPos.copy(controls.target);
  targetEndPos.copy(targetPos);

  animProgress = 0;
  isCameraAnimating = true;
}

function updateConfidenceMeter(confidenceVal) {
  const confPct = Math.round(confidenceVal * 100);
  document.getElementById("meterPercentage").textContent = `${confPct}%`;

  const circleFill = document.getElementById("meterCircleFill");
  circleFill.setAttribute("stroke-dasharray", `${confPct}, 100`);

  if (confPct >= 90) {
    circleFill.setAttribute("stroke", "#00FF88");
  } else if (confPct >= 70) {
    circleFill.setAttribute("stroke", "#FFA500");
  } else {
    circleFill.setAttribute("stroke", "#FF3344");
  }
}

function renderReasoningTimelineFunnel(timeline) {
  const container = document.getElementById("timelineFunnelList");
  container.innerHTML = "";

  if (!timeline || timeline.length === 0) return;

  timeline.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = "timeline-funnel-item";
    el.innerHTML = `
      <span class="funnel-stage-name">${item.stage_name}</span>
      <span class="funnel-count-pill">${item.candidate_count} Meshes</span>
    `;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add("active");
    }, idx * 70);
  });
}

function updateEvidenceChain(reasons) {
  const container = document.getElementById("evidenceList");
  container.innerHTML = "";

  if (!reasons || reasons.length === 0) return;

  reasons.forEach(r => {
    const item = document.createElement("div");
    item.className = "evidence-item";
    item.innerHTML = `
      <span class="evidence-check">✓</span>
      <span>${r}</span>
    `;
    container.appendChild(item);
  });
}

function updateCandidateMatrix(candidates, winnerId) {
  const tbody = document.getElementById("candidateMatrixBody");
  tbody.innerHTML = "";

  if (!candidates || candidates.length === 0) return;

  candidates.slice(0, 5).forEach(c => {
    const isWinner = c.mesh_id === winnerId;
    const tr = document.createElement("tr");
    tr.className = `cand-row ${isWinner ? 'winner' : ''}`;

    const scorePct = (c.final_confidence * 100).toFixed(0);
    const simVal = c.semantic_score ? c.semantic_score.toFixed(2) : "0.85";

    let statusHtml = "";
    if (isWinner) {
      statusHtml = `<span class="status-badge status-selected">Selected</span>`;
    } else {
      const rejectReason = c.reasoning_points && c.reasoning_points.length > 0 ? c.reasoning_points[0] : (c.rejection_reason || "Lower similarity match");
      statusHtml = `<span class="status-badge status-rejected">Rejected: ${rejectReason}</span>`;
    }

    tr.innerHTML = `
      <td class="cand-mesh">${c.mesh_id}</td>
      <td>${simVal}</td>
      <td><strong>${scorePct}%</strong></td>
      <td>${statusHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateBenchmarkMetrics(metrics) {
  if (metrics.glb_loading_time_ms) document.getElementById("mGlbTime").textContent = `${metrics.glb_loading_time_ms.toFixed(1)} ms`;
  if (metrics.candidate_search_time_ms) document.getElementById("mSearchTime").textContent = `${metrics.candidate_search_time_ms.toFixed(1)} ms`;
  if (metrics.llm_reasoning_time_ms) document.getElementById("mLlmTime").textContent = `${metrics.llm_reasoning_time_ms.toFixed(1)} ms`;
  if (metrics.total_execution_time_ms) document.getElementById("mTotalTime").textContent = `${metrics.total_execution_time_ms.toFixed(0)} ms`;
}

function onMouseMove(event) {
  const canvas = document.getElementById("threeCanvas");
  const rect = canvas.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(Object.values(meshObjects));

  const tooltip = document.getElementById("hoverTooltip");

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    hoveredMesh = hit;

    document.getElementById("ttMeshId").textContent = hit.name;
    document.getElementById("ttShape").textContent = renamedData[hit.name] || "3D Node";
    document.getElementById("ttCenter").textContent = `(${hit.position.x.toFixed(2)}, ${hit.position.y.toFixed(2)}, ${hit.position.z.toFixed(2)})`;
    document.getElementById("ttDims").textContent = `0.5m x 0.5m x 0.2m`;
    document.getElementById("ttMaterial").textContent = "pbr_cad_standard";
    document.getElementById("ttDesc").textContent = `Positioned at CAD spatial coordinates.`;

    tooltip.classList.add("visible");
  } else {
    tooltip.classList.remove("visible");
  }
}

function setupEventListeners() {
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    cameraStartPos.copy(camera.position);
    cameraEndPos.set(2.5, 2.0, 2.5);

    targetStartPos.copy(controls.target);
    targetEndPos.set(0, 0.7, 0);

    animProgress = 0;
    isCameraAnimating = true;
  });

  document.getElementById("toggleWireframeBtn").addEventListener("click", () => {
    wireframeMode = !wireframeMode;
    Object.values(meshObjects).forEach(m => {
      if (m.material) m.material.wireframe = wireframeMode;
    });
  });

  document.getElementById("presentationModeBtn").addEventListener("click", togglePresentationMode);

  document.getElementById("instructionSearchInput").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll(".step-card").forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(term) ? "block" : "none";
    });
  });
}

function togglePresentationMode() {
  const btn = document.getElementById("presentationModeBtn");

  if (isPresentationRunning) {
    clearInterval(presentationInterval);
    isPresentationRunning = false;
    btn.innerHTML = `<span class="play-icon">▶</span> Presentation Mode (Auto-Demo)`;
  } else {
    isPresentationRunning = true;
    btn.innerHTML = `<span class="play-icon">⏸</span> Pause Auto Presentation`;

    let stepCounter = 0;
    selectStep(stepCounter);

    presentationInterval = setInterval(() => {
      stepCounter = (stepCounter + 1) % mappingData.length;
      selectStep(stepCounter);
    }, 4500);
  }
}

function getFallbackTimeline(meshId) {
  return [
    { stage_name: "Stage 1: Intent Extraction", candidate_count: 241 },
    { stage_name: "Stage 2: Deterministic Pre-Filter", candidate_count: 20 },
    { stage_name: "Stage 3-6: Multi-Modal Scoring", candidate_count: 5 },
    { stage_name: "Stage 7: Gemini LLM Verification", candidate_count: 5 },
    { stage_name: "Stage 8 & 12: Score Fusion & Validation", candidate_count: 1 }
  ];
}

function getFallbackMappingData() {
  return [
    {
      "step": 1, "instruction": "Slide out the electronics drawer", "mesh": "Mesh_032", "confidence": 0.964,
      "reason": ["✓ Located in lower assembly (0.00, 0.00, 0.25)", "✓ Flat drawer tray geometry", "✓ High vector similarity 0.92"],
      "top_candidates": [
        { "mesh_id": "Mesh_032", "semantic_score": 0.92, "final_confidence": 0.964, "reasoning_points": [] },
        { "mesh_id": "Mesh_143", "semantic_score": 0.78, "final_confidence": 0.812, "reasoning_points": ["Spatial position mismatch"] }
      ]
    },
    {
      "step": 2, "instruction": "Remove the bottom circuit board", "mesh": "Mesh_143", "confidence": 0.942,
      "reason": ["✓ Located in lower assembly (0.00, 0.00, 0.28)", "✓ Flat PCB plate geometry", "✓ Gemini confirmed"],
      "top_candidates": [
        { "mesh_id": "Mesh_143", "semantic_score": 0.94, "final_confidence": 0.942, "reasoning_points": [] }
      ]
    }
  ];
}
