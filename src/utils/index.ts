export * from './canvas';
export * from './math';
export * from './img';

export const sleeper = (ms: number) => {
    return new Promise((resolve) => setTimeout(() => resolve(true), ms));
};
