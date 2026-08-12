package com.example.ezzeta.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: MainViewModel,
    onHistoryClick: () -> Unit,
    onOrdersClick: () -> Unit,
    onFollowingClick: () -> Unit,
    onAffiliateClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onCustomerServiceClick: () -> Unit,
    onSingleProductClick: () -> Unit,
    onAddressBookClick: () -> Unit,
    onLoginClick: () -> Unit,
    onMyProductsClick: () -> Unit
) {
    val user by viewModel.currentUser.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val context = LocalContext.current

    var showEditAliasDialog by remember { mutableStateOf(false) }
    var newAlias by remember { mutableStateOf(user?.alias ?: "") }
    
    var showSettingsSheet by remember { mutableStateOf(false) }
    var showTermsDialog by remember { mutableStateOf(false) }
    var showPrivacyDialog by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    if (showSettingsSheet) {
        ModalBottomSheet(
            onDismissRequest = { showSettingsSheet = false },
            sheetState = sheetState,
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            SettingsMenuContent(
                onNavigate = { url ->
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    context.startActivity(intent)
                },
                onTermsClick = {
                    showSettingsSheet = false
                    showTermsDialog = true
                },
                onPrivacyClick = {
                    showSettingsSheet = false
                    showPrivacyDialog = true
                },
                onAddressBookClick = {
                    showSettingsSheet = false
                    onAddressBookClick()
                }
            )
        }
    }

    if (showTermsDialog) {
        TermsAndConditionsDialog(onDismiss = { showTermsDialog = false })
    }

    if (showPrivacyDialog) {
        PrivacyPolicyDialog(onDismiss = { showPrivacyDialog = false })
    }

    if (showEditAliasDialog) {
        AlertDialog(
            onDismissRequest = { showEditAliasDialog = false },
            title = { Text("Editar Alias") },
            text = {
                OutlinedTextField(
                    value = newAlias,
                    onValueChange = { newAlias = it },
                    label = { Text("Nuevo Alias") },
                    singleLine = true
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    if (newAlias.isNotBlank()) {
                        viewModel.updateAlias(context, newAlias)
                        showEditAliasDialog = false
                    }
                }) {
                    Text("Guardar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditAliasDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            Text(
                text = "Mi Perfil",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(16.dp)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Box(
                    modifier = Modifier.size(100.dp).clip(CircleShape).background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(60.dp))
                }
                
                Text(
                    text = user?.alias ?: "Usuario",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 16.dp)
                )
                
                Row(
                    modifier = Modifier.padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { 
                            newAlias = user?.alias ?: ""
                            showEditAliasDialog = true 
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            contentColor = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    ) {
                        Text("Editar alias")
                    }

                    if (user?.isGuest == true) {
                        Button(
                            onClick = onLoginClick,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            )
                        ) {
                            Text("Iniciar sesión / Registro")
                        }
                    } else {
                        Button(
                            onClick = { 
                                viewModel.logout(context)
                                onLoginClick()
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error,
                                contentColor = MaterialTheme.colorScheme.onError
                            )
                        ) {
                            Text("Cerrar Sesión")
                        }
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(16.dp)) }

            item {
                Surface(
                    onClick = {
                        if (user?.isGuest == false) {
                            onSingleProductClick()
                        } else {
                            scope.launch {
                                val result = snackbarHostState.showSnackbar(
                                    message = "Debes iniciar sesión para vender productos",
                                    actionLabel = "Ir al Login",
                                    duration = SnackbarDuration.Short
                                )
                                if (result == SnackbarResult.ActionPerformed) {
                                    onLoginClick()
                                }
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.tertiaryContainer
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AddPhotoAlternate, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Vender mis productos",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Publica un producto para que otros lo compren.",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(16.dp)) }

            item {
                Surface(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.DarkMode, contentDescription = null)
                        Text(
                            text = "Modo Oscuro",
                            modifier = Modifier.padding(start = 16.dp).weight(1f),
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Switch(
                            checked = isDarkTheme,
                            onCheckedChange = { viewModel.toggleTheme(context) }
                        )
                    }
                }
            }
            
            item { ProfileMenuItem(icon = Icons.Default.ShoppingBag, title = "Mis pedidos", onClick = onOrdersClick) }
            item { ProfileMenuItem(icon = Icons.Default.Inventory, title = "Mis productos", onClick = onMyProductsClick) }
            item { ProfileMenuItem(icon = Icons.Default.Favorite, title = "Lista de Deseos", onClick = onWishlistClick) }
            item { ProfileMenuItem(icon = Icons.Default.History, title = "Historial", onClick = onHistoryClick) }
            item { ProfileMenuItem(icon = Icons.Default.People, title = "Siguiendo", onClick = onFollowingClick) }
            item { ProfileMenuItem(icon = Icons.Default.Stars, title = "Affiliate & Creator", onClick = onAffiliateClick) }
            item { 
                ProfileMenuItem(
                    icon = Icons.Default.TrendingUp, 
                    title = "Inversiones", 
                    onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://pabloezzeta.pe/club/"))
                        context.startActivity(intent)
                    }
                ) 
            }
            item { 
                ProfileMenuItem(
                    icon = Icons.Default.SupportAgent, 
                    title = "Servicio al cliente",
                    onClick = onCustomerServiceClick
                ) 
            }
            item { 
                ProfileMenuItem(
                    icon = Icons.Default.Settings, 
                    title = "Configuración",
                    onClick = { showSettingsSheet = true }
                ) 
            }
        }
    }
}

