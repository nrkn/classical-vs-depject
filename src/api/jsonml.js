'use strict'

const Api = require( './' )
const adapter = require( '../adapters/jsonml' )
const helloParent = require( '../plugins/helloParent' )

module.exports = Api( adapter, { helloParent } )
