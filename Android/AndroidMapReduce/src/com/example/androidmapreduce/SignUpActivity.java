package com.example.androidmapreduce;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.concurrent.ExecutionException;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.Settings.Secure;
import android.view.Menu;
import android.view.View;
import android.widget.Button;

public class SignUpActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_up);
        final String android_id = Secure.getString(this.getContentResolver(),
                Secure.ANDROID_ID); 
        final Button b = (Button) findViewById(R.id.signUpButton);
        b.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
            	try {
            		int resp = new SignUp().execute(android_id).get();
            		b.setText(Integer.toString(resp));
            		Intent i = new Intent("com.example.androidmapreduce.ReadFileActivity");
            		startActivity(i);
            	} catch (ExecutionException e) {
            		e.printStackTrace();
            	} catch (InterruptedException e) {
            		e.printStackTrace();
            	}

            }
        });
    }
    
    private class SignUp extends AsyncTask<String, Void, Integer> {
    	public Integer doInBackground(String... id) {
    		try {
    			String android_id = id[0];
            	String url = "https://frozen-inlet-2844.herokuapp.com/signup?android_id=" + android_id;
            	URL obj = new URL(url);
        		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
        		con.setRequestMethod("GET");
        		int responseCode = con.getResponseCode();
        		return responseCode;
        	} catch (MalformedURLException e) {
        		e.printStackTrace();
        	} catch (ProtocolException e) {
        		e.printStackTrace();
        	} catch (IOException e) {
        		e.printStackTrace();
        	}
    		return -1;
        }
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.sign_up, menu);
        return true;
    }
    
}
