// CONSTANTS
// -----------------------------------------------------------------------------

const AMPLITUDES_OLD = {
  30: {
    20: 0.6329162785709044,
    30: 0.6413956394030571,
    40: 0.4959053968361492,
    50: 0.36470454648566614,
    60: 0.26611422180100547,
    70: 0.2106880210457842,
  },
  45: {
    30: 0.6913082740649584,
    45: 0.6178336635675455,
    60: 0.40814966185229296,
    75: 0.2637512766651843,
    90: 0.18713049618808367,
    100: 0.1583433242220703,
  },
  60: {
    90: 0.2746515856573605,
    100: 0.2385729909602174,
    110: 0.21135206883702015,
    120: 0.1939659882572705,
    130: 0.1889887431844112,
  },
};

const AMPLITUDES_GLOSSY_OLD = {
  30: {
    20: 0.19519963262930745,
    30: 0.14585349794238683,
    40: 0.10949684499314123,
    50: 0.14333827160493828,
    60: 0.12908312757201648,
    70: 0.08848008804201367,
  },
  45: {
    30: 0.3045764114488478,
    45: 0.25160654091683826,
    60: 0.18813447619390103,
    75: 0.16698106995884768,
    90: 0.11375154193974496,
    100: 0.07663581181003455,
  },
  60: {
    90: 0.34636763919490754,
    100: 0.26469135802469146,
    110: 0.182875171467764,
    120: 0.12165340649291269,
    130: 0.08334681549586292,
  },
};

const AMPLITUDES = {
  30: {
    20: 0.5999248178350449,
    30: 0.5999248178350449,
    40: 0.5999248178350449,
    50: 0.4944317431285882,
    60: 0.3634959101762943,
    70: 0.2611431184270691,
  },
  45: {
    30: 0.5999203069051474,
    45: 0.5999203069051474,
    60: 0.5559197683279986,
    75: 0.3559727378956458,
    90: 0.21714928054101962,
    100: 0.15615543475192925,
  },
  60: {
    90: 0.3105957018747142,
    100: 0.23482194787379973,
    110: 0.17454767057867193,
    120: 0.13465046994868674,
    130: 0.10600296702738403,
  },
};

const AMPLITUDES_GLOSSY = {
  30: {
    20: 0.22277650764619214,
    30: 0.29852771366404873,
    40: 0.3386651009713519,
    50: 0.2450480109739369,
    60: 0.18031219834374845,
    70: 0.11370003443467853,
  },
  45: {
    30: 0.49974948821047,
    45: 0.6607601777834736,
    60: 0.6999052704721569,
    75: 0.5248380429812529,
    90: 0.3026066961337195,
    100: 0.1774946976240071,
  },
  60: {
    90: 0.18289410150891627,
    100: 0.15795775034293558,
    110: 0.12901941777168113,
    120: 0.09472029670273843,
    130: 0.07004962022887055,
  },
};

LIGHT_INTENSITY_MATTE = {
  30: {
    20: 0.85,
    30: 0.86,
    40: 0.9,
    50: 0.9,
    60: 0.92,
    70: 1,
  },
  45: {
    30: 0.64,
    45: 0.67,
    60: 0.72,
    75: 0.73,
    90: 0.83,
    100: 1,
  },
  60: {
    90: 0.6,
    100: 0.64,
    110: 0.72,
    120: 0.84,
    130: 1,
  },
};

const LIGHT_INTENSITY_GLOSSY = {
  30: {
    20: 0.95,
    30: 0.94,
    40: 0.99,
    50: 0.92,
    60: 0.86,
    70: 0.86,
  },
  45: {
    30: 0.70,
    45: 0.82,
    60: 0.97,
    75: 0.99,
    90: 0.93,
    100: 0.87,
  },
  60: {
    90: 0.94,
    100: 0.95,
    110: 0.95,
    120: 0.94,
    130: 1,
  },
};

const OTHER_AMPLITUDES = {
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
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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
  scene.background = DARKGRAY;

  // add all the lights, they start out: visible = false;
  for (let i = 0; i < MATHEMATICALIGHTS.length; i += 1) {
    scene.add(MATHEMATICALIGHTS[i]);
  }
  scene.add(MATLABLIGHT);
  for (let i = 0; i < DIRECTIONALLIGHTS.list.length; i += 1) {
    scene.add(DIRECTIONALLIGHTS.list[i]);
  }

  scene.add(MESH);
  scene.add(DISK);
  scene.add(PIP);
  scene.add(CAMERA);

  return scene;
})();

const RENDERER = (() => {
  const renderer = new THREE.WebGLRenderer({
    powerPreference: 'high-performance',
  });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.gammaFactor = GAMMA;
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

function setMathematicaLightsVisibility(value) {
  for (let i = 0; i < MATHEMATICALIGHTS.length; i += 1) {
    MATHEMATICALIGHTS[i].visible = value;
  }
}

function setMeshGeometryVerticesIndices(vertices, indices) {
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

function getSurfaceDataList(numSets = 1) {
  const choices = Object.entries(CHOICE);
  const materials = Object.entries(MATERIALS);

  const surfaceDataList = [];
  const testDataList = [];
  // for each surface slant
  for (let i = 0; i < numSets; i += 1) {
    for (let surfaceIndex = 0; surfaceIndex < SURFACESLANTS.length; surfaceIndex += 1) {
      // choice
      for (let choiceIndex = 0; choiceIndex < choices.length; choiceIndex += 1) {
        // material
        for (let materialIndex = 0; materialIndex < materials.length; materialIndex += 1) {
          // directional light slants

          for (let lightSlantIndex = 0;
            lightSlantIndex < DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]].length;
            lightSlantIndex += 1) {
            // pretest and test image surface data
            const seed = getRandomSeed();
            const testData = {
              seed,
              choice: choices[choiceIndex][1],
              material: materials[materialIndex][1],
              light: LIGHTS.DIRECTIONAL,
              lightSlant: DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]][lightSlantIndex],
              surfaceSlant: SURFACESLANTS[surfaceIndex],
            };
            // different amplitude values for different materials
            let amplitude;
            if (testData.material === MATERIALS.MATTE) {
              amplitude = AMPLITUDES[testData.surfaceSlant][testData.lightSlant];
              testData.lightIntensity = LIGHT_INTENSITY_MATTE[testData.surfaceSlant][testData.lightSlant];
            } else {
              amplitude = AMPLITUDES_GLOSSY[testData.surfaceSlant][testData.lightSlant];
              testData.lightIntensity = LIGHT_INTENSITY_GLOSSY[testData.surfaceSlant][testData.lightSlant];
            }

            const surfaceData = getSurfaceData(seed,
              testData.choice, amplitude);
            surfaceDataList.push(surfaceData);
            testDataList.push(testData);
          }
        }
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
