'use strict'

const isElement = node => !node.nodeName.startsWith( '#' )
const isText = node => node.nodeName === '#text'
const text = node => node.nodeValue
const children = node => 'childNodes' in node ? Array.from( node.childNodes ) : []
const nodeName = node => node.nodeName

// overrides default functions with more efficient ones from the DOM
const parent = ( root, node ) => node.parentNode
const stringify = node => isText( node ) ? text( node ) : node.outerHTML

module.exports = {
  isElement, isText, text, children, nodeName, parent, stringify
}
