(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

const isElement = node => !node.nodeName.startsWith( '#' )
const isText = node => node.nodeName === '#text'
const text = node => node.nodeValue
const children = node => 'childNodes' in node ? Array.from( node.childNodes ) : []
const nodeName = node => node.nodeName

// overrides Tree default functions with more efficient ones from the DOM
const parent = ( root, node ) => node.parentNode
const stringify = node => isText( node ) ? text( node ) : node.outerHTML

module.exports = {
  isElement, isText, text, children, nodeName, parent, stringify
}

},{}],2:[function(require,module,exports){
'use strict'

const Tree = require( './tree' )
const Plugins = require( './plugins' )
const adapter = require( './adapters/dom' )
const helloParent = require( './plugins/helloParent' )

const T = Tree( adapter )

Plugins( T, { helloParent } )

const section = document.querySelector( 'section' )
const pre = document.querySelector( 'pre' )
const hp = T.helloParent( section )

section.remove()
pre.textContent = T.stringify( hp )

},{"./adapters/dom":1,"./plugins":4,"./plugins/helloParent":3,"./tree":5}],3:[function(require,module,exports){
'use strict'

const helloParent = ( T, node ) => {
  const isHelloText = n =>
    T.isText( n ) && T.text( n ).includes( 'Hello' )

  const textNode = T.find( node, isHelloText )

  if( textNode )
    return T.parent( node, textNode )
}

module.exports = helloParent

},{}],4:[function(require,module,exports){
'use strict'

const Plugins = ( T, obj ) =>
  Object.keys( obj ).forEach( fname =>
    T[ fname ] = ( ...args ) => obj[ fname ]( T, ...args )
  )

module.exports = Plugins

},{}],5:[function(require,module,exports){
'use strict'

const Tree = adapter => {
  const { isElement, isText, text, children, nodeName } = adapter

  const walk = ( node, cb ) =>
    cb( node ) ||
    children( node ).some( child =>
      walk( child, cb )
    )

  const find = ( node, predicate ) => {
    let found

    walk( node, n => {
      if( predicate( n ) ){
        found = n

        return true
      }
    })

    return found
  }

  const parent = ( root, node ) =>
    find( root, n => children( n ).includes( node ) )

  const stringify = node => {
    if( isText( node ) )
      return text( node )

    const tag = nodeName( node )
    const innerHTML = children( node ).map( stringify ).join( '' )

    return `<${ tag }>${ innerHTML }</${ tag }>`
  }

  const tree = { walk, find, parent, stringify }

  return Object.assign( tree, adapter )
}

module.exports = Tree

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZGFwdGVycy9kb20uanMiLCJicm93c2VyLmpzIiwicGx1Z2lucy9oZWxsb1BhcmVudC5qcyIsInBsdWdpbnMvaW5kZXguanMiLCJ0cmVlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGlzRWxlbWVudCA9IG5vZGUgPT4gIW5vZGUubm9kZU5hbWUuc3RhcnRzV2l0aCggJyMnIClcbmNvbnN0IGlzVGV4dCA9IG5vZGUgPT4gbm9kZS5ub2RlTmFtZSA9PT0gJyN0ZXh0J1xuY29uc3QgdGV4dCA9IG5vZGUgPT4gbm9kZS5ub2RlVmFsdWVcbmNvbnN0IGNoaWxkcmVuID0gbm9kZSA9PiAnY2hpbGROb2RlcycgaW4gbm9kZSA/IEFycmF5LmZyb20oIG5vZGUuY2hpbGROb2RlcyApIDogW11cbmNvbnN0IG5vZGVOYW1lID0gbm9kZSA9PiBub2RlLm5vZGVOYW1lXG5cbi8vIG92ZXJyaWRlcyBUcmVlIGRlZmF1bHQgZnVuY3Rpb25zIHdpdGggbW9yZSBlZmZpY2llbnQgb25lcyBmcm9tIHRoZSBET01cbmNvbnN0IHBhcmVudCA9ICggcm9vdCwgbm9kZSApID0+IG5vZGUucGFyZW50Tm9kZVxuY29uc3Qgc3RyaW5naWZ5ID0gbm9kZSA9PiBpc1RleHQoIG5vZGUgKSA/IHRleHQoIG5vZGUgKSA6IG5vZGUub3V0ZXJIVE1MXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0VsZW1lbnQsIGlzVGV4dCwgdGV4dCwgY2hpbGRyZW4sIG5vZGVOYW1lLCBwYXJlbnQsIHN0cmluZ2lmeVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFRyZWUgPSByZXF1aXJlKCAnLi90cmVlJyApXG5jb25zdCBQbHVnaW5zID0gcmVxdWlyZSggJy4vcGx1Z2lucycgKVxuY29uc3QgYWRhcHRlciA9IHJlcXVpcmUoICcuL2FkYXB0ZXJzL2RvbScgKVxuY29uc3QgaGVsbG9QYXJlbnQgPSByZXF1aXJlKCAnLi9wbHVnaW5zL2hlbGxvUGFyZW50JyApXG5cbmNvbnN0IFQgPSBUcmVlKCBhZGFwdGVyIClcblxuUGx1Z2lucyggVCwgeyBoZWxsb1BhcmVudCB9IClcblxuY29uc3Qgc2VjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdzZWN0aW9uJyApXG5jb25zdCBwcmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAncHJlJyApXG5jb25zdCBocCA9IFQuaGVsbG9QYXJlbnQoIHNlY3Rpb24gKVxuXG5zZWN0aW9uLnJlbW92ZSgpXG5wcmUudGV4dENvbnRlbnQgPSBULnN0cmluZ2lmeSggaHAgKVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGhlbGxvUGFyZW50ID0gKCBULCBub2RlICkgPT4ge1xuICBjb25zdCBpc0hlbGxvVGV4dCA9IG4gPT5cbiAgICBULmlzVGV4dCggbiApICYmIFQudGV4dCggbiApLmluY2x1ZGVzKCAnSGVsbG8nIClcblxuICBjb25zdCB0ZXh0Tm9kZSA9IFQuZmluZCggbm9kZSwgaXNIZWxsb1RleHQgKVxuXG4gIGlmKCB0ZXh0Tm9kZSApXG4gICAgcmV0dXJuIFQucGFyZW50KCBub2RlLCB0ZXh0Tm9kZSApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGVsbG9QYXJlbnRcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBQbHVnaW5zID0gKCBULCBvYmogKSA9PlxuICBPYmplY3Qua2V5cyggb2JqICkuZm9yRWFjaCggZm5hbWUgPT5cbiAgICBUWyBmbmFtZSBdID0gKCAuLi5hcmdzICkgPT4gb2JqWyBmbmFtZSBdKCBULCAuLi5hcmdzIClcbiAgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpbnNcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBUcmVlID0gYWRhcHRlciA9PiB7XG4gIGNvbnN0IHsgaXNFbGVtZW50LCBpc1RleHQsIHRleHQsIGNoaWxkcmVuLCBub2RlTmFtZSB9ID0gYWRhcHRlclxuXG4gIGNvbnN0IHdhbGsgPSAoIG5vZGUsIGNiICkgPT5cbiAgICBjYiggbm9kZSApIHx8XG4gICAgY2hpbGRyZW4oIG5vZGUgKS5zb21lKCBjaGlsZCA9PlxuICAgICAgd2FsayggY2hpbGQsIGNiIClcbiAgICApXG5cbiAgY29uc3QgZmluZCA9ICggbm9kZSwgcHJlZGljYXRlICkgPT4ge1xuICAgIGxldCBmb3VuZFxuXG4gICAgd2Fsayggbm9kZSwgbiA9PiB7XG4gICAgICBpZiggcHJlZGljYXRlKCBuICkgKXtcbiAgICAgICAgZm91bmQgPSBuXG5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZvdW5kXG4gIH1cblxuICBjb25zdCBwYXJlbnQgPSAoIHJvb3QsIG5vZGUgKSA9PlxuICAgIGZpbmQoIHJvb3QsIG4gPT4gY2hpbGRyZW4oIG4gKS5pbmNsdWRlcyggbm9kZSApIClcblxuICBjb25zdCBzdHJpbmdpZnkgPSBub2RlID0+IHtcbiAgICBpZiggaXNUZXh0KCBub2RlICkgKVxuICAgICAgcmV0dXJuIHRleHQoIG5vZGUgKVxuXG4gICAgY29uc3QgdGFnID0gbm9kZU5hbWUoIG5vZGUgKVxuICAgIGNvbnN0IGlubmVySFRNTCA9IGNoaWxkcmVuKCBub2RlICkubWFwKCBzdHJpbmdpZnkgKS5qb2luKCAnJyApXG5cbiAgICByZXR1cm4gYDwkeyB0YWcgfT4keyBpbm5lckhUTUwgfTwvJHsgdGFnIH0+YFxuICB9XG5cbiAgY29uc3QgdHJlZSA9IHsgd2FsaywgZmluZCwgcGFyZW50LCBzdHJpbmdpZnkgfVxuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKCB0cmVlLCBhZGFwdGVyIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlXG4iXX0=
