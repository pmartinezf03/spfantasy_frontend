package com.example.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
  @Override
  public void onStart() {
    super.onStart();

    WebView webView = (WebView) this.bridge.getWebView();
    if (webView != null) {
      WebSettings settings = webView.getSettings();
      settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
  }
}
