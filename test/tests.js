const fs = require('fs')
const postcss = require('postcss')
const atImport = require('postcss-import')
const path = require('path')
const {Importers, makeAImportableFile, resolveImporter} = require('..')

// const myBufferFile = fs.readFileSync(__dirname + '/examples/myComponent.js')

// const importers = Importers(myBufferFile)

// const SourceFileImporter = makeAImportableFile(importers, {
//   cwd: __dirname + '/examples',
//   baseDir: __dirname + '/examples/myComponent.js'
// })

console.log('------------------------------------')

describe('Importers', () => {

  describe('a', () => {
    const filePath = path.resolve( __dirname + '/./examples/singleImport.js')

    const e = makeAImportableFile(resolveImporter(Importers(fs.readFileSync(filePath)), {from: path.dirname(filePath)}))

    console.log(e.source)

    postcss()
      .use(atImport())
      .process(e.source, {from: './test/examples/style.css'})
      .then(function (out) {
        console.log(out.css)
      })

    it('')

  })

})
