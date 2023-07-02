/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  const res = {
    width,
    height,
  };
  res.getArea = function () {
    return this.width * this.height;
  };
  return res;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const res = JSON.parse(json);
  Object.setPrototypeOf(res, proto);
  return res;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */


class Builder {
  constructor(selector, value, selector1 = null, combinator = null, selector2 = null) {
    if (selector === 'combine') {
      this.selector1 = selector1;
      this.combinator = combinator;
      this.selector2 = selector2;
      this.combine();
    }
    if (selector === 'class' || selector === 'pseudoClass') {
      this['p'.concat(selector)] = [value];
    } else {
      this['p'.concat(selector)] = value;
    }
  }

  element(value) {
    this.temp = value;
    if (this.pelement) {
      throw new Error('/Element, id and pseudo-element should not occur more then one time inside the selector/');
    }

    if ((this.pid) || (this.pclass) || (this.pattr) || (this.ppseudoClass)
      || (this.ppseudoElement)) {
      throw new Error('/Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element/');
    }
  }

  id(value) {
    if (this.pid) {
      throw new Error('/Element, id and pseudo-element should not occur more then one time inside the selector/');
    }
    if ((this.pclass) || (this.pattr) || (this.ppseudoClass) || (this.ppseudoElement)) {
      throw new Error('/Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element/');
    }
    this.pid = value;
    return this;
  }

  class(value) {
    if ((this.pattr) || (this.ppseudoClass) || (this.ppseudoElement)) {
      throw new Error('/Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element/');
    }
    if (this.pclass) {
      this.pclass.push(value);
    } else {
      this.pclass = [value];
    }
    return this;
  }

  attr(value) {
    if ((this.ppseudoClass) || (this.ppseudoElement)) {
      throw new Error('/Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element/');
    }
    this.pattr = value;
    return this;
  }

  pseudoClass(value) {
    if (this.ppseudoElement) {
      throw new Error('/Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element/');
    }
    if (this.ppseudoClass) {
      this.ppseudoClass.push(value);
    } else {
      this.ppseudoClass = [value];
    }
    return this;
  }

  pseudoElement(value) {
    if (this.ppseudoElement) {
      throw new Error('/Element, id and pseudo-element should not occur more then one time inside the selector/');
    }
    this.ppseudoElement = value;
    return this;
  }

  // combine(selector1, combinator, selector2) {
  combine() {
    let comb = '';
    comb = `${this.selector1.stringify()} ${this.combinator} ${this.selector2.stringify()}`;
    // console.log('comb ', comb);
    this.comb = comb;
    return this;
  }

  stringify() {
    let res = '';

    if (this.comb) {
      return this.comb;
    }

    if (this.pelement) {
      res += this.pelement;
    }
    if (this.pid) {
      res += `#${this.pid}`;
    }
    if (this.pclass) {
      let name = this.pclass.map((item) => `.${item}`);
      name = name.join('');
      res += name;
    }
    if (this.pattr) {
      res += `[${this.pattr}]`;
    }
    if (this.ppseudoClass) {
      let name = this.ppseudoClass.map((item) => `:${item}`);
      name = name.join('');
      res += name;
    }
    if (this.ppseudoElement) {
      res += `::${this.ppseudoElement}`;
    }
    console.log('res ', res);
    return res;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new Builder('element', value);
  },

  id(value) {
    return new Builder('id', value);
  },

  class(value) {
    return new Builder('class', value);
  },

  attr(value) {
    return new Builder('attr', value);
  },

  pseudoClass(value) {
    return new Builder('pseudoClass', value);
  },

  pseudoElement(value) {
    return new Builder('pseudoElement', value);
  },

  combine(selector1, combinator, selector2) {
    return new Builder('combine', null, selector1, combinator, selector2);
    // throw new Error('Not implemented');
  },

};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
