const fetch = require('node-fetch');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = require('canvas');
const path = require('path');

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Iniciar la detección facial
async function recognizeFace() {
    try {
        await loadModels();
        startFaceDetection();
    } catch (error) {
        console.error('Error en la detección facial:', error);
    }
}

// Obtener el stream de video de la webcam
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                resolve();
            };
        });
        videoElement.play();
        return videoElement;
    } catch (error) {
        console.error('Error al obtener el stream de video:', error);
        throw error;
    }
}

// Cargar los modelos de detección facial
async function loadModels() {
    const MODEL_PATH = path.resolve(__dirname, '../models');
    try {
        await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
        console.log('Modelos cargados correctamente.');
    } catch (err) {
        console.error('Error al cargar los modelos:', err);
        throw err;
    }
}

// Iniciar la detección facial en intervalos regulares
async function startFaceDetection() {
    try {
        const video = await startWebcam();
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length > 0) {
                const descriptor = Array.from(detections[0].descriptor);
                sendDescriptorToServer(descriptor);
            }
        }, 300);
    } catch (error) {
        console.error('Error al iniciar la detección facial:', error);
    }
}

// Enviar el descriptor al servidor
async function sendDescriptorToServer(descriptors) {
    try {
        const response = await fetch('http://149.50.138.128:4010/validar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptors })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la solicitud de reconocimiento facial');
        }

        const data = await response.json();
        if (data.message === "Coincidencia encontrada") {
            console.log('Coincidencia encontrada:', data.usuario);
        } else {
            console.log('Usuario no registrado');
        }
    } catch (error) {
        console.error('Error al enviar descriptor al servidor:', error);
    }
}

module.exports = {
    recognizeFace,
    sendDescriptorToServer,
    startWebcam,
    loadModels
};