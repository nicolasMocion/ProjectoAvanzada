package com.ProgramacionAvanzada.GestionSolicitudes;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
class UsuarioControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldAllowAdminToManageUsers() throws Exception {
        String adminToken = loginAndExtractToken("admin.demo@example.com", "CambioSeguro123!");

        MvcResult createResult = mockMvc.perform(post("/usuarios")
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", "Bearer " + adminToken)
                        .content("""
                                {
                                  "identificacion": "40000001",
                                  "nombre": "Docente Demo",
                                  "email": "docente.demo@example.com",
                                  "password": "CambioSeguro123!",
                                  "rol": "DOCENTE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("docente.demo@example.com"))
                .andExpect(jsonPath("$.activo").value(true))
                .andReturn();

        JsonNode createBody = objectMapper.readTree(createResult.getResponse().getContentAsString());
        String usuarioId = createBody.get("id").asText();

        mockMvc.perform(get("/usuarios")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").isNotEmpty())
                .andExpect(jsonPath("$[0].email").isNotEmpty());

        mockMvc.perform(patch("/usuarios/{id}/toggle-activo", usuarioId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false));
    }

    @Test
    void shouldRejectUserManagementForNonAdmin() throws Exception {
        String operadorToken = loginAndExtractToken("operador.demo@example.com", "CambioSeguro123!");

        mockMvc.perform(get("/usuarios")
                        .header("Authorization", "Bearer " + operadorToken))
                .andExpect(status().isForbidden());
    }

    private String loginAndExtractToken(String email, String password) throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        JsonNode loginBody = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return loginBody.get("accessToken").asText();
    }
}
