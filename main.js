// main.js
import { Vec3, Mat4, degToRad } from "./math3d.js";

/* =========================================================================
   1. CANVAS + WEBGL2
   ========================================================================= */
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2", { antialias: true });
if (!gl) throw new Error("WebGL2 tidak tersedia.");

const W = canvas.width;
const H = canvas.height;

/* =========================================================================
   2. CUBE GEOMETRY (36 vertex, warna per face)
   ========================================================================= */
const cubePositions = new Float32Array([
  // Front
  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,   0.5, 0.5, 0.5,
  -0.5,-0.5, 0.5,   0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
  // Back
   0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,
   0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5,
  // Left
  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  -0.5, 0.5, 0.5,
  -0.5,-0.5,-0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,
  // Right
   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5,
   0.5,-0.5, 0.5,   0.5, 0.5,-0.5,   0.5, 0.5, 0.5,
  // Top
  -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,   0.5, 0.5,-0.5,
  -0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,
  // Bottom
  -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,
  -0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,
]);

function solid(r, g, b, n = 6){
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++){
    out[i*3+0] = r; out[i*3+1] = g; out[i*3+2] = b;
  }
  return out;
}
const cubeColors = new Float32Array([
  ...solid(0.10, 0.95, 1.00),  // Front — cyan
  ...solid(0.20, 0.35, 1.00),  // Back — biru
  ...solid(1.00, 0.55, 0.10),  // Left — oranye
  ...solid(0.20, 1.00, 0.45),  // Right — hijau
  ...solid(1.00, 0.20, 0.85),  // Top — magenta
  ...solid(1.00, 0.92, 0.10),  // Bottom — kuning
]);

/* =========================================================================
   3. SHADERS
   ========================================================================= */
const vertexShaderSource = `#version 300 es
in vec3 a_position;
in vec3 a_color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 v_color;

void main(){
  gl_Position =
      u_projection
    * u_view
    * u_model
    * vec4(a_position, 1.0);
  v_color = a_color;
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;
in vec3 v_color;
out vec4 outColor;
void main(){
  outColor = vec4(v_color, 1.0);
}`;

function createShader(gl, type, source){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
    const info = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("Shader compile error:\n" + info);
  }
  return sh;
}
function createProgram(gl, vs, fs){
  const p = gl.createProgram();
  gl.attachShader(p, vs); gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)){
    const info = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error("Program link error:\n" + info);
  }
  return p;
}

const program = createProgram(
  gl,
  createShader(gl, gl.VERTEX_SHADER,   vertexShaderSource),
  createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource),
);

/* =========================================================================
   4. BUFFERS, ATTRIBUTES, UNIFORMS
   ========================================================================= */
const posBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);

const colBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

const aPos = gl.getAttribLocation(program, "a_position");
const aCol = gl.getAttribLocation(program, "a_color");
const uModel = gl.getUniformLocation(program, "u_model");
const uView  = gl.getUniformLocation(program, "u_view");
const uProj  = gl.getUniformLocation(program, "u_projection");

gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
gl.enableVertexAttribArray(aCol);
gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);

/* =========================================================================
   5. STATE
   ========================================================================= */
const cube = { rotationX: 22, rotationY: 34 };

const camera = {
  position: [0.0, 1.5, 4.0],
  target:   [0.0, 0.0, 0.0],
  up:       [0.0, 1.0, 0.0],
};

const projectionState = {
  mode: "perspective",
  fov:  60,
  near: 0.1,
  far:  100.0,
};

const clipPresets = [
  { near: 0.1, far: 100 },
  { near: 1.0, far: 20  },
  { near: 2.5, far: 8   },
];
let clipPresetIndex = 0;

const fovPresets = [35, 60, 90];
let fovPresetIndex = 1;

let depthEnabled  = true;
let orbitEnabled  = false;
let splitMode     = false;
let multiCube     = false;

let orbitAngle    = Math.atan2(4.0, 0.0);
let orbitRadius   = 4.0;
let orbitHeight   = 1.5;

const multiOffsets = [
  [ 1.6,  0.5,  1.5],
  [ 0.0, -0.4,  0.0],
  [-1.6,  0.4, -1.5],
];

/* =========================================================================
   6. UI REFERENCES
   ========================================================================= */
