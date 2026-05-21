import {buildApp} from './app.js';
import {loadServerConfig} from './config.js';

const config = loadServerConfig();
const app = await buildApp(config);

await app.listen({port: config.port, host: '0.0.0.0'});
console.log(`Query Dungeon server listening on http://localhost:${config.port}`);
