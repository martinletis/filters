function listFilters(tokenResponse) {
  // https://developers.google.com/gmail/api/reference/rest/v1/users.labels/list
  const labels = gapi.client.gmail.users.labels.list({userId: 'me'}).then(response => response.result.labels);

  // https://developers.google.com/gmail/api/reference/rest/v1/users.settings.filters/list
  const filters = gapi.client.gmail.users.settings.filters.list({userId: 'me'}).then(response => response.result.filter);

  Promise.all([labels, filters]).then(([labels, filters]) => {
    console.debug(labels);
    console.debug(filters);

    const map = new Map();
    labels.forEach(label => map.set(label.id, label.name));

    const re = /^list:\(<([^\.]+)[\.@]google\.com>\)$/;
    const table = document.getElementById('filters');
    filters.sort((a, b) => a.criteria.query ? a.criteria.query.localeCompare(b.criteria.query) : 0).forEach(filter => {
      const mapper = id => map.get(id) || id;
      if (filter.action.addLabelIds) {
        filter.action.addLabels = filter.action.addLabelIds.map(mapper);
      }
      if (filter.action.removeLabelIds) {
        filter.action.removeLabels = filter.action.removeLabelIds.map(mapper);
      }

      const row = table.insertRow();
      
      const from = row.insertCell();
      if (filter.criteria.from) {
        from.appendChild(document.createTextNode(filter.criteria.from));
      }
      const to = row.insertCell();
      if (filter.criteria.to) {
        to.appendChild(document.createTextNode(filter.criteria.to));
      }
      if (filter.criteria.subject) {
        // criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('subject: ' + filter.criteria.subject)));
        console.warn('Unsupported "criteria.subject": ' + filter.criteria.subject);
      }
      const query = row.insertCell();
      if (filter.criteria.query) {
        const match = filter.criteria.query.match(re);
        if (match && filter.action.addLabels) {
          row.bgColor = filter.action.addLabels.map(label => label.split('/').at(-1)).includes(match.at(1)) ? '#90ee90' : '#ee9090';
        }
        query.appendChild(document.createTextNode(filter.criteria.query));
      }
      if (filter.criteria.negatedQuery) {
        // criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('negatedQuery: ' + filter.criteria.negatedQuery)));
        console.warn('Unsupported "criteria.negatedQuery": ' + filter.criteria.negatedQuery);
      }
      if (filter.criteria.hasAttachment) {
        // criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('hasAttachment: ' + filter.criteria.hasAttachment)));
        console.warn('Unsupported "criteria.hasAttachment": ' + filter.criteria.hasAttachment);
      }
      if (filter.criteria.excludeChats) {
        // criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('excludeChats: ' + filter.criteria.excludeChats)));
        console.warn('Unsupported "criteria.excludeChats": ' + filter.criteria.excludeChats);
      }
      if (filter.criteria.size) {
        // criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('size: ' + filter.criteria.size)));
        console.warn('Unsupported "criteria.size": ' + filter.criteria.size);
      }
      if (filter.criteria.sizeComparison) {
        // criteria.appendChild(document.createElement('span').appendChild(document.createTextNode('sizeComparison: ' + filter.criteria.sizeComparison)));
        console.warn('Unsupported "criteria.sizeComparison": ' + filter.criteria.sizeComparison);
      }

      const addLabels = row.insertCell();
      if (filter.action.addLabels) {
        addLabels.appendChild(document.createTextNode(filter.action.addLabels));
      }
      const removeLabels = row.insertCell();
      if (filter.action.removeLabels) {
        removeLabels.appendChild(document.createTextNode(filter.action.removeLabels));
      }
      const forward = row.insertCell();
      if (filter.action.forward) {
        action.appendChild(document.createTextNode(filter.action.forward));
      }
    })
  });
}

function initAuth() {
  const url = new URL(window.location.href);
  const corp = url.hostname.endsWith('corp.google.com') || url.hostname.endsWith('proxy.googleprod.com');
  const client_id = corp ?
    '418027268213-8pb0j1jv4lg8ulbmmf4vd182kvgjvq3s.apps.googleusercontent.com' :
    '75676298790-14bh2i530mfg7pebtadh9vvokh404rk1.apps.googleusercontent.com';

  console.debug('Using client_id ' + client_id);

  const client = google.accounts.oauth2.initTokenClient({
    client_id: client_id,
    scope: [
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.settings.basic',
    ].join(' '),
    callback: listFilters,
    prompt: '',
    error_callback: error => console.warn(JSON.stringify(error)),
  });
  
  client.requestAccessToken();
}

function initGapi() {
  gapi.client.init({
    'discoveryDocs': ['https://gmail.googleapis.com/$discovery/rest?version=v1'],
  }).then(initAuth);
}

gapi.load('client', initGapi);
