import {TextureState} from '../@types/redux';
import {textureTypes} from '../redux-types';

interface TextureAction {
    type: string;
    name: string;
}

const initialState: TextureState = {
    name: 'metal',
};

const textureReducer = (state = initialState, action: TextureAction) => {
    switch (action.type) {
    case textureTypes.SET_TEXTURE:
        return {
            name: action.name,
        };
    default:
        return state;
    }
};

export default textureReducer;
