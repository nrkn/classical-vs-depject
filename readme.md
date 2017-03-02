# Working with different DOM formats

So, you have *some* representation of a DOM, which could be the real DOM, or it
could be some virtual DOM format, or it could be JsonML format etc.:

**JsonML**
```JSON
["section",
  ["h1","Test"],
  ["p","Hello ",["strong","World!"]]
]
```

You need an API that lets you do stuff with your DOM regardless of what the
implementation is. Most of the API functionality you need is implementation
agnostic, the only thing that really differs is the shape of the nodes.

So you write an adapter for each implementation, that handles just the stuff
that's specific to the implementation:

**JsonML adapter**
```javascript
'use strict'

const isElement = node => Array.isArray( node )
const isText = node => typeof node === 'string'
const text = node => node
const children = node => isElement( node ) ? node.slice( 1 ) : []
const nodeName = node => isElement( node ) ? node[ 0 ] : '#text'

module.exports = { isElement, isText, text, children, nodeName }
```

Then, your API can take the adapter, and start adding its own stuff:

```javascript
const Dom = adapter => {
  const { isElement, isText, text, children, nodeName } = adapter

  const walk = ( node, cb ) =>
    cb( node ) ||
    children( node ).some( child =>
      walk( child, cb )
    )

  const find = ( node, predicate ) => {
    // find implementation here
  }

  // inefficent but always works if you have find and children
  const parent = ( root, node ) =>
    find( root, n => children( n ).includes( node ) )

  //... stringify etc.

  const api = { walk, find, parent, stringify }

  return Object.assign( api, adapter )
}
```

Because `Object.assign( api, adapter )` overwrites API functions if they're
duplicated in the adapter, the adapter can have more optimized versions of some
of these with the same function signature:

**DOM adapter**
```javascript
'use strict'

const isElement = node => !node.nodeName.startsWith( '#' )
const isText = node => node.nodeName === '#text'
const text = node => node.nodeValue
const children = node => 'childNodes' in node ? Array.from( node.childNodes ) : []
const nodeName = node => node.nodeName

// overrides API default functions with more efficient ones
const parent = ( root, node ) => node.parentNode
const stringify = node => isText( node ) ? text( node ) : node.outerHTML

module.exports = {
  isElement, isText, text, children, nodeName, parent, stringify
}
```

Then, once you have your API, you allow plugins to make it more useful:

**Find nodes that contain a text node containing the string 'Hello'**
```javascript
const helloParent = ( D, node ) => {
  const { isText, text, find, parent } = D

  const isHelloText = n =>
    isText( n ) && text( n ).includes( 'Hello' )

  const textNode = find( node, isHelloText )

  if( textNode )
    return parent( node, textNode )
}
```

The plugins get an instance of the API as their first arg, and when you
plug them in, that arg is curried and the curried fn is assigned to the API,
so the consumer just calls `T.helloParent( node )`:

```javascript
const Plugins = ( D, obj ) =>
  Object.keys( obj ).forEach( fname =>
    D[ fname ] = ( ...args ) => obj[ fname ]( D, ...args )
  )
```