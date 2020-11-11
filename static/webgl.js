// CONSTANTS
// -----------------------------------------------------------------------------

const NUM_POINTS = 350;
const TOTAL_NUM_POINTS = NUM_POINTS * NUM_POINTS;
const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1200;

const LIGHT_Z_DISTANCE = 100;
const CAMERA_FOV = 20;
const CAMERA_POSITION = 53;

const INDICES = (() => {
  const faces = [];
  // hacky way of generating triangles because I know how the points are split, pretty standard
  for (let i = 0; i < NUM_POINTS - 1; i += 1) {
    for (let j = 0; j < NUM_POINTS - 1; j += 1) {
      const index = i * NUM_POINTS + j;
      // counter clockwise order
      faces.push(index, index + NUM_POINTS, index + 1);
      faces.push(index + 1, index + NUM_POINTS, index + 1 + NUM_POINTS);
    }
  }
  let uint32 = new Int32Array;
  uint32 = Int32Array.from(faces);
  return new THREE.BufferAttribute(uint32, 3);
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
  const color = new THREE.Color(0x000000);
  color.convertSRGBToLinear();
  return color;
})();

const GLOSSYCOLOR = (() => {
  const color = new THREE.Color(0xB2B2B2);
  color.convertSRGBToLinear();
  return color;
})();

const GLOSSYSPECULAR = (() => {
  const color = new THREE.Color(0x202020);
  color.convertSRGBToLinear();
  return color;
})();

const DARKGRAY = (() => {
  const color = new THREE.Color(0x111111);
  color.convertSRGBToLinear();
  return color;
})();

// MATERIALS

const MATTEMATERIAL = new THREE.MeshPhongMaterial(
  {
    side: THREE.FrontSide,
    color: WHITE,
    specular: WHITE,
    shininess: 0,
  },
);

const GLOSSYMATERIAL = new THREE.MeshPhongMaterial(
  {
    side: THREE.FrontSide,
    color: GLOSSYCOLOR,
    specular: GLOSSYSPECULAR,
    shininess: 18,
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

  const map = {};
  const list = [];

  map[30] = {};
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[30].length; i += 1) {
    const curLight = getDirectionalLight(DIRECTIONALLIGHTSLANTS[30][i]);
    map[30][i] = curLight;
    list.push(curLight);
  }

  map[45] = {};
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[45].length; i += 1) {
    const curLight = getDirectionalLight(DIRECTIONALLIGHTSLANTS[45][i]);
    map[45][i] = curLight;
    list.push(curLight);
  }

  map[60] = {};
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[60].length; i += 1) {
    const curLight = getDirectionalLight(DIRECTIONALLIGHTSLANTS[60][i]);
    map[60][i] = curLight;
    list.push(curLight);
  }

  return { map, list };
})();

const MESHGEOMETRY = (() => {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(TOTAL_NUM_POINTS * 3);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
})();

const MESH = (() => {
  const mesh = new THREE.Mesh(MESHGEOMETRY, MATTEMATERIAL);
  return mesh;
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

  // add the disk and pip
  scene.add(MESH);
  scene.add(DISK);
  scene.add(PIP);

  return scene;
})();

const CAMERA = (() => {
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, WINDOW_WIDTH / WINDOW_HEIGHT, 0.1, 1000);
  camera.position.set(0, 0, CAMERA_POSITION);
  camera.lookAt(0, 0, 0);
  return camera;
})();

// create the one canvas we are using to preload
const CANVAS = (() => {
  const canvas = document.createElement('canvas');
  canvas.id = 'c1';
  canvas.width = screen.width;
  canvas.height = screen.height;
  return canvas;
})();

const RENDERER = (() => {
  const renderer = new THREE.WebGLRenderer({
    powerPreference: 'high-performance',
  });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.gammaFactor = 2.2;
  renderer.physicallyCorrectLights = true;
  renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);
  return renderer;
})();

const RENDERERCANVAS = (() => {
  const canvas = RENDERER.domElement;
  canvas.width = screen.width;
  canvas.height = screen.height;
  return canvas;
})();

// Functions
// -----------------------------------------------------------------------------

function setMathematicaLightsVisibility(value) {
  for (let i = 0; i < MATHEMATICALIGHTS.length; i += 1) {
    MATHEMATICALIGHTS[i].visible = value;
  }
}

function setMeshGeometryVerticesIndices(vertices, indices) {
  MESHGEOMETRY.setIndex(indices);
  MESHGEOMETRY.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  MESH.geometry.attributes.position.needsUpdate = true; // update flag
  // If you change the position data values after the initial render
  MESH.geometry.computeBoundingBox();
}

function setMeshMaterial(material) {
  MESH.material = material;
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

function getSurfaceData(seed, choice, surfaceSlant) {
  const surfaceDetails = {
    seed,
    choice,
    surfaceSlant,
  };
  return $.get('/getsurface', surfaceDetails);
}

function getSurfaceDataList() {
  const choices = Object.entries(CHOICE);
  const materials = Object.entries(MATERIALS);

  const surfaceDataList = [];
  const testDataList = [];
  // for each surface slant
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
          const surfaceData = getSurfaceData(seed,
            choices[choiceIndex][1], SURFACESLANTS[surfaceIndex]);
          const testData = {
            seed,
            surfaceData,
            choice: choices[choiceIndex][1],
            material: materials[materialIndex][1],
            light: LIGHTS.DIRECTIONAL,
            lightSlant: DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]][lightSlantIndex],
            surfaceSlant: SURFACESLANTS[surfaceIndex],
          };
          surfaceDataList.push(surfaceData);
          testDataList.push(testData);
        }

        // matlab light
        // pretest and test image surface data
        const seed = getRandomSeed();
        const surfaceData = getSurfaceData(seed,
          choices[choiceIndex][1], SURFACESLANTS[surfaceIndex]);
        const testData = {
          seed,
          surfaceData,
          choice: choices[choiceIndex][1],
          material: materials[materialIndex][1],
          light: LIGHTS.MATLAB,
          surfaceSlant: SURFACESLANTS[surfaceIndex],
        };
        surfaceDataList.push(surfaceData);
        testDataList.push(testData);
      }
      // mathematica light
      // pretest and test image surface data
      const seed = getRandomSeed();
      const surfaceData = getSurfaceData(seed,
        choices[choiceIndex][1], SURFACESLANTS[surfaceIndex]);
      const testData = {
        seed,
        surfaceData,
        choice: choices[choiceIndex][1],
        material: MATERIALS.MATTE,
        light: LIGHTS.MATHEMATICA,
        surfaceSlant: SURFACESLANTS[surfaceIndex],
      };
      surfaceDataList.push(surfaceData);
      testDataList.push(testData);
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
