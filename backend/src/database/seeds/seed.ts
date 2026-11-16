
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../data-source';
import { User, UserRole } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import {
  Product,
  ProductCondition,
} from '../../products/entities/product.entity';

interface SeedProduct {
  title: string;
  description: string;
  price: number;
  categorySlug: string;
  sellerIndex: number;
  imageUrl?: string | null;
  condition?: ProductCondition;
  stock?: number;
}

const categories = [
  { slug: 'libros', name: 'Apuntes y Libros Físicos', icon: 'book' },
  { slug: 'tecnologia', name: 'Tecnología y Accesorios', icon: 'laptop' },
  { slug: 'deportes', name: 'Deportes y Vida Sana', icon: 'trophy' },
  { slug: 'utiles', name: 'Útiles y Papelería', icon: 'pencil-square' },
  { slug: 'hogar', name: 'Artículos para el Hogar/Pieza', icon: 'house-door' },
  { slug: 'snacks', name: 'Snacks y Colaciones', icon: 'cup-hot' },
];

const users = [
  { name: 'Administrador UNAB', email: 'admin@unab.cl', role: UserRole.ADMIN, career: null },
  { name: 'Juan Pérez', email: 'vendedor1@unab.cl', role: UserRole.SELLER, career: 'Ingeniería Civil Informática' },
  { name: 'María González', email: 'vendedor2@unab.cl', role: UserRole.SELLER, career: 'Arquitectura' },
  { name: 'Carlos Ruiz', email: 'vendedor3@unab.cl', role: UserRole.SELLER, career: 'Ingeniería en Computación' },
  { name: 'Ana Silva', email: 'vendedor4@unab.cl', role: UserRole.SELLER, career: 'Enfermería' },
  { name: 'Comprador 1', email: 'comprador1@unab.cl', role: UserRole.BUYER, career: null },
  { name: 'Comprador 2', email: 'comprador2@unab.cl', role: UserRole.BUYER, career: null },
  { name: 'Comprador 3', email: 'comprador3@unab.cl', role: UserRole.BUYER, career: null },
];

