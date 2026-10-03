package com.dritahanefi.app;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

public class SectionActivity extends Activity {
 @Override public void onCreate(Bundle b){
  super.onCreate(b);
  setTheme(R.style.AppTheme);
  setContentView(R.layout.activity_section);
  String title=getIntent().getStringExtra("title");
  String type=getIntent().getStringExtra("type");
  ((TextView)findViewById(R.id.sectionHeading)).setText(title==null?"Drita Hanefi":title);
  ((TextView)findViewById(R.id.sectionState)).setText("Duke u lidhur me bazën reale…");
  findViewById(R.id.backButton).setOnClickListener(v->finish());
  NativeRepository.load(type, this, (ok,message)->runOnUiThread(()->
    ((TextView)findViewById(R.id.sectionState)).setText(message)
  ));
 }
}
