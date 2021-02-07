/* Gamme Correction Widget*/

// EVENT LISTENERS

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  console.log(`x: ${x}, y: ${y}`);
}

// CONSTRUCTOR

function GammaCorrectionCanvas(color1, color2) {
  const CANVAS = document.createElement("CANVAS");
  const ctx = CANVAS.getContext("2d");
  const width = 200;
  const height = 200;
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  // draw the test
  // set constants
  const radius = Math.floor(width / 3);
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  // draw a single bar
  ctx.fillStyle = color1;
  ctx.strokeStyle = color1;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#000000';
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 2) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.fillStyle = '#000000';

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color2;
  ctx.fill();

  return CANVAS;
}

function CreateCanvas() {
  const canvas = document.createElement("CANVAS");
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  return {
    canvas,
    ctx,
  };
}

// FUNCTIONS

function linearToSRGB(l, gamma = 2.4) {
  normalizedL = l / 255;
  if (normalizedL >= 0 && normalizedL <= 0.0031308) {
    return 12.92 * normalizedL * 255;
  }
  return (1.055 * normalizedL ** (1 / gamma) - 0.055) * 255;
}

function CanvasFromLinearToSRGB(ctx, imageData, gamma) {
  const data = Uint8ClampedArray.from(imageData.data);
  // gamma correction
  for (let i = 0; i < data.length; i += 4) {
    data[i] = linearToSRGB(data[i], gamma);
    data[i + 1] = linearToSRGB(data[i + 1], gamma);
    data[i + 2] = linearToSRGB(data[i + 2], gamma);
  }

  const newImageData = new ImageData(data, ctx.canvas.width);
  ctx.putImageData(newImageData, 0, 0);
}

// converts from linear to SRGB and makes our green background dark dark gray
function CanvasFromLinearToSRGBPerChannel(data, gammaRed, gammaGreen, gammaBlue) {
  let redIndex = 0;
  // gamma correction
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) {
      data[i] = 17;
      data[i + 1] = 17;
      data[i + 2] = 17;
      data[i + 3] = 255;
    } else if (data[i] === 255 && data[i + 1] === 0
      && data[i + 2] === 0 && redIndex === 0) {
      redIndex = i;
    } else {
      data[i] = linearToSRGB(data[i], gammaRed);
      data[i + 1] = linearToSRGB(data[i + 1], gammaGreen);
      data[i + 2] = linearToSRGB(data[i + 2], gammaBlue);
    }
  }

  return redIndex;
}

function DrawBigDisk(ctx, redIndex) {
  const radius = Math.floor(ctx.canvas.width / 40);
  const centerY = Math.floor((redIndex / 4) / ctx.canvas.width);
  const centerX = (Math.floor(redIndex / 4) % ctx.canvas.width);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#ff0000';
  ctx.fill();
}

function GammaCorrectionWidget(color1, color2, groupName, sliderName, labelName) {
  const canvas = GammaCorrectionCanvas(color1, color2);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sliderGroup = document.getElementById(groupName);
  sliderGroup.appendChild(canvas);

  const rangeslider = document.getElementById(sliderName);
  const output = document.getElementById(labelName);
  output.innerHTML = rangeslider.value;

  rangeslider.oninput = function() {
    output.innerHTML = this.value;
    CanvasFromLinearToSRGB(ctx, imageData, this.value);
  };

  return rangeslider;
}

function NormalizeContrast(ctx, targetMean, targetStd, gammaRed, gammaBlue, gammaGreen) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
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

  let redIndex = 0;

  for (let i = 0; i < data.length; i += 4) {
    // remove green background and make it dark gray
    if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) {
      data[i] = 17;
      data[i + 1] = 17;
      data[i + 2] = 17;
      data[i + 3] = 255;
    } else if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0 && redIndex === 0) {
      // eslint-disable-next-line no-continue
      redIndex = i;
    } else {
      // contrast normalization
      data[i] = Math.round(targetMean.r + targetStd.r * ((data[i] - r) / stdR));
      data[i + 1] = Math.round(targetMean.g + targetStd.g * ((data[i + 1] - g) / stdG));
      data[i + 2] = Math.round(targetMean.b + targetStd.b * ((data[i + 2] - b) / stdB));
      // gamma correction
      data[i] = linearToSRGB(data[i], gammaRed);
      data[i + 1] = linearToSRGB(data[i + 1], gammaGreen);
      data[i + 2] = linearToSRGB(data[i + 2], gammaBlue);
    }
  }

  const newImageData = new ImageData(data, ctx.canvas.width);
  ctx.putImageData(newImageData, 0, 0);

  const radius = Math.floor(ctx.canvas.width / 24);
  const centerX = Math.floor(redIndex / 4 / ctx.canvas.width) - radius;
  const centerY = (Math.floor(redIndex / 4) % ctx.canvas.width) - radius;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#ff0000';
  ctx.fill();

  return newImageData;
}