const products: SeedProduct[] = [
  // Ocho productos originales del Taller 2
  {
    title: 'Libro: Cálculo de Stewart 8va Edición',
    description: 'Libro en excelente estado, ideal para primer año de ingeniería. Sin rayones, incluye formulario intacto.',
    price: 25000,
    categorySlug: 'libros',
    sellerIndex: 0,
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_970021-MLU77741616257_072024-O.webp',
  },
  {
    title: 'Calculadora Científica Casio FX-991',
    description: 'Casi nueva, la vendo porque me regalaron otra. Batería operativa e incluye tapa protectora original.',
    price: 15000,
    categorySlug: 'tecnologia',
    sellerIndex: 1,
    imageUrl: 'https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp',
  },
  {
    title: 'Notebook Dell Inspiron 15 (Core i5)',
    description: 'Intel Core i5, 8GB RAM, 256GB SSD. Batería con 4 horas de autonomía, perfecto para clases y proyectos.',
    price: 350000,
    categorySlug: 'tecnologia',
    sellerIndex: 2,
    imageUrl: 'https://i5.walmartimages.cl/asr/165e9694-8d8d-4441-9f34-8fc2d2b26f53.71d52b3fa4d5fb25e7b5d6eae7574f4f.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff',
  },
  {
    title: 'Raqueta de Tenis Wilson Pro Staff',
    description: 'Perfecta para electivos deportivos y entrenamientos en campus. Cuerdas recién cambiadas y funda incluida.',
    price: 40000,
    categorySlug: 'deportes',
    sellerIndex: 3,
    imageUrl: 'https://cdnx.jumpseller.com/padel-shop-chile/image/75728640/resize/719/719?1776090972',
  },
  {
    title: 'Libro: Campbell Biology 11th Edition',
    description: 'Texto fundamental para estudiantes de Medicina, Odontología y Bioquímica. Tapa dura y hojas limpias.',
    price: 38000,
    categorySlug: 'libros',
    sellerIndex: 0,
    imageUrl: 'https://covers.openlibrary.org/b/id/8394461-M.jpg',
  },
  {
    title: 'Set de Tiralíneas y Reglas Técnicas',
    description: 'Pack de 6 tiralíneas graduados (0.1 a 0.8), escalímetro profesional y portaminas metálico.',
    price: 12000,
    categorySlug: 'utiles',
    sellerIndex: 1,
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Audífonos Inalámbricos Sony WH-CH520',
    description: 'Hasta 50 horas de batería, conexión multipunto, almohadillas impecables. Ideales para biblioteca.',
    price: 28000,
    categorySlug: 'tecnologia',
    sellerIndex: 2,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Hervidor Eléctrico Compacto 1.2L',
    description: 'Ideal para preparar té o café en departamento de estudiante o sala de estudio. Apagado automático.',
    price: 8000,
    categorySlug: 'hogar',
    sellerIndex: 3,
    imageUrl: 'https://i5.walmartimages.cl/asr/497ee8cd-2950-4a65-9541-485a0658234f.783bdc7b93800fb1d82cbc5201b9e7a5.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff',
  },

  // Doce publicaciones adicionales de prueba para T05
  { title: 'Guía de Física I con ejercicios resueltos', description: 'Material de estudio con ejercicios desarrollados y explicaciones para Física I.', price: 9000, categorySlug: 'libros', sellerIndex: 0 },
  { title: 'Teclado mecánico compacto', description: 'Teclado compacto en buen estado, ideal para estudiar y programar.', price: 24000, categorySlug: 'tecnologia', sellerIndex: 1 },
  { title: 'Balón de básquetbol tamaño 7', description: 'Balón para entrenamientos y partidos recreativos universitarios.', price: 12000, categorySlug: 'deportes', sellerIndex: 2 },
  { title: 'Cuaderno universitario cuadriculado', description: 'Cuaderno de cien hojas cuadriculadas para apuntes y ejercicios.', price: 3000, categorySlug: 'utiles', sellerIndex: 3, condition: ProductCondition.NUEVO },
  { title: 'Lámpara LED para escritorio', description: 'Lámpara de escritorio con iluminación ajustable para estudiar.', price: 12000, categorySlug: 'hogar', sellerIndex: 0 },
  { title: 'Pack de barras de cereal', description: 'Paquete de barras de cereal individuales para colaciones.', price: 2500, categorySlug: 'snacks', sellerIndex: 1, condition: ProductCondition.NUEVO },
  { title: 'Libro de Álgebra Lineal aplicada', description: 'Libro de apoyo con ejercicios y ejemplos de álgebra lineal.', price: 17000, categorySlug: 'libros', sellerIndex: 2 },
  { title: 'Mouse inalámbrico USB', description: 'Mouse inalámbrico funcional con receptor USB incluido.', price: 7500, categorySlug: 'tecnologia', sellerIndex: 3 },
  { title: 'Mat de yoga antideslizante', description: 'Colchoneta para yoga, estiramientos y ejercicios en casa.', price: 9000, categorySlug: 'deportes', sellerIndex: 0 },
  { title: 'Set de destacadores pastel', description: 'Conjunto de seis destacadores de colores pastel para estudiar.', price: 4500, categorySlug: 'utiles', sellerIndex: 1, condition: ProductCondition.NUEVO },
  { title: 'Organizador de escritorio', description: 'Organizador compacto para lápices, apuntes y accesorios.', price: 6000, categorySlug: 'hogar', sellerIndex: 2 },
  { title: 'Pack de colaciones variadas', description: 'Selección de snacks envasados para acompañar la jornada universitaria.', price: 5000, categorySlug: 'snacks', sellerIndex: 3, condition: ProductCondition.NUEVO },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const categoryRepository = manager.getRepository(Category);
      const productRepository = manager.getRepository(Product);

      // No duplicar los datos de prueba si ya existen usuarios.
      const userCount = await userRepository.count();

      if (userCount > 0) {
        console.log('Seed omitido: la tabla users ya contiene datos.');
        return;
      }

      // Contraseña de desarrollo exigida por la guía.
      const passwordHash = await bcrypt.hash('Password123', 10);

      const savedUsers = await userRepository.save(
        users.map((user) =>
          userRepository.create({
            ...user,
            passwordHash,
            campus: null,
            phone: null,
          }),
        ),
      );

      const savedCategories = await categoryRepository.save(
        categories.map((category) =>
          categoryRepository.create(category),
        ),
      );

      const sellers = savedUsers.filter(
        (user) => user.role === UserRole.SELLER,
      );

      const categoryBySlug = new Map(
        savedCategories.map((category) => [category.slug, category]),
      );

      const savedProducts = products.map((product) => {
        const {
          categorySlug,
          sellerIndex,
          ...data
        } = product;

        const category = categoryBySlug.get(categorySlug);

        if (!category || !sellers[sellerIndex]) {
          throw new Error('Producto con categoría o vendedor inválido');
        }

        return productRepository.create({
          title: data.title,
          description: data.description,
          price: data.price,
          stock: data.stock ?? 1,
          condition: data.condition ?? ProductCondition.USADO,
          imageUrl: data.imageUrl ?? null,
          isActive: true,
          sellerId: sellers[sellerIndex].id,
          categoryId: category.id,
        });
      });

      await productRepository.save(savedProducts);

      console.log(
        `Seed completado: ${savedUsers.length} usuarios, ${savedCategories.length} categorías y ${savedProducts.length} productos.`,
      );
    });
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Error al ejecutar el seed:', error);
  process.exitCode = 1;
});
