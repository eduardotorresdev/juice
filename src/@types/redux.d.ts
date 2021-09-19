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
