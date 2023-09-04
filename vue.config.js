const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    // 阻止 webpack 的报错信息直接显示在页面上
    devServer: {
        client: {
            overlay: false,
        },
    },
})
