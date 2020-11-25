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
    - Item localstorage is WL name
      - Ex: 'HABANA' : 'sda2fed32311154252'
  - Encrypt domain json by public key from backend & decrypt private key from front-end

## Bugs

- Input data number or string, ex 169 and '169'
- ***cannot unmarshal string into Go struct field*** => backend is implemented by golang
- Session expired error a(4)(wait session refresh)

## Notes

- body parameters swagger io

  ```js

  {"cookie":"borderproxy-deviceId=QZGVvSjXLm6SNU6N2PKS3Q==; Path=/; Expires=Tue, 12 Nov 2120 10:34:12 GMT; HttpOnly,borderproxy-token=Gsaf7dGgs7kSXWVpVJOl5l7SyjuYhio_c9Q8x0PFq5A=; Path=/; Expires=Thu, 19 Nov 2020 10:34:12 GMT; HttpOnly"}
  
  ```

- Open API 2.0 doesn't support set-cookie at response header (SWAGGER UI) : <https://github.com/scottie1984/swagger-ui-express/issues/80>

- Change docs api to OAS(Open API Swagger) 3.0.3 <https://swagger.io/docs/specification/describing-request-body/>
