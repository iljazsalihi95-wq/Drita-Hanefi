package com.dritahanefi.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Intent;
import android.net.Uri;
import android.widget.ProgressBar;
import android.widget.LinearLayout;
import android.widget.Button;

public class MainActivity extends Activity {
 private WebView web;
 private ProgressBar progress;
 private LinearLayout offlinePanel;
 private Button retryButton;
 private static final String HOME="file:///android_asset/site/index.html";

 @Override public void onCreate(Bundle b){
  super.onCreate(b);
  setTheme(R.style.AppTheme);
  setContentView(R.layout.activity_main);
  web=findViewById(R.id.web);
  progress=findViewById(R.id.progress);
  offlinePanel=findViewById(R.id.offlinePanel);
  retryButton=findViewById(R.id.retryButton);
  retryButton.setOnClickListener(v->{ offlinePanel.setVisibility(View.GONE); web.setVisibility(View.VISIBLE); web.loadUrl(HOME); });

  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onProgressChanged(WebView view,int value){
    progress.setProgress(value);
    progress.setVisibility(value>=100?View.GONE:View.VISIBLE);
   }
  });
  web.setWebViewClient(new WebViewClient(){
   @Override public void onPageFinished(WebView v,String url){ offlinePanel.setVisibility(View.GONE); web.setVisibility(View.VISIBLE); }
   @Override public void onReceivedError(WebView v, WebResourceRequest r, android.webkit.WebResourceError e){ if(r.isForMainFrame()){ web.setVisibility(View.GONE); offlinePanel.setVisibility(View.VISIBLE); progress.setVisibility(View.GONE); } }
   @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r){
    Uri u=r.getUrl(); String scheme=u.getScheme();
    if("http".equals(scheme)||"https".equals(scheme)) return false;
    try{ startActivity(new Intent(Intent.ACTION_VIEW,u)); }catch(Exception ignored){}
    return true;
   }
  });

  WebSettings settings=web.getSettings();
  settings.setJavaScriptEnabled(true);
  settings.setDomStorageEnabled(true);
  settings.setMediaPlaybackRequiresUserGesture(false);
  settings.setCacheMode(WebSettings.LOAD_DEFAULT);
  // The audited web application is bundled with the APK. These two file-URL
  // settings let its relative JSON catalogs load while remote API/audio stay HTTPS.
  settings.setAllowFileAccess(true);
  settings.setAllowFileAccessFromFileURLs(true);
  settings.setAllowUniversalAccessFromFileURLs(true);
  settings.setAllowContentAccess(false);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

  if(b==null) web.loadUrl(HOME);
 }

 @Override protected void onSaveInstanceState(Bundle out){
  web.saveState(out); super.onSaveInstanceState(out);
 }
 @Override protected void onRestoreInstanceState(Bundle state){
  super.onRestoreInstanceState(state); web.restoreState(state);
 }
 @Override public void onBackPressed(){
  if(web.canGoBack()) web.goBack(); else super.onBackPressed();
 }
 @Override protected void onDestroy(){
  web.stopLoading(); web.setWebChromeClient(null); web.setWebViewClient(null); web.destroy(); super.onDestroy();
 }
}
