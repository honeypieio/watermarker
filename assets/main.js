var baseUrl = window.location;
var zip;
var thumbnailFixedWidth, watermarkedFixedWidth;
var watermarkWidth;

window.onload = function() {

	document.getElementById("process-image-button").addEventListener("click", function(){
		
		try {

			thumbnailFixedWidth = document.getElementById("thumb-width").value;
			watermarkedFixedWidth = document.getElementById("watermarked-width").value;
			
			if(isNaN(thumbnailFixedWidth)) {
				throw "Please enter a valid value for thumnail width";
			}

			if(isNaN(watermarkedFixedWidth)) {
				throw "Please enter a valid value for watermarked width";
			}

			var selectedFiles = document.getElementById('image-to-process').files;
			var totalFiles = Object.keys(selectedFiles).length;

			if(totalFiles == 0) {
				throw "Please select at least one image file";
			}

			document.getElementById("output-sample-header").style.display = "block";
			zip = new JSZip();
			var index = 0;
			processImage(selectedFiles, index, totalFiles);
			
		} catch(error) {
			alert(error);
		}
	});
}

function zipItUp() {
	zip.generateAsync({ type:"blob" })
		.then(function(content) {
		saveAs(content, "processed-images-" + Date.now() + ".zip");
	});
}

function getWatermarkFile(width) {
	var data;

	if(width > 1000) {
		watermarkWidth = "1000";
	} else if (width > 750) {
		watermarkWidth = "750";
	} else {
		watermarkWidth = "500";
	}

	data = Watermarks[watermarkWidth];

	return data;
}

function formatImage(dir, imageName, imageType, image, width, height, callback) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var scaleFactor;
	var fixedWidth;

	imageType == "thumbnail" ? fixedWidth = thumbnailFixedWidth: fixedWidth = watermarkedFixedWidth;

	scaleFactor = fixedWidth / width;

	canvas.width = fixedWidth;
	canvas.height = height * scaleFactor;
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	
	if(imageType == "watermarked"){

		var options = {
			init(img) {
				img.crossOrigin = 'anonymous'
			}
		}

		watermarkFile = getWatermarkFile(watermarkedFixedWidth);
		watermark([canvas.toDataURL("image/jpeg"), watermarkFile], options)
		.blob(function(image, watermark) {
			var watermarkedContext = image.getContext("2d");
			watermarkedContext.save();
			watermarkedContext.globalAlpha = 0.075;
			var watermarkX = (canvas.width / 2) - (watermarkWidth / 2);
			var watermarkY = (canvas.height /2) - (watermarkWidth / 2);	

			watermarkedContext.drawImage(watermark, watermarkX, watermarkY);
			watermarkedContext.restore();
			var watermarkedDataUrl = watermarkedContext.canvas.toDataURL("image/jpeg");
			setImage(
				watermarkedDataUrl,
				createDownloadLink(watermarkedDataUrl, imageName, canvas.width, canvas.height),
				dir,
				imageName,
				imageType
			);
		
		});

	} else {

		imageName += "-thumbnail.jpg";
		setImage(
			canvas.toDataURL("image/jpeg"), 
			createDownloadLink(canvas.toDataURL("image/jpeg"), imageName, canvas.width, canvas.height),
			dir,
			imageName, 
			imageType
		);
		
	}

	setTimeout(function(){
		callback();
	}, 250)

}

function setImage(data, downloadLink, dir, imageName, imageType) {
	dir.file(imageName, data.split("data:image/jpeg;base64,")[1], { base64: true });
	
	document.getElementById(imageType + "-image").innerHTML = "";
	var image = document.createElement("img");
	image.src = data;
	document.getElementById(imageType + "-image").appendChild(image);
	document.getElementById(imageType + "-image").appendChild(downloadLink);
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

	document.getElementById("watermarked-image").innerHTML = "";
	document.getElementById("thumbnail-image").innerHTML = "";

	var selectedFile = selectedFiles[index];
	var image = new Image();
	image.src = window.URL.createObjectURL(selectedFile);
	image.onload = function() {
		var width = image.naturalWidth;
                var height = image.naturalHeight;
		var imageName = selectedFile.name.split(".")[0] // Get filename without file extension.
		var dir = zip.folder(imageName);
		formatImage(dir, imageName, "thumbnail", image, width, height, function(){
			formatImage(dir, imageName, "watermarked", image, width, height, function() {
			
				if(index == (totalFiles - 1)){
					zipItUp();
				} else {
					index += 1;
					processImage(selectedFiles, index, totalFiles);
				}
			});
		});
	}
}
