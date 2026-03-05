(function (imageproc) {
    "use strict";

    /*
     * Apply box blur to the input data
     */
    imageproc.boxBlur = function (inputData, outputData, kernelSize, x, y) {
        //console.log("Applying box blur...");

        // Initialize variables
        var r, g, b;
        var kernelRadius = (kernelSize - 1) / 2;
        //console.log("kernelSize = ", kernelSize);

        // Reset variables
        r = 0;
        g = 0;
        b = 0;

        // Use imageproc.getPixel() to get the pixel values
        // over the kernel
        for (var j = -kernelRadius; j <= kernelRadius; j++) {
            for (var i = -kernelRadius; i <= kernelRadius; i++) {
                //multiply the pixels (x + i, y + j) with the coefficients
                var px = imageproc.getPixel(inputData, x + i, y + j);
                r += px.r;
                g += px.g;
                b += px.b;
            }
        }
        //console.log("(", r, ",", g, ",", b, ")");

        // Then set the blurred result to the output data
        var i = (x + y * outputData.width) * 4;
        outputData.data[i] = r / (kernelSize * kernelSize);
        outputData.data[i + 1] = g / (kernelSize * kernelSize);
        outputData.data[i + 2] = b / (kernelSize * kernelSize);

    }

    /*
     * Apply median blur to the input data
     */
    imageproc.medianBlur = function (inputData, outputData, kernelSize, x, y) {
        //console.log("Applying median blur...");

        // Initialize variables
        var kernelRadius = (kernelSize - 1) / 2;

        // Reset variables
        var rValues = [];
        var gValues = [];
        var bValues = [];

        // Use imageproc.getPixel() to get the pixel values
        // over the kernel
        for (var j = -kernelRadius; j <= kernelRadius; j++) {
            for (var i = -kernelRadius; i <= kernelRadius; i++) {
                // Get the pixel (x + i, y + j)
                var px = imageproc.getPixel(inputData, x + i, y + j);
                rValues.push(px.r);
                gValues.push(px.g);
                bValues.push(px.b);
            }
        }

        // Sort the color values
        rValues.sort();
        gValues.sort();
        bValues.sort();

        // Calculate the median value
        var medianIndex = Math.floor(rValues.length / 2);
        var rMedian = rValues[medianIndex];
        var gMedian = gValues[medianIndex];
        var bMedian = bValues[medianIndex];

        // Set the median value to the output data
        var i = (x + y * outputData.width) * 4;
        outputData.data[i] = rMedian;
        outputData.data[i + 1] = gMedian;
        outputData.data[i + 2] = bMedian;
    }

    /*
     * Apply gaussian blur to the input data
     */
    imageproc.gaussianBlur = function (inputData, outputData, kernelSize, threshold, x, y) {

        //console.log("Applying Gaussian blur...");

        function generateGaussianKernel(size, sigma) {
            var kernel = [];
            var sum = 0;

            // Generate kernel values
            for (var i = 0; i < size; i++) {
                kernel[i] = [];
                for (var j = 0; j < size; j++) {
                    var x = i - Math.floor(size / 2);
                    var y = j - Math.floor(size / 2);
                    var weight = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                    kernel[i][j] = weight;
                    sum += weight;
                }
            }
            //console.log("sum = ", sum);

            // Normalize the kernel
            for (var i = 0; i < size; i++) {
                for (var j = 0; j < size; j++) {
                    kernel[i][j] /= sum;
                }
            }

            return kernel;
        }
        // Generate Gaussian kernel
        var kernel = generateGaussianKernel(kernelSize, threshold);

        /*
        function print2DArray(array) {
            for (var i = 0; i < array.length; i++) {
                console.log(array[i].join('\t'));
            }
        }
        print2DArray(kernel);
        */

        // Initialize variables
        var r = 0, g = 0, b = 0;
        var kernelRadius = (kernelSize - 1) / 2;

        // Reset variables
        r = 0;
        g = 0;
        b = 0;

        // Apply Gaussian blur
        for (var j = -kernelRadius; j <= kernelRadius; j++) {
            for (var i = -kernelRadius; i <= kernelRadius; i++) {
                var px = imageproc.getPixel(inputData, x + i, y + j);
                var weight = kernel[i + kernelRadius][j + kernelRadius];
                r += px.r * weight;
                g += px.g * weight;
                b += px.b * weight;
            }
        }

        // Set the blurred result to the output data
        var i = (x + y * outputData.width) * 4;
        outputData.data[i] = r;
        outputData.data[i + 1] = g;
        outputData.data[i + 2] = b;
    }

    imageproc.regionStat = function (inputData, kernelSize, x, y) {
        // Find the mean colour and brightness
        var meanR = 0, meanG = 0, meanB = 0;
        var meanValue = 0;
        var kernelRadius = (kernelSize - 1) / 2;

        for (var j = -kernelRadius; j <= kernelRadius; j++) {
            for (var i = -kernelRadius; i <= kernelRadius; i++) {
                var pixel = imageproc.getPixel(inputData, x + i, y + j);

                // For the mean colour
                meanR += pixel.r;
                meanG += pixel.g;
                meanB += pixel.b;

                // For the mean brightness
                meanValue += (pixel.r + pixel.g + pixel.b) / 3;
            }
        }
        meanR /= kernelSize * kernelSize;
        meanG /= kernelSize * kernelSize;
        meanB /= kernelSize * kernelSize;
        meanValue /= kernelSize * kernelSize;

        // Find the variance
        var variance = 0;
        for (var j = -kernelRadius; j <= kernelRadius; j++) {
            for (var i = -kernelRadius; i <= kernelRadius; i++) {
                var pixel = imageproc.getPixel(inputData, x + i, y + j);
                var value = (pixel.r + pixel.g + pixel.b) / 3;

                variance += Math.pow(value - meanValue, 2);
            }
        }
        variance /= kernelSize * kernelSize;

        // Return the mean and variance as an object
        return {
            mean: { r: meanR, g: meanG, b: meanB },
            variance: variance
        };
    }

    /*
     * Apply noise reduction to the input data
     */
    imageproc.noiseReduction = function (inputData, outputData, type, kernelSize, threshold) {
        console.log("Applying noise reduction...");
        //console.log("Type of blur: ", type);

        var bufferData = imageproc.createBuffer(inputData);

        //for gaussian
        var gaussian_threshold = parseFloat($("#gaussian-threshold").val());

        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {

                //type of blur
                switch (type) {
                    case "box":
                        imageproc.boxBlur(inputData, bufferData, kernelSize, x, y);
                        break;
                    case "median":
                        imageproc.medianBlur(inputData, bufferData, kernelSize, x, y);
                        break;
                    case "gaussian":
                        imageproc.gaussianBlur(inputData, bufferData, kernelSize, gaussian_threshold, x, y);
                        break;
                }

                // Then set the blurred result to the output data
                if (imageproc.regionStat(inputData, kernelSize, x, y).variance < threshold) {
                    var i = (x + y * outputData.width) * 4;
                    outputData.data[i] = bufferData.data[i];
                    outputData.data[i + 1] = bufferData.data[i + 1];
                    outputData.data[i + 2] = bufferData.data[i + 2];
                } else {
                    outputData.data[i] = inputData.data[i];
                    outputData.data[i + 1] = inputData.data[i + 1];
                    outputData.data[i + 2] = inputData.data[i + 2];
                }
            }
        }
    }

    /*
     * Apply unsharp mask to the input data
     */
    imageproc.unsharp = function (inputData, outputData, type, size, strength, preview) {
        console.log("Applying unsharp masking...");

        // buffer
        var blurData = imageproc.createBuffer(outputData);
        var edgeData = imageproc.createBuffer(outputData);
        var sharpData = imageproc.createBuffer(outputData);

        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                //type of blur
                switch (type) {
                    case "box":
                        imageproc.boxBlur(inputData, blurData, size, x, y);
                        break;
                    case "median":
                        imageproc.medianBlur(inputData, blurData, size, x, y);
                        break;
                    case "gaussian":
                        var threshold = parseFloat($("#gaussian-threshold").val());
                        imageproc.gaussianBlur(inputData, blurData, size, threshold, x, y);
                        break;
                }
            }
        }


        //which img to preview
        for (var i = 0; i < inputData.data.length; i += 4) {
            for (var j = 0; j < 3; j++) {

                //blur
                //outputData.data[i + j] = blurData.data[i + j];

                //edge
                edgeData.data[i + j] = inputData.data[i + j] - blurData.data[i + j];

                //sharp
                sharpData.data[i + j] = inputData.data[i + j] + strength * edgeData.data[i + j];

                switch (preview) {
                    case "blurred":
                        outputData.data[i + j] = blurData.data[i + j];
                        break;
                    case "edge":
                        outputData.data[i + j] = strength * edgeData.data[i + j];
                        break;
                    case "sharpened":
                        outputData.data[i + j] = sharpData.data[i + j];
                        break;
                }

                // Handle clipping of the RGB components
                outputData.data[i + j] = Math.min(Math.max(outputData.data[i + j], 0), 255);
            }
        }

        if ($("#noise-reduction").prop("checked") && preview === "sharpened") {
            var threshold = parseFloat($("#noise-threshold").val());

            //kernel size for this is fixed
            imageproc.noiseReduction(inputData, outputData, type, 3, threshold);
        }
    }



}(window.imageproc = window.imageproc || {}));
