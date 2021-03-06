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
  return (normalizedL ** (1 / gamma)) * 255;
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

function GammaCorrectionWidget(color1, color2, groupName, sliderName, labelName, minusName, plusName) {
  const canvas = GammaCorrectionCanvas(color1, color2);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sliderGroup = document.getElementById(groupName);
  sliderGroup.appendChild(canvas);

  const rangeslider = $(`#${sliderName}`);
  const minus = $(`#${minusName}`);
  const plus = $(`#${plusName}`);
  const output = $(`#${labelName}`);
  output.innerHTML = rangeslider.value;

  minus.onclick = function() {
    rangeslider.val(parseFloat(rangeslider.val()) - 0.01);
    rangeslider.oninput();
  };

  plus.onclick = function() {
    rangeslider.val(parseFloat(rangeslider.val()) + 0.01);
    rangeslider.oninput();
  };

  function zoom(direction) {
    const step = parseFloat(rangeslider.attr('step'));
    const currentSliderValue = parseFloat(rangeslider.val());
    let newStepValue;
    if (direction === "out") {
      newStepValue = currentSliderValue - step;
    } else {
      newStepValue = currentSliderValue + step;
    }
    rangeslider.val(newStepValue).change();
  }

  minus.click((event) => {
    zoom("out");
  });

  plus.click((event) => {
    zoom("in");
  });

  rangeslider.on('input change', (event) => {
    output.text($(event.currentTarget).val());
    CanvasFromLinearToSRGB(ctx, imageData, $(event.currentTarget).val());
  });

  return rangeslider;
}
