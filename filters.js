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

    const table = document.getElementById('filters');
    filters.forEach(filter => {
      const mapper = id => map.get(id) || id;
      if (filter.action.addLabelIds) {
        filter.action.addLabels = filter.action.addLabelIds.map(mapper);
      }
      if (filter.action.removeLabelIds) {
        filter.action.removeLabels = filter.action.removeLabelIds.map(mapper);
      }

      const row = table.insertRow();
      row.insertCell().innerHTML = filter.id;
      
      const criteria = row.insertCell();
      if (filter.criteria.from) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('from: ' + filter.criteria.from)));
      }
      if (filter.criteria.to) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('to: ' + filter.criteria.to)));
      }
      if (filter.criteria.subject) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('subject: ' + filter.criteria.subject)));
      }
      if (filter.criteria.query) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('query: ' + filter.criteria.query)));
      }
      if (filter.criteria.negatedQuery) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('negatedQuery: ' + filter.criteria.negatedQuery)));
      }
      if (filter.criteria.hasAttachment) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('hasAttachment: ' + filter.criteria.hasAttachment)));
      }
      if (filter.criteria.excludeChats) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('excludeChats: ' + filter.criteria.excludeChats)));
      }
      if (filter.criteria.size) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('size: ' + filter.criteria.size)));
      }
      if (filter.criteria.sizeComparison) {
        criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('sizeComparison: ' + filter.criteria.sizeComparison)));
      }

      const action = row.insertCell();
      if (filter.action.addLabels) {
        action.appendChild(document.createElement('span').appendChild(document.createTextNode('addLabels: ' + filter.action.addLabels)));
      }
      if (filter.action.removeLabels) {
        action.appendChild(document.createElement('span').appendChild(document.createTextNode('removeLabels: ' + filter.action.removeLabels)));
      }
      if (filter.action.forward) {
        action.appendChild(document.createElement('span').appendChild(document.createTextNode('forward: ' + filter.action.forward)));
      }
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
