package com.example.ezzeta.data.service

import com.example.ezzeta.BuildConfig
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

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

    // Regex for standard email format
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
        "(?i)(?:instagram|ig|tiktok|facebook|fb|telegram|tg|messenger|snapchat|twitter|link en|sígueme|búscame|mi perfil|mi usuario|página|web|url|http|https)" +
        "(?:\\s|:)*" +
        "(?:@\\w+|[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}/\\S*|www\\.\\S*)",
        RegexOption.IGNORE_CASE
    )

    private val externalContactPhrases = listOf(
        "sígueme en", "escríbeme por", "contacta conmigo", "mi instagram", 
        "mi whatsapp", "búscame como", "link en mi bio", "contacto directo",
        "hablamos por", "escríbeme al", "trato directo"
    )

    suspend fun validateContent(text: String): ModerationResult {
        if (text.isBlank()) return ModerationResult.Allowed

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

        return validateWithNeutrino(text)
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
