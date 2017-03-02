'use strict'

const common = require( './common' )
const Plugins = require( '../plugins' )

const Api = ( adapter, plugins = {} ) => {
  const api = {}

  Plugins( api, common )
  Plugins( api, adapter )
  Plugins( api, plugins )

  return api
}

module.exports = Api
