export default {
    preset: '@lwc/jest-preset',
    moduleNameMapper: {
        '^lj/(.+)$': '<rootDir>/src/modules/lj/$1/$1',
        '^gsap$': '<rootDir>/jest-mocks/gsap.js'
    },
    globals: {
        'lwc-jest': {
            nativeShadow: true
        }
    },
    setupFilesAfterEnv: ['<rootDir>/jest-sa11y-setup.js'],
    testPathIgnorePatterns: ['/node_modules/', '/site/', '/__lwr_cache__/']
};
