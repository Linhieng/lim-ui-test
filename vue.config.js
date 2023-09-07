const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const isDemo = process.env.TYPE.trim() === 'demo'

module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack(config) {
        if (isDemo) {
            config.plugin('monaco').use(new MonacoWebpackPlugin())
        }
        config
            .plugin('circular')
            .use(new CircularDependencyPlugin({ exclude: /node_modules/ }))
    },
})
