'use strict'

const jsonml = require( './data/jsonml.json' )
const objnode = require( './data/objnode.json' )

const japi = require( './src/api/jsonml' )
const oapi = require( './src/api/objnode' )

const djapi = require( './depject/api/jsonml' )
const doapi = require( './depject/api/objnode' )

const log = ( api, data, name ) => {
  console.log( `${ name }:` )
  const helloParent = api.helloParent( data )
  console.log( api.stringify( helloParent ) )
  console.log()
}

log( japi, jsonml, 'jsonml' )
log( oapi, objnode, 'objnode' )
log( djapi, jsonml, 'depject jsonml' )
log( doapi, objnode, 'depject objnode' )
