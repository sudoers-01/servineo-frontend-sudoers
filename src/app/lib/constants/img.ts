// src/app/lib/constants/img.ts

/**
 * Configuración de Next.js requerida:
 * 
 * En next.config.ts o next.config.mjs agrega:
 * 
 * images: {
 *   remotePatterns: [
 *     {
 *       protocol: 'https',
 *       hostname: 'images.unsplash.com',
 *     },
 *   ],
 * }
 */

// Usando imágenes reales de Unsplash - Hasta 5 imágenes por categoría
export const categoryImages: { [key: string]: string[] } = {
  Albañil: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', // Construcción con ladrillos
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop', // Trabajador con paleta
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=400&fit=crop', // Mezcla de cemento
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop', // Obra en construcción
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop', // Trabajando en pared
  ],
  Carpintero: [
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&h=400&fit=crop', // Carpintero con madera
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop', // Herramientas de carpintería
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop', // Trabajando madera
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&h=400&fit=crop', // Taller de carpintería
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop', // Muebles de madera
  ],
  Fontanero: [
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop', // Tubería y herramientas
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop', // Reparación de cañería
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&h=400&fit=crop', // Fontanero trabajando
    'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600&h=400&fit=crop', // Instalación sanitaria
    'https://images.unsplash.com/photo-1635324799974-0059fa81d322?w=600&h=400&fit=crop', // Llaves y tuberías
  ],
  Electricista: [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop', // Panel eléctrico
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop', // Cables y conexiones
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop', // Herramientas eléctricas    
    'https://images.unsplash.com/photo-1581091870633-9b6c0a0ca4b7?w=600&h=400&fit=crop', // Medidor eléctrico
    'https://images.unsplash.com/photo-1581091870633-9b6c0a0ca4b7?w=600&h=400&fit=crop', // Cables eléctricos en primer plano
  ],
  Pintor: [
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop', // Pintando pared
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop', // Brochas y pintura
    'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=600&h=400&fit=crop', // Rodillo de pintura
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop', // Pintando interior
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&h=400&fit=crop', // Paleta de colores
  ],
  Soldador: [
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop', // Soldadura con chispas
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop', // Soldador trabajando
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop', // Trabajo con metal
    'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&h=400&fit=crop', // Herramientas de soldadura
    'https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600&h=400&fit=crop', // Estructura metálica
  ],
  Jardinero: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', // Jardín verde
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop', // Podando plantas
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop', // Herramientas de jardín
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&h=400&fit=crop', // Césped y plantas
    'https://images.unsplash.com/photo-1584479898061-15742e14f50d?w=600&h=400&fit=crop', // Mantenimiento de jardín
  ],
  Cerrajero: [
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&h=400&fit=crop', // Cerradura y llaves
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // Instalando cerradura
    'https://images.unsplash.com/photo-1586864387634-700a6097fca7?w=600&h=400&fit=crop', // Herramientas de cerrajero
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600&h=400&fit=crop', // Puerta con cerradura
    'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=600&h=400&fit=crop', // Llaves diversas
  ],
  Mecánico: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop', // Motor de auto
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=400&fit=crop', // Reparando vehículo
    'https://images.unsplash.com/photo-1632823469850-1017d9a1b28f?w=600&h=400&fit=crop', // Taller mecánico
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop', // Herramientas mecánicas
    'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600&h=400&fit=crop', // Diagnóstico de auto
  ],
  Vidriero: [
    'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600&h=400&fit=crop', // Vidrio y ventana
    'https://images.unsplash.com/photo-1593642532400-2682810df593?w=600&h=400&fit=crop', // Instalando vidrio
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop', // Cortando vidrio
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop', // Ventana de vidrio
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=400&fit=crop', // Trabajo con cristal
  ],
  Yesero: [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop', // Aplicando yeso
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop', // Alisando pared
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop', // Textura en pared
    'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&h=400&fit=crop', // Herramientas de yesería
    'https://images.unsplash.com/photo-1503594384566-461fe158e797?w=600&h=400&fit=crop', // Acabado de yeso
  ],
  Fumigador: [
    'https://images.unsplash.com/photo-1563207153-f403bf289096?w=600&h=400&fit=crop', // Equipo de fumigación
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop', // Fumigando jardín
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop', // Control de plagas
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&h=400&fit=crop', // Spray fumigador
    'https://images.unsplash.com/photo-1545450660-4010084f7063?w=600&h=400&fit=crop', // Protección ambiental
  ],
  Limpiador: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop', // Limpieza profesional
    'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=400&fit=crop', // Productos de limpieza
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop', // Limpiando espacio
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop', // Equipo de limpieza
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&h=400&fit=crop', // Oficina limpia
  ],
  Instalador: [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop', // Instalación general
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop', // Instalando equipo
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop', // Herramientas varias
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop', // Montaje técnico
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&h=400&fit=crop', // Instalación profesional
  ],
  Montador: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', // Montando estructura
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop', // Armando muebles
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&h=400&fit=crop', // Ensamblaje
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop', // Montaje industrial
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop', // Trabajo de montaje
  ],
  Decorador: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop', // Decoración interior
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600&h=400&fit=crop', // Diseño de espacios
    'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&h=400&fit=crop', // Decoración moderna
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop', // Sala decorada
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop', // Elementos decorativos
  ],
  Pulidor: [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop', // Puliendo superficie
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop', // Máquina pulidora
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop', // Acabado brillante
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=400&fit=crop', // Pulido de piso
    'https://images.unsplash.com/photo-1595814432314-90095f342694?w=600&h=400&fit=crop', // Superficie pulida
  ],
  Techador: [
    'https://images.unsplash.com/photo-1632416775768-598e0c25e3f6?w=600&h=400&fit=crop', // Techo en construcción
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', // Trabajando en techo
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop', // Instalación de techo
    'https://images.unsplash.com/photo-1597218868981-1b68e15f0065?w=600&h=400&fit=crop', // Tejas y techos
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=600&h=400&fit=crop', // Reparación de techo
  ],
  Default: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop', // Servicio general
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop', // Trabajo profesional
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', // Construcción
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop', // Herramientas
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop', // Servicio técnico
  ],

  // English translations (usando las mismas imágenes que español)
  Mason: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
  ],
  Carpenter: [
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop',
  ],
  Plumber: [
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1635324799974-0059fa81d322?w=600&h=400&fit=crop',
  ],
  Electrician: [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1621905252472-26fc26c82c9f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1594738793139-d3ff9e8c2e33?w=600&h=400&fit=crop',
  ],
  Painter: [
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&h=400&fit=crop',
  ],
  Welder: [
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600&h=400&fit=crop',
  ],
  Gardener: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1584479898061-15742e14f50d?w=600&h=400&fit=crop',
  ],
  Locksmith: [
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586864387634-700a6097fca7?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=600&h=400&fit=crop',
  ],
  Mechanic: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1632823469850-1017d9a1b28f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600&h=400&fit=crop',
  ],
  Glazier: [
    'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593642532400-2682810df593?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=400&fit=crop',
  ],
  Plasterer: [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503594384566-461fe158e797?w=600&h=400&fit=crop',
  ],
  Fumigator: [
    'https://images.unsplash.com/photo-1563207153-f403bf289096?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1545450660-4010084f7063?w=600&h=400&fit=crop',
  ],
  Cleaner: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&h=400&fit=crop',
  ],
  Installer: [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&h=400&fit=crop',
  ],
  Assembler: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
  ],
  Decorator: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop',
  ],
  Polisher: [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595814432314-90095f342694?w=600&h=400&fit=crop',
  ],
  Roofer: [
    'https://images.unsplash.com/photo-1632416775768-598e0c25e3f6?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1597218868981-1b68e15f0065?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=600&h=400&fit=crop',
  ],
};

