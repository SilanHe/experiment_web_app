// CONSTANTS
// -----------------------------------------------------------------------------

const AMPLITUDES = {
  30: 0.45,
  45: 0.35,
  60: 0.19,
};

const GAMMA = 2.2;

const NUM_POINTS = 350;
const RANGEMAX = 9.4;
const RANGEMIN = -9.4;
const RANGE = Math.abs(RANGEMAX - RANGEMIN);
const INCREMENT = RANGE / NUM_POINTS;

const TOTAL_NUM_POINTS = NUM_POINTS * NUM_POINTS * 3;

const LIGHT_Z_DISTANCE = 100;
const CAMERA_FOV = 20;
const CAMERA_POSITION = 53;

const INDICES = (() => {
  const faces = [];
  for (let i = 0; i < NUM_POINTS - 1; i += 1) {
    for (let j = 0; j < NUM_POINTS - 1; j += 1) {
      const a = i * NUM_POINTS + j;
      const b = a + NUM_POINTS;
      const c = a + 1;
      const d = a + 1 + NUM_POINTS;

      faces.push(a, b, c); // face one
      faces.push(c, b, d); // face two
    }
  }
  return faces;
})();

const SURFACESLANTS = [30, 45, 60];
const DIRECTIONALLIGHTSLANTS = (() => {
  const directionalLightSlants = {};
  directionalLightSlants[30] = [20, 30, 40, 50, 60, 70];
  directionalLightSlants[45] = [30, 45, 60, 75, 90, 100];
  directionalLightSlants[60] = [90, 100, 110, 120, 130];
  return directionalLightSlants;
})();

const CHOICE = {
  HILL: 'Hill',
  VALLEY: 'Valley',
};

const LIGHTS = {
  DIRECTIONAL: 'Directional',
  MATLAB: 'Matlab',
  MATHEMATICA: 'Mathematica',
};

const MATERIALS = {
  MATTE: 'Matte',
  GLOSSY: 'Glossy',
};

const DISKS = {
  DISK: 'Big',
  PIP: 'Small',
};

const DISKS_DISTANCES = {
  DISK: 2,
  PIP: 0.1,
};

// COLORS
const RED = (() => {
  const color = new THREE.Color(0xff0000);
  color.convertSRGBToLinear();
  return color;
})();

const WHITE = (() => {
  const color = new THREE.Color(0xffffff);
  color.convertSRGBToLinear();
  return color;
})();

const GLOSSYCOLOR = (() => {
  const color = new THREE.Color(0xB2B2B2);
  color.convertSRGBToLinear();
  return color;
})();

const GLOSSYSPECULAR = (() => {
  const color = new THREE.Color(0x4B4B4B);
  color.convertSRGBToLinear();
  return color;
})();

const DARKGRAY = (() => {
  const color = new THREE.Color(0x111111);
  color.convertSRGBToLinear();
  return color;
})();

const GREEN = (() => {
  const color = new THREE.Color(0x00ff00);
  color.convertSRGBToLinear();
  return color;
})();

const BLACK = (() => {
  const color = new THREE.Color(0x000000);
  color.convertSRGBToLinear();
  return color;
})();

// MATERIALS

const MATTEMATERIAL = new THREE.MeshPhongMaterial(
  {
    side: THREE.FrontSide,
    color: WHITE,
    specular: BLACK,
    shininess: 0,
  },
);

const GLOSSYMATERIAL = new THREE.MeshPhongMaterial(
  {
    side: THREE.FrontSide,
    color: GLOSSYCOLOR,
    specular: GLOSSYSPECULAR,
    shininess: 51,
  },
);

const REDMATERIAL = new THREE.MeshBasicMaterial(
  {
    color: RED,
    side: THREE.FrontSide,
  },
);

// DISK AND PIP
const DISK = (() => {
  const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 32);
  const disk = new THREE.Mesh(sphereGeometry, REDMATERIAL);
  disk.visible = false;
  return disk;
})();

const PIP = (() => {
  const sphereGeometry = new THREE.SphereGeometry(0.05, 32, 32);
  const pip = new THREE.Mesh(sphereGeometry, REDMATERIAL);
  pip.visible = false;
  return pip;
})();

