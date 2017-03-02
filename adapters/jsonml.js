'use strict'

const isElement = node => Array.isArray( node )
const isText = node => typeof node === 'string'
const text = node => node
const children = node => isElement( node ) ? node.slice( 1 ) : []
const nodeName = node => isElement( node ) ? node[ 0 ] : '#text'

module.exports = { isElement, isText, text, children, nodeName }
