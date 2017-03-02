# My classical approach vs `depject`

This compares my classical approach for dependencies, adapters, plugins etc. to
using [depject](https://github.com/depject/depject)

The example is a theoretical API for working with DOM-type data regardless of
the underlying implementation, so you can use the same API to do common DOM
traversal, manipulation etc. regardless of whether you're using a DOM
represented in some data format like [JsonML](http://www.jsonml.org/), real DOM
nodes in the browser, virtual DOM nodes provided by some library etc.

The core code for the classical approach is under [`/src`](/src) and using
`depject` under [`/depject`](/depject).

You can run the example on the server with `node index`, or in the browser by
running `npm run build` and then navigating to
[`/browser/index.html`](/browser/index.html)

**Note**: the example code makes a lot of assumptions to make the code simpler,
omits optimisations etc. and doesn't do much that's useful, a normal DOM API
would have a lot more useful things in it ala [`jQuery`](https://jquery.com/)

## Example used: working with different DOM formats

So, you have *some* representation of a DOM, which could be the real DOM, or it
could be some virtual DOM format, or it could be `JsonML` format etc.:

**JsonML**
```JSON
["section",
  ["h1","Test"],
  ["p","Hello ",["strong","World!"]]
]
```

You now need an API that lets you do stuff with your DOM regardless of what the
implementation is.

Typical API examples are `walk`, `find` etc. which are all built on the
functions provided by the adapter, eg to walk you only need to be able to get
an array of child nodes, to `find` you just need `walk` etc. To see how many
useful traversal/manipulation functions there are, one need only look at the
jQuery API.

## My classical approach

You write an adapter for each DOM node implementation, that handles just the
stuff that's specific to the implementation:

**JsonML adapter**
```javascript
const isElement = ( api, node ) => Array.isArray( node )
const isText = ( api, node ) => typeof node === 'string'
const text = ( api, node ) => node
const children = ( api, node ) => api.isElement( node ) ? node.slice( 1 ) : []
const nodeName = ( api, node ) => api.isElement( node ) ? node[ 0 ] : '#text'

module.exports = { isElement, isText, text, children, nodeName }
```

You write each function for the adapter as a "plugin" - that is, a function
whose first argument is the API - later, when you have all your API functions,
you remove this argument by wrapping it via partical application so that the
consumer of the API doesn't have to manually pass in the API for every function:

```javascript
// plugin function:
const foo = ( api, node ) => api.bar( node ) + 'foo'

// called on the final API:
api.foo( node )
```

Then you have your common API functions, that build on the adapter:

```javascript
const walk = ( api, node, cb ) =>
  cb( node ) ||
  api.children( node ).some( child =>
    api.walk( child, cb )
  )

const find = ( api, node, predicate ) => {
  //...
}

const parent = ( api, root, node ) =>
  api.find( root, n => api.children( n ).includes( node ) )

const stringify = ( api, node ) => {
  //...
}

module.exports = { walk, find, parent, stringify }
```

And then, you can build specialized plugins to extend the core functionality,
which you just use when you need them, so they don't pollute the core common
code. This example plugin finds nodes that contain a text node containing the
string "Hello":

```javascript
const helloParent = ( api, node ) => {
  const { isText, text, find, parent } = api

  const isHelloText = n =>
    isText( n ) && text( n ).includes( 'Hello' )

  const textNode = find( node, isHelloText )

  if( textNode )
    return parent( node, textNode )
}
```

Finally, for convenience you have an API factory that takes your adapter and
any specialized plugins and generates the API:

```javascript
const common = require( './common' )
const Plugins = require( '../plugins' )

const Api = ( adapter, plugins = {} ) => {
  const api = {}

  Plugins( api, common )
  Plugins( api, adapter )
  Plugins( api, plugins )

  return api
}
```

This factory is what we would ship, and allows other consumers of the code to
write their own adapters for different DOM formats and to add arbitrary plugins
eg. that they've found on NPM, written themselves etc.

## Optimizing common API functions in adapters

The adapters can have more optimized versions of the common functions, and
because of the plugin order they'll override the common version:

**DOM adapter**
```javascript
// ... normal required adapter functions go here

/*
  override API common functions with more efficient versions provided by
  implementation
*/
const parent = ( root, node ) => node.parentNode
const stringify = node => isText( node ) ? text( node ) : node.outerHTML

module.exports = {
  isElement, isText, text, children, nodeName, parent, stringify
}
```

The function that handles partial application of the api argument is fairly
straightforward though somewhat esoteric at first glance:

```javascript
const Plugins = ( api, obj ) =>
  Object.keys( obj ).forEach( fname =>
    api[ fname ] = ( ...args ) => obj[ fname ]( api, ...args )
  )
```

## Differences when implementing with depject

Every plugin function is described as a `depject` module instead of being a raw
function expecting `api` as its first argument.

`depject` module functions with dependencies still take an `api` argument, but
instead of automatically brute forcing every consumer facing function in the
`api` with the `Plugins` function described above, you curry it in with the `create`
property on the module, making it slightly more manual in a sense.

The `api` argument provided by `depject` has been resolved for you according to
the `needs` property of the module rather than just being a bag of every
function in the api.

### Pros

- `depject` enforces that all of your requirements are met rather than relying
  on the developer to pass the right things in and in the right order
- If you know how `depject` works, you can explicitly see the dependencies of
  each function at a glance, rather than them being implicitly assumed to be in
  the general `api` bag of functions - and even if you don't know how `depject`
  works, the module definitions are reasonably intuitive when looking at good
  examples.
- Provides a standard implementation for dependencies, the classical approach I
  normally use is more of a pattern than an implementation
- Makes more sense to anyone already familiar with `depject`

### Cons

- People writing adapters, plugins etc. have to familiarise themselves with
  `depject`, it *might* be easier for them to understand the classical approach?
- More verbose, though this is just due to making the dependencies explicit -
  meaning the explicit/implicit nature shows up in both the pros and cons!
- I can't figure out how once you've called `combine` you can then plug more
  modules into your `sockets` object post the fact - this is probably not so
  much a con as a lack of comprehension on my part!
- Again, this is possibly due to a misunderstanding on my part, and it's easy to
  work around, but the `sockets` that are returned by `combine` aren't an API in
  themselves out of the box, but an object mapping their names to arrays, so to
  get an API we end up doing something like this:

```javascript
const api = Object.keys( sockets ).reduce( ( api, key ) => {
  api[ key ] = sockets[ key ][ 0 ]

  return api
}, {})
  ```
  
## Conclusion
  
I really like `depject` and will probably use it in future over my former approach, I like the explicitness it creates. It's a shame that I have so much existing code using the former approach though :/
