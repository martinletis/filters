function listFilters(token) {
  // https://developers.google.com/gmail/api/reference/rest/v1/users.labels/list
  const labels =
    fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {headers: {Authorization: 'Bearer ' + token}})
      .then(response => response.json())
      .then(data => data.labels);

  // https://developers.google.com/gmail/api/reference/rest/v1/users.settings.filters/list
  const filters = fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/filters', {headers: {Authorization: 'Bearer ' + token}})
    .then(response => response.json())
    .then(data => data.filter);

  Promise.all([labels, filters]).then(([labels, filters]) => {
    const map = new Map();
    labels.forEach(label => map.set(label.id, label.name));

    console.log(map);

    var table = document.getElementById('filters');
    filters.forEach(filter => {
      const mapper = id => map.get(id) || id;
      if (filter.action.addLabelIds) {
        filter.action.addLabels = filter.action.addLabelIds.map(mapper);
      }
      if (filter.action.removeLabelIds) {
        filter.action.removeLabels = filter.action.removeLabelIds.map(mapper);
      }

      var row = table.insertRow();
      var cell = row.insertCell().innerHTML = filter.id;
      var cell = row.insertCell().appendChild(document.createTextNode(JSON.stringify(filter.criteria)));
      var cell = row.insertCell().appendChild(document.createTextNode(JSON.stringify(filter.action)));
    })
  });
}

function initAuth() {
  const url = new URL(window.location.href);
  const corp = url.hostname.endsWith('corp.google.com') || url.hostname.endsWith('proxy.googleprod.com');
  const client_id = corp ?
    '779034051627-0kucbfm2mm1rggfd5fr74k4a0a6sae8s.apps.googleusercontent.com' : 
    '75676298790-14bh2i530mfg7pebtadh9vvokh404rk1.apps.googleusercontent.com';

  console.log('Using client_id ' + client_id);

  client = google.accounts.oauth2.initTokenClient({
    client_id: client_id,
    scope: [
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.settings.basic',
    ].join(' '),
    callback: (tokenResponse) => {
      listFilters(tokenResponse.access_token);
    },
  });
  
  client.requestAccessToken();
}  