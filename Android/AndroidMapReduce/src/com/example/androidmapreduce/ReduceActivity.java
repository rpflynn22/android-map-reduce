package com.example.androidmapreduce;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;

import android.app.Activity;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.Settings.Secure;
import android.view.Menu;

public class ReduceActivity extends Activity {
	
	public static final String SITE_URL = "http://android-map-reduce.herokuapp.com/";

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_reduce);
		final String android_id = Secure.getString(this.getContentResolver(),
                Secure.ANDROID_ID);
		boolean reduceInputAvailable = false;
		while (!reduceInputAvailable) {
			
		}
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.reduce, menu);
		return true;
	}
	
	private class getReduceData extends AsyncTask<String, Void, String> {
		public String doInBackground(String... args) {
			try {
    			String android_id = args[0];
            	String url = SITE_URL.concat("reduce-input?android_id=").concat(android_id);
            	URL obj = new URL(url);
        		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
        		con.setRequestMethod("GET");
        		BufferedReader in = new BufferedReader(
        		        new InputStreamReader(con.getInputStream()));
        		String inputLine;
        		StringBuffer response = new StringBuffer();
         
        		while ((inputLine = in.readLine()) != null) {
        			response.append(inputLine);
        		}
        		in.close();
        		if (response.toString().length() == 0) {
        			return null;
        		}
        		return response.toString();
        	} catch (MalformedURLException e) {
        		e.printStackTrace();
        	} catch (ProtocolException e) {
        		e.printStackTrace();
        	} catch (IOException e) {
        		e.printStackTrace();
        	}
    		return null;
		}
	}

	private class ReduceAnalytics extends AsyncTask<String, Void, Integer> {
		public Integer doInBackground(String... args) {
			String keyvals = args[0];
			String android_id = args[1];
			Map<String, Integer> finalMap = new HashMap<String, Integer>();
			String[] lines = keyvals.split("\n");
			for (String line : lines) {
				String[] wordCountListStr = line.split("\t");
				String word = wordCountListStr[0];
				String[] counts = wordCountListStr[1].split(" ");
				int sum = 0;
				for (String count : counts) {
					sum += Integer.parseInt(count);
				}
				finalMap.put(word, sum);
			}
			StringBuilder keyvalRepr = new StringBuilder();
			for (String key : finalMap.keySet()) {
				keyvalRepr.append(key);
				keyvalRepr.append("\t");
				keyvalRepr.append(Integer.toString(finalMap.get(key)));
				keyvalRepr.append("\n");
			}
			String url = SITE_URL.concat("reduce-response");
		    HttpClient client = new DefaultHttpClient();
		    HttpPost post = new HttpPost(url);
		    List<NameValuePair> pairs = new ArrayList<NameValuePair>();
		    pairs.add(new BasicNameValuePair("keyvals", keyvalRepr.toString()));
		    pairs.add(new BasicNameValuePair("android_id", android_id));
		    try {
				post.setEntity(new UrlEncodedFormEntity(pairs));
				HttpResponse response = client.execute(post);
				return response.getStatusLine().getStatusCode();
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			} catch (ClientProtocolException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		    return null;
		}
	}
}
