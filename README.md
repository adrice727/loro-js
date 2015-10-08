# loro-js

A JavaScript library for building stream-based data stores with RxJS and Immutable.js.

*This is intended to provide a layer of abstraction for RxJS and Immutable.js, and is still very much a work in progress.  It may not be possible to abstract away the complexity of RxJS while still providing something of any real value for anything but the most basic of models. Loro isn't yet functional and the below documentation is being used soley to help determine a path forward.*


### Import Loro

```
import Loro from 'loro';

```
###Create a Loro Store

```
let myStore = new Loro.Store();
```

### Define streams to update the store . . .
```
let requestStreamOptions = {
	url: apiEndpoint,
	key: myKey
}

let updateStreamOptions = {
	url: apiEndpoint,
	method: 'POST',
	key: myKey
}

let request = myStore.defineStream(requestStreamOptions);
let update = myStore.defineStream(updateStreamOptions);

```

### and when you're done . . .
```
myStore.fly();
```

### Subscribe to models in UI components
```
myStore.get(key).subscribe(data => updateView(data));
```

### Pass data to your streams and Loro will handle updates

```
request.onNext({id});
update.onNext({id, data});
```
