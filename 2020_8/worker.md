## worker

### what

Worker is a  web worker or service worker. **A web worker is a JavaScript program running on a different thread, in parallel with main thread.**

Worker commuicate main by event, only two event type: message, error.

The data from main to worker or worker to main will be copied by serieslization. So if the data is big, you can use **Transferable objects**, So far **ArrayBuffer**, **MessagePort** and **ImageBitmap** types implement this interface.

In worker, you can create child worker,  it can communicate with father worker. 

The worker that we talk is dedicated worker. Shared Web Workers, they can communicate with and communicated by any thread running on same origin (example.com)

### why

sometime it may block UI when browse main thread are doing computationally intensive tasks. So we can use worker to execute these tasks. Worker is another thread and can do these job:

- Data and web page caching
- Image manipulation and encoding (base64 conversion)
- Canvas drawing and image filtering
- Network polling and web sockets
- Background I/O operations
- Video/Audio buffering and analysis
- Virtual DOM diffing
- Local database (indexedDB) operations
- Computationally intensive data operations

### HOW

#### create a web worker

In the main thread, browse context supply a constructor Worker, it take a parameter that can be a URI of a script or inline web worker code.

```js
// script
const worker = new Worker('../workers/myWorker.js')
// inline 
// create blob from JavaScript code (ES6 template literal)
var blob = new Blob([`
    self.onmessage = function(e) {
        postMessage('msg from worker');
    }
`]);
// create blob url from blob
var blobURL = window.URL.createObjectURL(blob);
// create web worker from blob url
var worker = new Worker(blobURL);

// error event is received when worker is not successfully registered or when workers sends an Error object as payload.
worker.addEventListener('error', function(event) {
    console.error('error received from workerFor => ', event);
});
```

In the worker thread, self variable is same as this at browse context. But window and document objects are not available. You can use third package like [workerDom](https://github.com/ampproject/worker-dom). Furthermore, you can use importScript to import external javascript.

Currently, we use webPack to  develpop front_end app and it supply [webworker loader](https://github.com/webpack-contrib/worker-loader)

Note: create a worker will consume a little time.

#### transimit data

your data must be serialized and also can use transferable objects

```js
// in main 
worker.postMessage(data)
woker.onmessage = (e) => {
// you can get data by e.data
  const res = e.data;
}
// in worker
worker.postMessage(data)
woker.onmessage = (e) => {
// you can get data by e.data
  const res = e.data;
}
// transferable objects, 
worker.postMessage(data, [data.tranferableObj.buffer])
```

There is a package [worker-promise](https://github.com/nolanlawson/promise-worker),  Post a message to the worker, get a message back. postMessage(data).then(res => {})

#### close worker

```js
// in main
worker.terminate()
// in worker
self.close()
```

