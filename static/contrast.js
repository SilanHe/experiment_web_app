const NUM_VERTICES = NUM_POINTS * NUM_POINTS;
const GLCONTEXT = RENDERERCANVAS.getContext('webgl');

function clearDocumentBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function downloadCanvas(canvas, filename = "canvas_images.jpeg") {
  // Convert the canvas to data
  let image = canvas.toDataURL();
  // Create a link
  let aDownloadLink = document.createElement('a');
  // Add the name of the file to the link
  aDownloadLink.download = filename;
  // Attach the data to the link
  aDownloadLink.href = image;
  // Get the code to click the download link
  aDownloadLink.click();
}

function rgbToGrayscale(r, g, b) {
  return 0.2126 * r ** GAMMA + 0.7152 * g ** GAMMA + 0.0722 * b ** GAMMA;
}

function GetCenterContrastBackground(x1, x2, y1, y2) {
  // get average Intensity of surface
  const height = y2 - y1;
  const width = x2 - x1;
  // get points from screen middle with GL call
  const numPixels = width * height;
  const pixels = new Uint8Array(numPixels * 4);
  GLCONTEXT.readPixels(x1, y1, width, height, GLCONTEXT.RGBA,
    GLCONTEXT.UNSIGNED_BYTE, pixels);

  const backgroundPixel = new Uint8Array(4);
  GLCONTEXT.readPixels(0, 0, 1, 1, GLCONTEXT.RGBA,
    GLCONTEXT.UNSIGNED_BYTE, backgroundPixel);
  const averageBackgroundIntensity = rgbToGrayscale(backgroundPixel[0] / 255,
    backgroundPixel[1] / 255, backgroundPixel[2] / 255);

  // get average intensity
  let intensity = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = rgbToGrayscale(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255);
    intensity += grayscale;
  }
  const averageTargetIntensity = intensity / numPixels;
  // computer RMS
  let sum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = rgbToGrayscale(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255);
    sum += (grayscale - averageTargetIntensity) ** 2;
  }

  const rms = Math.sqrt(sum / NUM_VERTICES) / averageBackgroundIntensity;
  return rms;
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
  const averageTargetIntensity = intensity / numPixels;
  // computer RMS
  let sum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = rgbToGrayscale(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255);
    sum += (grayscale - averageTargetIntensity) ** 2;
  }

  const rms = Math.sqrt(sum / NUM_VERTICES) / averageTargetIntensity;
  return rms;
}

function GetCenterLuminance(x1, x2, y1, y2) {
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
  const averageTargetIntensity = intensity / numPixels;

  return averageTargetIntensity;
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
  material, amplitude, isPretest, lightIntensity = 1) {
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
      DIRECTIONALLIGHTS.map.get(surfaceSlant)
        .get(lightSlant)
        .intensity = lightIntensity;
    }

    disk.visible = true;
    RENDERER.render(SCENE, CAMERA);
    const newCanvas = cloneCanvas(RENDERERCANVAS);
    document.body.appendChild(newCanvas);
    const rmsContrast = GetCenterContrast(400, 800, 200, 500);
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

    return newCanvas;
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
  const rmsContrast = GetCenterContrast(400, 800, 200, 500);

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

function renderSurface3(heightMap, seed, surfaceSlant, choice, light, lightSlant,
  material, amplitude, intensity) {
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

    DIRECTIONALLIGHTS.map.get(surfaceSlant)
      .get(lightSlant)
      .intensity = intensity;
  }

  RENDERER.render(SCENE, CAMERA);
  const luminance = GetCenterLuminance(400, 800, 200, 500);

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

  return luminance;
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
  const seed = 1;
  const choice = CHOICE.HILL;
  const light = LIGHTS.DIRECTIONAL;
  const materials = Object.entries(MATERIALS);
  const isPretest = false;

  for (let materialIndex = 0; materialIndex < materials.length; materialIndex += 1) {
    for (let surfaceSlant = 30; surfaceSlant <= 60; surfaceSlant += 15) {
      for (let lightSlantIndex = 0;
        lightSlantIndex < DIRECTIONALLIGHTSLANTS[surfaceSlant].length;
        lightSlantIndex += 1) {
        // pretest and test image surface data
        const data = {
          seed,
          choice,
          material: materials[materialIndex][1],
          light,
          lightSlant: DIRECTIONALLIGHTSLANTS[surfaceSlant][lightSlantIndex],
          surfaceSlant,
          isPretest,
        };
        // different amplitude values for different materials
        let amplitude;
        let lightIntensity;
        amplitude = OTHER_AMPLITUDES[data.surfaceSlant];
        console.log(lightIntensity);
        const tempCanvas = renderSurface(data.seed, data.surfaceSlant, data.choice,
          data.light, data.lightSlant, data.material, amplitude, data.isPretest, 1);
        const filename = getSurfaceInfoString(data, '.png');
        tempCanvas.then((canvas) => {
          downloadCanvas(canvas, filename);
        });
      }
    }
  }
}

