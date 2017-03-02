'use strict'

const Plugins = ( D, obj ) =>
  Object.keys( obj ).forEach( fname =>
    D[ fname ] = ( ...args ) => obj[ fname ]( D, ...args )
  )

module.exports = Plugins
