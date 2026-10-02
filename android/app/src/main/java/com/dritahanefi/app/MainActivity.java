package com.dritahanefi.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
 private WebView web;
 @Override public void onCreate(Bundle b){
  super.onCreate(b);
  web=new WebView(this); setContentView(web);
  web.setWebChromeClient(new WebChromeClient());
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r){ Uri u=r.getUrl(); String scheme=u.getScheme(); if("http".equals(scheme)||"https".equals(scheme)) return false; try{ startActivity(new Intent(Intent.ACTION_VIEW,u)); }catch(Exception ignored){} return true; }
  });
  web.getSettings().setJavaScriptEnabled(true);
  web.getSettings().setDomStorageEnabled(true);
  web.getSettings().setMediaPlaybackRequiresUserGesture(false);
  web.getSettings().setCacheMode(WebSettings.LOAD_DEFAULT);
  web.getSettings().setAllowFileAccess(false);
  web.getSettings().setAllowContentAccess(false);
  web.loadUrl("https://iljazsalihi95-wq.github.io/Drita-Hanefi/");
 }
 @Override public void onBackPressed(){ if(web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
