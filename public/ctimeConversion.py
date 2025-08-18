from datetime import datetime, timedelta, timezone

# Your timestamp in milliseconds
timestamp_ms = 1754976197632

# Convert milliseconds to seconds (float to keep milliseconds)
timestamp_sec = timestamp_ms / 1000

# Create a UTC datetime object from the timestamp
dt_utc = datetime.fromtimestamp(timestamp_sec, tz=timezone.utc)

# Define Sri Lanka timezone (UTC+5:30)
sl_timezone = timezone(timedelta(hours=5, minutes=30))

# Convert UTC datetime to Sri Lanka time
dt_sl = dt_utc.astimezone(sl_timezone)

# Format datetime with milliseconds
formatted_time = dt_sl.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]  # remove last 3 digits of microseconds to get milliseconds

print("Timestamp (ms):", timestamp_ms)
print("Sri Lanka time:", formatted_time)
