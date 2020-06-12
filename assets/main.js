var baseUrl = window.location;

window.onload = function() {

	document.getElementById("process-image-button").addEventListener("click", function(){
		processImage(document.getElementById('image-to-process').files[0]);
	});
}

function processImage(selectedFile) {
	var options = {
		init(img) {
    			img.crossOrigin = 'anonymous'
  		}
	}
	watermark([selectedFile, baseUrl + '/assets/watermark.png'], options)
	  .image(watermark.image.center(0.5))
	  .then(img => document.getElementById('result').appendChild(img));
}
