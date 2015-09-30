/**** Imports ****/
import axios from 'axios';
import Immutable from 'immutable';
import Rx from 'rx-lite';


/**** Constants ****/
const _store = Immutable.Map();
const _asyncStreams = [];

const errors = {
  0: 'A key is required to add a model to the store',
  1: 'If a key is not provided, the data passed to the store must contain an\
      id parameter which can be used as a key'
};

/**** Helper Methods ****/

const _defaultMapFunction = (value) => value;

const buildUrl = (options) => {
    let queryString = '';
    let url = options.url;
    let params = options.query;
    if ( params ) {
        let buildQuery = (query, key) => [query, key, '=', options[key],'&'].join('');
        queryString = Object.keys(params).reduce(buildQuery, '?').slice(0,-1);
    }
    return url + queryString;
};

const buildAsyncRequest = (options) => {
  let method = options.method || 'get';
  let url = options.query ? buildUrl(options) : options.url;
  let params = [url];
  !!options.data && params.push(options.data);
  return axios[method].apply(null, params);
};

const buildAsyncStream = (options) => {
  let request = buildRequest(options);
  return Rx.Observable.fromPromise(request)
};

/**** Store Constructor ****/
class Store {

  constructor(name) {
    this.name = name || '';
    this._store = ImmutableMap();
  }

  _add (key, data) {
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

  _update (key, data) {
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

  // This is where a key or id must be defined
  defineStream (options) {
    let subject = new Rx.Subject();
    let asyncStream = buildAsyncStream(options);
    let mapFn = options.map || _defaultMapFunction;
    let stream = subject
      .flatMap( data => asyncStream )
      .map( mapFn );

    return subject;
  }

  fly (map) {
    map = map || _defaultMapFunction;
    let metaStream = Rx.Observable.merge.apply(null, _asyncStreams);
    metaStream.subscribe( data => this.update(data) );
  }
}



/* Create an async stream
 * param {Object}
 *   {String} url
 *   {String} ~method
 *   {Object} ~query
 *   {Object} ~data
 *   {Function} ~map
 */
 // This should return a subject that can be used to
let defineStream = (options) => {

  let subject = new Rx.Subject();
  let asyncStream = buildAsyncStream(options);
  let mapFn = options.map || _defaultMapFunction;
  let stream = subject
    .flatMap( data => asyncStream )
    .map( mapFn );

  return subject;
}

let metaStream = Rx.Observable.merge.apply(null, _asyncStreams)
  .map( _defaultMapFunction );

metaStream.subscribe( data => _updateStore(data) );

// const projectMetaStream = Rx.Observable.merge(_requestStream, _likeStream)
//   .tap( console.log('OXOXOXO', this))
//   .map( response => new Project(response.data) )

export default {
  Store: Store,
  defineStream: defineStream
}
