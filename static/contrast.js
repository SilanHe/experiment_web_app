const NUM_VERTICES = NUM_POINTS * NUM_POINTS;
const GLCONTEXT = RENDERERCANVAS.getContext('webgl');

function clearDocumentBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function downloadCanvas(canvas, filename = 'canvas_images.jpeg') {
  // Convert the canvas to data
  const image = canvas.toDataURL();
  // Create a link
  const aDownloadLink = document.createElement('a');
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

function grayscaleToRGB(grayscale) {
  return {
    r: (grayscale * 0.2126) ** (1 / GAMMA),
    g: (grayscale * 0.7152) ** (1 / GAMMA),
    b: (grayscale * 0.0722) ** (1 / GAMMA),
  };
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

function GetLuminanceAndStandardDeviation() {
  const c = cloneCanvas(RENDERERCANVAS);
  const ctx = c.getContext("2d");
  const imageData = ctx.getImageData(0, 0, c.width, c.height);
  const data = Uint8ClampedArray.from(imageData.data);

  // get average intensity
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) {
      continue;
    } else if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
      continue;
    }
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }
  r /= count;
  g /= count;
  b /= count;  

  // get standard deviation of intensities
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) {
      continue;
    } else if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
      continue;
    }
    sumR += (data[i] - r) ** 2;
    sumG += (data[i + 1] - g) ** 2;
    sumB += (data[i + 2] - b) ** 2;
  }

  const stdR = Math.sqrt(sumR / count);
  const stdG = Math.sqrt(sumG / count);
  const stdB = Math.sqrt(sumB / count);

  console.log(`r: ${r},
  g: ${g},
  b: ${b}`);
  console.log(`stdR ${stdR}, stdG ${stdG}, stdB ${stdB}`);
}

function getSurfaceDataOnly(seed, choice) {
  const surfaceDetails = {
    seed,
    choice,
  };
  return $.get('/getsurface', surfaceDetails).then((data) => data);
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
    setMeshGeometryVerticesIndices(stimulusData.vertices);
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
    var t0 = performance.now();
    const newCanvas = NormalizeContrast();
    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
    document.body.appendChild(newCanvas);

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
      AMBIENTLIGHT.visible = false;
    }

    return newCanvas;
  });
}

function renderSurfaceContrast(heightMap, surfaceSlant, light, lightSlant,
  material, amplitude) {
  const vertices = getVertices(heightMap, amplitude);
  setMeshGeometryVerticesIndices(vertices);
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
    DIRECTIONALLIGHTS.map.get(surfaceSlant)
      .get(lightSlant)
      .visible = true;
  }

  RENDERER.render(SCENE, CAMERA);
  const CANVAS = NormalizeContrast();
  document.body.appendChild(CANVAS);
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

function GetAmbientLightIntensityContrastData(surfaceSlant = 30, lightSlant = 20, material = MATERIALS.MATTE) {
  const seed = 120;
  const choice = CHOICE.VALLEY;
  const light = LIGHTS.DIRECTIONAL;
  const isPretest = false;
  const surface = getSurfaceDataOnly(seed, choice);

  return surface.then((surfaceInfo) => {
    const data = [];
    for (let lightIntensity = 0; lightIntensity <= 1.0; lightIntensity += 0.01) {
      const rms = renderSurfaceContrast(surfaceInfo.heightMap, seed, surfaceSlant,
        choice, light, lightSlant, material, 
        AMPLITUDES[surfaceSlant], isPretest, lightIntensity);
      data.push(rms);
    }
    return data;
  });
}

function GetAllAmbientLightIntensityContrastData(surfaceSlant = 30, material = MATERIALS.MATTE) {
  for (let i = 0; i < DIRECTIONALLIGHTSLANTS[surfaceSlant].length; i += 1) {
    const lightSlant = DIRECTIONALLIGHTSLANTS[surfaceSlant][i];
    const amplitudeContrastData = GetAmbientLightIntensityContrastData(surfaceSlant, lightSlant, material);
    amplitudeContrastData.then((data) => {
      console.log(lightSlant);
      console.log(data.toString());
    });
  }
}

