export * from './canvas';
export * from './math';
export * from './img';
export * from './m4';
export * from './webgl';

export const sleeper = (ms: number) => {
    return new Promise((resolve) => setTimeout(() => resolve(true), ms));
};

export const end = (startTime: Date) => {
    const endTime = new Date();
    let timeDiff = +endTime - +startTime;
    timeDiff /= 1000;

    return Math.round(timeDiff);
};

export const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
});