@Composable
fun SettingsMenuContent(
    onNavigate: (String) -> Unit, 
    onTermsClick: () -> Unit, 
    onPrivacyClick: () -> Unit,
    onAddressBookClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "Configuración",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        SettingsItem(Icons.Default.LocationOn, "Libreta de direcciones", onClick = onAddressBookClick)
        SettingsItem(Icons.Default.Payments, "Opciones de Pago")
        SettingsItem(Icons.Default.PrivacyTip, "Política de privacidad y cookies", onClick = onPrivacyClick)
        SettingsItem(Icons.Default.Description, "Términos y condiciones", onClick = onTermsClick)
        
        HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))
        
        Text(
            text = "Conéctate con nosotros",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        // --- Redes por Marca ---
        val fbIcon = "https://cdn-icons-png.flaticon.com/512/145/145802.png"
        val ytIcon = "https://cdn-icons-png.flaticon.com/512/174/174883.png"
        val igIcon = "https://static.vecteezy.com/system/resources/thumbnails/018/930/413/small/instagram-logo-instagram-icon-transparent-free-png.png"
        val tkIcon = "https://cdn-icons-png.flaticon.com/512/3046/3046121.png"

        val ezzetaLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH6deP4ow_WolSBvxrJ6teDeWoWJlrlVldNHKol04TYJ5YfS5W7nw-rpXG&s=10"
        val crepanteLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3zQmT4V-w98N5ZK4s3xDh6KVhf7PO6JZBZUW03tF1MA&s=10"
        val maxetaLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxc1FrAjCDilMinzGvdINO5l4LS8QhwI2DWjNLnO9wkJY4TqvxUcNLie7_&s=10"
        val uomoLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNlxm0vLmPWcDXKI3qtD_OWlT4a7P6rXQB2PMt2ExjnAC7ZH4U91z4lGE&s=10"
        val t3x100Logo = "https://3x100.pe/wp-content/uploads/2026/01/LOGO-3X100.png"

        BrandSocialsSection(
            brandName = "Ezzeta Company",
            brandLogoUrl = ezzetaLogo,
            onNavigate = onNavigate,
            socials = listOf(
                SocialInfo("Facebook", "https://www.facebook.com/Ezzetacompany", fbIcon, Color(0xFF1877F2)),
                SocialInfo("Instagram", "https://www.instagram.com/ezzetacompany", igIcon, Color(0xFFE4405F)),
                SocialInfo("TikTok", "https://www.tiktok.com/@ezzetacompany", tkIcon, Color(0xFF000000)),
                SocialInfo("YouTube", "https://www.youtube.com/@Pabloezzeta", ytIcon, Color(0xFFFF0000))
            )
        )
        
        BrandSocialsSection(
            brandName = "3x100",
            brandLogoUrl = t3x100Logo,
            onNavigate = onNavigate,
            socials = listOf(
                SocialInfo("Facebook", "https://www.facebook.com/people/3X100/61584965300866/", fbIcon, Color(0xFF1877F2)),
                SocialInfo("Instagram", "https://www.instagram.com/3x100.pe/#", igIcon, Color(0xFFE4405F)),
                SocialInfo("TikTok", "https://www.tiktok.com/@3x100.pe?_r=1", tkIcon, Color(0xFF000000))
            )
        )
        
        BrandSocialsSection(
            brandName = "Crepante",
            brandLogoUrl = crepanteLogo,
            onNavigate = onNavigate,
            socials = listOf(
                SocialInfo("Facebook", "https://www.facebook.com/p/Crepante-100085842814872/", fbIcon, Color(0xFF1877F2)),
                SocialInfo("Instagram", "https://www.instagram.com/crepante/?hl=es-la", igIcon, Color(0xFFE4405F)),
                SocialInfo("TikTok", "https://www.tiktok.com/@crepante.store0", tkIcon, Color(0xFF000000))
            )
        )
        
        BrandSocialsSection(
            brandName = "Maxeta",
            brandLogoUrl = maxetaLogo,
            onNavigate = onNavigate,
            socials = listOf(
                SocialInfo("Facebook", "https://www.facebook.com/maxeta.peru", fbIcon, Color(0xFF1877F2)),
                SocialInfo("Instagram", "https://www.instagram.com/maxeta.pe/", igIcon, Color(0xFFE4405F)),
                SocialInfo("TikTok", "https://www.tiktok.com/@maxeta.pe", tkIcon, Color(0xFF000000))
            )
        )
        
        BrandSocialsSection(
            brandName = "Uomo Cattivo",
            brandLogoUrl = uomoLogo,
            onNavigate = onNavigate,
            socials = listOf(
                SocialInfo("Facebook", "https://web.facebook.com/p/UOMO-Cattivo-61552419367774", fbIcon, Color(0xFF1877F2)),
                SocialInfo("Instagram", "https://www.instagram.com/uomocattivo_/", igIcon, Color(0xFFE4405F)),
                SocialInfo("TikTok", "https://www.tiktok.com/@uomocattivo", tkIcon, Color(0xFF000000))
            )
        )
        
        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun SettingsItem(icon: ImageVector, title: String, onClick: () -> Unit = {}) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(24.dp))
            Text(
                text = title,
                modifier = Modifier.padding(start = 16.dp),
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

@Composable
fun PrivacyPolicyDialog(onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                "POLÍTICA DE PRIVACIDAD Y COOKIES – EZZETACOMPANY",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxHeight(0.8f)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Última actualización: 22/07/2026\n",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold
                )
                
                TermsSection("1. Introducción", 
                    "En EzzetaCompany, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política describe cómo recopilamos, usamos y protegemos su información personal conforme a la Ley N° 29733.")
                
                TermsSection("2. Información que Recopilamos", 
                    "Recopilamos datos como nombre, alias, correo electrónico y datos de uso de la plataforma para mejorar su experiencia y gestionar nuestras operaciones comerciales.")
                
                TermsSection("3. Uso de Cookies", 
                    "Utilizamos cookies propias y de terceros para personalizar el contenido, ofrecer funciones de redes sociales y analizar el tráfico. Las cookies nos permiten recordar sus preferencias y mejorar la navegación.")
                
                TermsSection("4. Seguridad de los Datos", 
                    "Implementamos medidas técnicas y organizativas para proteger sus datos contra acceso no autorizado, alteración o pérdida.")
                
                TermsSection("5. Derechos del Usuario", 
                    "Usted puede ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) enviando una solicitud a nuestro canal de atención al cliente.")
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cerrar")
            }
        }
    )
}

