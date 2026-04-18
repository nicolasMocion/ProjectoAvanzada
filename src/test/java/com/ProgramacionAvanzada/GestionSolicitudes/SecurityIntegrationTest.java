package com.ProgramacionAvanzada.GestionSolicitudes;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldIssueJwtAndUseItOnProtectedEndpoints() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "operador.demo@example.com",
                                  "password": "CambioSeguro123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        JsonNode body = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = body.get("accessToken").asText();

        mockMvc.perform(post("/sugerencias/clasificar")
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content("""
                                {
                                  "descripcion": "Necesito cupo urgente para una asignatura."
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestedType").isNotEmpty())
                .andExpect(jsonPath("$.suggestedPriority").isNotEmpty());
    }

    @Test
    void shouldRejectProtectedEndpointsWithoutJwt() throws Exception {
        mockMvc.perform(post("/sugerencias/clasificar")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "descripcion": "Consulta general."
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }
}
