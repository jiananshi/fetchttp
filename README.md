`req` is a small http request/response helper based on fetch

1. Installation

Add `req.js` to your page

`<script src="req.js"></script>`

2. API

a minimal http get request would be like this:

```js
req.get('https://yourdomain.com')
  .then(raw => /* now raw is response from `yourdomain.com` */);
```

`req` support bellow methods:

- GET
- POST
- PUT
- PATCH
- DELETE

Alternatively you can pass data as second argument:

```js
req.post('https://yourdomain.com', { str: 'ymy' });
```

3. Configuration

{{placeholder}}

