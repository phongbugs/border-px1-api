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
    $('input[name="username"]').val(localStorage.getItem('username'));
    $('input[name="password"]').val(CryptoJS.AES.decrypt(
      localStorage.getItem('password') || 'aaa',
      location.hostname
    ).toString(CryptoJS.enc.Utf8));
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
                       // save info
                       localStorage.setItem(
                        'username',
                        username
                      );
                      localStorage.setItem(
                        'password',
                        CryptoJS.AES.encrypt(
                          password,
                          location.hostname
                        ).toString()
                      );
                      // Hide loading indicator
                      $('#kt_sign_in_submit .indicator-label').show();
                      $('#kt_sign_in_submit .indicator-progress').hide();
                      window.location.href = 'summary.html';
                    },
                    failure: function (response) {
                      alert('Error', 'Sync CDN Images function');
                    },
                  });
                  
              } else {
                  alert(response.message);
                   // Hide loading indicator
                    $('#kt_sign_in_submit .indicator-label').show();
                    $('#kt_sign_in_submit .indicator-progress').hide();
              }
            },
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
                alert('An error occurred. Please try again later.');
            }
        })
    });
});
