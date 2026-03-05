(function (imageproc) {
    "use strict";

    /*
     * Apply blur to the input data
     */
    imageproc.blur = function (inputData, outputData, kernelSize) {
        console.log("Applying blur...");

        // You are given a 3x3 kernel but you need to create a proper kernel
        // using the given kernel size

        // Initialize variables
        var r, g, b;
        var kernelRadius = (kernelSize - 1) / 2;
        //console.log("kernelSize = ", kernelSize);

        /**
         * TODO: You need to extend the blur effect to include different
         * kernel sizes and then apply the kernel to the entire image
         */

        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
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
        }
    }

}(window.imageproc = window.imageproc || {}));
