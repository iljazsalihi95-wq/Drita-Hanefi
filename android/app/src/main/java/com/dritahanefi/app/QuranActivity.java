package com.dritahanefi.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.*;
import android.widget.*;

public class QuranActivity extends Activity {
 private Spinner surah,start,count,repeat; private LinearLayout verses; private TextView status,progress;
 private final String[] counts={"1","3","5","10"}, repeats={"1","3","5","10","20","∞"};
 @Override public void onCreate(Bundle b){super.onCreate(b);setTheme(R.style.AppTheme);setContentView(R.layout.activity_quran);
  surah=findViewById(R.id.surah);start=findViewById(R.id.startAyah);count=findViewById(R.id.groupCount);repeat=findViewById(R.id.repeatCount);verses=findViewById(R.id.verses);status=findViewById(R.id.quranStatus);progress=findViewById(R.id.hifzProgress);
  findViewById(R.id.quranBack).setOnClickListener(v->finish());count.setAdapter(adapter(counts));repeat.setAdapter(adapter(repeats));loadSurahs();findViewById(R.id.startHifz).setOnClickListener(v->renderGroup());
 }
 private ArrayAdapter<String> adapter(String[] a){return new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,a);}
 private void loadSurahs(){String[] n=new String[114];for(int i=0;i<114;i++)n[i]=(i+1)+". Sure";surah.setAdapter(adapter(n));surah.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener(){public void onNothingSelected(AdapterView<?>p){}public void onItemSelected(AdapterView<?>p,View v,int pos,long id){loadAyahSelector(pos+1);}});}
 private void loadAyahSelector(int s){int max=ayahCount(s);String[] a=new String[max];for(int i=0;i<max;i++)a[i]="Ajeti "+(i+1);start.setAdapter(adapter(a));status.setText("Kurani i hapur • Sure "+s+" • "+max+" ajete");renderGroup();}
 private int ayahCount(int s){int[]n={7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6};return n[s-1];}
 private void renderGroup(){int s=surah.getSelectedItemPosition()+1,a=start.getSelectedItemPosition()+1,c=Integer.parseInt(count.getSelectedItem().toString()),end=Math.min(ayahCount(s),a+c-1);verses.removeAllViews();progress.setText("Hifz • "+s+":"+a+"–"+end+" • "+repeat.getSelectedItem()+"×");
  for(int i=a;i<=end;i++){final int ay=i;LinearLayout card=new LinearLayout(this);card.setOrientation(LinearLayout.VERTICAL);card.setPadding(20,20,20,20);card.setBackgroundResource(R.drawable.native_card);TextView ref=new TextView(this);ref.setText("﴿ "+s+":"+i+" ﴾");ref.setTextColor(0xffe8c96d);ref.setTextSize(16);card.addView(ref);TextView ar=new TextView(this);ar.setText("Teksti i ajetit po lidhet me bazën 6236");ar.setGravity(Gravity.RIGHT);ar.setTextSize(25);ar.setTextColor(0xfffff4cf);ar.setPadding(0,14,0,14);card.addView(ar);LinearLayout links=new LinearLayout(this);links.setOrientation(LinearLayout.HORIZONTAL);String[][] bs={{"Tefsir","tefsir"},{"Hadith","hadith"},{"Fikh","fikh"},{"Akide","akide"},{"Texhvid","texhvid"},{"Esbab","quran"}};for(String[]x:bs){Button b=new Button(this);b.setText(x[0]);b.setTextSize(11);b.setAllCaps(false);b.setOnClickListener(v->open(x[1],s,ay));links.addView(b,new LinearLayout.LayoutParams(0,-2,1));}card.addView(links);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,-2);lp.setMargins(0,8,0,8);verses.addView(card,lp);}
 }
 private void open(String type,int s,int a){Intent i=new Intent(this,SectionActivity.class);i.putExtra("type",type);i.putExtra("surah",s);i.putExtra("ayah",a);i.putExtra("q",s+":"+a);startActivity(i);}
}