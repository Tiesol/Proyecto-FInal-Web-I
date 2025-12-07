-- Requisitos por categoría para RiseUp
-- Tipos de requisitos: 1=Texto, 2=Archivo, 3=Imagen, 4=URL

-- ====== TECNOLOGÍA (category_id: 1) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Nombre del producto/servicio', 'Nombre oficial del producto o servicio tecnológico', TRUE, 1, 1, 1),
('Descripción técnica', 'Describe las especificaciones técnicas de tu proyecto', TRUE, 2, 1, 1),
('Estado actual del desarrollo', 'Indica en qué fase se encuentra: idea, prototipo, MVP, etc.', TRUE, 3, 1, 1),
('URL de demo o prototipo', 'Enlace a demo, video o prototipo funcional (si existe)', FALSE, 4, 4, 1),
('Documentación técnica', 'URL a documentación, GitHub, o descripción del stack tecnológico', FALSE, 5, 4, 1);

-- ====== ARTE (category_id: 2) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Tipo de obra artística', 'Pintura, escultura, instalación, arte digital, etc.', TRUE, 1, 1, 2),
('Portfolio del artista', 'URL a tu portfolio o galería de trabajos anteriores', TRUE, 2, 4, 2),
('Concepto de la obra', 'Explica el concepto artístico y mensaje de tu proyecto', TRUE, 3, 1, 2),
('Materiales requeridos', 'Lista de materiales necesarios para la creación', FALSE, 4, 1, 2);

-- ====== MÚSICA (category_id: 3) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Género musical', 'Rock, pop, electrónica, clásica, etc.', TRUE, 1, 1, 3),
('Nombre del artista/banda', 'Nombre artístico o de la agrupación', TRUE, 2, 1, 3),
('Demo o muestra musical', 'URL a SoundCloud, YouTube o plataforma con tu música', TRUE, 3, 4, 3),
('Plan de producción', 'Describe qué planeas producir: álbum, EP, single, gira, etc.', TRUE, 4, 1, 3),
('Redes sociales del artista', 'URLs a perfiles en redes sociales', FALSE, 5, 4, 3);

-- ====== CINE Y VIDEO (category_id: 4) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Tipo de producción', 'Cortometraje, largometraje, documental, serie web, etc.', TRUE, 1, 1, 4),
('Sinopsis', 'Resumen de la historia o contenido del proyecto', TRUE, 2, 1, 4),
('Guión o tratamiento', 'URL a documento con guión o tratamiento cinematográfico', FALSE, 3, 4, 4),
('Equipo de producción', 'Describe quiénes conforman el equipo: director, productor, etc.', TRUE, 4, 1, 4),
('Material audiovisual previo', 'URL a trailer, teaser o trabajos anteriores', FALSE, 5, 4, 4);

-- ====== JUEGOS (category_id: 5) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Plataforma objetivo', 'PC, consolas, móvil, web, VR, etc.', TRUE, 1, 1, 5),
('Género del juego', 'RPG, shooter, puzzle, aventura, etc.', TRUE, 2, 1, 5),
('Motor de desarrollo', 'Unity, Unreal, Godot, propio, etc.', TRUE, 3, 1, 5),
('Estado del desarrollo', 'Concepto, pre-producción, alpha, beta, etc.', TRUE, 4, 1, 5),
('Demo jugable o gameplay', 'URL a demo descargable o video de gameplay', FALSE, 5, 4, 5),
('Game Design Document', 'URL a documento de diseño del juego', FALSE, 6, 4, 5);

-- ====== DISEÑO (category_id: 6) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Tipo de diseño', 'Gráfico, industrial, UX/UI, interiores, etc.', TRUE, 1, 1, 6),
('Portfolio de diseño', 'URL a Behance, Dribbble o portfolio personal', TRUE, 2, 4, 6),
('Descripción del proyecto', 'Explica en detalle qué vas a diseñar', TRUE, 3, 1, 6),
('Herramientas de trabajo', 'Software y herramientas que utilizarás', FALSE, 4, 1, 6);

