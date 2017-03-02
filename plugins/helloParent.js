'use strict'

const helloParent = ( D, node ) => {
  const { isText, text, find, parent } = D

  const isHelloText = n =>
    isText( n ) && text( n ).includes( 'Hello' )

  const textNode = find( node, isHelloText )

  if( textNode )
    return parent( node, textNode )
}

module.exports = helloParent
