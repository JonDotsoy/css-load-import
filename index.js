const {transform} = require('babel-core')
const path = require('path')
const trim = require('lodash/trim')
const isNull = require('lodash/isNull')
const isString = require('lodash/isString')

const REGEXPFINDCOMMENTS = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*)/g

const REGEXPFINDSTYLESHEET = /^((css|style)(sheet|file|import|require|load)?)\s*(:|=)\s*(["|'](\S+)["|']|(\S+))$/im
const REGEXPFINDSTYLESINLINE = /^((css|style)(sheet)?)\s+([\s\S]+)$/g

/*
hola
*/

function inspectorStylesheetFromChunk (chunkArg) {
  const chunk = trim(chunkArg)

  let resultReg

  if (!isNull(resultReg = REGEXPFINDSTYLESHEET.exec(chunk))) {
    const type = 'stylesheet'
    const [,,,,, _fileNoEspecific, _fileEspecific] = resultReg

    const value = _fileEspecific || _fileNoEspecific

    return {
      type,
      value
    }
  } else if (!isNull(resultReg = REGEXPFINDSTYLESINLINE.exec(chunk))) {
    const [,,,, preValue] = resultReg

    const value = trim(preValue, '*')

    return {
      type: 'styles',
      value
    }
  }

  return null
}

function * Importers (buffer) {
  const b = transform(buffer, {})

  for (var i = 0; i < b.ast.tokens.length; i++) {
    if (b.ast.tokens[i].type !== 'CommentBlock') {
      break
    }
    const inspector = inspectorStylesheetFromChunk(b.ast.tokens[i].value)
    if (!isNull(inspector)) yield inspector
  }
}

function makeAImportableFile (importers) {
  const linesSource = [...importers].filter(c => isString(c.css)).map(chunkCode => chunkCode.css)

  const source = linesSource.join('\n')

  return {linesSource, source}
}

function * resolveImporter (importer, {from, fromFile: fromFileArg, cwd: cwdArg, baseDir: baseDirArg} = {}) {
  const cwd = cwdArg || process.cwd()

  const arrImporter = [...importer]

  yield * arrImporter.filter(e => e.type === 'stylesheet').map(function (imprt) {
    const {type, value} = imprt

    const preBaseDir = path.resolve(from + '/' + value)

    const baseDir = path.relative(cwd, preBaseDir)

    const css = `@import "${baseDir}";`

    return {type, value, baseDir, from, css}
  })

  yield * arrImporter.filter(e => e.type === 'styles').map(function (imprt) {
    const {type, value} = imprt

    const css = value

    return {type, value, from, css}
  })
}

function * getCommentsFromString (stringArg) {
  let currentInspect = REGEXPFINDCOMMENTS.exec(stringArg)

  if (currentInspect !== null) {
    yield currentInspect
    const newChunk = currentInspect.input.slice(currentInspect.index + currentInspect[0].length)
    yield * getCommentsFromString(newChunk)
  }
}

exports = module.exports
exports.Importers = Importers
exports.makeAImportableFile = makeAImportableFile
exports.resolveImporter = resolveImporter
exports.REGEXPFINDCOMMENTS = REGEXPFINDCOMMENTS
exports.getCommentsFromString = getCommentsFromString
