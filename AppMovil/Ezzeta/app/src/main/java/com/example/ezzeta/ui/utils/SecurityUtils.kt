package com.example.ezzeta.ui.utils

import java.security.SecureRandom
import java.security.spec.KeySpec
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import android.util.Base64

object SecurityUtils {
    private const val ALGORITHM = "PBKDF2WithHmacSHA256"
    private const val ITERATIONS = 10000
    private const val KEY_LENGTH = 256
    private const val SALT_LENGTH = 16

    fun hashPassword(password: String): String {
        val random = SecureRandom()
        val salt = ByteArray(SALT_LENGTH)
        random.nextBytes(salt)

        val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH)
        val factory = SecretKeyFactory.getInstance(ALGORITHM)
        val hash = factory.generateSecret(spec).encoded

        val saltBase64 = Base64.encodeToString(salt, Base64.NO_WRAP)
        val hashBase64 = Base64.encodeToString(hash, Base64.NO_WRAP)

        return "PBKDF2\$$ITERATIONS\$$saltBase64\$$hashBase64"
    }

    fun verifyPassword(password: String, storedHash: String): Boolean {
        return try {
            val parts = storedHash.split("\$")
            if (parts.size != 4 || parts[0] != "PBKDF2") return false

            val iterations = parts[1].toInt()
            val salt = Base64.decode(parts[2], Base64.NO_WRAP)
            val hash = Base64.decode(parts[3], Base64.NO_WRAP)

            val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, iterations, KEY_LENGTH)
            val factory = SecretKeyFactory.getInstance(ALGORITHM)
            val testHash = factory.generateSecret(spec).encoded

            testHash.contentEquals(hash)
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
