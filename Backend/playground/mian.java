package playground;


import java.net.*;
import java.io.*;
import java.util.*;
import java.security.*;
import javax.crypto.*;
import javax.crypto.spec.*;

public class mian {
    public static void main(String[] args) {
        try {
            // Your API endpoint
            String url = "https://www.soliscloud.com:13333/v1/api/inverterDetail";

            // Your API credentials and request details
            String api_id = "1300319277300393317";
            String method = "POST";
            String content_md5 = "Q82RpRcU9eSFLeOr3I6M7w==";
            String content_type = "application/json";
            String date = "Tue, 05 Mar 2024 10:03:18 GMT"; // Should be current date and time in GMT

            // Request body
            String request_body = "{\"id\": \"2203049057\", \"sn\": \"233293756\"}";


            String signature = "My0C+CjqVhplfUMaPqWWdyuVNIA=";

            // Prepare headers
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-MD5", content_md5);
            headers.put("Content-Type", content_type);
            headers.put("Date", date);
            headers.put("Authorization", "API " + api_id + ":" + signature);
            headers.put("User-Agent", "Apache-HttpClient/4.5.13 (Java/11.0.17)");

            // Make the request
            URL obj = new URL(url);
            HttpURLConnection con = (HttpURLConnection) obj.openConnection();
            con.setRequestMethod("POST");
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                con.setRequestProperty(entry.getKey(), entry.getValue());
            }

            // Send post request
            con.setDoOutput(true);
            DataOutputStream wr = new DataOutputStream(con.getOutputStream());
            wr.writeBytes(request_body);
            wr.flush();
            wr.close();

            int responseCode = con.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
                String inputLine;
                StringBuffer response = new StringBuffer();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                // Print result
                System.out.println("Success:");
                System.out.println(response.toString());
            } else {
                System.out.println("POST request failed with response code: " + responseCode);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

