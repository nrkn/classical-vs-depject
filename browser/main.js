(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
'use strict'

const Dom = require( './dom' )
const Plugins = require( './plugins' )
const adapter = require( './adapters/dom' )
const helloParent = require( './plugins/helloParent' )

const D = Dom( adapter )

Plugins( D, { helloParent } )

const section = document.querySelector( 'section' )
const pre = document.querySelector( 'pre' )
const hp = D.helloParent( section )

section.remove()
pre.textContent = D.stringify( hp )

},{"./adapters/dom":1,"./dom":3,"./plugins":5,"./plugins/helloParent":4}],3:[function(require,module,exports){
'use strict'

const Dom = adapter => {
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

  const api = { walk, find, parent, stringify }

  return Object.assign( api, adapter )
}

module.exports = Dom

},{}],4:[function(require,module,exports){
'use strict'

const helloParent = ( D, node ) => {
  const { isText, text, find, parent } = D

  const isHelloText = n =>
    isText( n ) && text( n ).includes( 'Hello' )

  const textNode = find( node, isHelloText )

  if( textNode )
    return parent( node, textNode )
}

module.exports = helloParent

},{}],5:[function(require,module,exports){
'use strict'

const Plugins = ( D, obj ) =>
  Object.keys( obj ).forEach( fname =>
    D[ fname ] = ( ...args ) => obj[ fname ]( D, ...args )
  )

module.exports = Plugins

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZGFwdGVycy9kb20uanMiLCJicm93c2VyLmpzIiwiZG9tL2luZGV4LmpzIiwicGx1Z2lucy9oZWxsb1BhcmVudC5qcyIsInBsdWdpbnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBpc0VsZW1lbnQgPSBub2RlID0+ICFub2RlLm5vZGVOYW1lLnN0YXJ0c1dpdGgoICcjJyApXG5jb25zdCBpc1RleHQgPSBub2RlID0+IG5vZGUubm9kZU5hbWUgPT09ICcjdGV4dCdcbmNvbnN0IHRleHQgPSBub2RlID0+IG5vZGUubm9kZVZhbHVlXG5jb25zdCBjaGlsZHJlbiA9IG5vZGUgPT4gJ2NoaWxkTm9kZXMnIGluIG5vZGUgPyBBcnJheS5mcm9tKCBub2RlLmNoaWxkTm9kZXMgKSA6IFtdXG5jb25zdCBub2RlTmFtZSA9IG5vZGUgPT4gbm9kZS5ub2RlTmFtZVxuXG4vLyBvdmVycmlkZXMgZGVmYXVsdCBmdW5jdGlvbnMgd2l0aCBtb3JlIGVmZmljaWVudCBvbmVzIGZyb20gdGhlIERPTVxuY29uc3QgcGFyZW50ID0gKCByb290LCBub2RlICkgPT4gbm9kZS5wYXJlbnROb2RlXG5jb25zdCBzdHJpbmdpZnkgPSBub2RlID0+IGlzVGV4dCggbm9kZSApID8gdGV4dCggbm9kZSApIDogbm9kZS5vdXRlckhUTUxcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzRWxlbWVudCwgaXNUZXh0LCB0ZXh0LCBjaGlsZHJlbiwgbm9kZU5hbWUsIHBhcmVudCwgc3RyaW5naWZ5XG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgRG9tID0gcmVxdWlyZSggJy4vZG9tJyApXG5jb25zdCBQbHVnaW5zID0gcmVxdWlyZSggJy4vcGx1Z2lucycgKVxuY29uc3QgYWRhcHRlciA9IHJlcXVpcmUoICcuL2FkYXB0ZXJzL2RvbScgKVxuY29uc3QgaGVsbG9QYXJlbnQgPSByZXF1aXJlKCAnLi9wbHVnaW5zL2hlbGxvUGFyZW50JyApXG5cbmNvbnN0IEQgPSBEb20oIGFkYXB0ZXIgKVxuXG5QbHVnaW5zKCBELCB7IGhlbGxvUGFyZW50IH0gKVxuXG5jb25zdCBzZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ3NlY3Rpb24nIClcbmNvbnN0IHByZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdwcmUnIClcbmNvbnN0IGhwID0gRC5oZWxsb1BhcmVudCggc2VjdGlvbiApXG5cbnNlY3Rpb24ucmVtb3ZlKClcbnByZS50ZXh0Q29udGVudCA9IEQuc3RyaW5naWZ5KCBocCApXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgRG9tID0gYWRhcHRlciA9PiB7XG4gIGNvbnN0IHsgaXNFbGVtZW50LCBpc1RleHQsIHRleHQsIGNoaWxkcmVuLCBub2RlTmFtZSB9ID0gYWRhcHRlclxuXG4gIGNvbnN0IHdhbGsgPSAoIG5vZGUsIGNiICkgPT5cbiAgICBjYiggbm9kZSApIHx8XG4gICAgY2hpbGRyZW4oIG5vZGUgKS5zb21lKCBjaGlsZCA9PlxuICAgICAgd2FsayggY2hpbGQsIGNiIClcbiAgICApXG5cbiAgY29uc3QgZmluZCA9ICggbm9kZSwgcHJlZGljYXRlICkgPT4ge1xuICAgIGxldCBmb3VuZFxuXG4gICAgd2Fsayggbm9kZSwgbiA9PiB7XG4gICAgICBpZiggcHJlZGljYXRlKCBuICkgKXtcbiAgICAgICAgZm91bmQgPSBuXG5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZvdW5kXG4gIH1cblxuICBjb25zdCBwYXJlbnQgPSAoIHJvb3QsIG5vZGUgKSA9PlxuICAgIGZpbmQoIHJvb3QsIG4gPT4gY2hpbGRyZW4oIG4gKS5pbmNsdWRlcyggbm9kZSApIClcblxuICBjb25zdCBzdHJpbmdpZnkgPSBub2RlID0+IHtcbiAgICBpZiggaXNUZXh0KCBub2RlICkgKVxuICAgICAgcmV0dXJuIHRleHQoIG5vZGUgKVxuXG4gICAgY29uc3QgdGFnID0gbm9kZU5hbWUoIG5vZGUgKVxuICAgIGNvbnN0IGlubmVySFRNTCA9IGNoaWxkcmVuKCBub2RlICkubWFwKCBzdHJpbmdpZnkgKS5qb2luKCAnJyApXG5cbiAgICByZXR1cm4gYDwkeyB0YWcgfT4keyBpbm5lckhUTUwgfTwvJHsgdGFnIH0+YFxuICB9XG5cbiAgY29uc3QgYXBpID0geyB3YWxrLCBmaW5kLCBwYXJlbnQsIHN0cmluZ2lmeSB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIGFwaSwgYWRhcHRlciApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRG9tXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgaGVsbG9QYXJlbnQgPSAoIEQsIG5vZGUgKSA9PiB7XG4gIGNvbnN0IHsgaXNUZXh0LCB0ZXh0LCBmaW5kLCBwYXJlbnQgfSA9IERcblxuICBjb25zdCBpc0hlbGxvVGV4dCA9IG4gPT5cbiAgICBpc1RleHQoIG4gKSAmJiB0ZXh0KCBuICkuaW5jbHVkZXMoICdIZWxsbycgKVxuXG4gIGNvbnN0IHRleHROb2RlID0gZmluZCggbm9kZSwgaXNIZWxsb1RleHQgKVxuXG4gIGlmKCB0ZXh0Tm9kZSApXG4gICAgcmV0dXJuIHBhcmVudCggbm9kZSwgdGV4dE5vZGUgKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhlbGxvUGFyZW50XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgUGx1Z2lucyA9ICggRCwgb2JqICkgPT5cbiAgT2JqZWN0LmtleXMoIG9iaiApLmZvckVhY2goIGZuYW1lID0+XG4gICAgRFsgZm5hbWUgXSA9ICggLi4uYXJncyApID0+IG9ialsgZm5hbWUgXSggRCwgLi4uYXJncyApXG4gIClcblxubW9kdWxlLmV4cG9ydHMgPSBQbHVnaW5zXG4iXX0=
