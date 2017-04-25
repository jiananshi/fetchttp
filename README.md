`req` is a small http request/response helper based on fetch

**1. Installation**

Add `req.js` to your page

`<script src="req.js"></script>`

**2. API**

**2.1** a minimal http get request would be like this:

```js
req.get('https://yourdomain.com')
  .end()
  .then(raw => /* now raw is response from `yourdomain.com` */);
```

`req` support bellow methods:

- GET
- POST
- PUT
- PATCH
- DELETE

**2.2** Alternatively you can pass data as second argument:

```js
req.post('https://yourdomain.com', { str: 'ymy' }).end();
```

**2.3** Last arguments would always be fetch configuration which passes directly to native `fetch`:

```js
req.patch('https://yourdomain.com/user/813', { str: 'ymy' }, {
  mode: 'cors',
  credentials: 'include'
}).end();
````

**2.4** The reason why call `end()` method is inspired by mongoose's queryBuilder, which leet you generate your query step by step then do the query:

```js
req.post('https://yourdomain.com')
  .set('content-type', 'application/json')
  .set('accept', 'application/json')
  .set('x-csrftoken', '25818910680')
  .send(data)
  .end() // till now send the request
```

**2.5** Finally there are senarios in Project your have to write

```js
const commonConfig = Object.freeze({
  headers: { /* ... */ }
  mode: 'cors'
});
const prefix = 'https://yourdomain.com';

fetch('url', Object.assign(customConfig, commonConfig));
```

now just:

```js
const api = req.create({
  baseUrl: 'https://yourdomain.com/v1/',
  options: {
    headers: { /* ... */ },
    mode: 'cors'
  }
});

api.get('data').end(); // would send get request to https:\/\/yourdomain.com/data
```

