package com.example.ezzeta.ui.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import com.example.ezzeta.data.model.Category
import java.util.Locale

object CommunicationsHelper {

    fun sendEmail(context: Context, email: String, subject: String, body: String) {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:")
            putExtra(Intent.EXTRA_EMAIL, arrayOf(email))
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, body)
        }
        try {
            context.startActivity(Intent.createChooser(intent, "Enviar con..."))
        } catch (e: Exception) {
            Toast.makeText(context, "No se encontró una aplicación de correo", Toast.LENGTH_SHORT).show()
        }
    }

    fun sendWhatsApp(context: Context, phoneNumber: String, text: String) {
        val uri = Uri.parse("https://wa.me/$phoneNumber?text=${Uri.encode(text)}")
        val intent = Intent(Intent.ACTION_VIEW, uri)
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "WhatsApp no está instalado", Toast.LENGTH_SHORT).show()
        }
    }

    fun formatWishlistText(wishlist: List<com.example.ezzeta.data.model.Product>): String {
        val productListText = wishlist.joinToString("\n") { product ->
            "- ${product.name}: S/ ${String.format(Locale.US, "%.2f", product.price)}"
        }
        return """
            *MI LISTA DE DESEOS EN EZZETA*
            
            $productListText
            
            ¡Mira estos productos increíbles!
        """.trimIndent()
    }
}
