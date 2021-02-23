// CONSTANTS
// -----------------------------------------------------------------------------

const CLONECANVAS = document.createElement("CANVAS");
const CLONECONTEXT = CLONECANVAS.getContext("2d");
CLONECONTEXT.canvas.width = window.innerWidth;
CLONECONTEXT.canvas.height = window.innerHeight;

const AMPLITUDES = {
  30: 0.45,
  45: 0.35,
  60: 0.19,
};

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
  const color = new THREE.Color(0x000001);
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
  const redDirectionLight = new THREE.DirectionalLight(0xff0000, 1);
  redDirectionLight.position.set(LIGHT_Z_DISTANCE, 0, LIGHT_Z_DISTANCE);
  redDirectionLight.visible = false;

  const greenDirectionLight = new THREE.DirectionalLight(0x00ff00, 1);
  greenDirectionLight.position.set(LIGHT_Z_DISTANCE, LIGHT_Z_DISTANCE, LIGHT_Z_DISTANCE);
  greenDirectionLight.visible = false;

  const blueDirectionLight = new THREE.DirectionalLight(0x0000ff, 1);
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
  scene.background = DARKGRAY;

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

function NewMatteMaterial() {
  return new THREE.MeshPhongMaterial(
    {
      side: THREE.FrontSide,
      color: WHITE,
      specular: BLACK,
      shininess: 0,
    },
  );
}

function NewGlossyMaterial() {
  return new THREE.MeshPhongMaterial(
    {
      side: THREE.FrontSide,
      color: GLOSSYCOLOR,
      specular: GLOSSYSPECULAR,
      shininess: 51,
    },
  );
}

function CustomShaderMaterial(gammaFactor) {
  const matteMaterial = new THREE.MeshPhongMaterial(
    {
      side: THREE.FrontSide,
      color: WHITE,
      specular: BLACK,
      shininess: 0,
    },
  );

  const glossyMaterial = new THREE.MeshPhongMaterial(
    {
      side: THREE.FrontSide,
      color: GLOSSYCOLOR,
      specular: GLOSSYSPECULAR,
      shininess: 51,
    },
  );

  matteMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.gammafactor = { value: gammaFactor };
    shader.fragmentShader = `uniform float gammafactor;\n${shader.fragmentShader}`;
    shader.fragmentShader = shader.fragmentShader.replace(
      '	gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
      ' gl_FragColor = LinearToGamma(vec4( outgoingLight, 1.0 ), gammafactor);',
    );
  };

  glossyMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.gammafactor = { value: gammaFactor };
    shader.fragmentShader = `uniform float gammafactor;\n${shader.fragmentShader}`;
    shader.fragmentShader = shader.fragmentShader.replace(
      '	gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
      ' gl_FragColor = LinearToGamma(vec4( outgoingLight, 1.0 ), gammafactor);',
    );
  };

  return {
    matteMaterial,
    glossyMaterial,
  };
}

function ContrastOnBeforeCompile(material, gammaFactor, meanTarget,
  meanIntensity, stdTarget, stdIntensity) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.gammafactor = { value: gammaFactor };
    shader.uniforms.meanTarget = { value: meanTarget / 255 };
    shader.uniforms.meanIntensity = { value: meanIntensity / 255 };
    shader.uniforms.stdTarget = { value: stdTarget / 255 };
    shader.uniforms.stdIntensity = { value: stdIntensity / 255 };
    shader.fragmentShader = [
      'uniform float gammafactor;',
      'uniform float stdTarget;',
      'uniform float stdIntensity;',
      'uniform float meanTarget;',
      'uniform float meanIntensity;',
    ].join('\n') + '\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '	gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
      [
        ' vec4 v = vec4( outgoingLight, diffuseColor.a );',
        ' vec4 normalized = normalizeContrast( meanTarget, meanIntensity, stdTarget, stdIntensity, v);',
        ' gl_FragColor = LinearToGamma(normalized, gammafactor);',
      ].join('\n'),
    );
  };
}

