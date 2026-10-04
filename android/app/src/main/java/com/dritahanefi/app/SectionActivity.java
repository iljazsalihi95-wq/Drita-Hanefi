package com.dritahanefi.app;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class SectionActivity extends Activity {
 private WebView webView;

 @SuppressLint("SetJavaScriptEnabled")
 @Override public void onCreate(Bundle b){
  super.onCreate(b);
  setTheme(R.style.AppTheme);
  setContentView(R.layout.activity_section);
  String type=getIntent().getStringExtra("type");
  findViewById(R.id.backButton).setOnClickListener(v->finish());
  webView=findViewById(R.id.sectionWebView);
  WebSettings settings=webView.getSettings();
  settings.setJavaScriptEnabled(true);
  settings.setDomStorageEnabled(true);
  settings.setDatabaseEnabled(true);
  settings.setMediaPlaybackRequiresUserGesture(false);
  settings.setAllowFileAccess(true);
  settings.setAllowContentAccess(true);
  settings.setAllowFileAccessFromFileURLs(true);
  settings.setAllowUniversalAccessFromFileURLs(true);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  webView.setWebViewClient(new WebViewClient());
  String url=assetUrl(type); int surah=getIntent().getIntExtra("surah",0), ayah=getIntent().getIntExtra("ayah",0); if(surah>0&&ayah>0){ String sep=url.contains("?")?"&":"?"; url+=sep+"surah="+surah+"&ayah="+ayah+"&q="+surah+"%3A"+ayah; } webView.loadUrl(url);
 }

 private String assetUrl(String type){
  if("admin".equals(type)) return "file:///android_asset/site/admin/index.html";
  String safe=type==null?"quran":type.replaceAll("[^a-z]","");
  return "file:///android_asset/site/modules/"+safe+"/index.html";
 }

 @Override public void onBackPressed(){
  if(webView!=null&&webView.canGoBack()) webView.goBack();
  else super.onBackPressed();
 }
}
