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
	/*
	uniform vec2 u_translation;
	uniform vec2 u_rotation;
	uniform vec2 u_scale;
	*/
	uniform mat3 u_matrix;

	void main() {
		/*
		//Scale the position
		vec2 scaledPosition = a_position * u_scale;

		//Rotate the position
		vec2 rotatedPosition = vec2(
			scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
			scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
		);

		// Add in translation
		vec2 position = rotatedPosition + u_translation;
		*/

		vec2 position = (u_matrix * vec3(a_position, 1)).xy;

		//pixels to range 0 to 1
		vec2 zeroToOne = position /u_resolution;
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

	/*
	var translationLocation = gl.getUniformLocation(program, "u_translation");

	var rotationLocation = gl.getUniformLocation(program, "u_rotation");

	var scaleLocation = gl.getUniformLocation(program, "u_scale");
	*/

	var matrixLocation = gl.getUniformLocation(program, "u_matrix");

	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	setGeometry(gl);

	var translation = [130,30];
	
	//var rotation = [];
	var angleDeg = -45;
	var angleRad = angleDeg * Math.PI / 180;
	//rotation[0] = Math.sin(angleRad);
	//rotation[1] = Math.cos(angleRad);

	var scale = [0.2, 0.2];

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
    
        //setRectangle(gl, translation[0], translation[1], width, height);
		

        var size = 2;			// 2 components per interation
        var type = gl.FLOAT;    // 32bit float
        var normalize = false;	// unnormalized data
        var stride = 0;			// move forward size * sizeof(type)
        var offset = 0;         // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);
    
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    
		gl.uniform4fv(colorLocation, color);
		
		/*
		//set the translation
		gl.uniform2fv(translationLocation, translation);

		//set the rotation
		gl.uniform2fv(rotationLocation, rotation);

		//set the scale
		gl.uniform2fv(scaleLocation, scale);
		*/

		//compute the matricies
		var translationMatrix = m3.translation(translation[0],translation[1]);
		var rotationMatrix = m3.rotation(angleRad);
		var scaleMatrix = m3.scaling(scale[0],scale[1]);

		//Multiply the matricies
		var matrix = m3.multiply(translationMatrix, rotationMatrix);
		matrix = m3.multiply(matrix, scaleMatrix);

		//set the matrix
		gl.uniformMatrix3fv(matrixLocation, false, matrix);
		
        var primitiveType =gl.TRIANGLES;
        var offset = 0;
        var count = 18;
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
/*
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
*/
/*
function setGeometry(gl, x ,y) {
	var width = 100;
	var height = 150;
	var thickness = 30;
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			
			//left column
			x, y,
			x + thickness, y,
			x, y + height,

			x, y + height,
			x + thickness, y,
			x + thickness, y + height,

			
			//top rung
			x + thickness, y,
			x + width, y,
			x + thickness, y + thickness,

			x + thickness, y + thickness,
			x + width, y,
			x + width, y + thickness,


			//middle rung
			x + thickness, y + thickness * 2,
			x + width * 2 / 3, y + thickness * 2,
			x + thickness, y + thickness * 3,
			
			x + thickness, y + thickness * 3,
			x + width * 2 / 3, y + thickness * 2,
			x + width * 2 / 3, y + thickness * 3,
		]),
		gl.STATIC_DRAW
	);
}
*/

function setGeometry(gl) {
	var width = 100;
	var height = 150;
	var thickness = 30;
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			
			//left column
			0, 0,
			30, 0,
			0, 150,

			0, 150,
			30, 0,
			30, 150,

			
			//top rung
			30, 0,
			100, 0,
			30, 30,

			30, 30,
			100, 0,
			100, 30,


			//middle rung
			30, 60,
			67, 60,
			30, 90,

			30, 90,
			67, 60,
			67, 90,
		]),
		gl.STATIC_DRAW
	);
}

var m3 = {
	translation : function(tx, ty) {
		return [
			1,  0,  0,
			0,  1,  0,
			tx, ty, 1,
		];
	},
	rotation: function (angleInRadians) {
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
		return [
			c, -s,  0,
			s,  c,  0,
			0,  0,  1,
		];
	},
	scaling: function (sx, sy) {
		return [
			sx, 0,  0,
			0,  sy, 0,
			0,  0,  1,
		];
	},
	multiply: function (a, b) {
		var a00 = a[0 * 3 + 0];
		var a01 = a[0 * 3 + 1];
		var a02 = a[0 * 3 + 2];
		var a10 = a[1 * 3 + 0];
		var a11 = a[1 * 3 + 1];
		var a12 = a[1 * 3 + 2];
		var a20 = a[2 * 3 + 0];
		var a21 = a[2 * 3 + 1];
		var a22 = a[2 * 3 + 2];

		var b00 = b[0 * 3 + 0];
		var b01 = b[0 * 3 + 1];
		var b02 = b[0 * 3 + 2];
		var b10 = b[1 * 3 + 0];
		var b11 = b[1 * 3 + 1];
		var b12 = b[1 * 3 + 2];
		var b20 = b[2 * 3 + 0];
		var b21 = b[2 * 3 + 1];
		var b22 = b[2 * 3 + 2];
		return [
			b00 * a00 + b01 * a10 + b02 * a20,
			b00 * a01 + b01 * a11 + b02 * a21,
			b00 * a02 + b01 * a12 + b02 * a22,

			b10 * a00 + b11 * a10 + b12 * a20,
			b10 * a01 + b11 * a11 + b12 * a21,
			b10 * a02 + b11 * a12 + b12 * a22,

			b20 * a00 + b21 * a10 + b22 * a20,
			b20 * a01 + b21 * a11 + b22 * a21,
			b20 * a02 + b21 * a12 + b22 * a22,
		];
	},
};
main();