function getAllContrastMaterial(gammaFactor) {
  const materials = {};
  materials[MATERIALS.MATTE] = {};
  materials[MATERIALS.GLOSSY] = {};
  materials[MATERIALS.MATTE][30] = {};
  materials[MATERIALS.MATTE][45] = {};
  materials[MATERIALS.MATTE][60] = {};
  materials[MATERIALS.GLOSSY][30] = {};
  materials[MATERIALS.GLOSSY][45] = {};
  materials[MATERIALS.GLOSSY][60] = {};

  const targetStd = 10.378200810233588;
  const meanTarget = 164.3208475484253;
  let material;

  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 156.78441751556545, targetStd, 15.378369292846338); // matte directional 20 30
  materials[MATERIALS.MATTE][30][20] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 156.73204315863583, targetStd, 14.735199406339916); // matte directional 30 30
  materials[MATERIALS.MATTE][30][30] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 152.43828727743295, targetStd, 19.189763292808713); // matte directional 40 30
  materials[MATERIALS.MATTE][30][40] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 141.85212866714215, targetStd, 26.63428501073127); // matte directional 50 30
  materials[MATERIALS.MATTE][30][50] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 128.97426185358717, targetStd, 33.95757496043813); // matte directional 60 30
  materials[MATERIALS.MATTE][30][60] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 110.45247650436139, targetStd, 40.618685834439965); // matte directional 70 30
  materials[MATERIALS.MATTE][30][70] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 145.24504151641847, targetStd, 68.19507984420792); // matte matlab 30
  materials[MATERIALS.MATTE][30][LIGHTS.MATLAB] = material;

  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 77.66105048482835, targetStd, 20.840488892152457); // glossy directional 20 30
  materials[MATERIALS.GLOSSY][30][20] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 77.59462339901249, targetStd, 19.640071841171896); // glossy directiona 30 30
  materials[MATERIALS.GLOSSY][30][30] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 75.66843347453761, targetStd, 20.51199028233263); // glossy directional 40 30
  materials[MATERIALS.GLOSSY][30][40] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 70.6609089975541, targetStd, 21.623171581600857); // glossy directional 50 30
  materials[MATERIALS.GLOSSY][30][50] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 63.91771310005013, targetStd, 23.762505138501464); // glossy directional 60 30
  materials[MATERIALS.GLOSSY][30][60] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 54.97124607349393, targetStd, 25.795451080781323); // glossy directional 70 30
  materials[MATERIALS.GLOSSY][30][70] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 130.73872104507092, targetStd, 59.37215513448607); // matlab glossy 30
  materials[MATERIALS.GLOSSY][30][LIGHTS.MATLAB] = material;

  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 161.82561866291567, targetStd, 13.962054755936498); // matte directional 30 45
  materials[MATERIALS.MATTE][45][30] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 164.3208475484253, targetStd, 10.378200810233588); // matte directional 45 45
  materials[MATERIALS.MATTE][45][45] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 154.0722337735319, targetStd, 17.928364448440046); // matte directional 60 45
  materials[MATERIALS.MATTE][45][60] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 134.60153339832854, targetStd, 27.278002227705667); // matte directional 75 45
  materials[MATERIALS.MATTE][45][75] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 104.8302295939948, targetStd, 36.12854919358175); // matte directional 90 45
  materials[MATERIALS.MATTE][45][90] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 82.12687053802051, targetStd, 40.47684195258709); // matte directional 100 45
  materials[MATERIALS.MATTE][45][100] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 145.24504151641847, targetStd, 68.19507984420792); // matte matlab 45
  materials[MATERIALS.MATTE][45][LIGHTS.MATLAB] = material;

  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 80.07235680735263, targetStd, 20.569933157284137); // glossy directional 30 45
  materials[MATERIALS.GLOSSY][45][30] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 83.68543601651187, targetStd, 19.997361940379772); // glossy directional 45 45
  materials[MATERIALS.GLOSSY][45][45] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 80.15986836188678, targetStd, 19.093637881040486); // glossy directional 60 45
  materials[MATERIALS.GLOSSY][45][60] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 70.53981766860578, targetStd, 21.5397875591238); // glossy directional 75 45
  materials[MATERIALS.GLOSSY][45][75] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 56.4184812174614, targetStd, 25.029834592078473); // glossy directional 90 45
  materials[MATERIALS.GLOSSY][45][90] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 43.447956597920445, targetStd, 26.144498613697245); // glossy directional 100 45
  materials[MATERIALS.GLOSSY][45][100] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 58.20756089925286, targetStd, 27.61137254246659); // matlab glossy 45
  materials[MATERIALS.GLOSSY][45][LIGHTS.MATLAB] = material;

  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 146.0033590060164, targetStd, 15.576613308598121); // matte directional 90 60
  materials[MATERIALS.MATTE][60][90] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 128.80968662312245, targetStd, 18.215480673699382); // matte directional 100 60
  materials[MATERIALS.MATTE][60][100] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 107.72125271939024, targetStd, 22.50830654458899); // matte directional 110 60
  materials[MATERIALS.MATTE][60][110] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 88.87329198357965, targetStd, 23.551441632503828); // matte directional 120 60
  materials[MATERIALS.MATTE][60][120] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 72.3866582420558, targetStd, 26.407158004661255); // matte directional 130 60
  materials[MATERIALS.MATTE][60][130] = material;
  material = NewMatteMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 94.97364785265025, targetStd, 37.38996556166459); // matte matlab 60
  materials[MATERIALS.MATTE][60][LIGHTS.MATLAB] = material;

  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 82.49597690993694, targetStd, 15.157563565430284); // glossy directional 90 60
  materials[MATERIALS.GLOSSY][60][90] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 77.42224868629461, targetStd, 16.813043349637788); // glossy directional 100 60
  materials[MATERIALS.GLOSSY][60][100] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 70.01247472927017, targetStd, 20.151593700659085); // glossy directional 110 60
  materials[MATERIALS.GLOSSY][60][110] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 59.885340016839315, targetStd, 23.570160825318506); // glossy directional 120 60
  materials[MATERIALS.GLOSSY][60][120] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 50.43846485047754, targetStd, 25.852402488807098); // glossy directional 130 60
  materials[MATERIALS.GLOSSY][60][130] = material;
  material = NewGlossyMaterial();
  ContrastOnBeforeCompile(material, gammaFactor,
    meanTarget, 42.512636280303475, targetStd, 16.567008149745796); // matlab glossy 60
  materials[MATERIALS.GLOSSY][60][LIGHTS.MATLAB] = material;

  return materials;
}

