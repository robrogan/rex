const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// supabase/functions/* are Deno edge functions — linted/checked by Deno, not the Expo toolchain.
module.exports = defineConfig([expoConfig, { ignores: ['dist/*', 'supabase/functions/**'] }]);
