package com.martinletis.filters;

import com.google.api.client.auth.oauth2.AuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.Filter;
import com.google.api.services.gmail.model.Label;
import com.google.api.services.gmail.model.ListFiltersResponse;
import com.google.common.base.Joiner;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import java.io.File;
import java.io.FileReader;
import java.io.Reader;
import java.util.Map;

public class FilterManager {

  private static final String APP_NAME = "martinletis-filters-1.0";
  private static final String CLIENT_SECRET =
      "client_secret_779034051627-5spgb5pucbne41qqnpe44vkg46pc4e3s.apps.googleusercontent.com.json";

  public static void main(String[] args) throws Exception {
    NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
    JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    GoogleClientSecrets secrets;
    try (Reader reader =
        new FileReader(
            Joiner.on(File.separator)
                .join(System.getProperty("user.home"), "tmp", CLIENT_SECRET))) {
      secrets = GoogleClientSecrets.load(jsonFactory, reader);
    }

    File dataDirectory =
        new File(
            Joiner.on(File.separator)
                .join(System.getProperty("user.home"), "tmp", APP_NAME, "datastore"));

    AuthorizationCodeFlow flow =
        new GoogleAuthorizationCodeFlow.Builder(
                transport,
                jsonFactory,
                secrets,
                Lists.newArrayList(GmailScopes.GMAIL_SETTINGS_BASIC, GmailScopes.GMAIL_LABELS))
            .setDataStoreFactory(new FileDataStoreFactory(dataDirectory))
            .build();

    Credential credential =
        new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver()).authorize("user");

    Gmail service =
        new Gmail.Builder(transport, jsonFactory, credential).setApplicationName(APP_NAME).build();

    Map<String, Label> labels =
        Maps.uniqueIndex(service.users().labels().list("me").execute().getLabels(), Label::getId);

    ListFiltersResponse filters = service.users().settings().filters().list("me").execute();

    for (Filter filter : filters.getFilter()) {
      System.out.println(filter);
      if (filter.getAction().getAddLabelIds() != null) {
        for (String id : filter.getAction().getAddLabelIds()) {
          System.out.println(id + " - " + (labels.containsKey(id) ? labels.get(id).getName() : id));
        }
      }
      if (filter.getAction().getRemoveLabelIds() != null) {
        for (String id : filter.getAction().getRemoveLabelIds()) {
          System.out.println(id + " - " + (labels.containsKey(id) ? labels.get(id).getName() : id));
        }
      }
    }
  }
}
