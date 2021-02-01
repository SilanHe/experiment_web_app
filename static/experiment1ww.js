// converts from linear to SRGB and makes our green background dark dark gray
function linearToSRGB(l, gamma = 2.4) {
  normalizedL = l / 255;
  if (normalizedL >= 0 && normalizedL <= 0.0031308) {
    return 12.92 * normalizedL * 255;
  }
  return (1.055 * normalizedL ** (1 / gamma) - 0.055) * 255;
}

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

addEventListener("message", event => {
  const [data, gammaRed, gammaGreen, gammaBlue, width] = event.data;
  const redIndex = CanvasFromLinearToSRGBPerChannel(data, gammaRed, gammaGreen, gammaBlue);
  const imageData = new ImageData(data, width);
  postMessage([redIndex, imageData]);
});
