'use strict'

const Dom = adapter => {
  const { isElement, isText, text, children, nodeName } = adapter

  const walk = ( node, cb ) =>
    cb( node ) ||
    children( node ).some( child =>
      walk( child, cb )
    )

  const find = ( node, predicate ) => {
    let found

    walk( node, n => {
      if( predicate( n ) ){
        found = n

        return true
      }
    })

    return found
  }

  const parent = ( root, node ) =>
    find( root, n => children( n ).includes( node ) )

  const stringify = node => {
    if( isText( node ) )
      return text( node )

    const tag = nodeName( node )
    const innerHTML = children( node ).map( stringify ).join( '' )

    return `<${ tag }>${ innerHTML }</${ tag }>`
  }

  const api = { walk, find, parent, stringify }

  return Object.assign( api, adapter )
}

module.exports = Dom
