import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Chess Elo Hider',
    description: 'Hides information that may be putting you off while playing on chess.com',
    permissions: ['storage', 'scripting', 'tabs'],
    version: '1.0.0',
  },
});