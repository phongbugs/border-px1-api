const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function getHiddenFieldsAndCookies(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Extract hidden fields values
    const viewState = $('#__VIEWSTATE').val();
    const eventValidation = $('#__EVENTVALIDATION').val();
    const viewStateGenerator = $('#__VIEWSTATEGENERATOR').val();

    // Extract cookies from the response headers
    const cookies = response.headers.raw()['set-cookie'];

    return {
      viewState,
      eventValidation,
      viewStateGenerator,
      cookies,
    };
  } catch (error) {
    console.error('Error:', error);
  }
}

async function submitForm(url, hiddenFields) {
  const postData = new URLSearchParams();
  postData.append('__LASTFOCUS', '');
  postData.append('__EVENTTARGET', '');
  postData.append('__EVENTARGUMENT', '');
  postData.append('__VIEWSTATE', hiddenFields.viewState);
  postData.append('__VIEWSTATEGENERATOR', hiddenFields.viewStateGenerator);
  postData.append('__EVENTVALIDATION', hiddenFields.eventValidation);
  postData.append('txtSecret', 'main123');
  postData.append('btnSubmit', 'Submit');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: hiddenFields.cookies.join('; '), // Include cookies in the request headers
      },
      body: postData.toString(),
    });

    const responseBody = await response.text();
    //console.log('Response:', responseBody);
    //const $ = cheerio.load(responseBody);
    //return $('#divInfo').html();
    return responseBody
  } catch (error) {
    console.error('Error:', error);
  }
}
async function fetchTempPage(url) {
  const hiddenFields = await getHiddenFieldsAndCookies(url);
  return await submitForm(url, hiddenFields);
}

module.exports = { fetchTempPage };
