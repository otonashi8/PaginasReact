package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.data.model.Order
import com.example.ezzeta.data.model.User
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale

@Composable
fun AdminCustomerDetailView(
    user: User,
    viewModel: MainViewModel,
    onClose: () -> Unit
) {
    val orders = remember(user) { viewModel.getCustomerOrders(user.uuid.ifBlank { user.email ?: "" }) }
    val totalSpent = remember(orders) { orders.sumOf { it.total } }
    val avgTicket = if (orders.isNotEmpty()) totalSpent / orders.size else 0.0
    
    val userPlan = remember(user) { viewModel.advantagePlans.value.find { it.id == user.currentPlanId } }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "Detalle del Cliente", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            IconButton(onClick = onClose) { Icon(Icons.Default.Close, contentDescription = "Cerrar") }
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                DetailCard("DATOS DEL CLIENTE") {
                    InfoRow(Icons.Default.Person, "Nombre", user.alias.ifBlank { "Sin nombre" })
                    InfoRow(Icons.Default.Email, "Correo", user.email ?: "No registrado")
                    InfoRow(Icons.Default.Phone, "Teléfono", user.phone ?: "No registrado")
                    InfoRow(Icons.Default.Badge, "DNI/RUC", user.dniRuc ?: "No registrado")
                    InfoRow(Icons.Default.Groups, "Tipo", if (user.isGuest) "Invitado" else "Registrado")
                    InfoRow(
                        icon = if (user.isActive) Icons.Default.CheckCircle else Icons.Default.Cancel,
                        label = "Estado",
                        value = if (user.isActive) "Activo" else "Inactivo",
                        valueColor = if (user.isActive) Color(0xFF2E7D32) else Color.Red
                    )
                }
            }

            item {
                DetailCard("PLAN") {
                    InfoRow(Icons.Default.Stars, "Plan actual", userPlan?.name ?: "Sin plan")
                    user.subscriptionEndDate?.let {
                        val dateStr = java.text.SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(java.util.Date(it))
                        InfoRow(Icons.Default.Event, "Vencimiento", dateStr)
                    }
                    InfoRow(Icons.Default.Autorenew, "Renovación", if (user.isAutoRenewalEnabled) "Activada" else "Desactivada")
                }
            }

            item {
                DetailCard("RESUMEN") {
                    SummaryItem("Aporte total", "S/ ${String.format(Locale.US, "%.2f", totalSpent)}", MaterialTheme.colorScheme.primary)
                    SummaryItem("Pedidos realizados", orders.size.toString(), MaterialTheme.colorScheme.secondary)
                    SummaryItem("Ticket promedio", "S/ ${String.format(Locale.US, "%.2f", avgTicket)}", Color.Gray)
                }
            }

            item {
                Text(text = "PEDIDOS (${orders.size})", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }

            items(orders) { order ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = order.id, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                            Text(text = order.date, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                        }
                        Text(text = "${order.items.size} productos", style = MaterialTheme.typography.bodySmall)
                        Row(modifier = Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "Total: S/ ${String.format(Locale.US, "%.2f", order.total)}", fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                            Text(text = order.orderStatus, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
            content()
        }
    }
}

@Composable
private fun InfoRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String, valueColor: Color = Color.Unspecified) {
    Row(modifier = Modifier.padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp), tint = Color.Gray)
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(text = label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            Text(text = value, style = MaterialTheme.typography.bodyMedium, color = valueColor, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun SummaryItem(label: String, value: String, color: Color) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium)
        Text(text = value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Black, color = color)
    }
}
