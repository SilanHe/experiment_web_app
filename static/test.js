function clearDocumentBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

// change positions
const seed = 11435;
const surfaceSlant = 60;
const choice = CHOICE.HILL;
const light = LIGHTS.DIRECTIONALLIGHTS;
const lightSlant = 90;
const material = MATERIALS.MATTE;
const is_pretest = false;

getSurfaceData(seed, choice, surfaceSlant).then((stimulusData) => {
  clearDocumentBody();
  const disk = (() => {
    if (is_pretest) {
      return DISK;
    }
    return PIP;
  })();
  setMeshGeometryVerticesIndices(stimulusData.vertices, INDICES);
  // change material
  if (material === MATERIALS.MATTE) {
    setMeshMaterial(MATTEMATERIAL);
    MATTEMATERIAL.needsUpdate = true;
  } else {
    setMeshMaterial(GLOSSYMATERIAL);
    GLOSSYMATERIAL.needsUpdate = true;
  }
  // rotate
  MESH.rotateX(-THREE.Math.degToRad(surfaceSlant));
  MESH.geometry.computeVertexNormals();
  MESH.updateMatrixWorld();
  // set disk locations
  const x = stimulusData.vertices[stimulusData.extremaIndex];
  const y = stimulusData.vertices[stimulusData.extremaIndex + 1];
  const z = stimulusData.vertices[stimulusData.extremaIndex + 2];
  const diskLocation = new THREE.Vector3(x, y, z);
  MESH.localToWorld(diskLocation);

  if (is_pretest === true) {
    // disk position
    DISK.position.set(diskLocation.x, diskLocation.y, diskLocation.z + DISKS_DISTANCES.DISK);
    DISK.updateMatrix();
  } else {
    // pip position
    PIP.position.set(diskLocation.x, diskLocation.y, diskLocation.z + DISKS_DISTANCES.PIP);
    PIP.updateMatrix();
  }

  // make the light in question visible
  if (light === LIGHTS.MATLAB) {
    MATLABLIGHT.visible = true;
  } else if (light === LIGHTS.MATHEMATICA) {
    setMathematicaLightsVisibility(true);
  } else {
    // directional
    DIRECTIONALLIGHTS.map.get(surfaceSlant)
      .get(lightSlant)
      .visible = true;
  }

  disk.visible = true;
  RENDERER.render(SCENE, CAMERA);
  document.body.appendChild(RENDERERCANVAS);
});
