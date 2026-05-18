# Typhon Configuration

| Variable name       | Values     | Deescription                               |
|---------------------|------------|--------------------------------------------|
| ENABLE_INTERNAL_API | true/false | Enable the internal Gateway Management API |
| GATEWAY_HOST        | 0.0.0.0    | IP Address the gateway listens on          | 
| GATEWAY_PORT        | 5174       | Port the gateway listens on                |
| JWT_SECRET          |            | JWT Secret value for authentication        |
| LOG_LEVEL           | info       | Sets the minimum log level for logging     |
| MEMCACHED_URL       |            | Url of Memcached instance (if used)        |
| REDIS_STATS_STREAM  |            | Redis stream name for stats (If used)      |
| REDIS_URL           |            | Url of Redis instance (if used)            |
| SQLITE_PATH         |            | Filepath of Sqlite database (If used)      |
| STATS_BACKEND       | memory     | Backend used by stats                      |

The settings for Memcached, Redis, Sqlite are also used for other stores defined in the Manifest.
