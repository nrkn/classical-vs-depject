'use strict'

const walk = ( api, node, cb ) =>
  cb( node ) ||
  api.children( node ).some( child =>
    api.walk( child, cb )
  )

const find = ( api, node, predicate ) => {
  let found

  api.walk( node, n => {
    if( predicate( n ) ){
      found = n

      return true
    }
  })

  return found
}

const parent = ( api, root, node ) =>
  api.find( root, n => api.children( n ).includes( node ) )

const stringify = ( api, node ) => {
  if( api.isText( node ) )
    return api.text( node )

  const tag = api.nodeName( node )
  const children = api.children( node )
  const innerHTML = children.map( api.stringify ).join( '' )

  return `<${ tag }>${ innerHTML }</${ tag }>`
}

module.exports = { walk, find, parent, stringify }
