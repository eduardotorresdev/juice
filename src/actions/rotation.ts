import {rotationTypes} from '../redux-types';

export const rotationActions = {
    /**
     * setRotation
     * @param {RotationState} props
     * @return {RotationAction}
     */
    setRotation(props: { x?: number; y?: number; z?: number }) {
        return {
            type: rotationTypes.SET_ROTATION,
            ...props,
        };
    },
};
