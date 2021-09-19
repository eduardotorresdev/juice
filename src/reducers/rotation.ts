import {RotationState} from '../@types/redux';
import {rotationTypes} from '../redux-types';

interface RotationAction {
    type: string;
    x?: number;
    y?: number;
    z?: number;
}

const initialState: RotationState = {
    x: 0,
    y: 0,
    z: 0,
};

const rotationReducer = (state = initialState, action: RotationAction) => {
    switch (action.type) {
    case rotationTypes.SET_ROTATION:
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

export default rotationReducer;