-- ====== FOTOGRAFÍA (category_id: 7) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Tipo de proyecto fotográfico', 'Libro, exposición, documental, etc.', TRUE, 1, 1, 7),
('Temática o concepto', 'Describe la temática o concepto fotográfico', TRUE, 2, 1, 7),
('Portfolio fotográfico', 'URL a tu portfolio o Instagram profesional', TRUE, 3, 4, 7),
('Equipo fotográfico', 'Describe el equipo que utilizarás', FALSE, 4, 1, 7),
('Lugares o sujetos', 'Describe dónde o a quién fotografiarás', FALSE, 5, 1, 7);

-- ====== MODA (category_id: 8) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Nombre de la marca', 'Nombre de tu marca de moda', TRUE, 1, 1, 8),
('Tipo de colección', 'Ropa, accesorios, calzado, alta costura, etc.', TRUE, 2, 1, 8),
('Concepto de la colección', 'Describe el concepto y estilo de tu colección', TRUE, 3, 1, 8),
('Lookbook o diseños', 'URL a imágenes de diseños o lookbook', TRUE, 4, 4, 8),
('Materiales y proveedores', 'Describe los materiales y fabricación', FALSE, 5, 1, 8);

-- ====== COMIDA (category_id: 9) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Tipo de proyecto gastronómico', 'Restaurante, food truck, producto, catering, etc.', TRUE, 1, 1, 9),
('Nombre del negocio/producto', 'Nombre comercial del proyecto', TRUE, 2, 1, 9),
('Propuesta gastronómica', 'Describe tu propuesta culinaria y diferenciador', TRUE, 3, 1, 9),
('Permisos y certificaciones', 'Indica si cuentas con permisos sanitarios o en proceso', TRUE, 4, 1, 9),
('Menú o productos', 'URL a menú, fotos de productos o recetas', FALSE, 5, 4, 9);

-- ====== CAUSAS SOCIALES (category_id: 10) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Tipo de organización', 'ONG, fundación, colectivo, proyecto independiente, etc.', TRUE, 1, 1, 10),
('Causa que apoyas', 'Describe la causa social y población beneficiaria', TRUE, 2, 1, 10),
('Documentación legal', 'Registro legal de la organización (si aplica)', FALSE, 3, 4, 10),
('Impacto esperado', 'Describe el impacto social que esperas lograr', TRUE, 4, 1, 10),
('Antecedentes de trabajo', 'Describe proyectos anteriores o experiencia en la causa', FALSE, 5, 1, 10),
('Transparencia y rendición', 'Cómo reportarás el uso de los fondos a los donantes', TRUE, 6, 1, 10);

-- ====== EDUCACIÓN (category_id: 11) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Tipo de proyecto educativo', 'Curso, plataforma, material didáctico, escuela, etc.', TRUE, 1, 1, 11),
('Nivel educativo objetivo', 'Preescolar, básica, media, superior, profesional, etc.', TRUE, 2, 1, 11),
('Metodología pedagógica', 'Describe tu enfoque educativo y metodología', TRUE, 3, 1, 11),
('Contenido curricular', 'Describe los temas o materias que cubrirás', TRUE, 4, 1, 11),
('Credenciales del equipo', 'Formación académica del equipo docente', FALSE, 5, 1, 11),
('Muestra de contenido', 'URL a material educativo de muestra', FALSE, 6, 4, 11);

-- ====== MEDIO AMBIENTE (category_id: 12) ======
INSERT INTO category_requirements (requirement_name, description, is_required, order_index, requirements_type_id, category_id) VALUES
('Tipo de proyecto ambiental', 'Conservación, reciclaje, energía limpia, etc.', TRUE, 1, 1, 12),
('Problema ambiental que abordas', 'Describe el problema específico que atacas', TRUE, 2, 1, 12),
('Solución propuesta', 'Explica tu solución y cómo funciona', TRUE, 3, 1, 12),
('Impacto ambiental esperado', 'Métricas de impacto: CO2 reducido, árboles plantados, etc.', TRUE, 4, 1, 12),
('Área geográfica de impacto', 'Ubicación donde se implementará el proyecto', TRUE, 5, 1, 12),
('Alianzas o certificaciones', 'Colaboraciones con ONGs, certificaciones ambientales', FALSE, 6, 1, 12);
