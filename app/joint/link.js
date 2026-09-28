import { dia } from '@joint/core';

 const link = dia.Link.define('link', {
  attrs: {
      line: {
          connection: true,
          stroke: '#333333',
          strokeWidth: 1,
          strokeLinejoin: 'round',
          'pointer-events': 'none'
      },
      wrapper: {
          connection: true,
          stroke: 'transparent',
          'stroke-width': 10,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
      }
  }
}, {
  markup: [{
      tagName: 'path',
      selector: 'wrapper',
      attributes: {
          'fill': 'none',
          'cursor': 'pointer',
          'stroke': 'transparent',
          'stroke-linejoin': 'round'
      }
  }, {
      tagName: 'path',
      selector: 'line',
      attributes: {
          'fill': 'none',
          'pointer-events': 'none'
      }
  }]
});


export default link;

