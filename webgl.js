const THREE = require('three');

// CONSTANTS
// -----------------------------------------------------------------------------

const CHOICE = {
  HILL: 'Hill',
  VALLEY: 'Valley',
};
const AMPLITUDES = {
  30: 0.45,
  45: 0.35,
  60: 0.18,
};

const UMBRELLATHRESHHOLD = {
  30: 3,
  45: 2.5,
  60: 1.1,
};

const NUM_POINTS = 350;
const SimplexNoise = require('simplex-noise');

// Functions
// -----------------------------------------------------------------------------

/**
 * generate hills and valleys depending on seed
 */
function hillsAndValleys(amplitude = 1, seed = 1) {
  const simplex = new SimplexNoise(seed);

  const min = -9.4;
  const max = 9.4;
  const range = Math.abs(max - min);
  const increment = range / NUM_POINTS;

  const vertices = new Float32Array(NUM_POINTS * NUM_POINTS * 3);
  let counter = 0;
  for (let i = 0; i < NUM_POINTS; i += 1) {
    for (let j = 0; j < NUM_POINTS; j += 1) {
      // get point coordinates in plane's coordinate system
      // in the plane coordinate system we are using z as the height for the height map
      const x = min + increment * i;
      const y = min + increment * j;

      // get height map / z
      const z = amplitude * simplex.noise2D(x / 2.3, y / 2.3);

      vertices[counter] = x;
      counter += 1;
      vertices[counter] = y;
      counter += 1;
      vertices[counter] = z;
      counter += 1;
    }
  }
  return vertices;
}

function distance(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
}

/**
 * Get both the hill and valley point in the center
 * @param {Array of Number} vertices
 */
function getLocalExtremaInCenter(vertices, umbrellaCurvatureThreshhold, extremaChoice) {
  const centerWidth = 200;
  const startRow = Math.abs(Math.floor(NUM_POINTS / 2 - centerWidth / 2));
  const endRow = startRow + centerWidth;
  function getUmbrellaCurvature(x, y, z, i, j, umbrellaCorners) {
    let kum = 0;// umbrella curvature
    for (let idx = 0; idx < umbrellaCorners.length; idx += 1) {
      const tup = umbrellaCorners[idx];
      const indexNeighbor = ((i - tup[0]) * NUM_POINTS + (j - tup[1])) * 3;
      const nX = vertices[indexNeighbor];
      const nY = vertices[indexNeighbor + 1];
      const nZ = vertices[indexNeighbor + 2];
      const distanceFromNeighborToP = distance(x, y, z, nX, nY, nZ);
      const vNZ = (z - nZ) / distanceFromNeighborToP;
      kum += Math.abs(vNZ);
    }
    return kum;
  }

  // local max and local min tracking variables
  let localMax = Number.MIN_SAFE_INTEGER;
  let localMaxIndex = 0;
  let localMin = Number.MAX_SAFE_INTEGER;
  let localMinIndex = 0;

  if (extremaChoice === CHOICE.HILL) {
    localMinIndex = 1;
  } else {
    localMaxIndex = 1;
  }

  // approximate center area tracking variables
  let numTries = 0;
  const maxTries = 10;

  while (localMaxIndex === 0 || localMinIndex === 0) {
    const localWidth = Math.floor(centerWidth / (15 + numTries * 2));

    const cornerWidth = Math.floor(Math.sin(Math.PI / 2) * localWidth);
    const umbrellaCorners = [
      [-cornerWidth, -cornerWidth],
      [-cornerWidth, cornerWidth],
      [cornerWidth, -cornerWidth],
      [cornerWidth, cornerWidth],
      [-localWidth, 0],
      [localWidth, 0],
      [0, -localWidth],
      [0, localWidth],
    ];

    // for each index in the approximate center area, get local min index and local max index
    for (let i = startRow; i < endRow; i += 1) {
      for (let j = startRow; j < endRow; j += 1) {
        // convert from rowXcol to index in vertices list
        const curIndex = (i * NUM_POINTS + j) * 3;

        // update local min and local max
        const x = vertices[curIndex];
        const y = vertices[curIndex + 1];
        const z = vertices[curIndex + 2];

        // check local local area for other max local points
        if (extremaChoice === CHOICE.HILL && z > localMax) {
          const umbrellaCurvature = getUmbrellaCurvature(x, y, z, i, j, umbrellaCorners);
          if (umbrellaCurvature > umbrellaCurvatureThreshhold) {
            localMax = z;
            localMaxIndex = curIndex;
          }
        }

        // check local local area for other max local points
        if (extremaChoice === CHOICE.VALLEY && z < localMin) {
          const umbrellaCurvature = getUmbrellaCurvature(x, y, z, i, j, umbrellaCorners);
          if (umbrellaCurvature > umbrellaCurvatureThreshhold) {
            localMin = z;
            localMinIndex = curIndex;
          }
        }
      }
    }
    numTries += 1;
    if (maxTries === numTries) {
      throw new Error('maxTries exceeded: too many tries for finding local min and local max');
    }
  }

  if (extremaChoice === CHOICE.HILL) {
    return localMaxIndex;
  }
  return localMinIndex;
}

module.exports = {
  hillsAndValleys,
  getLocalExtremaInCenter,
  AMPLITUDES,
  UMBRELLATHRESHHOLD,
};
