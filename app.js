const express = require('express');  //app router
  const multer = require('multer'); // file storing middleware
  const bodyParser = require('body-parser'); //cleans our req.body
// SETUP APP
  const app = express();   //This IS an express app
  const port = process.env.PORT || 8080;  //preconfig your port!
  app.use(bodyParser.urlencoded({extended:false})); //handle body requests
  app.use(bodyParser.json()); // let's make JSON work too!
  app.use('/', express.static(__dirname + '/public'));
  app.listen(port,()=>console.log("app is listening on "+port)) 
  var unoconv = require("lib-unoconv");



const multerConfig = {
    
    storage: multer.diskStorage({
     destination: function(req, file, next){
       next(null, './public/file_storage/');
       }, 
       
       filename: function(req, file, next){
        console.log(file);
        //get the file mimetype ie 'image/jpeg' split and prefer the second value ie'jpeg'
        const ext = file.mimetype.split('/')[1];
        //set the file fieldname to a unique name containing the original name, current datetime and the extension.
        next(null, file.originalname);
      }
        
        //Then give the file a unique name
    })
}

app.get('/index', function(req, res){
    res.render('index.html');
});
app.post('/upload',multer(multerConfig).single('file'),function(req,res){

var data=[];
var filepath ="./public/file_storage/"+req.file.originalname;
var XLSX = require("xlsx");
var workbook = XLSX.readFile(filepath);
var sheet_name_list = workbook.SheetNames;
console.log("sheet_name", sheet_name_list);
sheet_name_list.forEach(async function(y) { 
  if (y == "XYZ") {
    var worksheet = workbook.Sheets[y];
    var headers = {};
    var data = [];
    {
        var col1 =[];
        var headers = {};
       var data = [];
       var datacol =[]
          var datacol1 =[]
   for (z in worksheet) {
           if (z[0] === "!") continue;
           //parse out the column, row, and value
           var tt = 0;
           for (var i = 0; i < z.length; i++) {
             if (!isNaN(z[i])) {
               tt = i;
               break;
             }
           }
           var col = z.substring(0, tt);
           
           if(col == "A"){
             datacol.push(worksheet[z].w)
           }
           if(col == "B"){
               
             datacol1.push(worksheet[z].w)
           }
   }
    }
}
var JSZip = require("jszip");
var Docxtemplater = require("docxtemplater");
var fs = require("fs");
var path = require("path");
var content = fs.readFileSync(
  path.resolve("./report/report.docx"),
  "binary"
);
var zip = new JSZip(content);
var doc = new Docxtemplater();
doc.loadZip(zip);
doc.setData({
  
  name :datacol1[0],
  address :datacol1[1],
  date : datacol1[2],
  pincode :datacol1[3]

   

   


   

})
try {
  doc.render();
} catch (error) {
  var e = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    properties: error.properties
  };
  console.log(
    JSON.stringify({
      error: e
    })
  );
  throw error;
}
var buf = doc.getZip().generate({
  type: "nodebuffer",
  compression: "DEFLATE"
});
let report_name ="PdfReport"
await fs.writeFileSync(
  path.resolve("./reports/" + report_name + ".docx"),
  buf,
  "binary"
);



await unoconv.convert(
  "./reports/" + report_name + ".docx",
  "pdf",
  async function (err, result) {
    await fs.writeFile(
      "./reports/" + report_name + ".pdf",
      result, async function (err) {
        if(err){
           resolve({
            status: 400,
            message: "pdf sent failed",
            path: null
          });
        }else{
         
          
         
      }

      }
    );
    // console.log("path==========>>..", path);
  }
);
})
res.send("pdf created successfully")



    




    

    // res.send('Complete!');



 });