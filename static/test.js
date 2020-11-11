// set our mesh geometry
const indices = (() => {
  const faces = [];
  for (let i = 0; i < NUM_POINTS; i += 1) {
    for (let j = 0; j < NUM_POINTS; j += 1) {
      const a = i * (NUM_POINTS + 1) + (j + 1);
      const b = i * (NUM_POINTS + 1) + j;
      const c = (i + 1) * (NUM_POINTS + 1) + j;
      const d = (i + 1) * (NUM_POINTS + 1) + (j + 1);

      // generate two faces (triangles) per iteration

      faces.push(a, b, d); // face one
      faces.push(b, c, d); // face two
    }
  }
  return faces;
})();

const COLORS = (() => {
  const colors = [];
  for (let i = 0; i < NUM_POINTS; i += 1) {
    for (let j = 0; j < NUM_POINTS; j += 1) {
      colors.push(1, 1, 1);
    }
  }
  return colors;
})();

const getGeometry = (vertices) => {
  const geometry = new THREE.BufferGeometry();
  console.log(vertices);
  console.log(COLORS);
  console.log(INDICES);
  console.log(COLORS.length);
  console.log(INDICES.length);
  geometry.setIndex(INDICES);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  // geometry.setAttribute('normal', new THREE.Float32BufferAttribute(COLORS, 3));
  // geometry.setAttribute('color', new THREE.Float32BufferAttribute(COLORS, 3));
  geometry.attributes.position.needsUpdate = true; // update flag
  MESH.geometry.computeBoundingSphere();
  MESH.geometry.computeVertexNormals();
  return geometry;
};

const getMesh = (geometry, material) => {
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
};
// change positions
const seed = 2;
const surfaceSlant = 45;
const choice = CHOICE.HILL;
const light = LIGHTS.MATLAB;
const lightSlant = 90;
const material = MATERIALS.MATTE;

const scene = new THREE.Scene();
scene.background = DARKGRAY;
// scene.add(MATLABLIGHT);
for (let i = 0; i < MATHEMATICALIGHTS.length; i += 1) {
  scene.add(MATHEMATICALIGHTS[i]);
}
setMathematicaLightsVisibility(true);

// scene.add(MESH);
scene.add(PIP);
scene.add(CAMERA);

getSurfaceData(seed, choice, surfaceSlant).then((stimulusData) => {
  const geometry = getGeometry(stimulusData.vertices);
  console.log(MATTEMATERIAL);
  const mesh = getMesh(geometry, GLOSSYMATERIAL);
  // change material
  scene.add(mesh);
  // rotate
  mesh.rotateX(-THREE.Math.degToRad(surfaceSlant));
  mesh.geometry.computeVertexNormals();
  mesh.updateMatrixWorld();
  // set disk locations
  const x = stimulusData.vertices[stimulusData.extremaIndex];
  const y = stimulusData.vertices[stimulusData.extremaIndex + 1];
  const z = stimulusData.vertices[stimulusData.extremaIndex + 2];
  const diskLocation = new THREE.Vector3(x, y, z);
  mesh.localToWorld(diskLocation);
  // disk position

  DISK.position.set(diskLocation.x, diskLocation.y, diskLocation.z + DISKS_DISTANCES.DISK);
  DISK.updateMatrix();
  // pip position
  PIP.position.set(diskLocation.x, diskLocation.y, diskLocation.z + DISKS_DISTANCES.PIP);
  PIP.updateMatrix();

  PIP.visible = true;
  RENDERER.render(scene, CAMERA);
  document.body.appendChild(RENDERERCANVAS);
});