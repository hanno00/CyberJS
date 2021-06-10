const express = require("express");
const multer = require("multer");
const uuid = require("uuid").v4;

const path = require("path");
const fs = require("fs");

const directoryPath = path.join(__dirname, "uploads");
var dirObj = {};

let readDirectory = function () {
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    files.forEach(function (file) {
      // If its a folder
      if (!file.includes(".")) {
        // Call method again
        fs.readdir(path.join(directoryPath, file), function (err, files) {
          //handling error
          if (err) {
            return console.log("Unable to scan directory: " + err);
          }
          //Add all children into array with folder as paramater
          dirObj[`${file}`] = files;
          // dirObj.push({ [file]: [files] });
        });
      } else {
        dirObj[`file`] = null;
      }
    });
  });
};
readDirectory();


let getFilesInFolder = function (id) {
  return dirObj[`${id}`];
}

let initUploads = function () {
  var dir = `./uploads`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
}
initUploads();

// setTimeout((x) => {
//   console.log(JSON.stringify(dirObj, null, 2));
// }, 1000);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var dir = `./uploads/${req.body.id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    // cb(null, `${uuid()}-${originalname}`);
    cb(null, `${originalname}`);
  },
});

const upload = multer({ storage });

const app = express();
app.use(express.static("public"));

app.post("/upload", upload.array("avatar"), (req, res) => {
  readDirectory();
  return res.json({ status: "OK" });
});

app.get("/directory/:id/:file", (req, res) => {

  var dir = `./uploads/${req.params.id}/${req.params.file}`;
  console.log(dir);
    if (fs.existsSync(dir)) {
      res.sendFile(path.join(__dirname, dir));
    }
    // res.send(getFilesInFolder(req.params.id));
});

app.get("/directory/:id", (req, res) => {
  // setTimeout((x) => {
    res.send(getFilesInFolder(req.params.id));
  //   res.sendFile(path.join(__dirname, "/uploads/15/test.txt"));
  // }, 1000);
});

app.get("/directory", (req, res) => {
  setTimeout((x) => {
    res.send(JSON.stringify(dirObj, null, 2));
  }, 1000);
});

app.listen(3001, () => console.log("App is listening..."));
