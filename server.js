const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const cors = require("cors");
const multer  = require('multer')

const faceController = require("./controllers/faceapi.controller");

const app = express();

var corsOptions = {
    origin: "http://localhost:3000"
};

     
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
     
app.use(cors(corsOptions));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// const db = require("./models");
// db.sequelize.sync({'alter':true});

const viewsDir = path.join(__dirname, 'views');
app.use(express.static(viewsDir));
app.use(express.static(path.join(__dirname, './public')));

const maxSize = 100 * 1000 * 1000;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {  
        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + "-" + Date.now()+".jpg")
    }
})
var upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    // fileFilter: function (req, file, cb){
    
    //     // Set the filetypes, it is optional
    //     var filetypes = /jpeg|jpg|png/;
    //     var mimetype = filetypes.test(file.mimetype);
  
    //     var extname = filetypes.test(path.extname(
    //                 file.originalname).toLowerCase());
        
    //     if (mimetype && extname) {
    //         return cb(null, true);
    //     }
      
    //     cb("Error: File upload only supports the "
    //             + "following filetypes - " + filetypes);
    //   } 
  
// mypic is the name of file attribute
}); 

// app.get('/', (req, res) => res.redirect('/face_detection'))
app.get('/', (req, res) => res.render('index'));

app.post('/profile', upload.single('image'), faceController.Upload)

app.post('/upload', (req, res)=>{
    console.log(req);
    console.log(req.params.userid);
    console.log(req.params.image64);
    res.send("Success, Image uploaded!");
});

app.get("/match", faceController.FaceMatch);


app.post('/fetch_external_image', async (req, res) => {
    const { imageUrl } = req.body
    if (!imageUrl) {
        return res.status(400).send('imageUrl param required')
    }
    try {
        const externalResponse = await request(imageUrl)
        res.set('content-type', externalResponse.headers['content-type'])
        return res.status(202).send(Buffer.from(externalResponse.body))
    } catch (err) {
        return res.status(404).send(err.toString())
    }
})

app.listen(process.env.PORT || 3000, () => console.log('Listening on port 3000!'))
