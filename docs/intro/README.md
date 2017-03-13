## XRequest

基于 Fetch 的接口调用工具

## Get started

```html
<script src="//github.elemecdn.com/jiananshi/XRequest/master/src/xrequest.js"></script>
<script>
XRequest.get('/api/apps', {
  mode: 'cors',
  credentials: 'include'
}).then(res => console.log(res));
</script>
```

## License

&copy; MIT

