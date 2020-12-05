function clearDocumentBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

clearDocumentBody();

document.body.appendChild(RENDERERCANVAS);
const myWorker = new Worker('static/contrast.js');