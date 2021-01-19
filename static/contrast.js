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

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  console.log(`x: ${x}, y: ${y}`);
}

RENDERERCANVAS.addEventListener('mousedown', function(e) {
  getCursorPosition(RENDERERCANVAS, e);
});

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
    renderSurface(surfaceInfo.heightMap, surfaceSlant, light, lightSlant, material,
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
