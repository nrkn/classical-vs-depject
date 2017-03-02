'use strict'

const isElement = ( api, node ) => !node.nodeName.startsWith( '#' )
const isText = ( api, node ) => node.nodeName === '#text'
const text = ( api, node ) => node.nodeValue
const children = ( api, node ) => 'childNodes' in node ? Array.from( node.childNodes ) : []
const nodeName = ( api, node ) => node.nodeName

// overrides default functions with more efficient ones from the DOM
const parent = ( api, root, node ) => node.parentNode
const stringify = ( api, node ) => api.isText( node ) ? api.text( node ) : node.outerHTML

module.exports = {
  isElement, isText, text, children, nodeName, parent, stringify
}
