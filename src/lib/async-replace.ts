/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {directive, NodePart} from '../lit-html.js';

// const previousIterables = new WeakMap<NodePart, AsyncIterable<any>>();

/**
 * Render items of an async iterable, replacing previous values.
 */
export const asyncReplace =
    <T>(value: AsyncIterable<T>, mapper?: (v: T, index?: number) => any) =>
        directive((part: NodePart) => {

          if (value === part._previousValue) {
            return;
          }

          // We nest a new part to keep track of previous item values separately
          // of the iterable as a value itself.
          const itemPart =
              new NodePart(part.instance, part.startNode, part.endNode);

          part.clear();
          part._previousValue = itemPart;

          (async () => {

            let i = 0;

            for await (let v of value) {
              // Check to make sure that value is the still the current value of
              // the part, and if not bail because a new value owns this part
              if (part._previousValue !== itemPart) {
                break;
              }

              // As a convenience, because functional-programming-style
              // transforms of iterables and async iterables requires a library,
              // we accept a mapper function. This is especially convenient for
              // rendering a template for each item.
              if (mapper !== undefined) {
                v = mapper(v, i++);
              }

              itemPart.setValue(v);
            }
          })();
        });
