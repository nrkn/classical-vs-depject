'use strict'

const isElement = node => Array.isArray( node )
const isText = node => typeof node === 'string'
const text = node => node
const children = ( api, node ) => api.isElement( node ) ? node.slice( 1 ) : []
const nodeName = ( api, node ) => api.isElement( node ) ? node[ 0 ] : '#text'

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
    needs: { isElement: 'first' },
    create: api => node => children( api, node )
  },
  nodeName: {
    gives: 'nodeName',
    needs: { isElement: 'first' },
    create: api => node => nodeName( api, node )
  }
}
