const tf = require('@tensorflow/tfjs-node');
const faceapi = require('@vladmandic/face-api');
const canvas = require("canvas");
const transactionModel = require('../models/transaction.model');
const fetch = require('node-fetch');
const fs = require('fs');

const { Canvas, Image, ImageData } = canvas; 
const modelPathRoot = './model';
const imgPathRoot = './demo'; // modify to include your sample images
const minConfidence = 0.15;
const maxResults = 5;
let optionsSSDMobileNet;

class FaceApiService{

    constructor () {     
        faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
        faceapi.env.monkeyPatch({ fetch: fetch });     
        optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({ minConfidence, maxResults });        
    }

    image = async (input) =>{
        // read input image file and create tensor to be used for processing
        let buffer;
        console.log('Loading image:', input);
        if (input.startsWith('http:') || input.startsWith('https:')) {
            const res = await fetch(input);
            if (res && res.ok) 
                buffer = await res.buffer();
            else 
                console.log('Invalid image URL:', input, res.status, res.statusText, res.headers.get('content-type'));
        } else {
          buffer = fs.readFileSync(input);
        }
      
        // decode image using tfjs-node so we don't need external depenencies
        // can also be done using canvas.js or some other 3rd party image library
        if (!buffer) return {};
        
        const tensor = tf.tidy(() => {
            const decode = faceapi.tf.node.decodeImage(buffer, 3);
            let expand;
            if (decode.shape[2] === 4) { // input is in rgba format, need to convert to rgb
                const channels = faceapi.tf.split(decode, 4, 2); // tf.split(tensor, 4, 2); // split rgba to channels
                const rgb = faceapi.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
                expand = faceapi.tf.reshape(rgb, [1, decode.shape[0], decode.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
            } else {
                expand = faceapi.tf.expandDims(decode, 0);
            }
            const cast = faceapi.tf.cast(expand, 'float32');
            return cast;
        });
        return tensor;
      }
      
    detect = async(tensor) =>{
        // console.log('tensor');
        // console.log(tensor);
        try {
            const detections = await faceapi
                .detectSingleFace(tensor, optionsSSDMobileNet)
                .withFaceLandmarks()           
                .withFaceDescriptor();  
            //console.log(detections);       
            return detections;
        } catch (err) {
            console.log('Caught error', err.message);
            return [];
        }
      }
      
    match = async (imgpath1, imgpath2) =>{
        console.log('FaceApiService:match');
       
        let descriptors = { desc1: null, desc2: null };        
        let detection;

        detection = await this.detect(await this.image(imgpath1));
        descriptors.desc1 = detection.descriptor;
        // console.log('Model desc1');
        // console.log(descriptors.desc1);
       
        detection = await this.detect(await this.image(imgpath2));
        descriptors.desc2 = detection.descriptor;
        // console.log('Model desc2');
        // console.log(descriptors.desc2);

        const distance = faceapi.utils.round(
            faceapi.euclideanDistance(descriptors.desc1, descriptors.desc2)
        );
        console.log('distance: ' + distance);
        return distance;
    }

    matchAll = async () =>{
        console.log('FaceApiService:Get');
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPathRoot);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPathRoot);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPathRoot);
        await faceapi.tf.setBackend('tensorflow');
        await faceapi.tf.enableProdMode();
        await faceapi.tf.ENV.set('DEBUG', false);
        await faceapi.tf.ready();
        console.log('Model loaded');

        let transactions = await transactionModel.Transaction.GetAll();

        transactions.forEach( 
            async (transac) => { 
                console.log("Id: " + transac.id);                
                console.log("Image1: " + transac.image_1);
                console.log("Image2: " + transac.image_2);
                let distance = await this.match(transac.image_1, transac.image_2);
                await transactionModel.Transaction.Update(transac.id, distance);
            }
        );
    }


}

module.exports = new FaceApiService();
