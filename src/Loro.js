import axios from 'axios';
import Immutable from 'immutable';
import Rx from 'rx-lite';

const errors = {
  0: 'A key is required to add a model to the store',
  1: 'If a key is not provided, the data passed to the store must contain an\
      id parameter which can be used as a key'
}

let _store = Immutable.Map();

class Store {

  constructor(name) {
    this.name = name || '';
  }

  add (key, data) {
    if ( arguments.length === 0 ) { throw errors[0] }
    if ( arguments.length === 1 ) {
      key = data.id;
      if ( !key ) { throw errors[1] }
    }
    if ( _store.has(key) ) {
      if ( data ) {
        return this.updateStore(key, data)
      } else {
        return _store.set(key, new Rx.BehaviorSubject(Immutable.Map(data)))
      }
    }
  }

  update (key, data) {
    if ( arguments.length === 0 ) { throw errors[0] }
    if ( arguments.length === 1 ) {
      key = data.id;
      if ( !key ) { throw errors[1] }
    }
    if ( _store.has(key) ) {
      if ( !key || !data ) { throw 'An id and data object are required to update a store'; }
      let updatedModel = _store.get(key).value.merge(data);
      _store.get(key).onNext(updatedModel);
    } else {
      _store.set(key, new Rx.BehaviorSubject(Immutable.Map(data)));
    }
  }
}

export default {
  Store: Store
}
