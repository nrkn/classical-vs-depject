'use strict'

const Dom = require( './dom' )
const Plugins = require( './plugins' )
const jadapter = require( './adapters/jsonml' )
const oadapter = require( './adapters/objnode' )
const helloParent = require( './plugins/helloParent' )
const jsonml = require( './data/jsonml.json' )
const objnode = require( './data/objnode.json' )

const J = Dom( jadapter )
const O = Dom( oadapter )

Plugins( J, { helloParent } )
Plugins( O, { helloParent } )

const log = ( D, data, name ) => {
  console.log( `${ name }:` )
  const helloParent = D.helloParent( data )
  console.log( D.stringify( helloParent ) )
  console.log()
}

log( J, jsonml, 'jsonml' )
log( O, objnode, 'objnode' )
