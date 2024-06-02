var formidable = require('formidable');
var util = require('util');
var express = require('express');
var cors = require('cors');
var fs = require('fs');
const CryptoJS = require('crypto-js');
//const queryString = require('query-string');
const qs = require('qs');
var app = express();
app.use(cors());
app.use(express.static(__dirname));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
function decodeHashedQueryStringToObject(hashedQueryString) {
    try {
        console.log('Hashed Query String:', hashedQueryString);
        const decodedHash = decodeURIComponent(hashedQueryString);
        console.log('Decoded Hash:', decodedHash);
        const bytes = CryptoJS.AES.decrypt(decodedHash, 'your-secret-key');
        const qsString = bytes.toString(CryptoJS.enc.Utf8);
        console.log('Query String:', qsString);

        if (!qsString) {
            throw new Error('Failed to decrypt or parse the query string');
        }

        const decodedObject = qs.parse(qsString);

        // Convert numeric values back to numbers
        for (let key in decodedObject) {
            if (!isNaN(decodedObject[key])) {
                decodedObject[key] = Number(decodedObject[key]);
            }
        }

        return decodedObject;
    } catch (error) {
        console.error('Error during decryption:', error.message);
        throw error;
    }
}


app.post('/upload', function (req, res) {

    // const folderName = req.headers['Folder-Name'];
    // console.log("Folder Name: ", folderName);


    var form = new formidable.IncomingForm();
    const folderName = req.query.folderName; 
console.log('??>',decodeHashedQueryStringToObject(folderName))

    form.parse(req, function (err, fields, files) {
        // console.log(util.inspect({
        //     fields: fields,
        //     files: files
        // }));

        fs.readFile(files.RemoteFile.path, function (err, data) {
            // save file from temp dir to new dir
            var newPath = __dirname + "/uploaded/" + files.RemoteFile.name;
            fs.writeFile(newPath, data, function (err) {
                if (err) throw err;
                console.log('file saved');
                res.end();
            });
        });
    });
})

var server = app.listen(2020, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('listening at http://%s:%s', host, port);
})