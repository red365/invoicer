const path = require('path');

interface DotEnvConfig {
    path: string;
}

export const getProdEnvConfigPathObj = (): DotEnvConfig => {
    return { path: 'config/production.env' }
}

export const getProdStaticFilesPath = (): string => {
    return path.resolve('./dist/static');
}

export const getProdIndexFilePath = (): string => {
    return path.join(__dirname, '..', 'dist', 'index.html')
}