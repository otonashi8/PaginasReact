import { Mail, MessageCircle } from 'lucide-react'

export const canales = [
  {
    icon: Mail,
    label: 'Correo',
    value: 'Gerencia@vitaella.pe',
    href: 'mailto:Gerencia@vitaella.pe',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+51 973 340 715',
    href: 'https://wa.me/51973340715',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+51 903 424 479',
    href: 'https://wa.me/51903424479',
  },
]

export const ASUNTOS = ['Consulta general', 'Estado de mi pedido', 'Cambios y devoluciones', 'Alianzas y mayoristas', 'Otro'] as const
