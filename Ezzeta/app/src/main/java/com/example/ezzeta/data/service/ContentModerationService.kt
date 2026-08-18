package com.example.ezzeta.data.service

import com.example.ezzeta.BuildConfig
import com.example.ezzeta.data.model.BlockedWord
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.text.Normalizer

sealed class ModerationResult {
    object Allowed : ModerationResult()
    data class Blocked(val reason: String) : ModerationResult()
    object Error : ModerationResult()
}

object ContentModerationService {
    
    private val gson = Gson()

    private val phoneRegex = Regex(
        "(?i)(?:whatsapp|telf|teléfono|celular|cel|llama|escríbeme|contacto|wssp|wsp|vende|precio|info)?" +
        "(?:\\s|:)*" +
        "(?:\\+?51)?" +
        "(?:\\s|-|\\.)*" +
        "9\\d{2}(?:\\s|-|\\.)*\\d{3}(?:\\s|-|\\.)*\\d{3}",
        RegexOption.IGNORE_CASE
    )

    // Regex formato email
    private val emailRegex = Regex(
        "[a-zA-Z0-9+._%-+]{1,256}" +
        "@" +
        "[a-zA-Z0-9][a-zA-Z0-9-]{0,64}" +
        "(" +
        "\\." +
        "[a-zA-Z0-9][a-zA-Z0-9-]{0,25}" +
        ")+"
    )

    private val socialMediaRegex = Regex(
        "(?i)(?:of|onlyfans|redes|solo fans|instagram|ig|tiktok|facebook|fb|telegram|tg|messenger|snapchat|twitter|link en|sígueme|búscame|mi perfil|mi usuario|página|web|url|http|https)" +
        "(?:\\s|:)*" +
        "(?:@\\w+|[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}/\\S*|www\\.\\S*)",
        RegexOption.IGNORE_CASE
    )

    private val externalContactPhrases = listOf(
        "sígueme en", "escríbeme por", "contacta conmigo", "mi instagram",
        "mi whatsapp", "búscame como", "link en mi bio", "contacto directo",
        "hablamos por", "escríbeme al", "trato directo", "mejor atención", "tambien en",
        "disponible en","para mas detalles", "sigueme por", "enlace directo"
    )

    suspend fun validateContent(text: String, localBlockedWords: List<BlockedWord> = emptyList()): ModerationResult {
        if (text.isBlank()) return ModerationResult.Allowed

        // 1. Moderación Local
        if (containsBlockedWord(text, localBlockedWords)) {
            return ModerationResult.Blocked("El contenido contiene términos no permitidos. Modifica el texto e inténtalo nuevamente.")
        }

        // 2. Moderación por Reglas
        if (phoneRegex.containsMatchIn(text)) {
            return ModerationResult.Blocked("No se permite incluir números de teléfono en campos públicos.")
        }

        if (emailRegex.containsMatchIn(text)) {
            return ModerationResult.Blocked("No se permite incluir correos electrónicos en campos públicos.")
        }

        if (socialMediaRegex.containsMatchIn(text)) {
            return ModerationResult.Blocked("No se permiten enlaces o nombres de usuario de redes sociales.")
        }

        val lowercaseText = text.lowercase()
        if (externalContactPhrases.any { phrase -> lowercaseText.contains(phrase) }) {
            return ModerationResult.Blocked("No se permite redirigir el contacto fuera de la aplicación.")
        }

        // 3. Moderación Externa (Neutrino)
        return validateWithNeutrino(text)
    }

    private fun containsBlockedWord(text: String, blockedWords: List<BlockedWord>): Boolean {
        if (blockedWords.isEmpty()) return false
        
        val normalizedText = normalizeText(text)
        
        return blockedWords.any { blocked ->
            val normalizedBlocked = normalizeText(blocked.word)
            if (blocked.isPartialMatch) {
                normalizedText.contains(normalizedBlocked)
            } else {
                // Coincidencia exacta de palabra (usando boundaries para evitar falsos positivos)
                // Usamos Regex con \b para detectar límites de palabra.
                // Sin embargo, Normalizer puede afectar los límites si no se tiene cuidado.
                // Para una validación robusta y simple de "palabra exacta":
                val regex = Regex("\\b${Regex.escape(normalizedBlocked)}\\b", RegexOption.IGNORE_CASE)
                regex.containsMatchIn(normalizedText)
            }
        }
    }

    private fun normalizeText(text: String): String {
        return Normalizer.normalize(text, Normalizer.Form.NFD)
            .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
            .lowercase()
    }

    private suspend fun validateWithNeutrino(text: String): ModerationResult = withContext(Dispatchers.IO) {
        val userId = BuildConfig.NEUTRINO_USER_ID
        val apiKey = BuildConfig.NEUTRINO_API_KEY

        if (userId.isBlank() || apiKey.isBlank()) {
            return@withContext ModerationResult.Allowed 
        }

        try {
            val endpoint = "https://neutrinoapi.net/bad-word-filter"
            val params = "content=${URLEncoder.encode(text, "UTF-8")}&catalog=strict"
            val url = URL(endpoint)
            val connection = url.openConnection() as HttpURLConnection
            
            connection.requestMethod = "POST"
            connection.setRequestProperty("User-ID", userId)
            connection.setRequestProperty("Api-Key", apiKey)
            connection.doOutput = true
            
            connection.outputStream.use { it.write(params.toByteArray()) }

            if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val result = gson.fromJson(response, NeutrinoResponse::class.java)
                
                if (result.isBad) {
                    ModerationResult.Blocked("El contenido contiene palabras no permitidas: ${result.badWordsList.joinToString(", ")}")
                } else {
                    ModerationResult.Allowed
                }
            } else {
                ModerationResult.Error
            }
        } catch (e: Exception) {
            e.printStackTrace()
            ModerationResult.Error
        }
    }

    private data class NeutrinoResponse(
        val isBad: Boolean,
        val badWordsList: List<String>,
        val badWordsCount: Int
    )
}
