package com.dritahanefi.app;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.DownloadListener;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

public class SectionActivity extends Activity {
 private static final String PREFS="drita_hanefi_native";
 private WebView webView;
 private String type;
 private String moduleRoot;

 @SuppressLint("SetJavaScriptEnabled")
 @Override public void onCreate(Bundle b){
  super.onCreate(b); setTheme(R.style.AppTheme); setContentView(R.layout.activity_section);
  type=safeType(getIntent().getStringExtra("type"));
  String title=titleFor(type);
  ((TextView)findViewById(R.id.sectionTitle)).setText(title);
  ((TextView)findViewById(R.id.sectionSubtitle)).setText(subtitleFor(type));
  findViewById(R.id.backButton).setOnClickListener(v->goBack());
  findViewById(R.id.homeButton).setOnClickListener(v->goHome());
  SharedPreferences prefs=getSharedPreferences(PREFS,MODE_PRIVATE);
  prefs.edit().putString("last_type",type).putString("last_title",title).apply();

  moduleRoot=assetUrl(type);
  webView=findViewById(R.id.sectionWebView); WebSettings settings=webView.getSettings();
  settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true); settings.setDatabaseEnabled(true); settings.setMediaPlaybackRequiresUserGesture(false);
  settings.setAllowFileAccess(true); settings.setAllowContentAccess(true); settings.setAllowFileAccessFromFileURLs(true); settings.setAllowUniversalAccessFromFileURLs(true); settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  settings.setBuiltInZoomControls(false); settings.setDisplayZoomControls(false); settings.setLoadWithOverviewMode(true); settings.setUseWideViewPort(true); settings.setTextZoom(100); settings.setCacheMode(WebSettings.LOAD_DEFAULT);
  webView.setWebChromeClient(new WebChromeClient());
  webView.setDownloadListener((url,userAgent,contentDisposition,mimeType,contentLength)->openExternal(Uri.parse(url)));
  webView.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request){ return openExternalIfNeeded(request.getUrl()); }
   @Override public boolean shouldOverrideUrlLoading(WebView view, String url){ return openExternalIfNeeded(Uri.parse(url)); }
   @Override public void onPageStarted(WebView view,String url,Bitmap favicon){ super.onPageStarted(view,url,favicon); persistLocation(url); }
   @Override public void onPageFinished(WebView view,String url){ super.onPageFinished(view,url); persistLocation(url); }
  });
  String resume=getIntent().getStringExtra("resume_url");
  Uri.Builder query=Uri.parse(validResumeUrl(resume)?resume:moduleRoot).buildUpon();
  int surah=getIntent().getIntExtra("surah",0), ayah=getIntent().getIntExtra("ayah",0); String text=getIntent().getStringExtra("query");
  if(surah>0&&ayah>0) query.appendQueryParameter("surah",String.valueOf(surah)).appendQueryParameter("ayah",String.valueOf(ayah)).appendQueryParameter("q",surah+":"+ayah);
  if(text!=null&&!text.trim().isEmpty()) query.appendQueryParameter("q",text.trim());
  webView.loadUrl(query.build().toString());
 }

 private void persistLocation(String url){
  if(!validResumeUrl(url)) return;
  getSharedPreferences(PREFS,MODE_PRIVATE).edit().putString("last_type",type).putString("last_title",titleFor(type)).putString("last_url",url).apply();
 }
 private boolean validResumeUrl(String url){
  if(url==null||url.trim().isEmpty()) return false;
  Uri uri=Uri.parse(url); String scheme=uri.getScheme();
  if(!"file".equalsIgnoreCase(scheme)) return false;
  return url.startsWith(moduleRoot==null?assetUrl(type):moduleRoot);
 }
 private boolean openExternalIfNeeded(Uri uri){
  if(uri==null) return false;
  String scheme=uri.getScheme();
  if(scheme==null||"file".equalsIgnoreCase(scheme)||"http".equalsIgnoreCase(scheme)||"https".equalsIgnoreCase(scheme)) return false;
  openExternal(uri); return true;
 }
 private void openExternal(Uri uri){
  if(uri==null) return;
  try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch(Exception ignored) { }
 }
 private String safeType(String value){
  if(value==null) return "quran";
  switch(value){case "quran":case "hadith":case "fikh":case "tefsir":case "akide":case "texhvid":case "abetare":case "hudbe":case "pedagogji":case "histori":case "tema":case "admin":return value;default:return "quran";}
 }
 private String assetUrl(String type){ if("admin".equals(type)) return "file:///android_asset/site/admin/index.html"; return "file:///android_asset/site/modules/"+type+"/index.html"; }
 private String titleFor(String t){
  switch(t){case "quran":return "Enciklopedia e Kuranit";case "hadith":return "Hadithi";case "fikh":return "Fikhu Hanefi";case "tefsir":return "Tefsiri";case "akide":return "Akide Maturidije";case "texhvid":return "Texhvidi";case "abetare":return "Abetarja Kuranore";case "hudbe":return "Hudbet";case "pedagogji":return "Pedagogjia Islame";case "histori":return "Historia Islame";case "tema":return "Më bëj një temë";case "admin":return "Administrimi";default:return "Drita Hanefi";}
 }
 private String subtitleFor(String t){
  switch(t){case "quran":return "114 sure • 6236 ajete • Hifz • Tefsir • Fikh";case "hadith":return "Koleksion • Libër • Kapitull • Hadith";case "fikh":return "Kategori • Temë • Nëntemë • Dispozitë";case "tefsir":return "Ajet • Mufessir • Vepër • Referencë";case "akide":return "Akide Maturidije • Burime • Tema";case "abetare":return "Mësime • Shqiptim • Ushtrime • Progres";case "texhvid":return "Rregulla • Shembuj kuranorë • Praktikë";case "hudbe":return "Hudbe • Tema • Burime";case "pedagogji":return "Edukim • Mësim • Zbatim";case "histori":return "Pejgamberë • Sahabë • Dinasti • Kronologji";case "tema":return "Kërkim i lidhur në burimet e Drita Hanefi";case "admin":return "Menaxhimi i përmbajtjes";default:return "Dituria • Burimi • Praktika";}
 }
 private void goHome(){ Intent i=new Intent(this,MainActivity.class); i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP); startActivity(i); finish(); }
 private void goBack(){ if(webView!=null&&webView.canGoBack()) webView.goBack(); else finish(); }
 @Override public void onBackPressed(){ goBack(); }
 @Override protected void onPause(){ if(webView!=null) webView.onPause(); super.onPause(); }
 @Override protected void onResume(){ super.onResume(); if(webView!=null) webView.onResume(); }
 @Override protected void onDestroy(){ if(webView!=null){ webView.stopLoading(); webView.setDownloadListener(null); webView.setWebChromeClient(null); webView.setWebViewClient(null); webView.destroy(); webView=null; } super.onDestroy(); }
}
