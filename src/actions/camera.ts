import {cameraTypes} from '../redux-types';

export const cameraActions = {
    /**
     * setPosition
     * @param {CameraState} props
     * @return {CameraActionAction}
     */
    setPosition(props: { x?: number; y?: number; z?: number }) {
        return {
            type: cameraTypes.SET_POSITION,
            ...props,
        };
    },
};
