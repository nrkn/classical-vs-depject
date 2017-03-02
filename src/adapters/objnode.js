'use strict'

const isElement = ( api, node ) => !node.value.nodeName.startsWith( '#' )
const isText = ( api, node ) => node.value.nodeName === '#text'
const text = ( api, node ) => node.value.nodeValue
const children = ( api, node ) => node.children
const nodeName = ( api, node ) => node.value.nodeName

module.exports = { isElement, isText, text, children, nodeName }
