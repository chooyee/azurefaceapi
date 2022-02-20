const msRest = require("@azure/ms-rest-js");
const Face = require("@azure/cognitiveservices-face");
const logger = require('../infrastructure/logger');
const Enum = require('../infrastructure/enum.util');


class AzureFaceApiService{
    constructor () {     
        let key = "9d8e6ab1281c4deeaf1929c20ff0059e";
        let endpoint = "https://chooyeefaceapi.cognitiveservices.azure.com/";
        let credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
        this.client = new Face.FaceClient(credentials, endpoint);
    }

    faceMatch = async (image_url)=>{
        let detected_faces = await this.detect(image_url);
        if (detected_faces.length>1)
        {
            return await this.compare(detected_faces[0].faceId, detected_faces[1].faceId);            
        }
        else{
            return {"status":Enum.Status.Fail, "message":"Failed to detect face", "result":detected_faces};
        }
    }

    detect = async(image_url, returnFaceLandmarks=false) =>{
        console.log("========DETECT FACES========");
        console.log(image_url);
        try {
            // let detected_faces = await client.face.detectWithUrl(image_base_url + image_file_name,
            //     {
            //         returnFaceAttributes: ["Accessories","Age","Blur","Emotion","Exposure","FacialHair","Gender","Glasses","Hair","HeadPose","Makeup","Noise","Occlusion","Smile","QualityForRecognition"],
            //         // We specify detection model 1 because we are retrieving attributes.
            //         detectionModel: "detection_01",
            //         recognitionModel: "recognition_03"
            //     });
            let detected_faces = await this.client.face.detectWithUrl(image_url,
                {
                    detectionModel: "detection_03",
                    recognitionModel: "recognition_04",
                    returnFaceLandmarks: returnFaceLandmarks
                });
            console.log (detected_faces.length + " face(s) detected from image " + image_url + ".");           
            return detected_faces;
        } catch (err) {
            console.log(`AzureFaceApiService=>detect: Error: ${err.message}`);
            logger.log.error(`AzureFaceApiService=>detect: Error: ${err.message}`);
            return [];
        }
    }

    compare = async (source_image_id_1, source_image_id_2)=>{
        try{
            let verify_result = await this.client.face.verifyFaceToFace(source_image_id_1, source_image_id_2);
            console.log(verify_result);
            return {status:Enum.Status.Success, message:"", result:verify_result};
        }
        catch (err) {
            console.log(`AzureFaceApiService=>compare: Error: ${err.message}`);
            logger.log.error(`AzureFaceApiService=>compare: Error: ${err.message}`);
            return {status:Enum.Status.Fail, message:err.message};
        }

    }
}

module.exports = new AzureFaceApiService();