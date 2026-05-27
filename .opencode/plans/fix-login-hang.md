# Fix Login Hang — Implementation Plan

## Problem
Login hangs on "Ingresando..." because backend never sends response after issuing JWT token. The non-standard `spring-boot-starter-webmvc` dependency (instead of `spring-boot-starter-web`) likely prevents `HttpMessageConvertersAutoConfiguration` from properly registering `MappingJackson2HttpMessageConverter`, so the response body is never serialized/written.

## Changes

### 1. `pom.xml:55` — Fix dependency name
Change `spring-boot-starter-webmvc` → `spring-boot-starter-web`

### 2. `JacksonConfig.java:14-19` — Use Jackson2ObjectMapperBuilder
Replace `new ObjectMapper()` manual construction with `Jackson2ObjectMapperBuilder` to preserve Spring Boot's auto-configuration defaults:

```java
@Bean
ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
    return builder
            .modules(new JavaTimeModule())
            .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();
}
```

### 3. `src/main/java/.../controller/AuthController.java` — Already fixed
Return type changed from `ResponseEntity<AuthTokenResponse>` to `AuthTokenResponse`. No further change needed.

### 4. `frontend/src/app/interceptors/auth.interceptor.ts` — Skip old token on login
Prevent the `AuthInterceptor` from sending the stale JWT token on `/auth/login` requests, eliminating `BearerTokenAuthenticationFilter` interference:

```typescript
intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.getToken();
    if (token && !req.url.includes('/auth/login')) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
```

## Verification
1. `./mvnw test` — all 7 tests must pass
2. `./mvnw spring-boot:run` — backend starts on port 8080
3. `cd frontend && npm start` — frontend starts on port 4200
4. Login with any demo user → should navigate to role-based dashboard
