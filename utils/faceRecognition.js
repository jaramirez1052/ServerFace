const faceapi = require('face-api.js');

async function extraerDescriptoresFaciales(imagenBuffer) {
  try {
    // Cargar modelos de reconocimiento faciales
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./modelos');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./modelos');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./modelos');

    // Cargar y preparar la imagen (Buffer recibido)
    const imagen = await faceapi.bufferToImage(imagenBuffer);

    // Detectar rostros y extraer descriptores
    const detecciones = await faceapi
      .detectAllFaces(imagen)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detecciones.length === 0) {
      throw new Error("No se detectaron rostros en la imagen.");
    }

    return detecciones[0].descriptor;
  } catch (err) {
    console.error("Error en el reconocimiento facial:", err);
    throw err; 
  }
}

module.exports = extraerDescriptoresFaciales;