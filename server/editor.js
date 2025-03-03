const express = require('express');
const promise = require("bluebird");
const bodyParser = require('body-parser');
const querystring = require('querystring');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const probe = require('node-ffprobe');
var http = require('https');
const fs = require('fs');
const url = require('url');

const router = express.Router();

module.exports = function (app) {
    app.use('/editor', router);

    app.get('/download', function (req, res) {
        const file = 'videos/output.mp4';
        res.download(file); // Set disposition and send it.
    });
};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

/* worked */
router.get('/mute-audio', function (req, res) {

    const url = 'videos/output.mp4';
    fs.exists(url, function (exists) {
        if (exists) {
            fs.unlink(url, function (err, data) {
                if (!err)
                    console.log("Existing File Deleted . . . ");
            });
        }
    });

    ffmpeg('videos/input.mp4') //Input Video File
        .output('videos/output.mp4') // Output File
        .noAudio().videoCodec('copy')
        .on('error', function (err) {
            console.log('error: ', +err);

        })
        .on('end', function (err) {
            if (err)
                console.log(err)
            else if (!err) {

                console.log("Conversion Done");
                let baseLink = 'https://appums-video-editor.herokuapp.com/videos/output.mp4';
                const file = 'videos/output.mp4';
                res.download(file); // Set disposition and send it.
                // res.send(baseLink);
            }
        }).run();
});

/* worked */
router.get('/remove-video', function (req, res) {
    const url = 'videos/output.mp3';
    fs.exists(url, function (exists) {
        if (exists) {
            fs.unlink(url, function (err, data) {
                if (!err) {
                    console.log("Existing File Deleted . . . ");
                }
            });
        }
    });
    ffmpeg('videos/input.mp4') // Input Video File
        .output('videos/output.mp3') // Output  File
        .on('end', function (err) {
            if (!err) {
                console.log("Remove video is done");
                res.send('Remove Video is Done');

            }

        })
        .on('error', function (err) {
            console.log('error: ' + err);
        }).run();

});

/* Done */
router.get('/thumbnail', function (req, res) {

    probe('videos/input.mp4', function (err, probeData) {

        const proc = new ffmpeg('videos/input.mp4');

        proc.screenshots({
            timestamps: ['50%', '80%'],
            folder: 'videos',
            size: '392x220'
        }).on('end', function () {
            console.log('Screenshots taken');
            res.send('Done Thumbnail');
        });

    });
});


/* ----- Done -----*/
router.get('/video-info', function (req, res) {
    ffmpeg.ffprobe('videos/input.mp4', function (err, metadata) {
        if (err) {
            console.log("MetaData not Found. " + err);
        } else {
            res.send(metadata);
        }
    });
});

/* Done */
router.get('/video-crop', function (req, res) {

    const url = 'videos/output.mp4';
    fs.exists(url, function (exists) {
        if (exists) {
            fs.unlink(url, function (err, data) {
                if (!err) {
                    console.log("Existing File Deleted . . . ");
                }
            });
        }
    });

    ffmpeg('videos/input.mp4') //Input Video File
        .output('videos/output1.mp4') // Output File
        .audioCodec('libmp3lame') // Audio Codec
        .videoCodec('libx264') // Video Codec
        .setStartTime(03) // Start Position
        .setDuration(5) // Duration
        .on('end', function (err) {
            if (!err) {

                ffmpeg('videos/input.mp4') //Input Video File
                    .output('videos/output2.mp4') // Output File
                    .audioCodec('libmp3lame') // Audio Codec
                    .videoCodec('libx264') // Video Codec
                    .setStartTime(10) // Start Position
                    .setDuration(5) // Duration
                    .on('end', function (err) {
                        if (!err) {
                            console.log("Conversion Done");
                            const files = ['output1.mp4', 'output2.mp4'];
                            const outputFile = 'output.mp4';
                            ffmpeg()
                                .input(files)
                                .on('start', function (commandLine) {
                                    console.log('Spawned Ffmpeg with command: ' + commandLine);
                                })
                                .on('error', function (err) {
                                    console.log('An error occurred: ' + err.message);
                                })
                                .on('end', function () {
                                    console.log('Merging finished !');
                                })
                                .save(outputFile);
                        }

                    })
                    .on('error', function (err) {
                        console.log('error: ', +err);

                    }).run();
            }

        })
        .on('error', function (err) {
            console.log('error: ', +err);

        }).run();
});

