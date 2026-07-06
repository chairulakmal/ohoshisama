import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig({ extends: ['recommended'] }),
  eslintConfigPrettier,
]
