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

function CanvasFromLinearToSRGBPerChannel(ctx, gammaRed, gammaGreen, gammaBlue) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = Uint8ClampedArray.from(imageData.data);
  // gamma correction
  for (let i = 0; i < data.length; i += 4) {
    data[i] = linearToSRGB(data[i], gammaRed);
    data[i + 1] = linearToSRGB(data[i + 1], gammaGreen);
    data[i + 2] = linearToSRGB(data[i + 2], gammaBlue);
  }

  const newImageData = new ImageData(data, ctx.canvas.width);
  ctx.putImageData(newImageData, 0, 0);
}

function placeholder () {
  const canvasRed = GammaCorrectionCanvas('#FF0000', '#7F0000');
  const ctxRed = canvasRed.getContext("2d");
  const imageDataRed = ctxRed.getImageData(0, 0, canvasRed.width, canvasRed.height);
  const sliderGroupRed = document.getElementById('sliderGroupRed');
  sliderGroupRed.appendChild(canvasRed);

  const rangesliderRed = document.getElementById('sliderRangeRed');
  const outputRed = document.getElementById('demoRed');
  console.log(rangesliderRed);
  outputRed.innerHTML = rangesliderRed.value;

  rangesliderRed.oninput = function() {
    outputRed.innerHTML = this.value;
    CanvasFromLinearToSRGB(ctxRed, imageDataRed, this.value);
  };
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

// SCRIPT
// const rangeSliderGray =GammaCorrectionWidget('#FFFFFF', '#7F7F7F', 'sliderGroupGray', 'sliderRangeGray', 'demoGray');
