import {LightState} from '../@types/redux';
import {lightTypes} from '../redux-types';

interface LightAction {
    type: string;
    x: number;
    y: number;
    z: number;
    ambient: {
        amount: number;
        colors: number[];
    };
    diffuse: {
        amount: number;
        colors: number[];
    };
    specular: {
        amount: number;
        colors: number[];
    };
}

const initialState: LightState = {
    x: 0,
    y: 0,
    z: 0,
    ambient: {
        amount: 2,
        colors: [1, 1, 1],
    },
    diffuse: {
        amount: 2,
        colors: [1, 1, 1],
    },
    specular: {
        amount: 2,
        colors: [1, 1, 1],
    },
};

const lightReducer = (state = initialState, action: LightAction) => {
    switch (action.type) {
    case lightTypes.SET_POSITION:
        // eslint-disable-next-line no-unused-vars
        const {type, ...newState} = action;

        return {
            ...state,
            ...newState,
        };
    case lightTypes.CHANGE_AMBIENT_LIGHT:
        return {
            ...state,
            ambient: {
                amount: action.ambient.amount / 5,
                colors: action.ambient.colors.map((color) => color / 7),
            },
        };
    case lightTypes.CHANGE_DIFFUSE_LIGHT:
        return {
            ...state,
            diffuse: {
                amount: action.diffuse.amount / 5,
                colors: action.diffuse.colors.map((color) => color / 7),
            },
        };
    case lightTypes.CHANGE_SPECULAR_LIGHT:
        return {
            ...state,
            specular: {
                amount: action.specular.amount / 5,
                colors: action.specular.colors.map((color) => color / 7),
            },
        };
    default:
        return state;
    }
};

export default lightReducer;
