# border-bpx1-api

## Document API

- API docs included Routing Execution
  - Docs API: <https://border-bpx1-api.herokuapp.com/api-docs>
  - Testing page : <https://border-bpx1-api.herokuapp.com>

## Setup

```js
npm install
npm start
```

## Todo

- Sync Domains Button
  - Sync all domain of all WLs
  - Save to local storage
  - Encrypt domain json by public key from backend & decrypt private key from front-end

## Bugs

- Input data number or string, ex 169 and '169'
- ***cannot unmarshal string into Go struct field*** => backend is implemented by golang

## Notes

- body parameters swagger io

  ```js

  {"cookie":"borderproxy-deviceId=QZGVvSjXLm6SNU6N2PKS3Q==; Path=/; Expires=Tue, 12 Nov 2120 10:34:12 GMT; HttpOnly,borderproxy-token=Gsaf7dGgs7kSXWVpVJOl5l7SyjuYhio_c9Q8x0PFq5A=; Path=/; Expires=Thu, 19 Nov 2020 10:34:12 GMT; HttpOnly"}
  
  ```
