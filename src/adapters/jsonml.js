'use strict'

const isElement = ( api, node ) => Array.isArray( node )
const isText = ( api, node ) => typeof node === 'string'
const text = ( api, node ) => node
const children = ( api, node ) => api.isElement( node ) ? node.slice( 1 ) : []
const nodeName = ( api, node ) => api.isElement( node ) ? node[ 0 ] : '#text'

module.exports = { isElement, isText, text, children, nodeName }
