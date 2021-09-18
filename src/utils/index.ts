export * from './canvas';
export * from './math';
export * from './img';

export const sleeper = (ms: number) => {
    return new Promise((resolve) => setTimeout(() => resolve(true), ms));
};

export const end = (startTime: Date) => {
    const endTime = new Date();
    let timeDiff = +endTime - +startTime;
    timeDiff /= 1000;

    return Math.round(timeDiff);
};