function GetAmplitudeContrastData(surfaceSlant = 30, lightSlant = 20, material = MATERIALS.GLOSSY) {
  const seed = 120;
  const choice = CHOICE.VALLEY;
  const light = LIGHTS.DIRECTIONAL;
  const isPretest = false;
  const surface = getSurfaceDataOnly(seed, choice);

  return surface.then((surfaceInfo) => {
    const data = [];
    for (let amplitude = 0.01; amplitude < 0.7; amplitude += 0.01) {
      const rms = renderSurface2(surfaceInfo.heightMap, seed, surfaceSlant,
        choice, light, lightSlant,
        material, amplitude, isPretest);
      data.push(rms);
    }
    return data;
  });
}

function GetAllAmplitudeContrastData(surfaceSlant = 30, material = MATERIALS.MATTE) {
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[surfaceSlant].length; i += 1) {
    const lightSlant = DIRECTIONALLIGHTSLANTS[surfaceSlant][i];
    const amplitudeContrastData = GetAmplitudeContrastData(surfaceSlant, lightSlant, material);
    amplitudeContrastData.then((data) => {
      console.log(lightSlant);
      console.log(data.toString());
    });
  }
}

function GetLuminanceData(seed = 1, surfaceSlant = 30, lightSlant = 20, material = MATERIALS.GLOSSY) {
  const choice = CHOICE.VALLEY;
  const light = LIGHTS.DIRECTIONAL;
  const isPretest = false;
  const surface = getSurfaceDataOnly(seed, choice);

  let amplitude;
  if (material === MATERIALS.MATTE) {
    amplitude = AMPLITUDES[surfaceSlant][lightSlant];
  } else {
    amplitude = AMPLITUDES_GLOSSY[surfaceSlant][lightSlant];
  }

  return surface.then((surfaceInfo) => {
    const data = [];
    for (let intensity = 0.01; intensity <= 1; intensity += 0.01) {
      const luminance = renderSurface3(surfaceInfo.heightMap, seed, surfaceSlant,
        choice, light, lightSlant,
        material, amplitude, intensity);
      data.push(luminance);
    }
    return data;
  });
}

function GetAllLuminanceData(seed = 1, surfaceSlant = 30, material = MATERIALS.MATTE) {
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[surfaceSlant].length; i += 1) {
    const lightSlant = DIRECTIONALLIGHTSLANTS[surfaceSlant][i];
    const luminanceData = GetLuminanceData(seed, surfaceSlant, lightSlant, material);
    luminanceData.then((data) => {
      console.log(surfaceSlant);
      console.log(lightSlant);
      console.log(data.toString());
    });
  }
}

function findAmplitudes(surfaceSlant = 30, material = MATERIALS.GLOSSY, lo = 0.1, hi = 0.7, target = 0.2) {
  const choice = CHOICE.VALLEY;

  const error = 0.001;
  const light = LIGHTS.DIRECTIONAL;
  const isPretest = false;
  const numSeeds = 50;
  const NUMCALLS = 20;

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
          NUMCALLS, target, lo, hi).then((data) => data);
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
  return amplitudes;
}

clearDocumentBody();
document.body.appendChild(RENDERERCANVAS);
// allRMSContrast();

// GetAllAmplitudeContrastData(60, MATERIALS.GLOSSY);

const TARGET_RMS = {
  MATTE: {
    30: 0.2,
    45: 0.2,
    60: 0.2,
  },
  GLOSSY: {
    30: 0.4,
    45: 0.4,
    60: 0.4,
  },
};

// findAmplitudes(60, MATERIALS.GLOSSY, 0.07, 0.4, 0.2);
allRMSContrast();

// GetAllLuminanceData(1, 30, MATERIALS.GLOSSY);
