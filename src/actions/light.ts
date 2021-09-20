import {lightTypes} from '../redux-types';

export const lightActions = {
    /**
     * setPosition
     * @param {LightState} props
     * @return {LightAction}
     */
    setPosition(props: { x?: number; y?: number; z?: number }) {
        return {
            type: lightTypes.SET_POSITION,
            ...props,
        };
    },
    /**
     * changeAmbientLight
     * @param {number} amount
     * @param {number[]} colors
     * @return {LightAction}
     */
    changeAmbientLight(amount: number, colors: number[]) {
        return {
            type: lightTypes.CHANGE_AMBIENT_LIGHT,
            ambient: {
                amount,
                colors,
            },
        };
    },
    /**
     * changeDiffuseLight
     * @param {number} amount
     * @param {number[]} colors
     * @return {LightAction}
     */
    changeDiffuseLight(amount: number, colors: number[]) {
        return {
            type: lightTypes.CHANGE_DIFFUSE_LIGHT,
            diffuse: {
                amount,
                colors,
            },
        };
    },
    /**
     * changeSpecularLight
     * @param {number} amount
     * @param {number[]} colors
     * @return {LightAction}
     */
    changeSpecularLight(amount: number, colors: number[]) {
        return {
            type: lightTypes.CHANGE_SPECULAR_LIGHT,
            specular: {
                amount,
                colors,
            },
        };
    },
};
