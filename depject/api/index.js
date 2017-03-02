'use strict'

const combine = require( 'depject' )
const common = require( './common' )

const Api = ( adapter, ...plugins ) => {
  const sockets = combine( [ adapter, common, ...plugins ] )

  const api = Object.keys( sockets ).reduce( ( api, key ) => {
    api[ key ] = sockets[ key ][ 0 ]

    return api
  }, {})

  return api
}

module.exports = Api
