return {
    init: function (ENGINE, WORLD, gl, program) {
        WORLD.initBuffers(program);
        WORLD.initWorld(program);
        WORLD.initLocations(program);

        // Bind the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, WORLD.boxVertexBufferObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, WORLD.boxIndexBufferObject);

        // Vertex Position
        gl.enableVertexAttribArray(WORLD.positionAttribLocation);
        gl.vertexAttribPointer(
            WORLD.positionAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            12 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        );

        // Normals
        gl.enableVertexAttribArray(WORLD.normalAttribLocation);
        gl.vertexAttribPointer(
            WORLD.normalAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            12 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );

        // Color Index
        gl.enableVertexAttribArray(WORLD.rgbaAttribLocation);
        gl.vertexAttribPointer(
            WORLD.rgbaAttribLocation, // Attribute location
            4, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            12 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            6 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );

        gl.enableVertexAttribArray(WORLD.emissionAttribLocation);
        gl.vertexAttribPointer(
            WORLD.emissionAttribLocation, // Attribute location
            1, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            12 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            10 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );  

        gl.enableVertexAttribArray(WORLD.occlusionAttribLocation);
        gl.vertexAttribPointer(
            WORLD.occlusionAttribLocation, // Attribute location
            1, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            12 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            11 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );

        this.isSunLocation = gl.getUniformLocation(program, 'is_sun');
    },
    use: function (ENGINE, WORLD, gl, program) {
        WORLD.initLocations(program);
        WORLD.updateWorld(program);
    },
    draw: function (ENGINE, WORLD, gl, program, textures, framebuffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.sunhdr);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(ENGINE.GL_CLEARBIT);
        gl.uniform1f(this.isSunLocation, 0);
        WORLD.render();
        gl.uniform1f(this.isSunLocation, 1);
        WORLD.sunRender();
    },
    clean: function (ENGINE, WORLD, gl, program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    },
}