@Composable
fun TermsAndConditionsDialog(onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                "TÉRMINOS Y CONDICIONES DE USO – EZZETACOMPANY",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxHeight(0.8f)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Última actualización: 22/07/2026\n",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold
                )
                
                TermsSection("1. Aceptación de los Términos y Condiciones", 
                    "Al registrarte, acceder o utilizar la aplicación web EzzetaCompany, aceptas íntegramente los presentes Términos y Condiciones de Uso. Si no estás de acuerdo con alguno de ellos, deberás abstenerte de utilizar la plataforma.")
                
                TermsSection("2. Objeto de la Plataforma", 
                    "EzzetaCompany es una aplicación web destinada a la administración de afiliados, creadores de contenido, campañas comerciales, ventas, comisiones, pagos y demás funcionalidades relacionadas con el ecosistema digital de la empresa.\nEl uso de la plataforma está sujeto a las condiciones establecidas en este documento y a la legislación peruana vigente.")
                
                TermsSection("3. Registro de Usuarios", 
                    "Para acceder a determinadas funcionalidades será necesario crear una cuenta proporcionando información completa, veraz y actualizada.\nEl usuario declara que:\n• La información proporcionada es verdadera.\n• Es responsable de mantenerla actualizada.\n• No utilizará identidades falsas o de terceros.\nEzzetaCompany podrá solicitar información adicional para validar la identidad del usuario cuando sea necesario.")
                
                TermsSection("4. Protección de Datos Personales", 
                    "El tratamiento de los datos personales se realiza conforme a:\nLey N.° 29733 - Ley de Protección de Datos Personales del Perú.\nDecreto Supremo N.° 003-2013-JUS, Reglamento de la Ley de Protección de Datos Personales.\nLos datos recopilados podrán utilizarse para:\n• Registro y autenticación de usuarios.\n• Gestión de afiliados y creadores.\n• Procesamiento de pagos y comisiones.\n• Atención al cliente.\n• Envío de notificaciones relacionadas con la plataforma.\n• Elaboración de reportes estadísticos internos.\nLos usuarios podrán ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición (Derechos ARCO).\nLa información personal no será comercializada ni compartida con terceros, salvo obligación legal o cuando sea indispensable para la prestación del servicio.")
                
                TermsSection("5. Uso Adecuado de la Plataforma", 
                    "El usuario se compromete a:\n• Utilizar la plataforma conforme a la legislación vigente.\n• No realizar actividades fraudulentas.\n• No intentar vulnerar la seguridad del sistema.\n• No utilizar robots, scripts o herramientas automatizadas para manipular la plataforma.\nEl incumplimiento podrá ocasionar la suspensión o cancelación inmediata de la cuenta.")
                
                TermsSection("6. Afiliados y Creadores", 
                    "La presentación de una solicitud para convertirse en afiliado o creador de contenido no implica su aceptación automática. EzzetaCompany podrá aprobar, rechazar o suspender la afiliación cuando detecte incumplimientos.")
                
                TermsSection("7. Comisiones y Pagos", 
                    "Las comisiones serán calculadas conforme a las políticas comerciales vigentes. Los pagos podrán verse afectados por cancelaciones, devoluciones, reembolsos o fraude.")
                
                TermsSection("8. Pagos Electrónicos", 
                    "Los pagos se procesan mediante proveedores externos. EzzetaCompany no almacena información confidencial de tarjetas bancarias.")
                
                TermsSection("9. Propiedad Intelectual", 
                    "Todo el contenido de la plataforma (Software, Código, Diseños, Logos, etc.) es propiedad de EzzetaCompany y está protegido por el Decreto Legislativo N.° 822.")
                
                TermsSection("10. Disponibilidad del Servicio", 
                    "EzzetaCompany realizará esfuerzos para mantener la disponibilidad, pero podrán producirse interrupciones por mantenimiento o fallas externas.")
                
                TermsSection("11. Seguridad de la Cuenta", 
                    "El usuario es responsable de mantener la confidencialidad de su contraseña y notificar cualquier acceso no autorizado.")
                
                TermsSection("12. Suspensión y Terminación", 
                    "La empresa podrá suspender cuentas en caso de fraude, incumplimiento o actividades ilícitas.")
                
                TermsSection("13. Limitación de Responsabilidad", 
                    "EzzetaCompany no será responsable por daños derivados del uso indebido, fallos de conexión o eventos de fuerza mayor.")
                
                TermsSection("14. Modificaciones de los Términos", 
                    "EzzetaCompany podrá modificar estos términos. Las modificaciones entrarán en vigor desde su publicación.")
                
                TermsSection("15. Legislación Aplicable y Jurisdicción", 
                    "Estos Términos se rigen por la legislación del Perú. Cualquier controversia será sometida a los jueces competentes del Perú.")
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cerrar")
            }
        }
    )
}

