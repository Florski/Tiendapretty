# Tienda Online - EShop

Una tienda en línea sencilla construida con Node.js, Express, MongoDB Atlas y Tailwind CSS.

## Características

- **Catálogo de productos**: Visualización de productos con filtrado por categorías
- **Panel de administración**: CRUD completo para gestión de productos
- **Carrito de compras**: Sistema básico de carrito (frontend)
- **Diseño responsive**: Interfaz moderna con Tailwind CSS
- **Base de datos en la nube**: MongoDB Atlas para almacenamiento persistente

## Tecnologías

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilos**: Tailwind CSS
- **Base de datos**: MongoDB Atlas
- **Iconos**: Font Awesome

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd eshop
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tu configuración de MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eshop?retryWrites=true&w=majority
PORT=3000
FRONTEND_URL=http://localhost:3000
```

4. Iniciar el servidor:
```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

## Uso

### Vista de Tienda
- Navega entre categorías usando los filtros
- Ve los detalles de cada producto
- Agrega productos al carrito
- Los productos destacados aparecen en la sección superior

### Panel de Administración
- Agrega nuevos productos con el formulario
- Edita productos existentes (clic en el ícono de editar)
- Elimina productos (clic en el ícono de eliminar)
- Gestiona stock y precios
- Marca productos como destacados

## API Endpoints

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Query Parameters
- `?category=electronics` - Filtrar por categoría
- `?featured=true` - Obtener solo productos destacados

## Estructura del Proyecto

```
eshop/
├── models/
│   └── Product.js          # Modelo de datos de productos
├── routes/
│   └── products.js         # Rutas de la API
├── public/
│   ├── index.html          # Página principal
│   ├── js/
│   │   └── app.js          # Lógica del frontend
│   ├── css/                # Estilos personalizados (si es necesario)
│   └── images/             # Imágenes de productos
├── server.js               # Servidor principal
├── package.json            # Dependencias del proyecto
└── README.md               # Documentación
```

## Modelo de Datos

### Producto
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: String (required, enum: ['electronics', 'clothing', 'home', 'books', 'other']),
  imageUrl: String (opcional),
  stock: Number (required, min: 0, default: 0),
  featured: Boolean (default: false),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

## Contribución

1. Fork del proyecto
2. Crear una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit de los cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## Licencia

MIT License
