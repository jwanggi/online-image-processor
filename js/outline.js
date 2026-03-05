(function (imageproc) {
    "use strict";

    /*
     * Apply sobel edge to the input data
     */
    imageproc.sobelEdge = function (inputData, outputData, threshold) {
        console.log("Applying Sobel edge detection...");

        /* Initialize the two edge kernel Gx and Gy */
        var Gx = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        var Gy = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];

        /**
         * TODO: You need to write the code to apply
         * the two edge kernels appropriately
         */

        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {

                var sumX = 0;
                var sumY = 0;

                // Calculate gradient using the Sobel kernels
                for (var ky = -1; ky <= 1; ky++) {
                    for (var kx = -1; kx <= 1; kx++) {

                        var pixel = imageproc.getPixel(inputData, x + kx, y + ky);

                        sumX += Gx[ky + 1][kx + 1] * ((pixel.r + pixel.g + pixel.b) / 3);
                        sumY += Gy[ky + 1][kx + 1] * ((pixel.r + pixel.g + pixel.b) / 3);

                    }
                }

                // Calculate the gradient magnitude using Math.hypot()
                var magnitude = Math.hypot(sumX, sumY);

                // Apply thresholding
                var edgeValue = magnitude >= threshold ? 255 : 0;

                // Set the pixel color in the output image
                var i = (x + y * outputData.width) * 4;
                outputData.data[i] =
                    outputData.data[i + 1] =
                    outputData.data[i + 2] = edgeValue;
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
