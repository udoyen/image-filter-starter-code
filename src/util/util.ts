// import fs from 'fs';
import Jimp = require('jimp');
const fs = require('fs');
const sharp = require('sharp');
const client = require('https');

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
// export async function filterImageFromURL(inputURL: string): Promise<string>{
//     return new Promise( async resolve => {
//         const photo = await Jimp.read(inputURL);
//         const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
//         await photo
//         .resize(256, 256) // resize
//         .quality(60) // set JPEG quality
//         .greyscale() // set greyscale
//         .write(__dirname+outpath, (img)=>{
//             resolve(__dirname+outpath);
//         });
//     });
// }

// export async function filterImageFromURL(inputURL: string): Promise<string> {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const photo = await Jimp.read(inputURL);
//             const outpath = '/tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg';
//             await photo
//                 .resize(256, 256) // resize
//                 .quality(60) // set JPEG quality
//                 .greyscale() // set greyscale
//                 .write(__dirname + outpath, (img) => {
//                     resolve(__dirname + outpath);
//                 });

//         } catch (error) {
//             reject(error)
//         }
//     });
// }

// export async function filterImageFromURL(inputURL: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//         Jimp.read(inputURL).then(photo => {
//             const outpath = '/tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg';
//             if (!fs.existsSync(process.env.PWD + "/tmp")) {
//                 fs.mkdirSync(process.env.PWD + "/tmp")
//             }

//             photo
//                 .resize(256, 256) // resize
//                 .quality(60) // set JPEG quality
//                 .greyscale() // set greyscale
//                 .write(process.env.PWD + outpath, (img) => {
//                     resolve(process.env.PWD + outpath);
//                 });
//         }).catch(err => {
//             console.error(err);
//             reject("Could not read image.");
//         })
//     });
// }

// export async function uploadImage(imagePath: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const outpath = '/tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg';
//         console.log('Path: ', outpath);
//         console.log('Path 2: ', __dirname + outpath);
//         got.get(imagePath).then((res: { statusCode: number; body: any; send: any; buffer: any; }) => {
//             console.log('Status Code:', res.statusCode);
//             sharp(res.body)
//                 .resize(200, 200)
//                 .flatten()
//                 .grayscale()
//                 .jpeg({ mozjpeg: true })
//                 .toFile(__dirname + outpath, (err: { message: any }, info: any) => {
//                     if (err) {
//                         console.log("Error: ", err.message);
//                         return;
//                     }
//                     console.log('Info: ', info);

//                 })

//         }).catch((err: { message: any }) => {
//             console.log("Error: ", err.message);
//         })

//     });
// }


export async function filterImageFromURL(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        client.get(imagePath, (res: { setHeader: any; headers: any; resume: any; statusCode: number; pipe: any; }) => {

            const outpath = process.env.PWD + '/tmp';
            // console.log("Dir: ", process.env.PWD);
            let image_name = 'filtered.' + Math.floor(Math.random() * 2000) + '.jpg';
            if (!fs.existsSync(outpath)) {

                fs.mkdirSync(outpath);

            }
            console.log("Status: ", res.statusCode);
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(encodeURI(`${outpath}/${image_name}`)))
                    .on('error', reject)
                    .once('close', async () => {
                        sharp.cache(false);
                        const format = await getMetadata(encodeURI(`${outpath}/${image_name}`));
                        console.log("Format: ", format);
                        sharp(encodeURI(`${outpath}/${image_name}`))
                            .resize(256, 256)
                            .greyscale()
                            .toFile(encodeURI(`${outpath}/out.${image_name}`), (err: { message: any }, info: any) => {
                                if (err) {
                                    console.log("toFile Error: ", err.message);
                                    return;
                                }
                                console.log('Info: ', info);
                                fs.unlinkSync(decodeURI(`${outpath}/${image_name}`));
                                resolve(decodeURI(`${outpath}/out.${image_name}`));
                            });

                    })


            } else {
                res.resume();
                reject(new Error(`Request Failed with a Status Code: ${res.statusCode}`));

            }

        });

    });
}

async function getMetadata(localImgPath: string): Promise<string> {
    try {
        const metadata = await sharp(localImgPath).metadata();
        console.log("Metadata: ", metadata.format);
        return metadata.format;
    } catch (error) {
        console.log(`An error occurred during processing: ${error}`);
        return;
    }


}


// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
    for (let file of files) {
        fs.unlinkSync(file);
    }
}

function err(err: any, arg1: (any: any) => void) {
    throw new Error('Function not implemented.');
}
