'use strict'

const combine = require( 'depject' )
const common = require( './common' )

const socketsToApi = sockets =>
  Object.keys( sockets ).reduce( ( api, key ) => {
    api[ key ] = sockets[ key ][ 0 ]

    return api
  }, {})

const Api = ( adapter, ...plugins ) =>
  socketsToApi( combine( [ ...plugins, common, adapter ] ) )

module.exports = Api
