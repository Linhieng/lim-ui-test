const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack(config) {
        config.plugin('monaco').use(new MonacoWebpackPlugin())
        config
            .plugin('circular')
            .use(new CircularDependencyPlugin({ exclude: /node_modules/ }))
    },
})
