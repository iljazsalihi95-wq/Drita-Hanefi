package com.dritahanefi.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
  private static final String PREFS="drita_hanefi_native";
  private static final String[][] SECTIONS = {
    {"Kurani","6236 ajete • Hifz • audio • tefsir","quran"},
    {"Hadithi","Koleksione • sened • gradim • koment","hadith"},
    {"Fikhu Hanefi","Kategori • tema • dispozita • burime","fikh"},
    {"Tefsiri","Ajet • mufessir • vepër • referencë","tefsir"},
    {"Akide Maturidije","Tema • dijetarë • vepra • argumente","akide"},
    {"Texhvidi","Rregulla • shembuj • mësim","texhvid"},
    {"Abetarja Kuranore","Mësime • shkronja • ushtrime","abetare"},
    {"Hudbet","Hudbe • kërkim • burime","hudbe"},
    {"Pedagogjia Islame","Edukim • mësime • burime","pedagogji"},
    {"Historia Islame","Ngjarje • figura • burime","histori"},
    {"Më bëj një temë","Përgatitje teme nga burimet","tema"},
    {"Admini","Kontrolli i sistemeve","admin"}
  };

  @Override public void onCreate(Bundle b) {
    super.onCreate(b); setTheme(R.style.AppTheme); setContentView(R.layout.activity_main);
    GridLayout list=findViewById(R.id.sectionGrid);
    list.setColumnCount(homeColumns());
    View firstCard=null;
    for(String[] s:SECTIONS){
      View sectionCard=card(s[0],s[1],s[2]);
      if(firstCard==null) firstCard=sectionCard;
      list.addView(sectionCard);
    }
    View continueCard=findViewById(R.id.continueCard);
    continueCard.setContentDescription("Vazhdo aty ku e ke lënë");
    continueCard.setOnClickListener(v->openLast());
    View searchButton=findViewById(R.id.searchButton);
    searchButton.setContentDescription("Kërko në Drita Hanefi");
    searchButton.setOnClickListener(v->search());
    if(isTv()){
      enableTvFocus(continueCard);
      enableTvFocus(searchButton);
      if(firstCard!=null) firstCard.requestFocus();
    }
    EditText search=findViewById(R.id.globalSearch);
    search.setContentDescription("Kërkim global në Drita Hanefi");
    search.setOnEditorActionListener((v,actionId,event)->{
      boolean enter=event!=null&&event.getKeyCode()==KeyEvent.KEYCODE_ENTER&&event.getAction()==KeyEvent.ACTION_UP;
      if(actionId!=0||enter){ search(); return true; }
      return false;
    });
    refreshContinue();
  }

  @Override protected void onResume(){ super.onResume(); refreshContinue(); }

  private boolean isTv(){
    Configuration c=getResources().getConfiguration();
    return (c.uiMode&Configuration.UI_MODE_TYPE_MASK)==Configuration.UI_MODE_TYPE_TELEVISION;
  }

  private int homeColumns(){
    Configuration c=getResources().getConfiguration();
    int sw=c.smallestScreenWidthDp;
    if(isTv()) return 4;
    if(sw>=840) return 4;
    if(sw>=600) return 3;
    return 2;
  }

  private void enableTvFocus(View v){
    v.setFocusable(true);
    v.setFocusableInTouchMode(false);
    v.setOnFocusChangeListener((view,hasFocus)->{
      float scale=hasFocus?1.045f:1f;
      view.animate().scaleX(scale).scaleY(scale).setDuration(120).start();
      view.setElevation(hasFocus?dp(10):dp(2));
    });
  }

  private void search(){
    EditText q=findViewById(R.id.globalSearch); String text=q.getText().toString().trim();
    Intent i=sectionIntent("Më bëj një temë","tema"); if(!text.isEmpty()) i.putExtra("query",text); startActivity(i);
  }

  private View card(String title,String subtitle,String type){
    View v=getLayoutInflater().inflate(R.layout.item_section,null,false);
    ((TextView)v.findViewById(R.id.sectionTitle)).setText(title); ((TextView)v.findViewById(R.id.sectionSubtitle)).setText(subtitle);
    v.setContentDescription(title+". "+subtitle);
    v.setOnClickListener(x->open(title,type));
    if(isTv()) enableTvFocus(v);
    GridLayout.LayoutParams lp=new GridLayout.LayoutParams(); lp.width=0; lp.height=GridLayout.LayoutParams.WRAP_CONTENT; lp.columnSpec=GridLayout.spec(GridLayout.UNDEFINED,1f); lp.setMargins(dp(5),dp(5),dp(5),dp(5)); v.setLayoutParams(lp); return v;
  }

  private void open(String title,String type){
    getSharedPreferences(PREFS,MODE_PRIVATE).edit().putString("last_type",type).putString("last_title",title).remove("last_url").apply(); startActivity(sectionIntent(title,type));
  }

  private Intent sectionIntent(String title,String type){
    Intent i=new Intent(this,SectionActivity.class); i.putExtra("title",title); i.putExtra("type",type); return i;
  }

  private void openLast(){
    SharedPreferences p=getSharedPreferences(PREFS,MODE_PRIVATE);
    Intent i=sectionIntent(p.getString("last_title","Kurani"),p.getString("last_type","quran"));
    String url=p.getString("last_url",""); if(url.startsWith("file:///android_asset/site/")) i.putExtra("resume_url",url);
    startActivity(i);
  }

  private void refreshContinue(){ SharedPreferences p=getSharedPreferences(PREFS,MODE_PRIVATE); String title=p.getString("last_title","Kurani"); ((TextView)findViewById(R.id.continueTitle)).setText("Vazhdo: "+title); }

  private int dp(int n){ return Math.round(n*getResources().getDisplayMetrics().density); }
}