/**
 * Obtiene imágenes para un trabajo basado en su ID y categoría
 * Maneja categorías en español e inglés automáticamente
 * Ahora selecciona aleatoriamente hasta 5 imágenes
 */
export const getImagesForJob = (
  jobId: string, 
  category?: string | null
): string[] => {
  // Si no hay categoría, usar Default
  if (!category || category.trim() === '') {
    console.warn(`⚠️ Categoría vacía para jobId: ${jobId}, usando Default`);
    const images = categoryImages['Default'];
    return selectRandomImages(jobId, images);
  }

  // Normalizar la categoría: quitar espacios y capitalizar
  const normalizedCategory = category.trim();
  
  // Intentar buscar directamente
  if (categoryImages[normalizedCategory]) {
    return selectRandomImages(jobId, categoryImages[normalizedCategory]);
  }

  // Intentar con primera letra mayúscula
  const capitalized = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1).toLowerCase();
  if (categoryImages[capitalized]) {
    return selectRandomImages(jobId, categoryImages[capitalized]);
  }

  // Intentar buscar en todas las claves ignorando mayúsculas/minúsculas
  const categoryKey = Object.keys(categoryImages).find(
    key => key.toLowerCase() === normalizedCategory.toLowerCase()
  );
  
  if (categoryKey) {
    return selectRandomImages(jobId, categoryImages[categoryKey]);
  }

  // Si todo falla, usar Default y mostrar warning
  console.warn(`⚠️ Categoría no encontrada: "${category}" para jobId: ${jobId}, usando Default`);
  return selectRandomImages(jobId, categoryImages['Default']);
};

/**
 * Selecciona entre 2-5 imágenes aleatorias basadas en el hash del jobId
 * para mantener consistencia entre renders
 */
function selectRandomImages(jobId: string, images: string[]): string[] {
  // Generar hash del jobId
  let hash = 0;
  for (let i = 0; i < jobId.length; i++) {
    hash = jobId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Determinar cuántas imágenes seleccionar (2-5)
  const numImages = Math.min(((Math.abs(hash) % 4) + 2), 5);
  const startIndex = Math.abs(hash) % images.length;

  // Seleccionar imágenes de forma aleatoria pero consistente
  const selectedImages: string[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < numImages && selectedImages.length < images.length; i++) {
    let index = (startIndex + i) % images.length;
    
    // Asegurar que no repetimos imágenes
    let attempts = 0;
    while (usedIndices.has(index) && attempts < images.length) {
      index = (index + 1) % images.length;
      attempts++;
    }
    
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      selectedImages.push(images[index]);
    }
  }

  return selectedImages;
}