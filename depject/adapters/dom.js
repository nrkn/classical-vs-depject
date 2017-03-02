'use strict'

const isElement = node => !node.nodeName.startsWith( '#' )
const isText = node => node.nodeName === '#text'
const text = node => node.nodeValue
const children = node => 'childNodes' in node ? Array.from( node.childNodes ) : []
const nodeName = node => node.nodeName

// overrides default functions with more efficient ones from the DOM
const parent = ( root, node ) => node.parentNode
const stringify = ( api, node ) => api.isText( node ) ? api.text( node ) : node.outerHTML

module.exports = {
  isElement: {
    gives: 'isElement',
    create: () => isElement
  },
  isText: {
    gives: 'isText',
    create: () => isText
  },
  text: {
    gives: 'text',
    create: () => text
  },
  children: {
    gives: 'children',
    create: () => children
  },
  nodeName: {
    gives: 'nodeName',
    create: () => nodeName
  },
  parent: {
    gives: 'parent',
    create: () => parent
  },
  stringify: {
    gives: 'stringify',
    needs: { isText: 'first', text: 'first' },
    create: api => node => stringify( api, node )
  }
}
