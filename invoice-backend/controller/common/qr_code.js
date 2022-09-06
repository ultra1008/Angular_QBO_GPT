const QRLogo = require('qr-with-logo');
var common = require("./common");
// var image = require("../../images/rovuck.png");

module.exports.generate_QR_Code = async function (data) {
    // // let stringdata = JSON.stringify(data)
    // console.log("awesome data: ", data)
    // const buffer = await new AwesomeQR({
    //     string: data,
    //     size: 200,
    //     logoImage: "./images/rovuck.png"
    // }).draw();
    // return buffer
    // console.log("qr: ", data)
    return new Promise(async function (resolve, reject) {
        await QRLogo.generateQRWithLogo(data, "images/rovuck.png", {
            errorCorrectionLevel: 'H',
            width: 1000,
            height: 1000,
        }, "Base64", "qrlogo.png", async function (b64) {
            let blob = Buffer.from(b64, 'base64');
            resolve(blob);
        });
    });
};