// Minimal GSAP stand-in for Jest: records calls, animates nothing.
const timeline = () => {
    const tl = {
        fromTo: jest.fn(() => tl),
        to: jest.fn(() => tl),
        progress: jest.fn(() => tl),
        kill: jest.fn()
    };
    return tl;
};

export const gsap = {
    set: jest.fn(),
    timeline: jest.fn(timeline)
};

export default gsap;
