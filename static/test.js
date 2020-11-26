const NUM_VERTICES = NUM_POINTS * NUM_POINTS;
const GLCONTEXT = RENDERERCANVAS.getContext('webgl');

function clearDocumentBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function toScreenPosition(x, y, z) {
  const vector = new THREE.Vector3();

  const widthHalf = 0.5 * RENDERERCANVAS.width;
  const heightHalf = 0.5 * RENDERERCANVAS.height;

  MESH.updateMatrixWorld();
  vector.setFromMatrixPosition(MESH.matrixWorld);
  vector.x += x;
  vector.y += y;
  vector.z += z;
  vector.project(CAMERA);
  vector.x = (vector.x * widthHalf) + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;

  return {
    x: vector.x,
    y: vector.y,
  };
}

function rgbToGrayscale(r, g, b) {
  return 0.2126 * r ** GAMMA + 0.7152 * g ** GAMMA + 0.0722 * b ** GAMMA;
}

function getCanvasIntensity(x, y) {
  const pixel = new Uint8Array(4);
  GLCONTEXT.readPixels(x, y, 1, 1, GLCONTEXT.RGBA, GLCONTEXT.UNSIGNED_BYTE, pixel);
  return {
    r: pixel[0],
    g: pixel[1],
    b: pixel[2],
  };
}

function getCanvasGrayscaleIntensity(x, y, z) {
  const screenPosition = toScreenPosition(x, y, z);
  const rgb = getCanvasIntensity(screenPosition.x, screenPosition.y);
  const grayscaleIntensity = rgbToGrayscale(rgb.r, rgb.g, rgb.b);
  return grayscaleIntensity;
}

function GetMeshRMSContrast(postMatrixWorld) {
  // get average Intensity of surface
  const bufferVertices = MESH.geometry.attributes.position.array;
  const transformedVertices = [];
  let intensity = 0;
  let point = new THREE.Vector3();
  for (let i = 0; i < bufferVertices.length; i += 3) {
    point.x = bufferVertices[i];
    point.y = bufferVertices[i + 1];
    point.z = bufferVertices[i + 2];
    point.applyMatrix4(postMatrixWorld);
    intensity += getCanvasGrayscaleIntensity(point.x,
      point.y, point.z);
    if (intensity !== 0){
      console.log(intensity);
      console.log(point);
    }
    transformedVertices.push(point.x, point.y, point.z);
  }
  const averageIntensity = intensity / NUM_VERTICES;
  // computer RMS
  let sum = 0;
  for (let i = 0; i < transformedVertices.length; i += 3) {
    const curIntensity = getCanvasGrayscaleIntensity(transformedVertices[0],
      transformedVertices[1], transformedVertices[2]);
    const meanSquare = (curIntensity - averageIntensity) ** 2;
    sum += meanSquare;
  }

  const rms = Math.sqrt(sum / NUM_VERTICES);
  return rms;
}

// change positions
const seed = 1342;
const surfaceSlant = 60;
const choice = CHOICE.HILL;
const light = LIGHTS.DIRECTIONALLIGHTS;
const lightSlant = 120;
const material = MATERIALS.MATTE;
const is_pretest = false;
const amplitude = AMPLITUDES[surfaceSlant][lightSlant];

getSurfaceData(seed, choice, surfaceSlant, amplitude).then((stimulusData) => {
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
  const rmsContrast = GetMeshRMSContrast(MESH.matrixWorld);
  console.log(rmsContrast);
  RENDERER.render(SCENE, CAMERA);
  document.body.appendChild(RENDERERCANVAS);
});
