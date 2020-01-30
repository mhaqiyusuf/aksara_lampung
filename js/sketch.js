/* ===
Coffee KNN Classification using Webcam & Images with mobileNet.
=== */
let video;
let doClassifyVideo = false;
let status = document.querySelector("#status");
let imageTestPreview = document.getElementById('imageTestPreview');
let imageTrainPreview = document.getElementById('imageTrainPreview');

// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

function setup() {
    // Create a featureExtractor that can extract the already learned features from MobileNet
    featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
    noCanvas();
    // Create a video element
    video = createCapture(VIDEO);
    // Append it to the videoContainer DOM element
    video.parent('videoContainer');
    // Create the UI buttons
    createButtons();
    loadMyKNN();
}

function modelReady() {
    status.innerText = 'FeatureExtractor(mobileNet model) Loaded';
}

//Preview for image
//Preview for test data
function onChangePreviewTestImage() {
    let file = document.getElementById("imageTest").files[0];
    previewImage(file, imageTestPreview);
    status.innerText = "Image Test Preview";
}

//Preview for training data
function onChangePreviewTrainImage() {
    let files = document.getElementById("imageTrain").files;
    imageFiles(files, imageTrainPreview);
    status.innerText = "Image Train Preview";
}

// <!-- Preview image script -->
// <!-- reference: https://stackoverflow.com/questions/18457340/how-to-preview-selected-image-in-input-type-file-in-popup-using-jquery -->
function previewImage(imgfile, imagepreview) {
    let oFReader = new FileReader();
    oFReader.onloadend = function(oFREvent) {
        imagepreview.src = oFREvent.target.result;
    };
    if (imgfile) {
        oFReader.readAsDataURL(imgfile);
    }
};

function previewTrainImage(imgfile, imagepreview) {
    let oFReader = new FileReader();
    oFReader.onloadend = function(oFREvent) {
        let imgv = document.createElement('img');
        imagepreview.appendChild(imgv);

        imgv.src = oFREvent.target.result;
    };
    if (imgfile) {
        oFReader.readAsDataURL(imgfile);
    }
};

function imageFiles(imgfiles, imgfilepreview) {
    imgfilepreview.innerHTML = "";
    for (let i = 0; i < imgfiles.length; i++) {
        console.log(i);
        previewTrainImage(imgfiles[i], imgfilepreview);
    }
};

// Clear div for image preview
document.getElementById('clear-imagetest-preview').addEventListener('click', () => clearImagePreview(imageTestPreview));
document.getElementById('clear-imagetrain-preview').addEventListener('click', () => clearImagePreview(imageTrainPreview));

function clearImagePreview(imagediv) {
    imagediv.src = "";
    imagediv.innerHTML = "";
}

// Add the current frame from the video to the classifier
function addExample(framesource, label) {
    // Get the features of the input video
    const features = featureExtractor.infer(framesource);
    // You can also pass in an optional endpoint, defaut to 'conv_preds'
    // const features = featureExtractor.infer(video, 'conv_preds');
    // You can list all the endpoints by calling the following function
    // console.log('All endpoints: ', featureExtractor.mobilenet.endpoints)

    // Add an example with a label to the classifier
    knnClassifier.addExample(features, label);
    updateCounts();
}

function addExamples(framesources, label) {
    let imgtraindata = framesources.querySelectorAll("img");
    for (let i = 0; i < imgtraindata.length; i++) {
        console.log(i);
        addExample(imgtraindata[i], label);
    }
}

// Predict the current frame/image.
function classifyVideo(framesource) {
    // Get the total number of labels from knnClassifier
    const numLabels = knnClassifier.getNumLabels();
    if (numLabels <= 0) {
        console.error('There is no examples in any label');
        return;
    }
    // Get the features of the input video
    const features = featureExtractor.infer(framesource);

    // Use knnClassifier to classify which label do these features belong to
    // You can pass in a callback function `gotResults` to knnClassifier.classify function
    knnClassifier.classify(features, gotResultsVideo);
    // You can also pass in an optional K value, K default to 3
    // knnClassifier.classify(features, 3, gotResults);

    // You can also use the following async/await function to call knnClassifier.classify
    // Remember to add `async` before `function predictClass()`
    // const res = await knnClassifier.classify(features);
    // gotResults(null, res);
}

function classifyImage(framesource) {
    // Get the total number of labels from knnClassifier
    const numLabels = knnClassifier.getNumLabels();
    if (numLabels <= 0) {
        console.error('There is no examples in any label');
        return;
    }
    // Get the features of the input video
    const features = featureExtractor.infer(framesource);

    // Use knnClassifier to classify which label do these features belong to
    // You can pass in a callback function `gotResults` to knnClassifier.classify function
    knnClassifier.classify(features, gotResultsImage);
    // You can also pass in an optional K value, K default to 3
    // knnClassifier.classify(features, 3, gotResults);

    // You can also use the following async/await function to call knnClassifier.classify
    // Remember to add `async` before `function predictClass()`
    // const res = await knnClassifier.classify(features);
    // gotResults(null, res);
}


