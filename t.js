const trim = require('lodash/trim')

const e = `

/* css: my file.js */

`

const [,l] = /\/\*([\s\S]*)\*\//.exec(e)

console.log(trim(l,"* \n\r\n"))

