# ata-push-api

## Push Notification API(Without authentication)

- API docs included Routing Execution
  - Docs API: <https://ata-push-api.herokuapp.com/api-docs>
  - Testing page : <https://ata-push-api.herokuapp.com>
- Inject other services
- Check infomation of injected service

## Subscribe Button

- When Push Notification server restarted, notification is only available if user browse page again(the browser will update the subscription to server automaticly , don't need click to "Notify Attendance")

## Notification Attendance Service

- Get office's working hours and notify to all users already have subscribed (Clicked to Notify Attendance button and allowed)
- Notify check-in early 5 minutes
- Notify check-out as end time

## ATA Core API

- Public get /api/officesettings

## Setup

```js
npm install
npm start
```

## Tips

- Broadcast all existed subscriptions with customized notification

    ```js
    let url =
        hostPushAPI +
        '/subscription/notify-all?' +
        new URLSearchParams({
            title: 'titile',
            text: 'content',
            image: 'path to bg img',
            tag: 'tag',
            url: 'url',
        }),
        options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
    fetch(url, options).then((response) => {
        log(`${response.url}: ${response.status}(${response.statusText})`);
    });
    ```

## Notes
