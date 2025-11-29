-- Crear tablas base
CREATE TABLE IF NOT EXISTS country (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    code VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS person (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    is_active BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(255),
    birthday_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    country_id INT REFERENCES country(id),
    role_id INT REFERENCES role(id) DEFAULT 2
);

CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS requeriment_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS category_requirements (
    id SERIAL PRIMARY KEY,
    requirement_name VARCHAR(255),
    is_required BOOLEAN DEFAULT TRUE,
    description VARCHAR(255),
    order_index INT,
    requirements_type_id INT REFERENCES requeriment_type(id),
    category_id INT REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS campaign_state (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS workflow_state (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS observation_action (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS campaign (
    id SERIAL PRIMARY KEY,
    tittle VARCHAR(200),
    description VARCHAR(200),
    goal_amount DECIMAL DEFAULT 0,
    current_amount DECIMAL DEFAULT 0,
    expiration_date DATE,
    main_image_url VARCHAR(255),
    rich_text TEXT,
    start_date DATE,
    end_date DATE,
    view_counting INT DEFAULT 0,
    favorites_counting INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    workflow_state_id INT REFERENCES workflow_state(id) DEFAULT 1,
    campaign_state_id INT REFERENCES campaign_state(id) DEFAULT 1,
    user_id INT REFERENCES person(id),
    category_id INT REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS campaign_observations (
    id SERIAL PRIMARY KEY,
    observation_text TEXT,
    user_id INT REFERENCES person(id),
    campaign_id INT REFERENCES campaign(id),
    action_id INT REFERENCES observation_action(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorite (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES person(id),
    campaign_id INT REFERENCES campaign(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation_state (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS payment_method (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS donation (
    id SERIAL PRIMARY KEY,
    amount DECIMAL,
    donation_state_id INT REFERENCES donation_state(id) DEFAULT 1,
    user_id INT REFERENCES person(id),
    campaign_id INT REFERENCES campaign(id),
    payment_method_id INT REFERENCES payment_method(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reward (
    id SERIAL PRIMARY KEY,
    tittle VARCHAR(100),
    description TEXT,
    amount DECIMAL,
    stock INT,
    campaign_id INT REFERENCES campaign(id),
    image_url VARCHAR(500),
    created_ad TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_requirement_response (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaign(id),
    requirement_id INT REFERENCES category_requirements(id),
    response_value TEXT,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales

-- Roles
INSERT INTO role (id, name) VALUES 
    (1, 'Administrador'),
    (2, 'Usuario')
ON CONFLICT (id) DO NOTHING;

-- Países (Lista completa)
INSERT INTO country (name, code) VALUES 
    ('Afganistán', 'AF'),
    ('Albania', 'AL'),
    ('Alemania', 'DE'),
    ('Andorra', 'AD'),
    ('Angola', 'AO'),
    ('Antigua y Barbuda', 'AG'),
    ('Arabia Saudita', 'SA'),
    ('Argelia', 'DZ'),
    ('Argentina', 'AR'),
    ('Armenia', 'AM'),
    ('Australia', 'AU'),
    ('Austria', 'AT'),
    ('Azerbaiyán', 'AZ'),
    ('Bahamas', 'BS'),
    ('Bangladés', 'BD'),
    ('Barbados', 'BB'),
    ('Baréin', 'BH'),
    ('Bélgica', 'BE'),
    ('Belice', 'BZ'),
    ('Benín', 'BJ'),
    ('Bielorrusia', 'BY'),
    ('Birmania', 'MM'),
    ('Bolivia', 'BO'),
    ('Bosnia y Herzegovina', 'BA'),
    ('Botsuana', 'BW'),
    ('Brasil', 'BR'),
    ('Brunéi', 'BN'),
    ('Bulgaria', 'BG'),
    ('Burkina Faso', 'BF'),
    ('Burundi', 'BI'),
    ('Bután', 'BT'),
    ('Cabo Verde', 'CV'),
    ('Camboya', 'KH'),
    ('Camerún', 'CM'),
    ('Canadá', 'CA'),
    ('Catar', 'QA'),
    ('Chad', 'TD'),
    ('Chile', 'CL'),
    ('China', 'CN'),
    ('Chipre', 'CY'),
    ('Colombia', 'CO'),
    ('Comoras', 'KM'),
    ('Corea del Norte', 'KP'),
    ('Corea del Sur', 'KR'),
    ('Costa de Marfil', 'CI'),
    ('Costa Rica', 'CR'),
    ('Croacia', 'HR'),
    ('Cuba', 'CU'),
    ('Dinamarca', 'DK'),
    ('Dominica', 'DM'),
    ('Ecuador', 'EC'),
    ('Egipto', 'EG'),
    ('El Salvador', 'SV'),
    ('Emiratos Árabes Unidos', 'AE'),
    ('Eritrea', 'ER'),
    ('Eslovaquia', 'SK'),
    ('Eslovenia', 'SI'),
    ('España', 'ES'),
    ('Estados Unidos', 'US'),
    ('Estonia', 'EE'),
    ('Etiopía', 'ET'),
    ('Filipinas', 'PH'),
    ('Finlandia', 'FI'),
    ('Fiyi', 'FJ'),
    ('Francia', 'FR'),
    ('Gabón', 'GA'),
    ('Gambia', 'GM'),
    ('Georgia', 'GE'),
    ('Ghana', 'GH'),
    ('Granada', 'GD'),
    ('Grecia', 'GR'),
    ('Guatemala', 'GT'),
    ('Guinea', 'GN'),
    ('Guinea Ecuatorial', 'GQ'),
    ('Guinea-Bisáu', 'GW'),
    ('Guyana', 'GY'),
    ('Haití', 'HT'),
    ('Honduras', 'HN'),
    ('Hungría', 'HU'),
    ('India', 'IN'),
    ('Indonesia', 'ID'),
    ('Irak', 'IQ'),
    ('Irán', 'IR'),
    ('Irlanda', 'IE'),
    ('Islandia', 'IS'),
    ('Islas Marshall', 'MH'),
    ('Islas Salomón', 'SB'),
    ('Israel', 'IL'),
    ('Italia', 'IT'),
    ('Jamaica', 'JM'),
    ('Japón', 'JP'),
    ('Jordania', 'JO'),
    ('Kazajistán', 'KZ'),
    ('Kenia', 'KE'),
    ('Kirguistán', 'KG'),
    ('Kiribati', 'KI'),
    ('Kuwait', 'KW'),
    ('Laos', 'LA'),
    ('Lesoto', 'LS'),
    ('Letonia', 'LV'),
    ('Líbano', 'LB'),
    ('Liberia', 'LR'),
    ('Libia', 'LY'),
    ('Liechtenstein', 'LI'),
    ('Lituania', 'LT'),
    ('Luxemburgo', 'LU'),
    ('Macedonia del Norte', 'MK'),
    ('Madagascar', 'MG'),
    ('Malasia', 'MY'),
    ('Malaui', 'MW'),
    ('Maldivas', 'MV'),
    ('Malí', 'ML'),
    ('Malta', 'MT'),
    ('Marruecos', 'MA'),
    ('Mauricio', 'MU'),
    ('Mauritania', 'MR'),
    ('México', 'MX'),
    ('Micronesia', 'FM'),
    ('Moldavia', 'MD'),
    ('Mónaco', 'MC'),
    ('Mongolia', 'MN'),
    ('Montenegro', 'ME'),
    ('Mozambique', 'MZ'),
    ('Namibia', 'NA'),
    ('Nauru', 'NR'),
    ('Nepal', 'NP'),
    ('Nicaragua', 'NI'),
    ('Níger', 'NE'),
    ('Nigeria', 'NG'),
    ('Noruega', 'NO'),
    ('Nueva Zelanda', 'NZ'),
    ('Omán', 'OM'),
    ('Países Bajos', 'NL'),
    ('Pakistán', 'PK'),
    ('Palaos', 'PW'),
    ('Panamá', 'PA'),
    ('Papúa Nueva Guinea', 'PG'),
    ('Paraguay', 'PY'),
    ('Perú', 'PE'),
    ('Polonia', 'PL'),
    ('Portugal', 'PT'),
    ('Puerto Rico', 'PR'),
    ('Reino Unido', 'GB'),
    ('República Centroafricana', 'CF'),
    ('República Checa', 'CZ'),
    ('República del Congo', 'CG'),
    ('República Democrática del Congo', 'CD'),
    ('República Dominicana', 'DO'),
    ('Ruanda', 'RW'),
    ('Rumania', 'RO'),
    ('Rusia', 'RU'),
    ('Samoa', 'WS'),
    ('San Cristóbal y Nieves', 'KN'),
    ('San Marino', 'SM'),
    ('San Vicente y las Granadinas', 'VC'),
    ('Santa Lucía', 'LC'),
    ('Santo Tomé y Príncipe', 'ST'),
    ('Senegal', 'SN'),
    ('Serbia', 'RS'),
    ('Seychelles', 'SC'),
    ('Sierra Leona', 'SL'),
    ('Singapur', 'SG'),
    ('Siria', 'SY'),
    ('Somalia', 'SO'),
    ('Sri Lanka', 'LK'),
    ('Suazilandia', 'SZ'),
    ('Sudáfrica', 'ZA'),
    ('Sudán', 'SD'),
    ('Sudán del Sur', 'SS'),
    ('Suecia', 'SE'),
    ('Suiza', 'CH'),
    ('Surinam', 'SR'),
    ('Tailandia', 'TH'),
    ('Taiwán', 'TW'),
    ('Tanzania', 'TZ'),
    ('Tayikistán', 'TJ'),
    ('Timor Oriental', 'TL'),
    ('Togo', 'TG'),
    ('Tonga', 'TO'),
    ('Trinidad y Tobago', 'TT'),
    ('Túnez', 'TN'),
    ('Turkmenistán', 'TM'),
    ('Turquía', 'TR'),
    ('Tuvalu', 'TV'),
    ('Ucrania', 'UA'),
    ('Uganda', 'UG'),
    ('Uruguay', 'UY'),
    ('Uzbekistán', 'UZ'),
    ('Vanuatu', 'VU'),
    ('Vaticano', 'VA'),
    ('Venezuela', 'VE'),
    ('Vietnam', 'VN'),
    ('Yemen', 'YE'),
    ('Yibuti', 'DJ'),
    ('Zambia', 'ZM'),
    ('Zimbabue', 'ZW')
ON CONFLICT DO NOTHING;

-- Categorías
INSERT INTO category (name, image_url) VALUES 
    ('Tecnología', '/assets/images/categories/tech.jpg'),
    ('Arte', '/assets/images/categories/art.jpg'),
    ('Música', '/assets/images/categories/music.jpg'),
    ('Cine y Video', '/assets/images/categories/film.jpg'),
    ('Juegos', '/assets/images/categories/games.jpg'),
    ('Diseño', '/assets/images/categories/design.jpg'),
    ('Fotografía', '/assets/images/categories/photo.jpg'),
    ('Moda', '/assets/images/categories/fashion.jpg'),
    ('Comida', '/assets/images/categories/food.jpg'),
    ('Causas Sociales', '/assets/images/categories/social.jpg'),
    ('Educación', '/assets/images/categories/education.jpg'),
    ('Medio Ambiente', '/assets/images/categories/environment.jpg')
ON CONFLICT DO NOTHING;

-- Tipos de requisitos
INSERT INTO requeriment_type (id, name) VALUES 
    (1, 'Texto'),
    (2, 'Archivo'),
    (3, 'Imagen'),
    (4, 'URL')
ON CONFLICT (id) DO NOTHING;

-- Estados de workflow
INSERT INTO workflow_state (id, name) VALUES 
    (1, 'Borrador'),
    (2, 'En Revisión'),
    (3, 'Observado'),
    (4, 'Rechazado'),
    (5, 'Publicado')
ON CONFLICT (id) DO NOTHING;

-- Estados de campaña
INSERT INTO campaign_state (id, name) VALUES 
    (1, 'No Iniciada'),
    (2, 'En Progreso'),
    (3, 'En Pausa'),
    (4, 'Finalizada')
ON CONFLICT (id) DO NOTHING;

-- Acciones de observación
INSERT INTO observation_action (id, name) VALUES 
    (1, 'Observado'),
    (2, 'Rechazado'),
    (3, 'Aprobado')
ON CONFLICT (id) DO NOTHING;

-- Estados de donación
INSERT INTO donation_state (id, name) VALUES 
    (1, 'Pendiente'),
    (2, 'Completada'),
    (3, 'Cancelada'),
    (4, 'Reembolsada')
ON CONFLICT (id) DO NOTHING;

-- Métodos de pago
INSERT INTO payment_method (id, name) VALUES 
    (1, 'Tarjeta de Crédito'),
    (2, 'Tarjeta de Débito'),
    (3, 'PayPal'),
    (4, 'Transferencia Bancaria')
ON CONFLICT (id) DO NOTHING;

-- Usuario administrador por defecto
-- Password: admin123 (hash bcrypt)
INSERT INTO person (first_name, last_name, email, password, is_active, role_id) VALUES 
    ('Admin', 'RiseUp', 'admin@riseup.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VqQQQqXZQQQQQQ', TRUE, 1)
ON CONFLICT (email) DO NOTHING;
