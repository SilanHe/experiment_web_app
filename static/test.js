const NUM_VERTICES = NUM_POINTS * NUM_POINTS;
const GLCONTEXT = RENDERERCANVAS.getContext('webgl');

function clearDocumentBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function rgbToGrayscale(r, g, b) {
  return 0.2126 * r ** GAMMA + 0.7152 * g ** GAMMA + 0.0722 * b ** GAMMA;
}

function GetCenterContrast(x1, x2, y1, y2) {
  // get average Intensity of surface
  const height = y2 - y1;
  const width = x2 - x1;
  // get points from screen middle with GL call
  const numPixels = width * height;
  const pixels = new Uint8Array(numPixels * 4);
  GLCONTEXT.readPixels(x1, y1, width, height, GLCONTEXT.RGBA,
    GLCONTEXT.UNSIGNED_BYTE, pixels);
  // get average intensity
  let intensity = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = rgbToGrayscale(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255);
    intensity += grayscale;
  }
  const averageIntensity = intensity / numPixels;
  // computer RMS
  let sum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = rgbToGrayscale(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255);
    sum += (grayscale - averageIntensity) ** 2;
  }

  const rms = Math.sqrt(sum / NUM_VERTICES);
  return rms;
}

function getSurfaceDataOnly(seed, choice) {
  const surfaceDetails = {
    seed,
    choice,
  };
  return $.get('/getsurface', surfaceDetails).then((data) => data);
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

function renderSurface(seed, surfaceSlant, choice, light, lightSlant,
  material, amplitude, isPretest) {
  return getSurfaceData(seed, choice, amplitude).then((stimulusData) => {
    const disk = (() => {
      if (isPretest) {
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

    if (isPretest === true) {
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
    const newCanvas = cloneCanvas(RENDERERCANVAS);
    document.body.appendChild(newCanvas);
    const rmsContrast = GetCenterContrast(500, 1400, 300, 700);
    console.log(`surfaceSlant: ${surfaceSlant}, lightSlant: ${lightSlant}, rmsContrast: ${rmsContrast}`);

    // reset our renderering to prep for next one
    resetObject(MESH);
    resetObject(DISK);
    resetObject(PIP);

    if (light === LIGHTS.MATLAB) {
      MATLABLIGHT.visible = false;
    } else if (light === LIGHTS.MATHEMATICA) {
      setMathematicaLightsVisibility(false);
    } else {
      // directional
      DIRECTIONALLIGHTS.map.get(surfaceSlant)
        .get(lightSlant)
        .visible = false;
    }

    return rmsContrast;
  });
}

function renderSurface2(heightMap, seed, surfaceSlant, choice, light, lightSlant,
  material, amplitude, isPretest) {
  const vertices = getVertices(heightMap, amplitude);
  setMeshGeometryVerticesIndices(vertices, INDICES);
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

  RENDERER.render(SCENE, CAMERA);
  const rmsContrast = GetCenterContrast(500, 1400, 300, 700);

  // reset our renderering to prep for next one
  resetObject(MESH);

  if (light === LIGHTS.MATLAB) {
    MATLABLIGHT.visible = false;
  } else if (light === LIGHTS.MATHEMATICA) {
    setMathematicaLightsVisibility(false);
  } else {
    // directional
    DIRECTIONALLIGHTS.map.get(surfaceSlant)
      .get(lightSlant)
      .visible = false;
  }

  return rmsContrast;
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  console.log(`x: ${x}, y: ${y}`);
}

RENDERERCANVAS.addEventListener('mousedown', function(e) {
  getCursorPosition(RENDERERCANVAS, e);
});

function allRMSContrast() {
  const seed = 120;
  const choice = CHOICE.VALLEY;
  const light = LIGHTS.DIRECTIONAL;
  const material = MATERIALS.MATTE;
  const isPretest = false;

  for (let surfaceSlant = 30; surfaceSlant <= 60; surfaceSlant += 15) {
    for (let lightSlantIndex = 0;
      lightSlantIndex < DIRECTIONALLIGHTSLANTS[surfaceSlant].length;
      lightSlantIndex += 1) {
      // pretest and test image surface data
      const data = {
        seed,
        choice,
        material,
        light: LIGHTS.DIRECTIONAL,
        lightSlant: DIRECTIONALLIGHTSLANTS[surfaceSlant][lightSlantIndex],
        surfaceSlant,
        amplitude: AMPLITUDES[surfaceSlant][DIRECTIONALLIGHTSLANTS[surfaceSlant][lightSlantIndex]],
        isPretest,
      };
      renderSurface(data.seed, data.surfaceSlant, data.choice, data.light, data.lightSlant,
        data.material, data.amplitude, data.isPretest);
    }
  }
}

function findAmplitudes() {
  const choice = CHOICE.VALLEY;
  const TARGET_RMS = {
    30: 0.2,
    45: 0.2,
    60: 0.17,
  };

  const error = 0.001;
  const light = LIGHTS.DIRECTIONAL;
  const material = MATERIALS.GLOSSY;
  const isPretest = false;
  const numSeeds = 50;

  function searchAmplitude(surfaceData, numCalls, targetRMS, l, r) {
    // additional exit condition
    const mid1 = l + (r - l) / 3;
    const mid2 = r - (r - l) / 3;

    const rms1 = renderSurface2(surfaceData.heightMap, surfaceData.seed, surfaceData.surfaceSlant,
      surfaceData.choice, surfaceData.light, surfaceData.lightSlant,
      surfaceData.material, mid1, surfaceData.isPretest);
    const rms2 = renderSurface2(surfaceData.heightMap, surfaceData.seed, surfaceData.surfaceSlant,
      surfaceData.choice, surfaceData.light, surfaceData.lightSlant,
      surfaceData.material, mid2, surfaceData.isPretest);
    const rms = [rms1, rms2];

    if (numCalls === 0) {
      // console.log(`surfaceSlant: ${surfaceData.surfaceSlant}, 
      // lightSlant: ${surfaceData.lightSlant}, 
      // mid1: ${mid1}
      // mid2: ${mid2}
      // rms1: ${rms1}
      // rms2: ${rms2}
      // numCalls ${numCalls}`);
      return ((l + r) / 2);
    }

    return Promise.all(rms).then((data) => {
      const difference1 = Math.abs(data[0] - targetRMS);
      const difference2 = Math.abs(data[1] - targetRMS);

      if (difference1 < error) {
        return mid1;
      }
      if (difference2 < error) {
        return mid2;
      }

      let newL = l;
      let newR = r;

      if (difference1 < difference2) {
        newR = mid2;
      } else if (difference2 < difference1) {
        newL = mid1;
      } else {
        newR = mid2;
        newL = mid1;
      }

      return searchAmplitude(surfaceData, numCalls - 1, targetRMS, newL, newR);
    });
  }

  const amplitudes = [];
  for (let surfaceSlant = 30; surfaceSlant <= 60; surfaceSlant += 15) {
    const lightSlants = DIRECTIONALLIGHTSLANTS[surfaceSlant];
    for (let i = 0; i < lightSlants.length; i += 1) {
      const lightSlant = lightSlants[i];
      const amplitude = [];
      for (let j = 0; j < numSeeds; j += 1) {
        const seed = getRandomSeed();
        const surface = getSurfaceDataOnly(seed, choice);
        amplitude.push(surface.then((surfaceInfo) => {
          const surfaceData = {
            surfaceSlant,
            lightSlant,
            choice,
            seed,
            light,
            material,
            isPretest,
            heightMap: surfaceInfo.heightMap,
          };

          return searchAmplitude(surfaceData,
            20, TARGET_RMS[surfaceSlant], 0.05, 0.5).then((data) => data);
        }));
      }

      Promise.all(amplitude).then((data) => {
        let sum = 0;
        for (let k = 0; k < data.length; k += 1) {
          sum += data[k];
        }
        const amp = sum / numSeeds;
        console.log(`surfaceSlant: ${surfaceSlant}, lightSlant: ${lightSlant}, amplitude: ${amp}, sum: ${sum}`);
      });
    }
  }
  return amplitudes;
}

clearDocumentBody();
// document.body.appendChild(RENDERERCANVAS);
allRMSContrast();
