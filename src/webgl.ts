import {parseOBJ, img, sleeper, end, m4, webglUtils} from '@utils';
import Metal from '../public/img/texturaMetal.jpg';
import Espaco from '../public/img/texturaEspaco.jpg';
import Azul from '../public/img/texturaAzul.jpg';

type Init = {
    webgl: WebGLRenderingContext;
    render: (
        rotationX: number,
        rotationY: number,
        rotationZ: number,
        textura: string
    ) => Promise<void>;
};

/**
 * init
 * @return {Init|null}
 */
async function init(): Promise<Init> {
    const element: HTMLCanvasElement | null = document.querySelector('.canvas');

    if (!element) return null;

    const webgl = element.getContext('webgl');
    const {default: chairObj} = await require('./objects/awp.obj');
    const chair = parseOBJ(chairObj);

    const vertexShader = `
        attribute vec4 a_position;
        attribute vec3 a_normal;

        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_world;

        varying vec3 v_worldPosition;
        varying vec3 v_normal;

        varying vec3 vertPos;

        void main() {
            vec4 vertPos4 = u_view * a_position;
            vertPos = vec3(vertPos4) / vertPos4.w;

            gl_Position = u_projection * u_view * u_world * a_position;
            v_normal = mat3(u_world) * a_normal;
            v_worldPosition = (u_world * a_position).xyz;
        }
    `;

    const fragShader = `
        precision highp float;

        varying vec3 v_normal;
        varying vec3 vertPos;       
        uniform float Ka;
        uniform float Kd;
        uniform float Ks;
        uniform vec3 ambientColor;
        uniform vec3 diffuseColor;
        uniform vec3 specularColor;
        uniform vec3 u_lightDirection;

        varying vec3 v_worldPosition;
        
        uniform samplerCube u_texture;
        
        uniform vec3 u_worldCameraPosition;

        void main () {
            vec3 normal = normalize(v_normal);
            vec3 L = normalize(u_lightDirection - vertPos);
            float lambertian = max(dot(normal, L), 0.0);
            float specular = 0.0;
            if(lambertian > 0.0) {
                vec3 R = reflect(-L, normal);
                vec3 V = normalize(-vertPos);
                float specAngle = max(dot(R, V), 0.0);
                specular = pow(specAngle, 1.0);
            }

            vec3 eyeToSurfaceDir = normalize(
                v_worldPosition - u_worldCameraPosition
            );
            vec3 direction = reflect(eyeToSurfaceDir, normal);
            vec3 lights = Ka * ambientColor +
            Kd * lambertian * diffuseColor +
            Ks * specular * specularColor;

            // textureCube(u_texture, direction)
            gl_FragColor = vec4(
                textureCube(u_texture, direction).rgb * lights, 1.0
            );
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

    const ambientColorLoc = webgl.getUniformLocation(
        meshProgramInfo.program,
        'ambientColor',
    );
    const diffuseColorLoc = webgl.getUniformLocation(
        meshProgramInfo.program,
        'diffuseColor',
    );
    const specularColorLoc = webgl.getUniformLocation(
        meshProgramInfo.program,
        'specularColor',
    );

    const kaLoc = webgl.getUniformLocation(meshProgramInfo.program, 'Ka');
    const kdLoc = webgl.getUniformLocation(meshProgramInfo.program, 'Kd');
    const ksLoc = webgl.getUniformLocation(meshProgramInfo.program, 'Ks');

    const texturas: { [key: string]: string } = {
        metal: Metal,
        espaco: Espaco,
        azul: Azul,
    };

    const faces = [
        webgl.TEXTURE_CUBE_MAP_POSITIVE_X,
        webgl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        webgl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        webgl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        webgl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        webgl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];

    for (const face of faces) {
        const level = 0;
        const internalFormat = webgl.RGBA;
        const width = 256;
        const height = 256;
        const format = webgl.RGBA;
        const type = webgl.UNSIGNED_BYTE;

        webgl.texImage2D(
            face,
            level,
            internalFormat,
            width,
            height,
            0,
            format,
            type,
            null,
        );

        const image = await img.addImageProcess(texturas.metal);
        webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, texture);
        webgl.texImage2D(face, level, internalFormat, format, type, image);
    }

    webgl.texParameteri(
        webgl.TEXTURE_CUBE_MAP,
        webgl.TEXTURE_MIN_FILTER,
        webgl.LINEAR_MIPMAP_LINEAR,
    );

    const cameraTarget = [0, 0, 0];
    const zNear = 0.5;
    const zFar = 2000;
    const ambientColor = [0, 0, 0];
    const diffuseColor = [5, 5, 5];
    const specularColor = [0, 0, 0];
    const kaVal = 1.0;
    const kdVal = 1.0;
    const ksVal = 1.0;

    let currentTextura = '';

    const render = async (
        rotationX: number,
        rotationY: number,
        rotationZ: number,
        textura: string,
    ) => {
        if (textura !== currentTextura) {
            const loading = document.querySelector('.texture__loading');
            loading.classList.add('texture__loading--show');
            const startTime = new Date();
            for (const face of faces) {
                const level = 0;
                const internalFormat = webgl.RGBA;
                const format = webgl.RGBA;
                const type = webgl.UNSIGNED_BYTE;

                const image = await img.addImageProcess(texturas[textura]);
                webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, texture);
                webgl.texImage2D(
                    face,
                    level,
                    internalFormat,
                    format,
                    type,
                    image,
                );
                webgl.generateMipmap(webgl.TEXTURE_CUBE_MAP);
            }
            const endTime = end(startTime);
            if (endTime < 1) await sleeper((0.5 - endTime) * 1000);
            loading.classList.remove('texture__loading--show');
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
            u_lightDirection: [0, 100, 50],
            u_view: view,
            u_projection: projection,
        };

        webgl.useProgram(meshProgramInfo.program);
        webgl.uniform3fv(worldCameraPositionLocation, cameraPosition);
        webgl.uniform1i(textureLocation, 0);
        webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
        webglUtils.setBuffersAndAttributes(webgl, meshProgramInfo, bufferInfo);
        webgl.uniform3fv(ambientColorLoc, ambientColor);
        webgl.uniform3fv(diffuseColorLoc, diffuseColor);
        webgl.uniform3fv(specularColorLoc, specularColor);
        webgl.uniform1f(kaLoc, kaVal);
        webgl.uniform1f(kdLoc, kdVal);
        webgl.uniform1f(ksLoc, ksVal);
        webglUtils.setUniforms(meshProgramInfo, {
            u_world: worldMatrix,
        });
        webglUtils.drawBufferInfo(webgl, bufferInfo);
    };

    return {
        webgl,
        render,
    };
}

export const webgl = init();
