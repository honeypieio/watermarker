var baseUrl = window.location;

window.onload = function() {

	document.getElementById("process-image-button").addEventListener("click", function(){
		processImage(document.getElementById('image-to-process').files[0]);
	});
}

function getWatermarkFile(width, height) {
	var url = baseUrl + '/assets/watermark-';

	if(width > 1000) {
		url += "1000px";
	} else if (width > 750) {
		url += "750px";
	} else {
		url += "500px";
	}

	url += ".png";
	return url;
}

function makeThumbnail(imageName, image, width, height) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var scaleFactor;
	var fixedWidth = 500;

	if(fixedWidth > width) {
		scaleFactor = 1;
		fixedWidth = width;
	} else {
		scaleFactor = 500 / width;
	}

	canvas.width = 500; // Set width to 500px;
	canvas.height = height * scaleFactor;
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	document.getElementById("thumbnail-image").appendChild(canvas);


	var downloadLink = document.createElement("a");
	downloadLink.href = canvas.toDataURL();
	downloadLink.download = imageName + "_thumbnail.jpeg";
	downloadLink.textContent = "Download Thumbnail";
	var paragraphWrapper = document.createElement("p");
	paragraphWrapper.appendChild(downloadLink);
	document.getElementById("thumbnail-image").appendChild(paragraphWrapper);
}

function processImage(selectedFile) {
	var options = {
		init(img) {
    			img.crossOrigin = 'anonymous'
  		}
	}

	var image = new Image();

	image.src = window.URL.createObjectURL(selectedFile);
	image.onload = function() {
		var width = image.naturalWidth;
                var height = image.naturalHeight;
		var imageName = selectedFile.name.split(".")[0] // Get filename without file extension.
		makeThumbnail(imageName, image, width, height);
		watermarkFile = getWatermarkFile(width, height);
		watermark([selectedFile, watermarkFile], options)
			.image(watermark.image.center(0.1))
			.then(img => document.getElementById('result').appendChild(img)) // To-do: get as canvas

		var downloadLink = document.createElement("a");
		downloadLink.href = document.querySelector("#watermarked-image > img").src;
		downloadLink.download = imageName + "_watermarked.jpeg";
		downloadLink.textContent = "Download watermarked image";
		var paragraphWrapper = document.createElement("p");
		paragraphWrapper.appendChild(downloadLink);
		document.getElementById("watermarked-image").appendChild(paragraphWrapper);

	}
}

