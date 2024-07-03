let tokenPublicKey =
'-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrRxLdvg03/1KX9xJAW0USP3pSqJTSkwEY3aQ2tphPkKmGAZxVPUgiNjyGxhplR6Q+YKKybmveL/TbhKEWCXRXcRkZVEQo3vG2SFozWcgJIFaCw7g6aU73hG3kYxb+uJsUPR7AUls/YECKeouCKEYgg+aqmJm0zgT+p3vBd/lNzwIDAQAB-----END PUBLIC KEY-----';
let cdnImageHost =
localStorage.getItem('cdnImageHost') ||
(location.host.indexOf('localhost') > -1
  ? 'http://localhost/ShareImgAPI'
  : 'https://imgtest.playliga.com');
  let borderPx1ApiHost =
  localStorage.getItem('borderPx1ApiHost') ||
  ((location.host.indexOf('localhost') > -1 || location.host.indexOf('192.168.1') > -1 )
    ? 'http://localhost:8888'
    : 
    //'https://border-px1-api.herokuapp.com'
    'https://bpx-api.icu'
    );
$(document).ready(function () {
    $('#kt_sign_in_form').on('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        var username = $('input[name="username"]').val();
        var password = $('input[name="password"]').val();

        // Basic validation
        if (username === "" || password === "") {
            alert('Please fill in both fields');
            return;
        }

        // Show loading indicator
        $('#kt_sign_in_submit .indicator-label').hide();
        $('#kt_sign_in_submit .indicator-progress').show();
        let loginData = {
            username,
            password,
            days: 1,
        },
            loginHost = borderPx1ApiHost;
        //loginHost = cdnImageHost;
        if (loginHost.indexOf(cdnImageHost) === -1) {
            let crypt = new JSEncrypt();
            crypt.setKey(tokenPublicKey);
            loginData = crypt.encrypt(JSON.stringify(loginData));
        }

        $.ajax({
            url: loginHost  + '/user/login',
            type: 'POST',
            data: loginHost.indexOf(cdnImageHost) === -1 ? { loginData } : loginData,
            success: function (response) {
              // Hide loading indicator
              $('#kt_sign_in_submit .indicator-label').show();
              $('#kt_sign_in_submit .indicator-progress').hide();
              console.log(response);
              if (response.success) {
              localStorage.setItem('border-px1-api-cookie', response.token);
              localStorage.setItem('username', username);
               $.ajax({
                    method: 'POST',
                    url: cdnImageHost + '/token/create',
                    data: {
                      username,
                      password,
                      days: 1,
                    },
                    success: function (response) {
                      if (response.success)
                        localStorage.setItem(
                          'token-sync-image-cdn',
                          response.token
                        );
                      else console.log(response.message);
                    },
                    failure: function (response) {
                      alert('Error', 'Sync CDN Images function');
                    },
                  });
                  window.location.href = $('#kt_sign_in_form').data('kt-redirect-url');
              } else {
                  alert(response.message);
              }
            },
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
                alert('An error occurred. Please try again later.');
            }
        })
    });
});
