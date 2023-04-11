package com.martinletis.filters;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.Gmail.Users.Settings.Filters;

public class FilterManager {

  private static final String APP_NAME = "martinletis-filters-1.0";

  public static void main(String[] args) throws Exception {
    NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
    JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    HttpRequestInitializer requestInitializer = null;

    Gmail service = new Gmail.Builder(
        transport,
        jsonFactory,
        requestInitializer).setApplicationName(APP_NAME).build();

    Filters.List filters = service.users().settings().filters().list("me");

    System.out.println(filters);
  }
}