function cloneCanvas(oldCanvas) {
  // create a new canvas
  // using a precreated canvas to increase speed
  // set dimensions
  CLONECANVAS.width = oldCanvas.width;
  CLONECANVAS.height = oldCanvas.height;

  // apply the old canvas to the new one
  CLONECONTEXT.drawImage(oldCanvas, 0, 0);

  // return the new canvas
  return CLONECANVAS;
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

function getSurfaceData(testData) {
  const surfaceDetails = {
    seed: testData.seed,
    choice: testData.choice,
  };
  return $.get('/getsurface', surfaceDetails).then((data) => {
    const { heightMap, extremaIndex } = data;
    testData.vertices = getVertices(heightMap, testData.amplitude);
    testData.extremaIndex = extremaIndex;
    return testData;
  });
}

function getSurfaceDataList(gammaRed, gammaGreen, gammaBlue, numSets = 1, normalizeContrast = true) {
  const choices = Object.entries(CHOICE);
  const materials = Object.entries(MATERIALS);
  const averageGammaFactor = (gammaRed + gammaGreen + gammaBlue) / 3;
  const { matteMaterial, glossyMaterial } = CustomShaderMaterial(averageGammaFactor);
  const contrastMaterialLookup = getAllContrastMaterial(averageGammaFactor);

  const surfaceDataList = [];
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
              amplitude: AMPLITUDES[surfaceSlant],
              seed: seedDirectional,
              choice: choices[choiceIndex][1],
              material,
              light: LIGHTS.DIRECTIONAL,
              lightSlant,
              surfaceSlant,
              gammaRed,
              gammaGreen,
              gammaBlue,
              matteMaterial,
              glossyMaterial,
              contrastMaterialLookup,
              normalizeContrast,
            };
            // different amplitude values for different materials
            const surfaceDataDirectional = getSurfaceData(testDataDirectional);
            surfaceDataList.push(surfaceDataDirectional);
          }
          // matlab
          const seed = getRandomSeed();
          const testData = {
            amplitude: AMPLITUDES[surfaceSlant],
            seed,
            choice: choices[choiceIndex][1],
            material,
            light: LIGHTS.MATLAB,
            surfaceSlant,
            gammaRed,
            gammaGreen,
            gammaBlue,
            matteMaterial,
            glossyMaterial,
            contrastMaterialLookup,
            normalizeContrast,
          };
          const surfaceData = getSurfaceData(testData);
          surfaceDataList.push(surfaceData);
        }
        if (!normalizeContrast) {
          // mathematica
          const seed = getRandomSeed();
          const testData = {
            amplitude: AMPLITUDES[surfaceSlant],
            seed,
            choice: choices[choiceIndex][1],
            material: MATERIALS.MATTE,
            light: LIGHTS.MATHEMATICA,
            surfaceSlant,
            gammaRed,
            gammaGreen,
            gammaBlue,
            matteMaterial,
            glossyMaterial,
            contrastMaterialLookup,
            normalizeContrast,
          };
          const surfaceData = getSurfaceData(testData);
          surfaceDataList.push(surfaceData);
        }
      }
    }
  }
  return surfaceDataList;
}

