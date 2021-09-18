import {parseOBJ} from '@utils';

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

        varying vec3 v_normal;

        void main() {
            gl_Position = u_projection * u_view * u_world * a_position;
            v_normal = mat3(u_world) * a_normal;
        }
    `;

    const fragShader = `
        precision mediump float;

        varying vec3 v_normal;

        uniform vec4 u_diffuse;
        uniform vec3 u_lightDirection;

        void main () {
            vec3 normal = normalize(v_normal);
            float fakeLight = dot(u_lightDirection, normal) * .5 + .7;
            gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
        }
    `;

    const meshProgramInfo = webglUtils.createProgramInfo(webgl, [
        vertexShader,
        fragShader,
    ]);

    const bufferInfo = webglUtils.createBufferInfoFromArrays(webgl, chair);

    const cameraTarget = [0, 0, 0];
    const zNear = 0.5;
    const zFar = 2000;

    const render = (
        rotationX: number,
        rotationY: number,
        rotationZ: number,
    ) => {
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

        const cameraPosition = [0, 0, 50];

        const up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        const cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up);

        // Make a view matrix from the camera matrix.
        let view = m4.inverse(cameraMatrix);

        view = m4.multiply(view, m4.xRotation(rotationX));
        view = m4.multiply(view, m4.yRotation(rotationY));
        view = m4.multiply(view, m4.zRotation(rotationZ));

        const sharedUniforms = {
            u_lightDirection: m4.normalize([5, 3, 5]),
            u_view: view,
            u_projection: projection,
        };

        webgl.useProgram(meshProgramInfo.program);

        webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
        webglUtils.setBuffersAndAttributes(webgl, meshProgramInfo, bufferInfo);
        webglUtils.setUniforms(meshProgramInfo, {
            u_world: m4.zRotation(0),
            u_diffuse: [1, 1, 1, 1],
        });
        webglUtils.drawBufferInfo(webgl, bufferInfo);
    };

    render(0);

    return {
        webgl,
        render,
    };
}

export const webgl = init();