// A util function to create UI buttons
function createButtons() {
    // When the button is pressed, add the current frame
    buttonA = select('#addBijiNormal');
    buttonA.mousePressed(function() {
        addExample(video, 'biji normal');
    });

    buttonB = select('#addBijiBolong');
    buttonB.mousePressed(function() {
        addExample(video, 'biji bolong');
    });

    buttonC = select('#addBijiHitam');
    buttonC.mousePressed(function() {
        addExample(video, 'biji hitam');
    });

    buttonD = select('#addBijiPecah');
    buttonD.mousePressed(function() {
        addExample(video, 'biji pecah');
    });

    // Train Batch
    buttonABatch = select('#addBijiNormalBatch');
    buttonABatch.mousePressed(function() {
        addExamples(imageTrainPreview, 'biji normal');
    });

    buttonBBatch = select('#addBijiBolongBatch');
    buttonBBatch.mousePressed(function() {
        addExamples(imageTrainPreview, 'biji bolong');
    });

    buttonCBatch = select('#addBijiHitamBatch');
    buttonCBatch.mousePressed(function() {
        addExamples(imageTrainPreview, 'biji hitam');
    });

    buttonDBatch = select('#addBijiPecahBatch');
    buttonDBatch.mousePressed(function() {
        addExamples(imageTrainPreview, 'biji pecah');
    });

    // Predict button
    buttonPredictVideo = select('#btnPredictVideo');
    buttonPredictVideo.mousePressed(function() {
        classifyVideo(video);
        // Mencatat kondisi classifyVideo
        doClassifyVideo = (doClassifyVideo) ? false : true;
    });

    // Predict button
    buttonPredictImage = select('#btnPredictImage');
    buttonPredictImage.mousePressed(function() {
        classifyImage(imageTestPreview);
    });

    // Clear all classes button
    buttonClearAll = select('#clearAll');
    buttonClearAll.mousePressed(clearAllLabels);

    // Load saved classifier dataset
    buttonSetData = select('#load');
    buttonSetData.mousePressed(loadMyKNN);

    // Get classifier dataset
    buttonGetData = select('#save');
    buttonGetData.mousePressed(saveMyKNN);
}

// Show the results
function gotResultsVideo(err, result) {
    if (doClassifyVideo) {
        // Display any error
        if (err) {
            console.error(err);
        }

        if (result.confidencesByLabel) {
            const confidences = result.confidencesByLabel;
            // result.label is the label that has the highest confidence
            if (result.label) {
                select('#videoResult').html(result.label);
                select('#videoConfidence').html(`${confidences[result.label] * 100} %`);
            }

            select('#confidenceBijiNormal').html(`${confidences['biji normal'] ? confidences['biji normal'] * 100 : 0} %`);
            select('#confidenceBijiBolong').html(`${confidences['biji bolong'] ? confidences['biji bolong'] * 100 : 0} %`);
            select('#confidenceBijiHitam').html(`${confidences['biji hitam'] ? confidences['biji hitam'] * 100 : 0} %`);
            select('#confidenceBijiPecah').html(`${confidences['biji pecah'] ? confidences['biji pecah'] * 100 : 0} %`);
        }

        classifyVideo(video);
    }
}

function gotResultsImage(err, result) {
    // Display any error
    if (err) {
        console.error(err);
    }

    if (result.confidencesByLabel) {
        const confidences = result.confidencesByLabel;
        // result.label is the label that has the highest confidence
        if (result.label) {
            select('#imageResult').html(result.label);
            select('#imageConfidence').html(`${confidences[result.label] * 100} %`);
        }

        select('#confidenceBijiNormal').html(`${confidences['biji normal'] ? confidences['biji normal'] * 100 : 0} %`);
        select('#confidenceBijiBolong').html(`${confidences['biji bolong'] ? confidences['biji bolong'] * 100 : 0} %`);
        select('#confidenceBijiHitam').html(`${confidences['biji hitam'] ? confidences['biji hitam'] * 100 : 0} %`);
        select('#confidenceBijiPecah').html(`${confidences['biji pecah'] ? confidences['biji pecah'] * 100 : 0} %`);
    }
}

// Update the example count for each label	
function updateCounts() {
    const counts = knnClassifier.getCountByLabel();

    select('#exampleBijiNormal').html(counts['biji normal'] || 0);
    select('#exampleBijiBolong').html(counts['biji bolong'] || 0);
    select('#exampleBijiHitam').html(counts['biji hitam'] || 0);
    select('#exampleBijiPecah').html(counts['biji pecah'] || 0);
}

// Clear the examples in one label
function clearLabel(label) {
    knnClassifier.clearLabel(label);
    updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
    knnClassifier.clearAllLabels();
    updateCounts();
}

// Save dataset as myKNNDataset.json
function saveMyKNN() {
    knnClassifier.save('coffeeKNNDataset');
}

// Load dataset to the classifier
function loadMyKNN() {
    knnClassifier.load('./coffeeKNNDataset.json', updateCounts);
}