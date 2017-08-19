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

/**
 * Render items of an async iterable, appending new values to previous values.
 */
export const asyncAppend =
    <T>(value: AsyncIterable<T>, mapper?: (v: T, index?: number) => any) =>
        directive((part: NodePart) => {
          if (value === part._previousValue) {
            return;
          }
          part.clear();
          part._previousValue = value;

          (async () => {

            // We keep track of item parts across iterations, so that we can
            // share marker nodes between adjacent parts.
            let itemPart;
            let i = 0;

            for await (let v of value) {
              // Check to make sure that value is the still the current value of
              // the part, and if not bail because a new value owns this part
              if (part._previousValue !== value) {
                break;
              }

              // As a convenience, because functional-programming-style
              // transforms of iterables and async iterables requires a library,
              // we accept a mapper function. This is especially convenient for
              // rendering a template for each item.
              if (mapper !== undefined) {
                v = mapper(v, i++);
              }

              // Like iterables, each item induces a part, so we need to keep
              // track of start and end nodes. Because these parts are not
              // updatable like an iterable, it may be possible to optimize away
              // the parts and just re-use the setValue() logic.
              let itemStart = part.startNode;
              if (itemPart !== undefined) {
                itemStart = new Text();
                // Set up the previous item's endNode to the new part's
                // startNode
                itemPart.endNode = itemStart;
                part.endNode.parentNode!.insertBefore(itemStart, part.endNode);
              }
              itemPart = new NodePart(part.instance, itemStart, part.endNode);
              itemPart.setValue(v);
            }
          })();
        });
