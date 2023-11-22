const path = require('path')
const fs = require('fs')
const prettier = require('prettier')

const packagePath = path.resolve(__dirname, '../package.json')

const packageBckpPath = path.resolve(__dirname, '../package.backup.json')

if (fs.existsSync(packageBckpPath)) {
    throw new Error('Backup already exist.')
}

const pkg = fs.readFileSync(packagePath)

fs.writeFileSync(packageBckpPath, pkg)

const content = JSON.parse(pkg)

delete content.devDependencies

const serverDeps = [
    '@abandonware/noble',
    'axios',
    'body-parser',
    'buffer',
    'cors',
    'debug',
    'express',
    'http-proxy-middleware',
    'immer',
    'morgan',
    'serve-static',
    'ws',
    'zod',
]

for (const key of Object.keys(content.dependencies)) {
    if (!serverDeps.includes(key)) {
        delete content.dependencies[key]
    }
}

delete content.scripts

prettier.resolveConfig(__dirname).then((options) => {
    const json = prettier.format(JSON.stringify(content), { ...options, parser: 'json' })
    fs.writeFileSync(path.resolve(__dirname, '../package.json'), json)
})
