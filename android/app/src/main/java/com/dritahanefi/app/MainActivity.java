package com.dritahanefi.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.GridLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
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
    super.onCreate(b);
    setTheme(R.style.AppTheme);
    setContentView(R.layout.activity_main);
    GridLayout list=findViewById(R.id.sectionGrid);
    for(String[] s:SECTIONS) list.addView(card(s[0],s[1],s[2]));
  }

  private View card(String title,String subtitle,String type){
    View v=getLayoutInflater().inflate(R.layout.item_section,null,false);
    ((TextView)v.findViewById(R.id.sectionTitle)).setText(title);
    ((TextView)v.findViewById(R.id.sectionSubtitle)).setText(subtitle);
    v.setOnClickListener(x->{
      Intent i=new Intent(this, "quran".equals(type)?QuranActivity.class:SectionActivity.class);
      i.putExtra("title",title); i.putExtra("type",type);
      startActivity(i);
    });
    GridLayout.LayoutParams lp=new GridLayout.LayoutParams();
    lp.width=0; lp.height=GridLayout.LayoutParams.WRAP_CONTENT; lp.columnSpec=GridLayout.spec(GridLayout.UNDEFINED,1f); lp.setMargins(dp(5),dp(5),dp(5),dp(5)); v.setLayoutParams(lp);
    return v;
  }

  private int dp(int n){ return Math.round(n*getResources().getDisplayMetrics().density); }
}
