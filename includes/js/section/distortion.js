WebGLDistortionScroller = function (input) {
	this._canvas = null;
	this._gl = null;
	this._vertexBuffer = null;
	this._indexBuffer = null;
	this._vertexShader = null;
	this._fragmentShader = null;
	this._program = null;
	this._positionAttrib = 0;
	this._uvAttrib = 0;
	this._amountLoc = null;
	this._phaseLoc = null;
	this._phase = 0;
	this._amount = 0;
	this._amountTarget = 0;
	this._cutOff = 1.0;

	// adjustable properties:
	this.strengthX = -0.0725;
	this.strengthY = 4;
	this.animationSpeed = 1.2;
	this.hardness = 30.0;

	// Fired when the program has finished it's animation
	this.onpause = input.onpause;

	this._init(input.displacement);
};

WebGLDistortionScroller.prototype =
{
	start: function () {
		this.running = true;
		self.requestAnimationFrame(this._render.bind(this));
	},

	_init: function (displacementMap) {
		this._canvas = document.querySelector("#distortion");

		this._initWebGL();
		if (!this._gl) return;

		this._displacementMap = this._initTexture(displacementMap, this._gl.REPEAT);

		this._resize();
		this._prepareRender();

		this.start();
	},

	_initWebGL: function () {
		var webglFlags = { antialias: false, depth: false };
		this._gl = this._canvas.getContext('webgl', webglFlags) || this._canvas.getContext('experimental-webgl', webglFlags);
		if (!this._gl) return;

		var vertices = [-1, 1, 0, 1,
			1, 1, 1, 1,
			1, -1, 1, 0,
		-1, -1, 0, 0];
		var indices = [0, 1, 2, 0, 2, 3];

		this._vertexBuffer = this._gl.createBuffer();
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexBuffer);
		this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);

		this._indexBuffer = this._gl.createBuffer();
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), this._gl.STATIC_DRAW);

		this._initProgram();
	},

	_initTexture: function (img, wrap) {
		var texture = this._gl.createTexture();

		this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
		this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, 1);

		this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, img);

		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);

		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, wrap);
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, wrap);

		return texture;
	},

	_initProgram: function () {
		this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
		if (!this._initShader(this._vertexShader, WebGLDistortionScroller.VERTEX_SHADER)) {
			console.warn("Failed generating vertex shader");
			return;
		}

		this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
		if (!this._initShader(this._fragmentShader, WebGLDistortionScroller.FRAGMENT_SHADER)) {
			console.warn("Failed generating fragment shader:");
			return;
		}

		this._program = this._gl.createProgram();

		this._gl.attachShader(this._program, this._vertexShader);
		this._gl.attachShader(this._program, this._fragmentShader);
		this._gl.linkProgram(this._program);

		if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
			var log = this._gl.getProgramInfoLog(this._program);
			console.warn("Error in program linking:" + log);
			return;
		}

		this._positionAttrib = this._gl.getAttribLocation(this._program, "position");
		this._uvAttrib = this._gl.getAttribLocation(this._program, "texCoord");

		this._gl.useProgram(this._program);
		texLoc = this._gl.getUniformLocation(this._program, "displacementMap");
		this._gl.uniform1i(texLoc, 0);
		this._amountLoc = this._gl.getUniformLocation(this._program, "amount");
		this._cutoffLoc = this._gl.getUniformLocation(this._program, "cutoff");
		this._hardnessLoc = this._gl.getUniformLocation(this._program, "hardness");
		this._phaseLoc = this._gl.getUniformLocation(this._program, "phase");
	},

	_initShader: function (shader, code) {
		this._gl.shaderSource(shader, code);
		this._gl.compileShader(shader);

		// Check the compile status, return an error if failed
		if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
			console.warn(this._gl.getShaderInfoLog(shader));
			return false;
		}

		return true;
	},


	_resize: function () {
		this._canvas.width = this._canvas.clientWidth;
		this._canvas.style.height = window.innerHeight + "px";
		this._canvas.height = window.innerHeight;
	},

	_prepareRender: function () {
		const gl = this._gl;



		gl.viewport(0, 0, this._canvas.clientWidth, this._canvas.clientHeight);



		gl.useProgram(this._program);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);



		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);

		gl.vertexAttribPointer(this._positionAttrib, 2, gl.FLOAT, false, 16, 0);
		gl.vertexAttribPointer(this._uvAttrib, 2, gl.FLOAT, false, 16, 8);



		// Binds the textures to the display
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._displacementMap);


		gl.uniform1f(this._hardnessLoc, this.hardness);
	},

	calculateScrollTarget: function () {
		const scrolling = (document.documentElement && document.documentElement.scrollTop) ||
			document.body.scrollTop;

		this._amountTarget = Math.min(
			Math.max(0, scrolling / window.innerHeight)
			, 0.95);

		return this._amountTarget;
	},
	shouldBeActive: function () {
		this.calculateScrollTarget();
		if (0.95 === this._amountTarget) return false;
		return true;
	},
	_updateScrollVariables: function () {
		this.calculateScrollTarget();

		this._amount = (this._amountTarget + this._amount) * .5;
		this._cutOff = (this._amountTarget + this._cutOff) * .5;

		if (0.93 < this._amount && 0.93 < this._cutOff) {
			this.running = false;
			this.onpause();
		}
	},

	running: true,
	_render: function (timeStamp) {
		if (this.running) self.requestAnimationFrame(this._render.bind(this));
		else return;

		this._updateScrollVariables();

		const gl = this._gl;


		// Set variables
		this._phase += .01;
		gl.uniform1f(this._phaseLoc, this._phase * this.animationSpeed);
		gl.uniform1f(this._cutoffLoc, this._cutOff * 1.25);
		gl.uniform2f(this._amountLoc, this._amount * this.strengthX, this._amount * this.strengthY);


		// Draws the textures
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	},
};

WebGLDistortionScroller.VERTEX_SHADER =
	[
		"precision highp float;",
		"attribute vec4 position;",
		"attribute vec2 texCoord;",

		"varying vec2 uv;",

		"void main()",
		"{",
		"   uv = texCoord;",
		"   gl_Position = position;",
		"}"
	].join("\n");

WebGLDistortionScroller.FRAGMENT_SHADER =
	[
		"precision highp float;",
		"varying vec2 uv;",

		"uniform sampler2D displacementMap;",

		"uniform vec2 amount;",
		"uniform float phase;",
		"uniform float hardness;",
		"uniform float cutoff;",

		"uniform vec3 contentLimit;",

		"void main()",
		"{",
		"   vec2 sampleUV = uv;",
		"   vec2 offset;",
		"   offset.x = sin(uv.x * 15.0 + phase) * .05;",
		"   offset.y = cos(uv.y * 15.0 + phase) * .05;",
		"   sampleUV += (texture2D(displacementMap, uv * 1.2 + offset).xy - .5) * amount;",
		"   gl_FragColor = vec4(1.0);",
		"   if (sampleUV.y > 1.0 || sampleUV.y < cutoff) gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);",
		"}",
	].join("\n");