const fovSlider   = document.getElementById("fovSlider");
const camHSlider  = document.getElementById("camHSlider");
const tgtXSlider  = document.getElementById("tgtXSlider");
const tgtYSlider  = document.getElementById("tgtYSlider");

const fovOut   = document.getElementById("fovOut");
const camHOut  = document.getElementById("camHOut");
const tgtXOut  = document.getElementById("tgtXOut");
const tgtYOut  = document.getElementById("tgtYOut");

const btnProjection = document.getElementById("btnProjection");
const btnOrbit      = document.getElementById("btnOrbit");
const btnSplit      = document.getElementById("btnSplit");
const btnDepth      = document.getElementById("btnDepth");
const btnNearFar    = document.getElementById("btnNearFar");
const btnFovPreset  = document.getElementById("btnFovPreset");
const btnMulti      = document.getElementById("btnMulti");
const btnReset      = document.getElementById("btnReset");

const splitLabels = document.getElementById("splitLabels");

const projectionInfo = document.getElementById("projectionInfo");
const cameraInfo     = document.getElementById("cameraInfo");
const fovInfo        = document.getElementById("fovInfo");
const clipInfo       = document.getElementById("clipInfo");
const depthInfo      = document.getElementById("depthInfo");

/* =========================================================================
   7. HELPERS
   ========================================================================= */
function updateRangeFill(el){
  const min = parseFloat(el.min), max = parseFloat(el.max), v = parseFloat(el.value);
  const pct = ((v - min) / (max - min)) * 100;
  el.style.setProperty("--pct", pct + "%");
}

function refreshButtons(){
  btnProjection.classList.toggle("active", projectionState.mode === "orthographic");
  btnOrbit     .classList.toggle("active", orbitEnabled);
  btnSplit     .classList.toggle("active", splitMode);
  btnDepth     .classList.toggle("active", !depthEnabled);
  btnMulti     .classList.toggle("active", multiCube);
}

function syncSlidersFromState(){
  fovSlider .value = projectionState.fov;
  camHSlider.value = camera.position[1];
  tgtXSlider.value = camera.target[0];
  tgtYSlider.value = camera.target[1];
  updateRangeFill(fovSlider);
  updateRangeFill(camHSlider);
  updateRangeFill(tgtXSlider);
  updateRangeFill(tgtYSlider);
  fovOut .textContent = projectionState.fov.toFixed(0) + "°";
  camHOut.textContent = camera.position[1].toFixed(2);
  tgtXOut.textContent = camera.target[0].toFixed(2);
  tgtYOut.textContent = camera.target[1].toFixed(2);
}

/* =========================================================================
   8. MATRICES PER FRAME
   ========================================================================= */
function createModelMatrix(){
  const rx = Mat4.rotationX(degToRad(cube.rotationX));
  const ry = Mat4.rotationY(degToRad(cube.rotationY));
  return Mat4.multiply(rx, ry);
}

function getCubeModels(){
  const base = createModelMatrix();
  if (!multiCube) return [base];
  return multiOffsets.map(o =>
    Mat4.multiply(Mat4.translation(o[0], o[1], o[2]), base)
  );
}

function createProjectionMatrix(aspect){
  if (projectionState.mode === "perspective"){
    return Mat4.perspective(
      degToRad(projectionState.fov),
      aspect,
      projectionState.near,
      projectionState.far,
    );
  }
  const size = 2.0;
  return Mat4.orthographic(
    -size * aspect,  size * aspect,
    -size,            size,
     projectionState.near,
     projectionState.far,
  );
}

/* =========================================================================
   9. DRAW
   ========================================================================= */