function getSurfaceInfoString(testData, additionalInfo) {
  if (testData.lightSlant) {
    return `${testData.light}_${testData.seed}_${testData.choice}_${testData.material}_${testData.surfaceSlant}_${testData.lightSlant}_${additionalInfo}`;
  }
  return `${testData.light}_${testData.seed}_${testData.choice}_${testData.material}_${testData.surfaceSlant}_${additionalInfo}`;
}

function RenderImage(data, isPretest = false, normalizeContrast = false) {
  // set our mesh geometry
  // change positions
  setMeshGeometryVerticesIndices(data.vertices);
  // change material
  if (!normalizeContrast) {
    if (data.material === MATERIALS.MATTE) {
      setMeshMaterial(data.matteMaterial);
      // setMeshMaterial(MATTEMATERIAL);
      data.matteMaterial.needsUpdate = true;
    } else {
      setMeshMaterial(data.glossyMaterial);
      // setMeshMaterial(GLOSSYMATERIAL);
      data.glossyMaterial.needsUpdate = true;
    }
  } else if (data.light === LIGHTS.MATLAB) {
    setMeshMaterial(data.contrastMaterialLookup[data.material][data.surfaceSlant][data.light]);
  } else if (data.light === LIGHTS.DIRECTIONAL) {
    setMeshMaterial(data.contrastMaterialLookup[data.material][data.surfaceSlant][data.lightSlant]);
  } else {
    //mathematica
    return;
  }
  // rotate
  MESH.rotateX(-THREE.Math.degToRad(data.surfaceSlant));
  MESH.geometry.computeVertexNormals();
  MESH.updateMatrixWorld();
  // set disk locations
  const x = data.vertices[data.extremaIndex];
  const y = data.vertices[data.extremaIndex + 1];
  const z = data.vertices[data.extremaIndex + 2];
  const diskLocation = new THREE.Vector3(x, y, z);
  MESH.localToWorld(diskLocation);

  // set pip position
  let disk;
  if (isPretest) {
    disk = DISK;
    disk.position.set(diskLocation.x, diskLocation.y, diskLocation.z + DISKS_DISTANCES.DISK);
  } else {
    disk = PIP;
    disk.position.set(diskLocation.x, diskLocation.y, diskLocation.z + DISKS_DISTANCES.PIP);
  }
  disk.updateMatrix();
  disk.visible = true;

  // make the light in question visible
  if (data.light === LIGHTS.MATLAB) {
    MATLABLIGHT.visible = true;
  } else if (data.light === LIGHTS.MATHEMATICA) {
    setMathematicaLightsVisibility(true);
  } else {
    // directional
    DIRECTIONALLIGHTS.map.get(data.surfaceSlant)
      .get(data.lightSlant)
      .visible = true;
  }

  RENDERER.render(SCENE, CAMERA);
}

function ResetRenderImage(data) {
  // reset mesh rotation
  resetObject(MESH);
  resetObject(DISK);
  DISK.visible = false;
  resetObject(PIP);
  PIP.visible = false;
  // make the light in question non visible
  if (data.light === LIGHTS.MATLAB) {
    MATLABLIGHT.visible = false;
  } else if (data.light === LIGHTS.MATHEMATICA) {
    setMathematicaLightsVisibility(false);
  } else {
    // directional
    DIRECTIONALLIGHTS.map.get(data.surfaceSlant)
      .get(data.lightSlant)
      .visible = false;
  }

  RENDERER.render(SCENE, CAMERA);
}
