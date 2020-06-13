var baseUrl = window.location;
var zip;

window.onload = function() {

	document.getElementById("process-image-button").addEventListener("click", function(){
		document.getElementById("output-sample-header").style.display = "block";
		var selectedFiles = document.getElementById('image-to-process').files;
		zip = new JSZip();
		var totalFiles = Object.keys(selectedFiles).length;
		var index = 0;
		if(totalFiles > 0) {
			processImage(selectedFiles, index, totalFiles);
		}
	});
}

function zipItUp() {
	zip.generateAsync({ type:"blob" })
		.then(function(content) {
		saveAs(content, "processed-images-" + Date.now() + ".zip");
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

function makeThumbnail(dir, imageName, image, width, height, callback) {
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
	document.getElementById("thumbnail-image").innerHTML = "";
	document.getElementById("thumbnail-image").appendChild(canvas);

	imageName += "-thumbnail.jpg";
	dir.file(imageName, canvas.toDataURL("image/jpeg").split("data:image/jpeg;base64,")[1], { base64: true });
	document.getElementById("thumbnail-image").appendChild(createDownloadLink(canvas.toDataURL("image/jpeg"), imageName, canvas.width, canvas.height));
	setTimeout(function() {
		callback();
	}, 500);
}

function createDownloadLink(src, imageName, width, height) {

	var downloadLink = document.createElement("a");
	downloadLink.href = src;
	downloadLink.download = imageName;
	downloadLink.textContent = downloadLink.download + " (" + width + "px * " + height + "px)";
	var paragraphWrapper = document.createElement("p");
	paragraphWrapper.appendChild(downloadLink);
	return paragraphWrapper;
}

function processImage(selectedFiles, index, totalFiles) {
	var options = {
		init(img) {
    			img.crossOrigin = 'anonymous'
  		}
	}

	var selectedFile = selectedFiles[index];
	var image = new Image();
	image.src = window.URL.createObjectURL(selectedFile);
	image.onload = function() {
		var width = image.naturalWidth;
                var height = image.naturalHeight;
		var imageName = selectedFile.name.split(".")[0] // Get filename without file extension.
		var dir = zip.folder(imageName);
		makeThumbnail(dir, imageName, image, width, height, function(){

			watermarkFile = getWatermarkFile(width, height);
			watermark([selectedFile, watermarkFile], options)
			.image(watermark.image.center(0.06))
			.then(function(img) {
				document.getElementById("watermarked-image").innerHTML = "";
				document.getElementById('watermarked-image').appendChild(img);
				imageName += "-watermarked.png";
				setTimeout(function() {
					dir.file(imageName, document.querySelector("#watermarked-image > img").src.split("data:image/png;base64,")[1], { base64: true });
					document.getElementById("watermarked-image").appendChild(createDownloadLink(document.querySelector("#watermarked-image > img").src, imageName, width, height));
					if(index == (totalFiles - 1)){
						zipItUp();
					} else {
						index += 1;
						processImage(selectedFiles, index, totalFiles);
					}
				}, 500);
			})
		});
	}
}
