package com.ProgramacionAvanzada.GestionSolicitudes.security;

import com.ProgramacionAvanzada.GestionSolicitudes.config.JwtProperties;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public IssuedToken issueToken(ApplicationUserDetails userDetails) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(jwtProperties.accessTokenTtl());

        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
                .issuer(jwtProperties.issuer())
                .subject(userDetails.publicId())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .claim("email", userDetails.getUsername())
                .claim("name", userDetails.getUsuario().getNombre())
                .claim("role", userDetails.getUsuario().getRol().name())
                .claim("authorities", List.of("ROLE_" + userDetails.getUsuario().getRol().name()))
                .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
        String tokenValue = jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claimsSet)).getTokenValue();
        return new IssuedToken(tokenValue, expiresAt);
    }

    public record IssuedToken(String value, Instant expiresAt) {
    }
}
