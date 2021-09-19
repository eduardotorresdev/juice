/* eslint-disable prefer-rest-params */
/* eslint-disable no-throw-literal */
export const webglUtils = {
    defaultShaderType: ['VERTEX_SHADER', 'FRAGMENT_SHADER'],
    error: (msg) => {
        if (topWindow.console) {
            if (topWindow.console.error) {
                topWindow.console.error(msg);
            } else if (topWindow.console.log) {
                topWindow.console.log(msg);
            }
        }
    },
    getBindPointForSamplerType: (gl, type) => {
        if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;
        if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
        return undefined;
    },
    allButIndices: (name) => {
        return name !== 'indices';
    },
    createAttribsFromArrays: (gl, arrays, optMapping) => {
        const mapping = optMapping || webglUtils.createMapping(arrays);
        const attribs = {};
        Object.keys(mapping).forEach(function(attribName) {
            const bufferName = mapping[attribName];
            const origArray = arrays[bufferName];
            if (origArray.value) {
                attribs[attribName] = {
                    value: origArray.value,
                };
            } else {
                const array = webglUtils.makeTypedArray(origArray, bufferName);
                attribs[attribName] = {
                    buffer: webglUtils.createBufferFromTypedArray(gl, array),
                    numComponents:
                        origArray.numComponents ||
                        array.numComponents ||
                        webglUtils.guessNumComponentsFromName(bufferName),
                    type: webglUtils.getGLTypeForTypedArray(gl, array),
                    normalize: webglUtils.getNormalizationForTypedArray(array),
                };
            }
        });
        return attribs;
    },
    positionKeys: ['position', 'positions', 'a_position'],
    getNumComponents(array, arrayName) {
        return (
            array.numComponents ||
            array.size ||
            webglUtils.guessNumComponentsFromName(
                arrayName,
                webglUtils.getArray(array).length,
            )
        );
    },
    getNumElementsFromNonIndexedArrays: (arrays) => {
        let key;
        for (const k of webglUtils.positionKeys) {
            if (k in arrays) {
                key = k;
                break;
            }
        }
        key = key || Object.keys(arrays)[0];
        const array = arrays[key];
        const length = webglUtils.getArray(array).length;
        const numComponents = webglUtils.getNumComponents(array, key);
        const numElements = length / numComponents;
        if (length % numComponents > 0) {
            throw new Error(`numComponents ${numComponents}
            not correct for length ${length}`);
        }
        return numElements;
    },
    createAugmentedTypedArray: (numComponents, numElements, optType) => {
        const Type = optType || Float32Array;
        return webglUtils.augmentTypedArray(
            new Type(numComponents * numElements),
            numComponents,
        );
    },
    createBufferFromTypedArray: (gl, array, type, drawType) => {
        type = type || gl.ARRAY_BUFFER;
        const buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
        return buffer;
    },
    getGLTypeForTypedArray: (gl, typedArray) => {
        if (typedArray instanceof Int8Array) {
            return gl.BYTE;
        }
        if (typedArray instanceof Uint8Array) {
            return gl.UNSIGNED_BYTE;
        }
        if (typedArray instanceof Int16Array) {
            return gl.SHORT;
        }
        if (typedArray instanceof Uint16Array) {
            return gl.UNSIGNED_SHORT;
        }
        if (typedArray instanceof Int32Array) {
            return gl.INT;
        }
        if (typedArray instanceof Uint32Array) {
            return gl.UNSIGNED_INT;
        }
        if (typedArray instanceof Float32Array) {
            return gl.FLOAT;
        }
        throw 'unsupported typed array type';
    },
    getNormalizationForTypedArray: (typedArray) => {
        if (typedArray instanceof Int8Array) {
            return true;
        }
        if (typedArray instanceof Uint8Array) {
            return true;
        }
        return false;
    },
    augmentTypedArray: (typedArray, numComponents) => {
        let cursor = 0;
        typedArray.push = function() {
            for (let ii = 0; ii < arguments.length; ++ii) {
                const value = arguments[ii];
                if (
                    value instanceof Array ||
                    (value.buffer && value.buffer instanceof ArrayBuffer)
                ) {
                    for (let jj = 0; jj < value.length; ++jj) {
                        typedArray[cursor++] = value[jj];
                    }
                } else {
                    typedArray[cursor++] = value;
                }
            }
        };
        typedArray.reset = function(optIndex) {
            cursor = optIndex || 0;
        };
        typedArray.numComponents = numComponents;
        Object.defineProperty(typedArray, 'numElements', {
            get: function() {
                return (this.length / this.numComponents) | 0;
            },
        });
        return typedArray;
    },
    createProgram: (
        gl,
        shaders,
        optAttribs,
        optlocations,
        optErrorCallback,
    ) => {
        const errFn = optErrorCallback || webglUtils.error;
        const program = gl.createProgram();
        shaders.forEach(function(shader) {
            gl.attachShader(program, shader);
        });
        if (optAttribs) {
            optAttribs.forEach(function(attrib, ndx) {
                gl.bindAttribLocation(
                    program,
                    optlocations ? optlocations[ndx] : ndx,
                    attrib,
                );
            });
        }
        gl.linkProgram(program);

        // Check the link status
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            const lastError = gl.getProgramInfoLog(program);
            errFn('Error in program linking:' + lastError);

            gl.deleteProgram(program);
            return null;
        }
        return program;
    },
    createProgramInfo: (
        gl,
        shaderSources,
        optAttribs,
        optLocations,
        optErrorCallback,
    ) => {
        shaderSources = shaderSources.map(function(source) {
            const script = document.getElementById(source);
            return script ? script.text : source;
        });
        const program = webglUtils.createProgramFromSources(
            gl,
            shaderSources,
            optAttribs,
            optLocations,
            optErrorCallback,
        );
        if (!program) {
            return null;
        }
        const uniformSetters = webglUtils.createUniformSetters(gl, program);
        const attribSetters = webglUtils.createAttributeSetters(gl, program);
        return {
            program: program,
            uniformSetters: uniformSetters,
            attribSetters: attribSetters,
        };
    },
    createProgramFromSources: (
        gl,
        shaderSources,
        optAttribs,
        optLocations,
        optErrorCallback,
    ) => {
        const shaders = [];
        for (let ii = 0; ii < shaderSources.length; ++ii) {
            shaders.push(
                webglUtils.loadShader(
                    gl,
                    shaderSources[ii],
                    gl[webglUtils.defaultShaderType[ii]],
                    optErrorCallback,
                ),
            );
        }
        return webglUtils.createProgram(
            gl,
            shaders,
            optAttribs,
            optLocations,
            optErrorCallback,
        );
    },
    createUniformSetters: (gl, program) => {
        let textureUnit = 0;

        const createUniformSetter = (program, uniformInfo) => {
            const location = gl.getUniformLocation(program, uniformInfo.name);
            const type = uniformInfo.type;
            // Check if this uniform is an array
            const isArray =
                uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]';
            if (type === gl.FLOAT && isArray) {
                return function(v) {
                    gl.uniform1fv(location, v);
                };
            }
            if (type === gl.FLOAT) {
                return function(v) {
                    gl.uniform1f(location, v);
                };
            }
            if (type === gl.FLOAT_VEC2) {
                return function(v) {
                    gl.uniform2fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC3) {
                return function(v) {
                    gl.uniform3fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC4) {
                return function(v) {
                    gl.uniform4fv(location, v);
                };
            }
            if (type === gl.INT && isArray) {
                return function(v) {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.INT) {
                return function(v) {
                    gl.uniform1i(location, v);
                };
            }
            if (type === gl.INT_VEC2) {
                return function(v) {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.INT_VEC3) {
                return function(v) {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.INT_VEC4) {
                return function(v) {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.BOOL) {
                return function(v) {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC2) {
                return function(v) {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC3) {
                return function(v) {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC4) {
                return function(v) {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.FLOAT_MAT2) {
                return function(v) {
                    gl.uniformMatrix2fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT3) {
                return function(v) {
                    gl.uniformMatrix3fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT4) {
                return function(v) {
                    gl.uniformMatrix4fv(location, false, v);
                };
            }
            if (
                (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) &&
                isArray
            ) {
                const units = [];
                for (let ii = 0; ii < info.size; ++ii) {
                    units.push(textureUnit++);
                }
                return (function(bindPoint, units) {
                    return function(textures) {
                        gl.uniform1iv(location, units);
                        textures.forEach(function(texture, index) {
                            gl.activeTexture(gl.TEXTURE0 + units[index]);
                            gl.bindTexture(bindPoint, texture);
                        });
                    };
                })(webglUtils.getBindPointForSamplerType(gl, type), units);
            }
            if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
                return (function(bindPoint, unit) {
                    return function(texture) {
                        gl.uniform1i(location, unit);
                        gl.activeTexture(gl.TEXTURE0 + unit);
                        gl.bindTexture(bindPoint, texture);
                    };
                })(
                    webglUtils.getBindPointForSamplerType(gl, type),
                    textureUnit++,
                );
            }
            throw `unknown type: 0x ${type.toString(16)}`;
        };

        const uniformSetters = {};
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let ii = 0; ii < numUniforms; ++ii) {
            const uniformInfo = gl.getActiveUniform(program, ii);
            if (!uniformInfo) {
                break;
            }
            let name = uniformInfo.name;
            // remove the array suffix.
            if (name.substr(-3) === '[0]') {
                name = name.substr(0, name.length - 3);
            }
            const setter = createUniformSetter(program, uniformInfo);
            uniformSetters[name] = setter;
        }
        return uniformSetters;
    },
    createAttributeSetters: (gl, program) => {
        const attribSetters = {};

        const createAttribSetter = (index) => {
            return function(b) {
                if (b.value) {
                    gl.disableVertexAttribArray(index);
                    switch (b.value.length) {
                    case 4:
                        gl.vertexAttrib4fv(index, b.value);
                        break;
                    case 3:
                        gl.vertexAttrib3fv(index, b.value);
                        break;
                    case 2:
                        gl.vertexAttrib2fv(index, b.value);
                        break;
                    case 1:
                        gl.vertexAttrib1fv(index, b.value);
                        break;
                    default:
                        throw new Error(
                            `the length of a float constant 
                            value must be between 1 and 4!`,
                        );
                    }
                } else {
                    gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                    gl.enableVertexAttribArray(index);
                    gl.vertexAttribPointer(
                        index,
                        b.numComponents || b.size,
                        b.type || gl.FLOAT,
                        b.normalize || false,
                        b.stride || 0,
                        b.offset || 0,
                    );
                }
            };
        };

        const numAttribs = gl.getProgramParameter(
            program,
            gl.ACTIVE_ATTRIBUTES,
        );
        for (let ii = 0; ii < numAttribs; ++ii) {
            const attribInfo = gl.getActiveAttrib(program, ii);
            if (!attribInfo) {
                break;
            }
            const index = gl.getAttribLocation(program, attribInfo.name);
            attribSetters[attribInfo.name] = createAttribSetter(index);
        }

        return attribSetters;
    },
    createBufferInfoFromArrays: (gl, arrays, optMapping) => {
        const bufferInfo = {
            attribs: webglUtils.createAttribsFromArrays(gl, arrays, optMapping),
        };
        let indices = arrays.indices;
        if (indices) {
            indices = webglUtils.makeTypedArray(indices, 'indices');
            bufferInfo.indices = webglUtils.createBufferFromTypedArray(
                gl,
                indices,
                gl.ELEMENT_ARRAY_BUFFER,
            );
            bufferInfo.numElements = indices.length;
        } else {
            bufferInfo.numElements =
                webglUtils.getNumElementsFromNonIndexedArrays(arrays);
        }

        return bufferInfo;
    },
    getArray: (array) => {
        return array.length ? array : array.data;
    },
    createMapping: (obj) => {
        const mapping = {};
        Object.keys(obj)
            .filter(webglUtils.allButIndices)
            .forEach(function(key) {
                mapping['a_' + key] = key;
            });
        return mapping;
    },
    isArrayBuffer: (a) => {
        return a.buffer && a.buffer instanceof ArrayBuffer;
    },
    guessNumComponentsFromName: (name, length) => {
        let numComponents;
        if (name.indexOf('coord') >= 0) {
            numComponents = 2;
        } else if (name.indexOf('color') >= 0) {
            numComponents = 4;
        } else {
            numComponents = 3; // position, normals, indices ...
        }

        if (length % numComponents > 0) {
            throw 'can not guess numComponents. You should specify it.';
        }

        return numComponents;
    },
    makeTypedArray: (array, name) => {
        if (webglUtils.isArrayBuffer(array)) {
            return array;
        }

        if (array.data && webglUtils.isArrayBuffer(array.data)) {
            return array.data;
        }

        if (Array.isArray(array)) {
            array = {
                data: array,
            };
        }

        if (!array.numComponents) {
            array.numComponents = webglUtils.guessNumComponentsFromName(
                name,
                array.length,
            );
        }

        let type = array.type;
        if (!type) {
            if (name === 'indices') {
                type = Uint16Array;
            }
        }
        const typedArray = webglUtils.createAugmentedTypedArray(
            array.numComponents,
            (array.data.length / array.numComponents) | 0,
            type,
        );
        typedArray.push(array.data);
        return typedArray;
    },
    resizeCanvasToDisplaySize: (canvas, multiplier) => {
        multiplier = multiplier || 1;
        const width = (canvas.clientWidth * multiplier) | 0;
        const height = (canvas.clientHeight * multiplier) | 0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    },
    setUniforms: (setters, ...values) => {
        setters = setters.uniformSetters || setters;
        for (const uniforms of values) {
            Object.keys(uniforms).forEach(function(name) {
                const setter = setters[name];
                if (setter) {
                    setter(uniforms[name]);
                }
            });
        }
    },
    setAttributes: (setters, attribs) => {
        setters = setters.attribSetters || setters;
        Object.keys(attribs).forEach(function(name) {
            const setter = setters[name];
            if (setter) {
                setter(attribs[name]);
            }
        });
    },
    setBuffersAndAttributes: (gl, setters, buffers) => {
        webglUtils.setAttributes(setters, buffers.attribs);
        if (buffers.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        }
    },
    drawBufferInfo: (gl, bufferInfo, primitiveType, count, offset) => {
        const indices = bufferInfo.indices;
        primitiveType =
            primitiveType === undefined ? gl.TRIANGLES : primitiveType;
        const numElements =
            count === undefined ? bufferInfo.numElements : count;
        offset = offset === undefined ? 0 : offset;
        if (indices) {
            gl.drawElements(
                primitiveType,
                numElements,
                gl.UNSIGNED_SHORT,
                offset,
            );
        } else {
            gl.drawArrays(primitiveType, offset, numElements);
        }
    },
    loadShader: (gl, shaderSource, shaderType, optErrorCallback) => {
        const errFn = optErrorCallback || webglUtils.error;
        const shader = gl.createShader(shaderType);

        gl.shaderSource(shader, shaderSource);

        gl.compileShader(shader);

        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            const lastError = gl.getShaderInfoLog(shader);
            errFn(
                '*** Error compiling shader \'' +
                    shader +
                    '\':' +
                    lastError +
                    `\n` +
                    shaderSource
                        .split('\n')
                        .map((l, i) => `${i + 1}: ${l}`)
                        .join('\n'),
            );
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    },
};
