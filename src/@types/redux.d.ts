export type TextureState = {
    name: string;
};

export interface RotationState {
    x: number;
    y: number;
    z: number;
}
export interface CameraState extends RotationState {}

export interface LightState extends RotationState {
    ambient: {
        amount: number,
        colors: number[]
    },
    diffuse: {
        amount: number,
        colors: number[]
    },
    specular: {
        amount: number,
        colors: number[]
    },
}
