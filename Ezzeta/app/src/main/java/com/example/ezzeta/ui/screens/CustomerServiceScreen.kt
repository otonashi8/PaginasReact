package com.example.ezzeta.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerServiceScreen(viewModel: MainViewModel, onBack: () -> Unit) {
    val context = LocalContext.current

    var showComplaintForm by remember { mutableStateOf(false) }
    var fullName by remember { mutableStateOf("") }
    var dni by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var itemType by remember { mutableStateOf("Bien") }
    var itemDescription by remember { mutableStateOf("") }
    var complaintType by remember { mutableStateOf("Reclamo") }
    var complaintDetail by remember { mutableStateOf("") }
    var proposedSolution by remember { mutableStateOf("") }
    var acceptedTerms by remember { mutableStateOf(false) }

    val isFormValid = fullName.isNotBlank() && dni.isNotBlank() && phone.isNotBlank() && 
                      email.isNotBlank() && itemDescription.isNotBlank() && 
                      complaintDetail.isNotBlank() && acceptedTerms

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Servicio al Cliente", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Text(
                "¿Cómo podemos ayudarte?",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ContactCard(
                    icon = Icons.AutoMirrored.Filled.Chat,
                    title = "WhatsApp",
                    subtitle = "Respuesta rápida",
                    color = Color(0xFF25D366),
                    modifier = Modifier.weight(1f)
                ) {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/51987654321"))
                    context.startActivity(intent)
                }
                
                ContactCard(
                    icon = Icons.Default.Email,
                    title = "Correo",
                    subtitle = "Consultas",
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.weight(1f)
                ) {
                    val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:pruebasjorge11@gmail.com"))
                    context.startActivity(intent)
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))

            // FAQ
            Text(
                "Preguntas Frecuentes",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            FAQItem(
                question = "¿Cómo puedo rastrear mi pedido?",
                answer = "Una vez que tu pedido sea despachado, recibirás un mensaje de confirmación por WhatsApp o correo con el número de seguimiento y el link de la transportadora."
            )
            FAQItem(
                question = "¿Cuáles son los métodos de pago?",
                answer = "Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, AMEX), además de pagos rápidos con Yape y transferencias bancarias."
            )
            FAQItem(
                question = "¿Cómo realizo un cambio o devolución?",
                answer = "Tienes hasta 7 días útiles para solicitar un cambio. El producto debe estar en perfectas condiciones y con las etiquetas originales. Contáctanos por WhatsApp para iniciar el proceso."
            )
            FAQItem(
                question = "¿Cuánto tiempo demora el envío?",
                answer = "En Lima metropolitana entregamos de 24 a 48 horas útiles. Para provincias, el tiempo estimado es de 3 a 5 días hábiles dependiendo del destino."
            )
            FAQItem(
                question = "¿Tienen tiendas físicas?",
                answer = "Somos una plataforma principalmente digital para ofrecerte los mejores precios, pero realizamos envíos a todo el Perú con total garantía."
            )

            Spacer(modifier = Modifier.height(40.dp))

            // LIBRO DE RECLAMACIONES
            Surface(
                onClick = { showComplaintForm = !showComplaintForm },
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.AutoMirrored.Filled.MenuBook, contentDescription = null, tint = Color.Gray)
                    Text(
                        text = "Libro de Reclamaciones Virtual",
                        modifier = Modifier.padding(horizontal = 16.dp).weight(1f),
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                    Icon(
                        if (showComplaintForm) Icons.Default.ExpandLess else Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = null,
                        tint = Color.Gray
                    )
                }
            }

            AnimatedVisibility(
                visible = showComplaintForm,
                enter = expandVertically(),
                exit = shrinkVertically()
            ) {
                Column(modifier = Modifier.padding(top = 24.dp)) {
                    Text(
                        text = "FORMULARIO DE RECLAMACIÓN",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "1. DATOS DEL CONSUMIDOR RECLAMANTE",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it },
                        label = { Text("Nombre completo*") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = dni,
                        onValueChange = { dni = it },
                        label = { Text("DNI*") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Telefono*") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Correo*") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(
                        text = "2. IDENTIFICACION DEL BIEN CONTRATADO",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Row(Modifier.selectableGroup()) {
                        RadioButtonRow(text = "Bien", selected = itemType == "Bien", onClick = { itemType = "Bien" })
                        Spacer(modifier = Modifier.width(16.dp))
                        RadioButtonRow(text = "Servicio", selected = itemType == "Servicio", onClick = { itemType = "Servicio" })
                    }
                    
                    OutlinedTextField(
                        value = itemDescription,
                        onValueChange = { itemDescription = it },
                        label = { Text("Descripción del bien o servicio*") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = "3. DETALLE DE LA RECLAMACIÓN O QUEJA",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Row(Modifier.selectableGroup()) {
                        RadioButtonRow(text = "Queja", selected = complaintType == "Queja", onClick = { complaintType = "Queja" })
                        Spacer(modifier = Modifier.width(16.dp))
                        RadioButtonRow(text = "Reclamo", selected = complaintType == "Reclamo", onClick = { complaintType = "Reclamo" })
                    }
                    
                    Text(
                        text = if (complaintType == "Queja") 
                            "Queja: malestar o descontento respecto a la atencion al publico" 
                        else 
                            "Reclamo: disconformidad relacionada con los productos o servicios",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                    
                    OutlinedTextField(
                        value = complaintDetail,
                        onValueChange = { complaintDetail = it },
                        label = { Text("Detalle de su reclamo o queja*") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = "4. PROPUESTA DE SOLUCIÓN",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = proposedSolution,
                        onValueChange = { proposedSolution = it },
                        label = { Text("¿Qué solución propone? (opcional)") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = "5. CLAUSULA DE ACEPTACION",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Declaro ser el titular de la informacion brindada en este formulario y acepto el tratamiento de mis datos personales conforme a la Ley N° 29733.",
                        style = MaterialTheme.typography.bodySmall,
                        textAlign = TextAlign.Justify
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 8.dp)
                    ) {
                        Checkbox(checked = acceptedTerms, onCheckedChange = { acceptedTerms = it })
                        Text(
                            text = "Acepto las condiciones y el tratamiento de mis datos",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                viewModel.sendComplaint(
                                    context, fullName, dni, phone, email, itemType, itemDescription,
                                    complaintType, complaintDetail, proposedSolution
                                )
                                onBack()
                            },
                            modifier = Modifier.weight(1f),
                            enabled = isFormValid,
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Por Correo", textAlign = TextAlign.Center)
                        }

                        Button(
                            onClick = {
                                viewModel.sendComplaintViaWhatsApp(
                                    context, fullName, dni, phone, email, itemType, itemDescription,
                                    complaintType, complaintDetail, proposedSolution
                                )
                                onBack()
                            },
                            modifier = Modifier.weight(1f),
                            enabled = isFormValid,
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
                        ) {
                            Text("Por WhatsApp", textAlign = TextAlign.Center)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    LegalNotesSection()
                }
            }
            
            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}

@Composable
fun ContactCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    color: Color,
    modifier: Modifier = Modifier,
    horizontal: Boolean = false,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray.copy(alpha = 0.3f)),
        shadowElevation = 2.dp
    ) {
        if (horizontal) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(color.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyLarge)
                    Text(subtitle, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                }
                Spacer(modifier = Modifier.weight(1f))
                Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null, tint = Color.LightGray)
            }
        } else {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(color.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text(title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                Text(subtitle, style = MaterialTheme.typography.labelSmall, color = Color.Gray, textAlign = TextAlign.Center)
            }
        }
    }
}

@Composable
fun FAQItem(question: String, answer: String) {
    var expanded by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded }
            .padding(vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = question,
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (expanded) FontWeight.Bold else FontWeight.Normal
            )
            Icon(
                imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = null,
                tint = if (expanded) MaterialTheme.colorScheme.primary else Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
        
        AnimatedVisibility(
            visible = expanded,
            enter = expandVertically(),
            exit = shrinkVertically()
        ) {
            Text(
                text = answer,
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray,
                modifier = Modifier.padding(top = 8.dp, end = 24.dp),
                lineHeight = 18.sp
            )
        }
        HorizontalDivider(modifier = Modifier.padding(top = 12.dp), thickness = 0.5.dp, color = Color.LightGray.copy(alpha = 0.5f))
    }
}

@Composable
fun RadioButtonRow(text: String, selected: Boolean, onClick: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .selectable(
                selected = selected,
                onClick = onClick,
                role = Role.RadioButton
            )
            .padding(vertical = 4.dp)
    ) {
        RadioButton(selected = selected, onClick = null)
        Text(text = text, modifier = Modifier.padding(start = 8.dp))
    }
}

@Composable
fun LegalNotesSection() {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "La formulación del reclamo no impide acudir a otra vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.",
            style = MaterialTheme.typography.bodySmall,
            fontSize = 10.sp,
            color = Color.Gray,
            textAlign = TextAlign.Justify
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "EZZETA COMPANY EIRL deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles. Este Plazo es improrrogable.",
            style = MaterialTheme.typography.bodySmall,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Justify
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Conforme a lo establecido en el código de protección y defensa del consumidor este establecimiento cuenta con un libro de reclamaciones virtual a tus disposición.",
            style = MaterialTheme.typography.bodySmall,
            fontSize = 10.sp,
            color = Color.Gray,
            textAlign = TextAlign.Justify
        )
    }
}
