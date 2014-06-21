window.onload = function() {
	var c = document.getElementById("myCanvas"),
		ctx = c.getContext("2d");
	
	ctx.moveTo(0,0);
	ctx.lineTo(200,100);
	ctx.stroke();

	var img = new Image();
	img.src = 'hello.png';
	img.onload = function() {
		ctx.drawImage(img, 16, 32);
	};
}
