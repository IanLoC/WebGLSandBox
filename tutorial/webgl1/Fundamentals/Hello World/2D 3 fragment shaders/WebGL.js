function main() {
	var canvas = document.getElementById("c");

	var gl = canvas.getContext("webgl");
	if (!gl) {
		console.err("webGL failed to start");
		return;
	}

	var vertexShaderSource = 
	`
	attribute vec2 a_position;
	
	uniform vec2 u_resolution;

	void main() {
		//pixels to range 0 to 1
		vec2 zeroToOne = a_position / u_resolution;
		
		//double the range to 0 to 2
		vec2 zeroToTwo = zeroToOne * 2.0;
		
		//offset so that it goes from -1 to 1
		vec2 clipSpace = zeroToTwo - 1.0;
		
		//clipspace
		gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
	}
	`;
	var fragmentShaderSource = 
	`
	precision mediump float;

	uniform vec4 u_color;
	void main() {
		gl_FragColor = u_color;
	}
	`;

	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

	var program = createProgram(gl, vertexShader, fragmentShader);

	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	
	var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
	
	var colorUniformLocation = gl.getUniformLocation(program,"u_color");
	
	var positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	var positions = [
	10, 20,
	80, 20,
	10, 30,
	10, 30,
	80, 20,
	80, 30,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	
	gl.viewport(0,0,gl.canvas.width, gl.canvas.height);

	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.useProgram(program);
	gl.enableVertexAttribArray(positionAttributeLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	
	gl.uniform2f(resolutionUniformLocation,gl.canvas.width, gl.canvas.height);

	var size = 2;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(
		positionAttributeLocation, size, type, normalize, stride, offset);

		
	//must be put after the vertexAttribPointer is set
	for(var ii = 0; ii< 50; ++ii) {
		
		setRectangle(
			gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
			
		gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
		
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
		
		
	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 6;
	gl.drawArrays(primitiveType, offset, count);
}

function createShader(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if(success) {
		return shader;
	}
	
	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(success) {
		return program;
	}
	
	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

function randomInt(range) {
	return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
	var x1 = x;
	var x2 = x + width;
	var y1 = y;
	var y2 = y + height;
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		x1, y1,
		x2, y1,
		x1, y2,
		x1, y2,
		x2, y1,
		x2, y2,
	]), gl.STATIC_DRAW);
}

main();