// LIGHTS
const MATLABLIGHT = (() => {
  const matlabLight = new THREE.DirectionalLight(0xffffff, 1);
  // target of directional light is (0,0,0) by default
  matlabLight.position.set(LIGHT_Z_DISTANCE, 0, LIGHT_Z_DISTANCE);
  matlabLight.visible = false;
  return matlabLight;
})();

const MATHEMATICALIGHTS = (() => {
  const redDirectionLight = new THREE.DirectionalLight(0xff0000, 0.9);
  redDirectionLight.position.set(LIGHT_Z_DISTANCE, 0, LIGHT_Z_DISTANCE);
  redDirectionLight.visible = false;

  const greenDirectionLight = new THREE.DirectionalLight(0x00ff00, 0.9);
  greenDirectionLight.position.set(LIGHT_Z_DISTANCE, LIGHT_Z_DISTANCE, LIGHT_Z_DISTANCE);
  greenDirectionLight.visible = false;

  const blueDirectionLight = new THREE.DirectionalLight(0x0000ff, 0.9);
  blueDirectionLight.position.set(0, LIGHT_Z_DISTANCE, LIGHT_Z_DISTANCE);
  blueDirectionLight.visible = false;

  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  ambientLight.visible = false;

  return [redDirectionLight, greenDirectionLight, blueDirectionLight, ambientLight];
})();

const DIRECTIONALLIGHTS = (() => {
  function getDirectionalLight(lightSlant) {
    // target of directional light is (0,0,0) by default
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.visible = false;

    if (lightSlant < 90) {
      const lightY = getTanFromDegrees(lightSlant) * LIGHT_Z_DISTANCE;
      directionalLight.position.set(0, lightY, LIGHT_Z_DISTANCE);

      return directionalLight;
    } if (lightSlant === 90) {
      directionalLight.position.set(0, LIGHT_Z_DISTANCE, 0);

      return directionalLight;
    }

    const lightZ = getSinFromDegrees(lightSlant - 90) * LIGHT_Z_DISTANCE;
    directionalLight.position.set(0, LIGHT_Z_DISTANCE, -lightZ);

    return directionalLight;
  }

  const map = new Map();
  const list = [];

  map.set(30, new Map());
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[30].length; i += 1) {
    const curLight = getDirectionalLight(DIRECTIONALLIGHTSLANTS[30][i]);
    map.get(30).set(DIRECTIONALLIGHTSLANTS[30][i], curLight);
    list.push(curLight);
  }

  map.set(45, new Map());
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[45].length; i += 1) {
    const curLight = getDirectionalLight(DIRECTIONALLIGHTSLANTS[45][i]);
    map.get(45).set(DIRECTIONALLIGHTSLANTS[45][i], curLight);
    list.push(curLight);
  }

  map.set(60, new Map());
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[60].length; i += 1) {
    const curLight = getDirectionalLight(DIRECTIONALLIGHTSLANTS[60][i]);
    map.get(60).set(DIRECTIONALLIGHTSLANTS[60][i], curLight);
    list.push(curLight);
  }

  return { map, list };
})();

const AMBIENTLIGHT = (() => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  ambientLight.visible = false;
  return ambientLight;
})();

const MESHGEOMETRY = (() => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < TOTAL_NUM_POINTS; i += 1) {
    vertices.push(0.134758724358);
  }
  geometry.setIndex(INDICES);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.attributes.position.needsUpdate = true; // update flag
  return geometry;
})();

const MESH = (() => {
  const mesh = new THREE.Mesh(MESHGEOMETRY, MATTEMATERIAL);
  return mesh;
})();

const CAMERA = (() => {
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV,
    window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, CAMERA_POSITION);
  camera.lookAt(0, 0, 0);
  return camera;
})();
/**
 * Generic scene generation function with my default camera settings
 */
const SCENE = (() => {
  const scene = new THREE.Scene();
  scene.background = GREEN;

  // add all the lights, they start out: visible = false;
  for (let i = 0; i < MATHEMATICALIGHTS.length; i += 1) {
    scene.add(MATHEMATICALIGHTS[i]);
  }
  scene.add(MATLABLIGHT);
  for (let i = 0; i < DIRECTIONALLIGHTS.list.length; i += 1) {
    scene.add(DIRECTIONALLIGHTS.list[i]);
  }

  scene.add(AMBIENTLIGHT);

  scene.add(MESH);
  scene.add(DISK);
  scene.add(PIP);
  scene.add(CAMERA);

  return scene;
})();

