import path from 'path';

export function getProdEnvConfigPathObj() {
    return { path: 'config/production.env' }
}

export function getProdStaticFilesPath() {
    return path.resolve('./dist/static');
}

export function getProdIndexFilePath() {
    return path.join(__dirname, '..', 'dist', 'index.html' )
}