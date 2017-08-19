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

// Set Symbol.asyncIterator on browsers without it
if (typeof Symbol !== undefined && Symbol.asyncIterator === undefined) {
  Object.defineProperty(Symbol, 'asyncIterator', {value: Symbol()});
}

export class TestAsyncIterable<T> implements AsyncIterable<T> {
  /**
   * A Promise that resolves with the next value to be returned by the
   * async iterable returned from iterable()
   */
  private _nextValue: Promise<T> =
      new Promise((res, _) => this._resolveNextValue = res);
  private _resolveNextValue: (value: T) => void;

  async * [Symbol.asyncIterator]() {
    while (true) {
      yield await this._nextValue;
    }
  }

  async push(value: any): Promise<void> {
    const currentValue = this._nextValue;
    const currentResolveValue = this._resolveNextValue;
    this._nextValue =
        new Promise((ressolve, _) => this._resolveNextValue = ressolve);
    // Resolves the previous value of _nextValue (now currentValue in this
    // scope), making `yield await this._nextValue` go.
    currentResolveValue(value);
    // Waits for the value to be emitted
    await currentValue;
    // Need to wait for one more microtask for value to be rendered, but only
    // when devtools is closed. Waiting for rAF might be more reliable, but
    // this waits the minimum that seems reliable now.
    await Promise.resolve();
  }
}
