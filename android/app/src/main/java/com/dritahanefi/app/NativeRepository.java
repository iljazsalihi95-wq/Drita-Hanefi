package com.dritahanefi.app;

import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public final class NativeRepository {
 private static final String API="https://script.google.com/macros/s/AKfycbyfIejtkg6R5d6Qc1pR8L1zj0eZ3eF8vZc1K0mP2aN4bX7yT9uW5sD3hJ6qG/exec";
 public interface Callback { void done(boolean ok,String message); }
 public static void load(String type, Context c, Callback cb){
  new Thread(()->{
   try{
    URL u=new URL(API+"?action=list&type="+java.net.URLEncoder.encode(type,"UTF-8")+"&limit=20");
    HttpURLConnection h=(HttpURLConnection)u.openConnection();
    h.setConnectTimeout(12000); h.setReadTimeout(16000); h.setRequestMethod("GET");
    BufferedReader r=new BufferedReader(new InputStreamReader(h.getInputStream()));
    StringBuilder s=new StringBuilder(); String line; while((line=r.readLine())!=null)s.append(line);
    r.close();
    JSONObject o=new JSONObject(s.toString());
    JSONArray a=o.optJSONArray("data");
    if(a==null) a=o.optJSONArray("items");
    int n=a==null?0:a.length();
    cb.done(true,n+" materiale u lexuan nga baza.");
   }catch(Exception e){ cb.done(false,"Lidhja me bazën dështoi: "+e.getClass().getSimpleName()); }
  }).start();
 }
 private NativeRepository(){}
}
