'use strict'

const helloParent = ( api, node ) => {
  const { isText, text, find, parent } = api

  const isHelloText = n =>
    isText( n ) && text( n ).includes( 'Hello' )

  const textNode = find( node, isHelloText )

  if( textNode )
    return parent( node, textNode )
}

module.exports = {
  gives: 'helloParent',
  needs: { isText: 'first', text: 'first', find: 'first', parent: 'first' },
  create: api => node => helloParent( api, node )
}
