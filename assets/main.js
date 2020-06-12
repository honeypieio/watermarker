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
		watermarkFile = getWatermarkFile(width, height);
		console.log(watermarkFile);
		watermark([selectedFile, watermarkFile], options)
			.image(watermark.image.center(0.25))
			.then(img => document.getElementById('result').appendChild(img))
	}
}
