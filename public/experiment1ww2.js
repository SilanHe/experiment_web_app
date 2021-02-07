addEventListener("message", event => {
  const [ctx, data] = event.data;
  ctx.putImageData(data, 0, 0);
});
