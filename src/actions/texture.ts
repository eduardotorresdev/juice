import {textureTypes} from '../redux-types';

export const textureActions = {
    /**
     * setTexture
     * @param {string} name
     * @return {TextureAction}
     */
    setTexture(name: string) {
        return {
            type: textureTypes.SET_TEXTURE,
            name,
        };
    },
};