function drawCube(model, view, proj){
  gl.uniformMatrix4fv(uModel, false, model);
  gl.uniformMatrix4fv(uView,  false, view);
  gl.uniformMatrix4fv(uProj,  false, proj);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

/* =========================================================================
   10. UPDATE
   ========================================================================= */
function updateCube(dt){
  cube.rotationX += 25 * dt;
  cube.rotationY += 40 * dt;
}

const keys = {};
const CAM_SPEED = 2.0;

function updateCamera(dt){
  if (keys["arrowleft"])  camera.position[0] -= CAM_SPEED * dt;
  if (keys["arrowright"]) camera.position[0] += CAM_SPEED * dt;
  if (keys["arrowup"])    camera.position[1] += CAM_SPEED * dt;
  if (keys["arrowdown"])  camera.position[1] -= CAM_SPEED * dt;
  if (keys["w"]) camera.position[2] -= CAM_SPEED * dt;
  if (keys["s"]) camera.position[2] += CAM_SPEED * dt;
  if (keys["pageup"])     camera.position[1] += CAM_SPEED * dt;
  if (keys["pagedown"])   camera.position[1] -= CAM_SPEED * dt;

  if (keys["j"]) camera.target[0] -= CAM_SPEED * dt * 0.5;   // target X -
  if (keys["l"]) camera.target[0] += CAM_SPEED * dt * 0.5;   // target X +
  if (keys["i"]) camera.target[1] += CAM_SPEED * dt * 0.5;   // target Y +
  if (keys["k"]) camera.target[1] -= CAM_SPEED * dt * 0.5;   // target Y -
}

function updateFOV(dt){
  const fovSpeed = 35.0;
  if (keys["["]) projectionState.fov -= fovSpeed * dt;
  if (keys["]"]) projectionState.fov += fovSpeed * dt;
  projectionState.fov = Math.max(30, Math.min(110, projectionState.fov));
}

function updateOrbit(dt){
  if (!orbitEnabled) return;
  orbitAngle += dt * 0.9;

  orbitRadius = Math.hypot(
    camera.position[0] - camera.target[0],
    camera.position[2] - camera.target[2],
  );
  if (orbitRadius < 0.3) orbitRadius = 0.3;
  orbitHeight = camera.position[1];

  camera.position[0] = camera.target[0] + Math.cos(orbitAngle) * orbitRadius;
  camera.position[2] = camera.target[2] + Math.sin(orbitAngle) * orbitRadius;
  camera.position[1] = orbitHeight;
}

/* =========================================================================
   11. HUD
   ========================================================================= */
function updateHUD(){
  const proj = splitMode
    ? "perspective | orthographic"
    : projectionState.mode;
  projectionInfo.textContent = proj;

  cameraInfo.textContent =
    `(${camera.position[0].toFixed(2)}, ` +
    `${camera.position[1].toFixed(2)}, ` +
    `${camera.position[2].toFixed(2)})`;

  fovInfo.textContent = projectionState.fov.toFixed(1) + "°";

  clipInfo.textContent =
    `${projectionState.near.toFixed(1)} / ${projectionState.far.toFixed(0)}`;

  depthInfo.textContent = depthEnabled ? "ON" : "OFF";
}

/* =========================================================================
   12. RENDER LOOP
   ========================================================================= */
let lastTime = 0;

function render(time){
  const t = time * 0.001;
  let dt = (time - lastTime) * 0.001;
  lastTime = time;
  if (!isFinite(dt) || dt < 0) dt = 0;
  dt = Math.min(dt, 0.05);

  updateCube(dt);
  updateOrbit(dt);
  updateCamera(dt);
  updateFOV(dt);

  if (depthEnabled) gl.enable(gl.DEPTH_TEST);
  else              gl.disable(gl.DEPTH_TEST);

  gl.clearColor(0.008, 0.030, 0.018, 1.0);

  const models = getCubeModels();
  const view = Mat4.lookAt(camera.position, camera.target, camera.up);

  if (splitMode){
    const half = Math.floor(W / 2);

    gl.enable(gl.SCISSOR_TEST);

    // LEFT — Perspective
    gl.viewport(0, 0, half, H);
    gl.scissor(0, 0, half, H);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const aspectL = half / H;
    const projL = Mat4.perspective(
      degToRad(projectionState.fov),
      aspectL,
      projectionState.near,
      projectionState.far,
    );
    for (const m of models) drawCube(m, view, projL);

    // RIGHT — Orthographic
    const rightW = W - half;
    gl.viewport(half, 0, rightW, H);
    gl.scissor(half, 0, rightW, H);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const aspectR = rightW / H;
    const size = 2.0;
    const projR = Mat4.orthographic(
      -size * aspectR,  size * aspectR,
      -size,             size,
       projectionState.near,
       projectionState.far,
    );
    for (const m of models) drawCube(m, view, projR);

    gl.disable(gl.SCISSOR_TEST);
  } else {
    gl.viewport(0, 0, W, H);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = W / H;
    const proj = createProjectionMatrix(aspect);
    for (const m of models) drawCube(m, view, proj);
  }

  syncSlidersFromState();
  updateHUD();

  requestAnimationFrame(render);
}

/* =========================================================================
   13. INPUT
   ========================================================================= */
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (e.key.startsWith("Arrow") ||
      e.key === "PageUp" || e.key === "PageDown" || e.key === " "){
    e.preventDefault();
  }

  if (e.repeat) return;

  switch (k){
    case "o": toggleProjection();   break;
    case "b": toggleOrbit();        break;
    case "x": toggleSplit();        break;
    case "d": toggleDepth();        break;
    case "n": nextClipPreset();     break;
    case "m": toggleMulti();        break;
    case "r": resetScene();         break;
    case "1": setFovPreset(0);      break;
    case "2": setFovPreset(1);      break;
    case "3": setFovPreset(2);      break;
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function toggleProjection(){
  projectionState.mode =
    projectionState.mode === "perspective" ? "orthographic" : "perspective";
  refreshButtons();
}
function toggleOrbit(){
  orbitEnabled = !orbitEnabled;
  if (orbitEnabled){
    orbitAngle = Math.atan2(
      camera.position[2] - camera.target[2],
      camera.position[0] - camera.target[0],
    );
    orbitRadius = Math.max(0.5, Math.hypot(
      camera.position[0] - camera.target[0],
      camera.position[2] - camera.target[2],
    ));
    orbitHeight = camera.position[1];
  }
  refreshButtons();
}
function toggleSplit(){
  splitMode = !splitMode;
  splitLabels.classList.toggle("on", splitMode);
  refreshButtons();
}
function toggleDepth(){
  depthEnabled = !depthEnabled;
  refreshButtons();
}
function toggleMulti(){
  multiCube = !multiCube;
  refreshButtons();
}
function nextClipPreset(){
  clipPresetIndex = (clipPresetIndex + 1) % clipPresets.length;
  const p = clipPresets[clipPresetIndex];
  projectionState.near = p.near;
  projectionState.far  = p.far;
}
function setFovPreset(i){
  fovPresetIndex = i;
  projectionState.fov = fovPresets[i];
}
function resetScene(){
  camera.position[0] = 0.0;
  camera.position[1] = 1.5;
  camera.position[2] = 4.0;
  camera.target[0]   = 0.0;
  camera.target[1]   = 0.0;
  camera.target[2]   = 0.0;
  camera.up = [0, 1, 0];

  projectionState.mode = "perspective";
  projectionState.fov  = 60;
  projectionState.near = 0.1;
  projectionState.far  = 100.0;

  clipPresetIndex = 0;
  fovPresetIndex  = 1;

  depthEnabled = true;
  orbitEnabled = false;
  splitMode    = false;
  multiCube    = false;

  splitLabels.classList.remove("on");
  refreshButtons();
}

/* ---------- Sliders ---------- */
fovSlider.addEventListener("input", (e) => {
  projectionState.fov = parseFloat(e.target.value);
});
camHSlider.addEventListener("input", (e) => {
  camera.position[1] = parseFloat(e.target.value);
});
tgtXSlider.addEventListener("input", (e) => {
  camera.target[0] = parseFloat(e.target.value);
});
tgtYSlider.addEventListener("input", (e) => {
  camera.target[1] = parseFloat(e.target.value);
});

/* ---------- Buttons ---------- */
btnProjection.addEventListener("click", toggleProjection);
btnOrbit     .addEventListener("click", toggleOrbit);
btnSplit     .addEventListener("click", toggleSplit);
btnDepth     .addEventListener("click", toggleDepth);
btnNearFar   .addEventListener("click", nextClipPreset);
btnMulti     .addEventListener("click", toggleMulti);
btnReset     .addEventListener("click", resetScene);
btnFovPreset .addEventListener("click", () => {
  fovPresetIndex = (fovPresetIndex + 1) % fovPresets.length;
  projectionState.fov = fovPresets[fovPresetIndex];
});

/* =========================================================================
   14. INIT
   ========================================================================= */

gl.useProgram(program);  

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.viewport(0, 0, W, H);

refreshButtons();
syncSlidersFromState();
requestAnimationFrame(render);