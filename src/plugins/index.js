'use strict'

const Plugins = ( api, obj ) =>
  Object.keys( obj ).forEach( fname =>
    api[ fname ] = ( ...args ) => obj[ fname ]( api, ...args )
  )

module.exports = Plugins