const RENDERER = (() => {
  const renderer = new THREE.WebGLRenderer({
    powerPreference: 'high-performance',
    // gammaFactor: GAMMA,
    // outputEncoding: THREE.sRGBEncoding,
  });
  // renderer.outputEncoding = THREE.sRGBEncoding;
  // renderer.gammaOutput = true;
  renderer.physicallyCorrectLights = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
})();

const RENDERERCANVAS = (() => {
  const canvas = RENDERER.domElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.id = 'jspsych-canvas-keyboard-response-stimulus';
  return canvas;
})();

// Functions
// -----------------------------------------------------------------------------
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  CAMERA.aspect = window.innerWidth / window.innerHeight;
  CAMERA.updateProjectionMatrix();
  RENDERER.setSize(window.innerWidth, window.innerHeight);
  RENDERERCANVAS.width = window.innerWidth;
  RENDERERCANVAS.height = window.innerHeight;
}

function cloneCanvas(oldCanvas) {
  // create a new canvas
  const newCanvas = document.createElement('canvas');
  const context = newCanvas.getContext('2d');

  // set dimensions
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;

  // apply the old canvas to the new one
  context.drawImage(oldCanvas, 0, 0);

  // return the new canvas
  return newCanvas;
}

function ConvertLinearToSRGB(l) {
  normalizedL = l / 255;
  if (normalizedL >= 0 && normalizedL <= 0.0031308) {
    return 12.92 * normalizedL * 255;
  }
  return (1.055 * normalizedL ** (1 / 2.4) - 0.055) * 255;
}

function removeGreenBackground() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = Uint8ClampedArray.from(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) {
      data[i] = 17;
      data[i + 1] = 17;
      data[i + 2] = 17;
      data[i + 3] = 255;
    }
  }
}

function NormalizeContrast(ctx, targetMean, targetStd) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = Uint8ClampedArray.from(imageData.data);

  // get average intensity
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (!((data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0)
    || (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0))) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    }
  }
  r /= count;
  g /= count;
  b /= count;

  // get standard deviation of intensities
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (!((data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0)
    || (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0))) {
      sumR += (data[i] - r) ** 2;
      sumG += (data[i + 1] - g) ** 2;
      sumB += (data[i + 2] - b) ** 2;
    }
  }

  const stdR = Math.sqrt(sumR / count);
  const stdG = Math.sqrt(sumG / count);
  const stdB = Math.sqrt(sumB / count);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) {
      data[i] = 17;
      data[i + 1] = 17;
      data[i + 2] = 17;
      data[i + 3] = 255;
    } else if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
      // eslint-disable-next-line no-continue
      continue;
    } else {
      data[i] = Math.round(targetMean.r + targetStd.r * ((data[i] - r) / stdR));
      data[i + 1] = Math.round(targetMean.g + targetStd.g * ((data[i + 1] - g) / stdG));
      data[i + 2] = Math.round(targetMean.b + targetStd.b * ((data[i + 2] - b) / stdB));
    }
  }

  const newImageData = new ImageData(data, ctx.canvas.width);
  ctx.putImageData(newImageData, 0, 0);
}

function setMathematicaLightsVisibility(value) {
  for (let i = 0; i < MATHEMATICALIGHTS.length; i += 1) {
    MATHEMATICALIGHTS[i].visible = value;
  }
}

function setMeshGeometryVerticesIndices(vertices) {
  const bufferVertices = MESH.geometry.attributes.position.array;
  for (let i = 0; i < TOTAL_NUM_POINTS; i += 1) {
    bufferVertices[i] = vertices[i];
  }
  MESH.geometry.attributes.position.needsUpdate = true; // update flag
  // If you change the position data values after the initial render
  MESH.geometry.computeBoundingSphere();
  MESH.geometry.computeVertexNormals();
}

function setMeshMaterial(material) {
  MESH.material = material;
}

function resetObject(object) {
  // object.updateMatrix();
  // object.geometry.applyMatrix(object.matrix);
  object.position.set(0, 0, 0);
  object.rotation.set(0, 0, 0);
  object.scale.set(1, 1, 1);
  object.updateMatrix();
}

