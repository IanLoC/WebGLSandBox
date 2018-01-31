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
		vec2 zeroToOne = a_position /u_resolution;
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

	void main() {
		gl_FragColor = vec4(1,0,0.5,1);
	}
	`;

	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

	var program = createProgram(gl, vertexShader, fragmentShader);

	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	
	var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

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
main();