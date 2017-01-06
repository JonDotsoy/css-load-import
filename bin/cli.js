const fs = require('fs')
const asyncSeries = require('async/series')
const rearg = require('lodash/rearg')
const postcss = require('postcss')
const atImport = require('postcss-import')
const path = require('path')
const bind = require('lodash/bind')
const concat = require('lodash/concat')
const glob = require('glob')
const cssImport = require('..')

const argv = require('minimist')(process.argv.slice(2), {
  default: {
    out: "style.css",
    relative: process.cwd()
  },
  alias: {
    o: 'out',
    r: 'relative'
  }
})

const args = argv._

switch (args.shift()) {
  case 'i':
  case 'inspect':
    (function () {
      const nolfiles = args
      const files = concat(...nolfiles.map(e => glob.sync(e)))

      console.log(`/** CSSLoadImport: from ${files.length} files **/`)

      files.map(function (filePath) {
        return [
          filePath,
          cssImport.makeAImportableFile(
            cssImport.resolveImporter(
              cssImport.Importers(fs.readFileSync(filePath)),
              {
                from: path.dirname(filePath),
                cwd: path.resolve(argv.relative)
              }
            )
          )
        ]
      })
      .forEach(function ([path,f]) {
        console.log(`\n/** FROM FILE: ${path} **/\n`)
        console.log(f.source)
      })
    })()
    break

  case 'b':
  case 'build':
  case 'make':
    (function() {
      const nolfiles = args
      const files = concat(...nolfiles.map(e => glob.sync(e)))

      // console.log()

      const fOut = files.map(function (filePath) {
        return [
          filePath,
          cssImport.makeAImportableFile(
            cssImport.resolveImporter(
              cssImport.Importers(fs.readFileSync(filePath)),
              {
                from: path.dirname(filePath)
              }
            )
          )
        ]
      })
      .map(function ([path,f]) {
        f.source = `\n/** FROM FILE: ${path} **/\n${f.source}`

        return [path,f]
      })

      asyncSeries(fOut.map(function ([path, f]) {
        return function done (next) {
          postcss()
            .use(atImport())
            .process(f.source, {from: path})
            .then(function (ot) {
              next(null, ot.css)
            }, next)
        }
      }), function (err, results) {
        if (err) throw err

        const outfile = [`/** CSSLoadImport: from ${files.length} files **/`,...results].join('\n')

        const fileToMake = path.resolve(argv.out)

        fs.writeFileSync(fileToMake, outfile)

        console.log(`making file: ${fileToMake}`)
      })

    })()
    break
}
