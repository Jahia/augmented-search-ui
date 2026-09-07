import {defineConfig} from 'vite';
import jahia from '@jahia/vite-plugin';
import {spawnSync} from 'node:child_process';

// Workaround for styled-components, object-inspect and deep-equal
const resolveServerBundleForGraalVM = {
    name: 'augmented-search-ui:graalvm-is-not-node',
    configEnvironment(name) {
        if (name === 'ssr') {
            return {
                resolve: {
                    conditions: ['module', 'browser', 'development|production'],
                    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main']
                }
            };
        }
    }
};

export default defineConfig({
    plugins: [
        jahia({
            // Called on every successful build in watch mode: repackage and redeploy.
            watchCallback() {
                spawnSync('yarn', ['watch:callback'], {stdio: 'inherit', shell: true});
            }
        }),
        resolveServerBundleForGraalVM
    ]
});
