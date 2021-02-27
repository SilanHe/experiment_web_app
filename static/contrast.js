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

function GetLuminanceAndStandardDeviation(canvas = RENDERERCANVAS) {
  const c = cloneCanvas(canvas);
  const ctx = c.getContext("2d");
  const imageData = ctx.getImageData(0, 0, c.width, c.height);
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

  return {
    r,
    g,
    b,
    stdR,
    stdG,
    stdB,
  };
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

function getSet(seed, gammaRed, gammaGreen, gammaBlue, numSets, normalizeContrast) {
  const choice = CHOICE.HILL;
  const materials = Object.entries(MATERIALS);
  const averageGammaFactor = (gammaRed + gammaGreen + gammaBlue) / 3;
  const { matteMaterial, glossyMaterial } = CustomShaderMaterial(averageGammaFactor);
  // const matteMaterial = MATTEMATERIAL;
  // const glossyMaterial = GLOSSYMATERIAL;
  const contrastMaterialLookup = getAllContrastMaterial(averageGammaFactor);

  const downloadFunction = (data) => {
    RenderImage(data, false, data.normalizeContrast);
    const canvas = cloneCanvas(RENDERERCANVAS);
    const filename = getSurfaceInfoString(data, 1);
    downloadCanvas(canvas, filename);
    ResetRenderImage(data);
  };

  // for each surface slant
  for (let i = 0; i < numSets; i += 1) {
    for (let surfaceIndex = 0; surfaceIndex < SURFACESLANTS.length; surfaceIndex += 1) {
      const surfaceSlant = SURFACESLANTS[surfaceIndex];
      // material
      for (let materialIndex = 0; materialIndex < materials.length; materialIndex += 1) {
        // directional light slants
        const material = materials[materialIndex][1];
        for (let lightSlantIndex = 0;
          lightSlantIndex < DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]].length;
          lightSlantIndex += 1) {
          // pretest and test image surface data
          const lightSlant = DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]][lightSlantIndex];

          const testDataDirectional = {
            amplitude: AMPLITUDES[surfaceSlant],
            seed,
            choice,
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
          surfaceDataDirectional.then(downloadFunction);
        }
        // matlab
        const testData = {
          amplitude: AMPLITUDES[surfaceSlant],
          seed,
          choice,
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
        surfaceData.then(downloadFunction);
      }
      // mathematica
      if (!normalizeContrast) {
        const testData = {
          amplitude: AMPLITUDES[surfaceSlant],
          seed,
          choice,
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
        surfaceData.then(downloadFunction);
      }
    }
  }
}

