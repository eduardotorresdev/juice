import {parseOBJ, img} from '@utils';
/**
 * init
 * @return {WebGLRenderingContext|null}
 */
async function init(): Promise<any> {
    const element: HTMLCanvasElement | null = document.querySelector('.canvas');

    if (!element) return null;

    const webgl = element.getContext('webgl');
    const {default: chairObj} = await require('./assets/awp.obj');
    const chair = parseOBJ(chairObj);

    const vertexShader = `
        attribute vec4 a_position;
        attribute vec3 a_normal;

        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_world;

        varying vec3 v_worldPosition;
        varying vec3 v_normal;

        void main() {
            gl_Position = u_projection * u_view * u_world * a_position;
            v_normal = mat3(u_world) * a_normal;
            v_worldPosition = (u_world * a_position).xyz;
        }
    `;

    const fragShader = `
        precision highp float;

        varying vec3 v_normal;        
        uniform vec4 u_diffuse;
        uniform vec3 u_lightDirection;

        varying vec3 v_worldPosition;
        
        uniform samplerCube u_texture;
        
        uniform vec3 u_worldCameraPosition;

        void main () {
            vec3 normal = normalize(v_normal);
            float fakeLight = dot(u_lightDirection, normal) * 4.5 + .7;

            vec3 worldNormal = normalize(v_normal);
            vec3 eyeToSurfaceDir = normalize(v_worldPosition - u_worldCameraPosition);
            vec3 direction = reflect(eyeToSurfaceDir,worldNormal);
            
            gl_FragColor = textureCube(u_texture, direction) * vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
            ;
        }
    `;

    const meshProgramInfo = webglUtils.createProgramInfo(webgl, [
        vertexShader,
        fragShader,
    ]);

    const bufferInfo = webglUtils.createBufferInfoFromArrays(webgl, chair);

    // Create a texture.
    const texture = webgl.createTexture();
    webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, texture);

    const textureLocation = webgl.getUniformLocation(
        meshProgramInfo.program,
        'u_texture',
    );
    const worldCameraPositionLocation = webgl.getUniformLocation(
        meshProgramInfo.program,
        'u_worldCameraPosition',
    );

    const faceInfos = (filename = 'texturaMetal.jpg') => [
        {
            target: webgl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: `/public/img/${filename}`,
        },
        {
            target: webgl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: `/public/img/${filename}`,
        },
        {
            target: webgl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: `/public/img/${filename}`,
        },
        {
            target: webgl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: `/public/img/${filename}`,
        },
        {
            target: webgl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: `/public/img/${filename}`,
        },
        {
            target: webgl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: `/public/img/${filename}`,
        },
    ];

    faceInfos().forEach((faceInfo) => {
        const {target, url} = faceInfo;

        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = webgl.RGBA;
        const width = 256;
        const height = 256;
        const format = webgl.RGBA;
        const type = webgl.UNSIGNED_BYTE;

        // setup each face so it's immediately renderable
        webgl.texImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            0,
            format,
            type,
            null,
        );

        // Asynchronously load an image
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            // Now that the image has loaded upload it to the texture.
            webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, texture);
            webgl.texImage2D(
                target,
                level,
                internalFormat,
                format,
                type,
                image,
            );
            webgl.generateMipmap(webgl.TEXTURE_CUBE_MAP);
        });
    });
    webgl.generateMipmap(webgl.TEXTURE_CUBE_MAP);
    webgl.texParameteri(
        webgl.TEXTURE_CUBE_MAP,
        webgl.TEXTURE_MIN_FILTER,
        webgl.LINEAR_MIPMAP_LINEAR,
    );

    const cameraTarget = [0, 0, 0];
    const zNear = 0.5;
    const zFar = 2000;

    let currentTextura = '';

    const render = async (
        rotationX: number,
        rotationY: number,
        rotationZ: number,
        textura: string,
    ) => {
        if (textura !== currentTextura) {
            for (const faceInfo of faceInfos(textura)) {
                const level = 0;
                const internalFormat = webgl.RGBA;
                const format = webgl.RGBA;
                const type = webgl.UNSIGNED_BYTE;

                const image = await img.addImageProcess(faceInfo.url);
                webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, texture);
                webgl.texImage2D(
                    faceInfo.target,
                    level,
                    internalFormat,
                    format,
                    type,
                    image,
                );
                webgl.generateMipmap(webgl.TEXTURE_CUBE_MAP);
            }
            currentTextura = textura;
        }

        webglUtils.resizeCanvasToDisplaySize(webgl.canvas);
        webgl.viewport(0, 0, webgl.canvas.width, webgl.canvas.height);
        webgl.enable(webgl.DEPTH_TEST);
        webgl.enable(webgl.CULL_FACE);

        const fieldOfViewRadians = 1;
        const aspect = webgl.canvas.clientWidth / webgl.canvas.clientHeight;
        const projection = m4.perspective(
            fieldOfViewRadians,
            aspect,
            zNear,
            zFar,
        );

        const cameraPosition = [0, 0, 60];

        const up = [1, 0, 1];
        // Compute the camera's matrix using look at.
        const cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up);

        // Make a view matrix from the camera matrix.
        const view = m4.inverse(cameraMatrix);

        let worldMatrix = m4.multiply(
            cameraMatrix,
            m4.translate(view, 0, 17, 0),
        );
        worldMatrix = m4.multiply(worldMatrix, m4.xRotation(rotationX));
        worldMatrix = m4.multiply(worldMatrix, m4.yRotation(rotationY + 1.57));
        worldMatrix = m4.multiply(worldMatrix, m4.zRotation(rotationZ));

        const sharedUniforms = {
            u_lightDirection: m4.normalize([-50, 50, 50]),
            u_view: view,
            u_projection: projection,
        };

        webgl.useProgram(meshProgramInfo.program);
        webgl.uniform3fv(worldCameraPositionLocation, cameraPosition);
        webgl.uniform1i(textureLocation, 0);
        webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
        webglUtils.setBuffersAndAttributes(webgl, meshProgramInfo, bufferInfo);
        webglUtils.setUniforms(meshProgramInfo, {
            u_world: worldMatrix,
            u_diffuse: [1, 1, 1, 1],
        });
        webglUtils.drawBufferInfo(webgl, bufferInfo);
    };
    setTimeout(() => render(0, 0, 0), 1000);

    return {
        webgl,
        render,
    };
}

export const webgl = init();