function getTanFromDegrees(degrees) {
  return Math.tan((degrees * Math.PI) / 180);
}

function getSinFromDegrees(degrees) {
  return Math.sin((degrees * Math.PI) / 180);
}

// range of seed from 1 - 10000, should be enough variety
function getRandomSeed() {
  return Math.floor(Math.random() * 10000);
}

function getSurfaceData(seed, choice, amplitude) {
  const surfaceDetails = {
    seed,
    choice,
  };
  return $.get('/getsurface', surfaceDetails).then((data) => {
    data.vertices = getVertices(data.heightMap, amplitude);
    return data;
  });
}

function getVertices(heightmap, amplitude) {
  const vertices = [];
  let counter = 0;
  for (let i = 0; i < NUM_POINTS; i += 1) {
    const x = RANGEMIN + INCREMENT * i;
    for (let j = 0; j < NUM_POINTS; j += 1) {
      // get point coordinates in plane's coordinate system
      // in the plane coordinate system we are using z as the height for the height map
      const y = RANGEMIN + INCREMENT * j;

      // get height map / z
      vertices.push(x, y, amplitude * heightmap[counter]);
      counter += 1;
    }
  }
  return vertices;
}

function getSurfaceDataList(numSets = 1, gammaRed, gammaGreen, gammaBlue) {
  const choices = Object.entries(CHOICE);
  const materials = Object.entries(MATERIALS);

  const surfaceDataList = [];
  const testDataList = [];
  // for each surface slant
  for (let i = 0; i < numSets; i += 1) {
    for (let surfaceIndex = 0; surfaceIndex < SURFACESLANTS.length; surfaceIndex += 1) {
      // choice
      const surfaceSlant = SURFACESLANTS[surfaceIndex];
      for (let choiceIndex = 0; choiceIndex < choices.length; choiceIndex += 1) {
        // material
        for (let materialIndex = 0; materialIndex < materials.length; materialIndex += 1) {
          // directional light slants
          const material = materials[materialIndex][1];
          for (let lightSlantIndex = 0;
            lightSlantIndex < DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]].length;
            lightSlantIndex += 1) {
            // pretest and test image surface data
            const seedDirectional = getRandomSeed();
            const lightSlant = DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]][lightSlantIndex];

            const testDataDirectional = {
              seedDirectional,
              choice: choices[choiceIndex][1],
              material,
              light: LIGHTS.DIRECTIONAL,
              lightSlant,
              surfaceSlant,
              gammaRed,
              gammaGreen,
              gammaBlue,
            };
            // different amplitude values for different materials

            const surfaceDataDirectional = getSurfaceData(seedDirectional,
              testDataDirectional.choice, AMPLITUDES[testDataDirectional.surfaceSlant]);
            surfaceDataList.push(surfaceDataDirectional);
            testDataList.push(testDataDirectional);
          }
          // matlab
          const seed = getRandomSeed();
          const testData = {
            seed,
            choice: choices[choiceIndex][1],
            material,
            light: LIGHTS.MATLAB,
            surfaceSlant,
            gammaRed,
            gammaGreen,
            gammaBlue,
          };
          const surfaceData = getSurfaceData(seed,
            testData.choice, AMPLITUDES[testData.surfaceSlant]);
          surfaceDataList.push(surfaceData);
          testDataList.push(testData);
        }
        // mathematica
        const seed = getRandomSeed();
        const testData = {
          seed,
          choice: choices[choiceIndex][1],
          material: MATERIALS.MATTE,
          light: LIGHTS.MATHEMATICA,
          surfaceSlant,
          gammaRed,
          gammaGreen,
          gammaBlue,
        };
        const surfaceData = getSurfaceData(seed,
          testData.choice, AMPLITUDES[testData.surfaceSlant]);
        surfaceDataList.push(surfaceData);
        testDataList.push(testData);
      }
    }
  }
  return [surfaceDataList, testDataList];
}

function getSurfaceInfoString(testData, additionalInfo) {
  if (testData.lightSlant) {
    return `${testData.light}_${testData.seed}_${testData.choice}_${testData.material}_${testData.surfaceSlant}_${testData.lightSlant}_${additionalInfo}`;
  }
  return `${testData.light}_${testData.seed}_${testData.choice}_${testData.material}_${testData.surfaceSlant}_${additionalInfo}`;
}