function getContrastData(gammaRed, gammaGreen, gammaBlue, numSets, sampleSize,
  normalizeContrast, surfaceSlantChoice, materialChoice = MATERIALS.MATTE) {
  const choice = CHOICE.HILL;
  const materials = Object.entries(MATERIALS);
  const averageGammaFactor = (gammaRed + gammaGreen + gammaBlue) / 3;
  const { matteMaterial, glossyMaterial } = CustomShaderMaterial(averageGammaFactor);
  const contrastMaterialLookup = getAllContrastMaterial(averageGammaFactor);
  // const matteMaterial = MATTEMATERIAL;
  // const glossyMaterial = GLOSSYMATERIAL;

  const downloadFunction = (data) => {
    RenderImage(data, false, data.normalizeContrast);
    const contrastData = GetLuminanceAndStandardDeviation(RENDERERCANVAS);
    ResetRenderImage(data);
    return contrastData;
  };

  const averageLuminanceAndSTD = (data) => {
    let r = 0;
    let g = 0;
    let b = 0;
    let stdR = 0;
    let stdG = 0;
    let stdB = 0;

    let minR = 255;
    let minG = 255;
    let minB = 255;
    let minStdR = 255;
    let minStdG = 255;
    let minStdB = 255;

    let maxR = 0;
    let maxG = 0;
    let maxB = 0;
    let maxStdR = 0;
    let maxStdG = 0;
    let maxStdB = 0;

    for (let i = 0; i < data.length; i += 1) {
      r += data[i].r;
      g += data[i].g;
      b += data[i].b;
      stdR += data[i].stdR;
      stdG += data[i].stdG;
      stdB += data[i].stdB;

      minR = Math.min(minR, data[i].r);
      minB = Math.min(minB, data[i].b);
      minG = Math.min(minG, data[i].g);
      minStdR = Math.min(minStdR, data[i].stdR);
      minStdG = Math.min(minStdG, data[i].stdG);
      minStdB = Math.min(minStdB, data[i].stdB);

      maxR = Math.max(maxR, data[i].r);
      maxB = Math.max(maxB, data[i].b);
      maxG = Math.max(maxG, data[i].g);
      maxStdR = Math.max(maxStdR, data[i].stdR);
      maxStdG = Math.max(maxStdG, data[i].stdG);
      maxStdB = Math.max(maxStdB, data[i].stdB);
    }
    r /= data.length;
    g /= data.length;
    b /= data.length;
    stdR /= data.length;
    stdG /= data.length;
    stdB /= data.length;



    console.log(`
    length: ${data.length},
    surfaceSlant: ${data[0].surfaceSlant},
    lightSlant: ${data[0].lightSlant},
    material: ${data[0].material},
    r: ${r},
    g: ${g},
    b: ${b},
    stdR: ${stdR},
    stdG: ${stdG},
    stdB: ${stdB},
    --------------
    minR: ${minR},
    minG: ${minG},
    minB: ${minB},
    minStdR: ${minStdR},
    minStdG: ${minStdG},
    minStdB: ${minStdB},
    maxR: ${maxR},
    maxG: ${maxG},
    maxB: ${maxB},
    maxStdR: ${maxStdR},
    maxStdG: ${maxStdG},
    maxStdB: ${maxStdB},
    `);
  };

  const data = {};

  // for each surface slant
  for (let i = 0; i < numSets; i += 1) {
    for (let surfaceIndex = 0; surfaceIndex < SURFACESLANTS.length; surfaceIndex += 1) {
      // choice
      const surfaceSlant = SURFACESLANTS[surfaceIndex];
      if (surfaceSlant !== surfaceSlantChoice) continue;
      data[surfaceSlant] = {};
      for (let materialIndex = 0; materialIndex < materials.length; materialIndex += 1) {
        // directional light slants
        const material = materials[materialIndex][1];
        data[surfaceSlant][material] = {};
        if (material !== materialChoice) continue;
        // for (let lightSlantIndex = 0;
        //   lightSlantIndex < DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]].length;
        //   lightSlantIndex += 1) {
        //   // pretest and test image surface data
        //   const lightSlant = DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]][lightSlantIndex];
        //   data[surfaceSlant][material][lightSlant] = [];

        //   for (let sampleNum = 0; sampleNum < sampleSize; sampleNum += 1) {
        //     const seed = getRandomSeed();
        //     const testDataDirectional = {
        //       amplitude: AMPLITUDES[surfaceSlant],
        //       seed,
        //       choice,
        //       material,
        //       light: LIGHTS.DIRECTIONAL,
        //       lightSlant,
        //       surfaceSlant,
        //       gammaRed,
        //       gammaGreen,
        //       gammaBlue,
        //       matteMaterial,
        //       glossyMaterial,
        //       contrastMaterialLookup,
        //       normalizeContrast,
        //     };
        //     // different amplitude values for different materials
        //     const surfaceDataDirectional = getSurfaceData(testDataDirectional);
        //     const contrastData = surfaceDataDirectional.then(downloadFunction);
        //     contrastData.then((data) => {
        //       data.surfaceSlant = surfaceSlant;
        //       data.material = material;
        //       data.lightSlant = lightSlant;
        //     });
        //     data[surfaceSlant][material][lightSlant].push(contrastData);
        //   }
        // }
        // matlab
        data[surfaceSlant][material][LIGHTS.MATLAB] = [];
        for (let sampleNum = 0; sampleNum < sampleSize; sampleNum += 1) {
          const seed = getRandomSeed();
          const testData = {
            amplitude: AMPLITUDES[surfaceSlant],
            seed,
            choice,
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
          const contrastData = surfaceData.then(downloadFunction);
          contrastData.then((data) => {
            data.surfaceSlant = surfaceSlant;
            data.material = material;
            data.lights = LIGHTS.MATLAB;
          });
          data[surfaceSlant][material][LIGHTS.MATLAB].push(contrastData);
        }
      }
    }
  }

  for (let surfaceIndex = 0; surfaceIndex < SURFACESLANTS.length; surfaceIndex += 1) {
    const surfaceSlant = SURFACESLANTS[surfaceIndex];
    if (surfaceSlant !== surfaceSlantChoice) continue;
    for (let materialIndex = 0; materialIndex < materials.length; materialIndex += 1) {
      // directional light slants
      const material = materials[materialIndex][1];
      if (material !== materialChoice) continue;
      // for (let lightSlantIndex = 0;
      //   lightSlantIndex < DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]].length;
      //   lightSlantIndex += 1) {
      //   // pretest and test image surface data
      //   const lightSlant = DIRECTIONALLIGHTSLANTS[SURFACESLANTS[surfaceIndex]][lightSlantIndex];
      //   Promise.all(data[surfaceSlant][material][lightSlant]).then(averageLuminanceAndSTD);
      // }
      Promise.all(data[surfaceSlant][material][LIGHTS.MATLAB]).then(averageLuminanceAndSTD);
    }
  }

  return data;
}

getContrastData(1, 1, 1, 1, 1, true, 45, MATERIALS.MATTE);
