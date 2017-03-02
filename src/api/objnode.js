'use strict'

const Api = require( './' )
const adapter = require( '../adapters/objnode' )
const helloParent = require( '../plugins/helloParent' )

module.exports = Api( adapter, { helloParent } )