function findAmbientLightIntensity(surfaceSlant = 30, material = MATERIALS.GLOSSY, lo = 0, hi = 1, target = 0.2) {
  const choice = CHOICE.VALLEY;

  const error = 0.001;
  const light = LIGHTS.DIRECTIONAL;
  const isPretest = false;
  const numSeeds = 50;
  const NUMCALLS = 20;

  function searchAmbient(surfaceData, numCalls, targetRMS, l, r) {
    // additional exit condition
    const mid1 = l + (r - l) / 3;
    const mid2 = r - (r - l) / 3;

    const rms1 = renderSurfaceContrast(surfaceData.heightMap, surfaceData.seed, surfaceData.surfaceSlant,
      surfaceData.choice, surfaceData.light, surfaceData.lightSlant,
      surfaceData.material, AMPLITUDES[surfaceData.surfaceSlant], surfaceData.isPretest, mid1);
    const rms2 = renderSurfaceContrast(surfaceData.heightMap, surfaceData.seed, surfaceData.surfaceSlant,
      surfaceData.choice, surfaceData.light, surfaceData.lightSlant,
      surfaceData.material, AMPLITUDES[surfaceData.surfaceSlant], surfaceData.isPretest, mid2);
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

      return searchAmbient(surfaceData, numCalls - 1, targetRMS, newL, newR);
    });
  }

  const lightIntensities = [];
  const lightSlants = DIRECTIONALLIGHTSLANTS[surfaceSlant];
  for (let i = 0; i < lightSlants.length; i += 1) {
    const lightSlant = lightSlants[i];
    const lightIntensity = [];
    for (let j = 0; j < numSeeds; j += 1) {
      const seed = getRandomSeed();
      const surface = getSurfaceDataOnly(seed, choice);
      lightIntensity.push(surface.then((surfaceInfo) => {
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

        return searchAmbient(surfaceData,
          NUMCALLS, target, lo, hi).then((data) => data);
      }));
    }

    Promise.all(lightIntensity).then((data) => {
      let sum = 0;
      for (let k = 0; k < data.length; k += 1) {
        sum += data[k];
      }
      const amp = sum / numSeeds;
      console.log(`material: ${material} surfaceSlant: ${surfaceSlant}, lightSlant: ${lightSlant}, amplitude: ${amp}, sum: ${sum}`);
    });
  }
  return lightIntensities;
}

clearDocumentBody();
document.body.appendChild(RENDERERCANVAS);
// allRMSContrast();


// GetAllAmplitudeContrastData(60, MATERIALS.GLOSSY);

const TARGET_RMS = {
  MATTE: {
    30: 0.08849325510537281,
    45: 0.06089653849564214,
    60: 0.12608018980461572,
  },
  GLOSSY: {
    30: 0.24829650141654042,
    45: 0.2315229692583383,
    60: 0.20102753863201026,
  },
};

function getSet(numSets = 1) {
  const choices = Object.entries(CHOICE);
  const materials = Object.entries(MATERIALS);
  const seed = 1;

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
            const data = {
              seed,
              choice: choices[choiceIndex][1],
              material: materials[materialIndex][1],
              light: LIGHTS.DIRECTIONAL,
              lightSlant: DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]][lightSlantIndex],
              surfaceSlant: SURFACESLANTS[surfaceIndex],
            };

            const amplitude = AMPLITUDES[data.surfaceSlant];
            const tempCanvas = renderSurface(data.seed, data.surfaceSlant, data.choice,
            data.light, data.lightSlant, data.material, amplitude, data.isPretest);
            const filename = getSurfaceInfoString(data, '.png');
            tempCanvas.then((canvas) => {
              downloadCanvas(canvas, filename);
            });
          }

          // matlab light
          // pretest and test image surface data
          const data = {
            seed,
            choice: choices[choiceIndex][1],
            material: materials[materialIndex][1],
            light: LIGHTS.MATLAB,
            surfaceSlant: SURFACESLANTS[surfaceIndex],
          };
          const amplitude = AMPLITUDES[data.surfaceSlant];
          const tempCanvas = renderSurface(data.seed, data.surfaceSlant, data.choice,
          data.light, data.lightSlant, data.material, amplitude, data.isPretest);
          const filename = getSurfaceInfoString(data, '.png');
          tempCanvas.then((canvas) => {
            downloadCanvas(canvas, filename);
          });
        }
        // mathematica light
        // pretest and test image surface data
        const data = {
          seed,
          choice: choices[choiceIndex][1],
          material: MATERIALS.MATTE,
          light: LIGHTS.MATHEMATICA,
          surfaceSlant: SURFACESLANTS[surfaceIndex],
        };
        const amplitude = AMPLITUDES[data.surfaceSlant];
        const tempCanvas = renderSurface(data.seed, data.surfaceSlant, data.choice,
        data.light, data.lightSlant, data.material, amplitude, data.isPretest);
        const filename = getSurfaceInfoString(data, '.png');
        tempCanvas.then((canvas) => {
          downloadCanvas(canvas, filename);
        });
      }
    }
  }
}

function RenderSurface(surfaceSlant = 60, lightSlant = 120, material = MATERIALS.MATTE) {
  const seed = 1;
  const choice = CHOICE.VALLEY;
  const light = LIGHTS.DIRECTIONAL;
  const surface = getSurfaceDataOnly(seed, choice);

  return surface.then((surfaceInfo) => {
    renderSurfaceContrast(surfaceInfo.heightMap, surfaceSlant, light, lightSlant, material,
      AMPLITUDES[surfaceSlant], 0);
  });
}

const targetMean = {
  r: 245.5942780005993,
  g: 245.5942780005993,
  b: 245.5942780005993,
};

const targetStd = {
  r: 7.104325914379496,
  g: 7.104325914379496,
  b: 7.104325914379496,
};

getSet();
