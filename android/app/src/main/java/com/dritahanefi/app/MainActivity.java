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

public class MainActivity extends Activity {
 private WebView web;
 private ProgressBar progress;
 private static final String HOME="https://iljazsalihi95-wq.github.io/Drita-Hanefi/";

 @Override public void onCreate(Bundle b){
  super.onCreate(b);
  setTheme(R.style.AppTheme);
  setContentView(R.layout.activity_main);
  web=findViewById(R.id.web);
  progress=findViewById(R.id.progress);

  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onProgressChanged(WebView view,int value){
    progress.setProgress(value);
    progress.setVisibility(value>=100?View.GONE:View.VISIBLE);
   }
  });
  web.setWebViewClient(new WebViewClient(){
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
  settings.setAllowFileAccess(false);
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