@Composable
fun TermsSection(title: String, content: String) {
    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = content,
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Justify
        )
    }
}

@Composable
fun BrandSocialsSection(brandName: String, brandLogoUrl: String, onNavigate: (String) -> Unit, socials: List<SocialInfo>) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        AsyncImage(
            model = brandLogoUrl,
            contentDescription = null,
            modifier = Modifier
                .size(45.dp)
                .clip(CircleShape)
                .background(Color.LightGray.copy(alpha = 0.2f)),
            contentScale = androidx.compose.ui.layout.ContentScale.Crop
        )
        Spacer(modifier = Modifier.width(12.dp))
        
        Text(
            text = brandName,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.weight(1f)
        )

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            socials.forEach { social ->
                if (social.hasFollowButton) {
                    Button(
                        onClick = { onNavigate(social.url) },
                        colors = ButtonDefaults.buttonColors(containerColor = social.color),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                        modifier = Modifier.height(28.dp)
                    ) {
                        AsyncImage(
                            model = social.iconUrl,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp).padding(end = 4.dp)
                        )
                        Text("Seguir", fontSize = 9.sp)
                    }
                } else {
                    IconButton(
                        onClick = { onNavigate(social.url) },
                        modifier = Modifier.size(28.dp)
                    ) {
                        AsyncImage(
                            model = social.iconUrl,
                            contentDescription = social.name,
                            modifier = Modifier.size(22.dp).clip(CircleShape)
                        )
                    }
                }
            }
        }
    }
}

data class SocialInfo(
    val name: String,
    val url: String,
    val iconUrl: String,
    val color: Color,
    val hasFollowButton: Boolean = false
)

@Composable
fun ProfileMenuItem(icon: ImageVector, title: String, onClick: () -> Unit = {}) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(24.dp))
            Text(
                text = title,
                modifier = Modifier.padding(start = 16.dp).weight(1f),
                style = MaterialTheme.typography.bodyLarge
            )
            Icon(Icons.Default.ChevronRight, contentDescription = null)
        }
    }
}
