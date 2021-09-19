import {CameraState} from '../@types/redux';
import {cameraTypes} from '../redux-types';

interface CameraAction {
    type: string;
    x: number;
    y: number;
    z: number;
}

const initialState: CameraState = {
    x: 0,
    y: 0,
    z: 0,
};

const cameraReducer = (state = initialState, action: CameraAction) => {
    switch (action.type) {
    case cameraTypes.SET_POSITION:
        // eslint-disable-next-line no-unused-vars
        const {type, ...newState} = action;

        return {
            ...state,
            ...newState,
        };
    default:
        return state;
    }
};

export default cameraReducer;
