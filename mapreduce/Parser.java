import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.net.*;
import java.io.*;

public class Parser {
    
    public static Map<String, Integer> mapper(String url) throws Exception {
        URL website = new URL(url);
        URLConnection connection = website.openConnection();
        BufferedReader in = new BufferedReader(
                                new InputStreamReader(
                                    connection.getInputStream()));
        StringBuilder response = new StringBuilder();
        String inputLine;
        while ((inputLine = in.readLine()) != null) 
            response.append(inputLine);
        in.close();
        String text = response.toString();
    	
    	String[] words = text.replaceAll("[^a-zA-Z ]", " ").toLowerCase().split("\\s+");
    	Map<String, Integer> map = new HashMap<String, Integer>();
    	for (String word : words) {
    	  Integer count = map.get(word);
    	  if (count == null) {
    	    map.put(word, 1);
    	  } else {
    	    map.put(word, count + 1);
    	  }
    	}
    	return map;
    }
    
    public static void main (String[] args) throws Exception {
    	for (Entry<String, Integer> entry: mapper("http://www.msn.com").entrySet()) {
    	    System.out.println(entry.getKey() + ":" + entry.getValue());
    	}  
    }  
}
