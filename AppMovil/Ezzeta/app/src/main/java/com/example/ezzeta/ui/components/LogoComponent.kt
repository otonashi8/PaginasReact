package com.example.ezzeta.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ezzeta.R

@Composable
fun EzzetaLogo(modifier: Modifier = Modifier, isDark: Boolean = false) {
    // Si los archivos logo_standard y logo_dark existen quitar el comentado
    /*
    val logoRes = if (isDark) R.drawable.logo_dark else R.drawable.logo_standard
    Image(
        painter = painterResource(id = logoRes),
        contentDescription = "EZZETA Logo",
        modifier = modifier.height(40.dp)
    )
    */

    // Mientras no estén las imágenes, usamos este logo dinámico basado en texto
    Text(
        text = "EZZETA",
        color = if (isDark) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.primary,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Black,
        modifier = modifier
    )
}
