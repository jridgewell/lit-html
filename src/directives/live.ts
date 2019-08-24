/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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

import {directive, Part, PropertyPart} from '../lit-html.js';


/**
 */
export const classMap = directive((value: unknown) => (part: Part) => {
  if (!(part instanceof PropertyPart)) {
    throw new Error(
        'The `classMap` directive must be used in the `class` attribute ' +
        'and must be the only part in the attribute.');
  }

  const {committer} = part;
  const {element, name} = committer;

  part.value = value;
  const v = committer.getValue();

  // tslint:disable-next-line:no-any
  const liveValue = (element as any)[name];

  if (v !== liveValue) {
    part.setValue(v);
  }
});
