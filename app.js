const express = require("express");
const multer = require("multer");
const uuid = require("uuid").v4;
const axios = require("axios");
const path = require("path");
const fs = require("fs");

//#region readDirectory

const directoryPath = path.join(__dirname, "uploads");
var dirObj = {};

let readDirectory = function() {
    fs.readdir(directoryPath, function(err, files) {
        //handling error
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }
        files.forEach(function(file) {
            // If its a folder
            if (!file.includes(".")) {
                // Call method again
                fs.readdir(path.join(directoryPath, file), function(err, files) {
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
//#endregion
readDirectory();


let getFilesInFolder = function(id) {
    return dirObj[`${id}`];
}

let initUploads = function() {
    var dir = `./uploads`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}
initUploads();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        var dir = `./uploads/${req.body.id}`;
        // console.log(dir);
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
// app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index"); // index refers to index.ejs
});

app.post("/login", (req, res) => {
    var username = req.body.id;
    var usernamestring = username.toLowerCase();
    var files = dirObj[`${usernamestring}`];
    if (files != undefined) {
        // console.log(dirObj);
        if (usernamestring != "admin") {
            res.render("fileoverview", {
                username: usernamestring,
                files: files
            });
        } else {
            res.render("fileoverview", {
                username: usernamestring,
                files: files,
                directory: JSON.stringify(dirObj, null, 2)
            });
        }

    } else {
        res.render("failure", {
            username: usernamestring
        });
    }
});

// app.get("/files", async(req, res) => {

//     res.render("fileoverview", {
//         files: getFilesInFolder()
//     });
// });


app.post("/upload", upload.single("avatar"), (req, res) => {
    readDirectory();
    res.render("uploadsucces", {
        username: req.body.id
    });
});

app.post("/createnewuser", (req, res) => {
    var dir = `./uploads/${req.body.id}`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    readDirectory();
    res.render("index");
});

app.get("/directory/:id/:file", (req, res) => {

    var dir = `./uploads/${req.params.id}/${req.params.file}`;
    // console.log(dir);
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

app.listen(3001, () => console.log("App is listening on 3001..."));