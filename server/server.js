var formidable = require('formidable');
var util = require('util');
var express = require('express');
var cors = require('cors');
const crypto = require('crypto-js');
var fs = require('fs');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const qs = require('qs');
const axios = require('axios'); // For making API calls
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

const secretKey = 'your-secret-key'; // Use the same secret key as in React

function decryptObject(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (err) {
        throw new Error('Failed to decrypt token');
    }
}

function decodeHashedQueryStringToObject(hashedQueryString) {
    try {
       // console.log('Hashed Query String:', hashedQueryString);
        const decodedHash = decodeURIComponent(hashedQueryString);
      //  console.log('Decoded Hash:', decodedHash);
        const bytes = CryptoJS.AES.decrypt(decodedHash, 'your-secret-key');
        const qsString = bytes.toString(CryptoJS.enc.Utf8);
        //console.log('Query String:', qsString);

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
    var form = new formidable.IncomingForm();
    const folderName = req.query.folderName;
    const obj = decodeHashedQueryStringToObject(folderName);

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.error('Form parse error:', err);
            res.status(500).send('Form parse error');
            return;
        }

        fs.readFile(files.RemoteFile.path, function (err, data) {
            if (err) {
                console.error('Read file error:', err);
                res.status(500).send('Read file error');
                return;
            }

            var newPath = __dirname + "/uploaded/" + obj.name;
            fs.writeFile(newPath, data, function (err) {
                let status = 'failure';
                if (err) {
                    console.error('File save error:', err);
                } else {
                    console.log('File saved as ' + obj.name);
                    status = 'success';
                }
                //res.end();
               // res.status(200).send('File processed');

              //  Call the endpoint API with the object and status
              if(obj.mode==='add'){
                axios.post('https://charge.persiangulfmall.com/api/newfile', { ...obj, status: status })
                    .then(apiRes => {
                        console.log('API response:', apiRes.data);
                        res.status(200).send('File processed');
                        res.end();
                    })
                    .catch(apiErr => {
                        console.error('API call error:', apiErr);
                        res.status(500).send('API call error');
                        res.end();
                    });
                  }
                  else{
                    res.status(200).send('File processed');
                    res.end();
                  }
            });
        });
    });
});

var server = app.listen(2020, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('listening at http://%s:%s', host, port);
});
