'use strict'

const walk = ( api, node, cb ) =>
  cb( node ) ||
  api.children( node ).some( child =>
    walk( api, child, cb )
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
  const innerHTML = children.map( child => stringify( api, child ) ).join( '' )

  return `<${ tag }>${ innerHTML }</${ tag }>`
}

module.exports = {
  walk: {
    gives: 'walk',
    needs: { children: 'first' },
    create: api => ( node, cb ) => walk( api, node, cb )
  },
  find: {
    gives: 'find',
    needs: { walk: 'first' },
    create: api => ( node, predicate ) => find( api, node, predicate )
  },
  parent: {
    gives: 'parent',
    needs: { find: 'first', children: 'first' },
    create: api => ( root, node ) => parent( api, root, node )
  },
  stringify: {
    gives: 'stringify',
    needs: { isText: 'first',  text: 'first', nodeName: 'first', children: 'first' },
    create: api => node => stringify( api, node )
  }
}
