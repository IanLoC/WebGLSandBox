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
    var colorLocation = gl.getUniformLocation(program, "u_color");

	var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	var translation = [0, 0];
	var width = 100;
	var height = 30;
    var color = [Math.random(),Math.random(),Math.random(), 1];
    
    drawScene();

    function drawScene() {

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        gl.useProgram(program);
    
        gl.enableVertexAttribArray(positionAttributeLocation);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
        setRectangle(gl, translation[0], translation[1], width, height);
    
        var size = 2;			// 2 components per interation
        var type = gl.FLOAT;    // 32bit float
        var normalize = false;	// unnormalized data
        var stride = 0;			// move forward size * sizeof(type)
        var offset = 0;         // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);
    
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    
        gl.uniform4fv(colorLocation, color);
    
        var primitiveType =gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }
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

/**
 * @param {"gl"} gl object 
 * @param {"int"} x x coordinate
 * @param {"int"} y y coordinate
 * @param {"int"} width the width
 * @param {"int"} height the height
 */
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