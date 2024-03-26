import java.time.*;
import java.time.format.*;

public class time {
    public static void main(String[] args) {
        // Set the timezone to GMT
        ZoneId gmt = ZoneId.of("GMT");
        
        // Get the current time in UTC
        ZonedDateTime nowUtc = ZonedDateTime.now(ZoneOffset.UTC);
        
        // Convert it to GMT time
        ZonedDateTime nowGmt = nowUtc.withZoneSameInstant(gmt);
        
        // Format the time to a string as per your requirement
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss z");
        String formattedTime = nowGmt.format(formatter);
        
        System.out.println(formattedTime);
    }
}
