'use strict'

const isElement = node => !node.value.nodeName.startsWith( '#' )
const isText = node => node.value.nodeName === '#text'
const text = node => node.value.nodeValue
const children = node => node.children
const nodeName = node => node.value.nodeName

module.exports = { isElement, isText, text, children, nodeName }
