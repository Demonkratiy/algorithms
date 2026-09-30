import base from './sandbox-worker.js?raw';
import scenario from './scenario-runtime.js?raw';

const marker = '/* SCENARIO_RUNTIME */';
if (!base.includes(marker)) throw new Error('В исходнике Worker отсутствует место для scenario runtime.');
export const workerSource = base.replace(marker, scenario);
