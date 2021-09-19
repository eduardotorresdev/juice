import {LightState} from '../@types/redux';
import {lightTypes} from '../redux-types';

interface LightAction {
    type: string;
    x: number;
    y: number;
    z: number;
    ambient: {
        amount: number;
        color: [number, number, number]
    };
    diffuse: {
        amount: number;
        color: [number, number, number]
    };
    specular: {
        amount: number;
        color: [number, number, number]
    };
}

const initialState: LightState = {
    x: 0,
    y: 0,
    z: 0,
    ambient: {
        amount: 1,
        color: [1, 1, 1],
    },
    diffuse: {
        amount: 1,
        color: [1, 1, 1],
    },
    specular: {
        amount: 1,
        color: [1, 1, 1],
    },
};

const lightReducer = (state = initialState, action: LightAction) => {
    switch (action.type) {
    case lightTypes.CHANGE_POSITION:
        return {
            x: action.x,
            y: action.y,
            z: action.z,
        };
    case lightTypes.CHANGE_AMBIENT_LIGHT:
        return action.ambient;
    case lightTypes.CHANGE_DIFFUSE_LIGHT:
        return action.diffuse;
    case lightTypes.CHANGE_SPECULAR_LIGHT:
        return action.specular;
    default:
        return state;
    }
};

export default lightReducer;
