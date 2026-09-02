export interface ChatMessage {
  id: number;
  sender: "bot" | "user";
  text: string;
  date: string;
}

export const chatbotResponses = {
  welcome: `Hola 👋

Soy el asistente virtual de Ezzeta.

Estoy aquí para ayudarte con productos, pedidos, métodos de pago, envíos y nuestro programa de membresías.

¿En qué puedo ayudarte hoy?`,

  // ===== Productos =====
  products: `Puedes explorar todas nuestras prendas desde la sección Tienda.

Utiliza el buscador para encontrar productos por nombre, categoría o subcategoría.

También puedes añadir productos a Favoritos ❤️ para revisarlos más tarde.`,

  availability: `Todos los productos muestran las tallas disponibles dentro de su ficha.

Si una talla no aparece, significa que actualmente no se encuentra disponible.`,

  sizes: `Cada producto cuenta con sus tallas disponibles.

Si tienes dudas sobre cuál elegir, puedes revisar la información del producto antes de comprar.`,

  // ===== Envíos =====
  shipping: `Realizamos envíos a todo el Perú 🇵🇪.

🚚 Compras mayores a cierto número tienen envío gratuito.

El costo del envío se calcula automáticamente durante el proceso de compra.`,

  // ===== Pagos =====
  payment: `Aceptamos los siguientes métodos de pago:

💳 Tarjeta (Mercado Pago)
📱 Yape

Todos los pagos se realizan mediante un proceso seguro.`,


  // ===== Contacto =====
  advisor: `Si necesitas ayuda personalizada, uno de nuestros asesores podrá ayudarte mediante WhatsApp.`,

  // ===== Carrito =====
  cart: `Desde el carrito puedes:

• Modificar cantidades.
• Cambiar la talla.
• Eliminar productos.
• Continuar con el proceso de pago.
• Suscribirte al programa mayorista.`,

  // ===== Favoritos =====
  wishlist: `Puedes guardar tus productos favoritos ❤️ y compartir tu lista mediante un enlace.`,

  // ===== Horario =====
  schedule: `Nuestro canal de atención está disponible de lunes a sábado.

Si nos escribes fuera del horario de atención, responderemos lo antes posible.`,

  // ===== Devoluciones =====
  returns: `Si tienes algún inconveniente con tu compra, comunícate con uno de nuestros asesores para revisar tu caso y brindarte una solución.`,

  // ===== Gracias =====
  thanks: `¡Con gusto! 😊

Si necesitas algo más, aquí estaré para ayudarte.`,

  // ===== Despedida =====
  goodbye: `¡Gracias por visitar Ezzeta!

Esperamos verte nuevamente muy pronto. 👋`,

  // ===== Error =====
  unknown: `No encontré una respuesta para esa consulta.

Puedes preguntarme sobre:

🛍️ Productos
🚚 Envíos
💳 Métodos de pago
❤️ Favoritos
🛒 Carrito

O si lo prefieres, puedes hablar directamente con uno de nuestros asesores por WhatsApp.`
};