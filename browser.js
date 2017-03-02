'use strict'

const dom = require( './src/api/dom' )
const ddom = require( './depject/api/dom' )

const section = document.querySelector( 'section' )
const pre = document.querySelector( 'pre' )

const log = ( api, data, name ) => {
  const helloParent = api.helloParent( data )

  pre.textContent += `${ name }:\n`
  pre.textContent += `${ api.stringify( helloParent ) }\n\n`
}

log( dom, section, 'dom' )
log( ddom, section, 'depject dom' )

section.remove()