/* Done */
router.get('/effect-fadein', function (req, res) {

    ffmpeg('videos/input.mp4')
        .audioCodec('libmp3lame') // Audio Codec
        .videoCodec('libx264')
        .videoFilters('fade=in:0:200')
        .output('videos/fadein.mp4')

        .on('end', function (err) {
            if (!err)
                res.send("Successfull");
        })
        .on('progress', function (data) {
            console.log(data.percent);

        })
        .on('error', function (err) {
            console.log('error: ' + err);
        }).run();
});

/* Done */
router.get('/effect-fadeout', function (req, res) {

    ffmpeg('videos/input.mp4')
        .audioCodec('libmp3lame') // Audio Codec
        .videoCodec('libx264')
        .videoFilters('fade=out:70:10')
        .output('videos/fadeout.mp4')

        .on('end', function (err) {
            if (!err)
                res.send("Successfull");
        })
        .on('error', function (err) {
            console.log('error: ' + err);
        }).run();
});

/* Done */
router.get('/effect-blur', function (req, res) {

    ffmpeg('./videos/input.mp4')
        .audioCodec('libmp3lame') // Audio Codec
        .videoCodec('libx264')
        .videoFilters('unsharp=7:7:-2:7:7:-2')
        .output('videos/blur.mp4')

        .on('end', function (err) {
            if (!err)
                res.send("Successfull");
        })
        .on('progress', function (data) {
            console.log(Math.floor(data.percent) + " %");

        })
        .on('error', function (err) {
            console.log('error: ' + err);
        }).run();
});

/* Done */
router.get('/effect-sharpen', function (req, res) {

    ffmpeg('videos/input.mp4')
        .audioCodec('libmp3lame') // Audio Codec
        .videoCodec('libx264')
        .videoFilters('unsharp=7:7:-2:7:7:-2')
        .output('videos/sharpen.mp4')

        .on('end', function (err) {
            if (!err)
                res.send("Successfull");
        })
        .on('progress', function (data) {
            console.log(Math.floor(data.percent) + " %");

        })
        .on('error', function (err) {
            console.log('error: ' + err);
            //callback(err);
        }).run();
});

router.get('/video-subtitle', function (req, res) {
    console.log("Title ......", __dirname);
    if (fs.existsSync('../videos/input.mp4')) {
        console.log('Found file');
    } else {
        console.log("Not Found File");
    }

    ffmpeg('../videos/input.mp4')
        .audioCodec('libmp3lame')
        .videoCodec('libx264')
        .videoFilters({
            filter: 'drawtext',
            options: {
                fontfile: './DINLight.ttf',
                text: "Bilash & Lopa",
                fontsize: 20,
                fontcolor: '#ccc',
                x: '(main_w/2-text_w/2)',
                y: 50,
                shadowcolor: 'black',
                shadowx: 2,
                shadowy: 2
            }
        })
        .output('videos/subtitle.mp4')

        .on('end', function () {
            console.log("Done")

        })
        .on('error', function (err) {
            console.log('error: ', +err);

        }).run();

});

router.get('/watermark', function (req, res) {

    console.log("Watermark");
    if (fs.existsSync(__dirname + 'videos/input.mp4')) {
        console.log('Found file');
    } else {
        console.log("Not Found File");
    }
    //const ffmpeg = require('fluent-ffmpeg'); 
    ffmpeg(__dirname + 'videos/input.mp4')
        .videoFilters({
            filter: 'drawtext',
            options: {
                fontfile: 'videos/LucidaGrande.ttc',
                text: 'THIS IS TEXT',
                fontsize: 20,
                fontcolor: 'white',
                x: '(main_w/2-text_w/2)',
                y: 50,
                shadowcolor: 'black',
                shadowx: 2,
                shadowy: 2
            }
        })
        .output('./videos/watermark.mp4')

        .on('end', function (err) {
            if (!err) {
                console.log('Title Save successfully');
                //res.send('videos/effect/test.mp4')

            }

        })
        .on('error', function (err) {
            console.log('error: ', +err);
            //callback(err);
        }).run();
});