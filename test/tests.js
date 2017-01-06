const fs = require('fs')
const postcss = require('postcss')
const atImport = require('postcss-import')
const path = require('path')
const {Importers, makeAImportableFile, resolveImporter, REGEXPFINDCOMMENTS, descompose, getCommentsFromString} = require('..')


let falseScript1 = `
/*   Comment 1  */
/*   Comment 2   */
/**  Comment 3    */
/*   Comment 4  */

/**
 *Comment 5
 */
`


describe('get comment from strings', () => {

  it('falseScript1', () => {

    const e = getCommentsFromString(falseScript1)
    console.log([...e])

  })

})


describe('Importers', () => {

  describe('a', () => {
    // const filePath = path.resolve( __dirname + '/./examples/singleImport.js')

    // const e = makeAImportableFile(resolveImporter(Importers(fs.readFileSync(filePath)), {from: path.dirname(filePath)}))

    // console.log(e.source)

    // postcss()
    //   .use(atImport())
    //   .process(e.source, {from: './test/examples/style.css'})
    //   .then(function (out) {
    //     // console.log(out.css)
    //   })

    it('')

  })

})
