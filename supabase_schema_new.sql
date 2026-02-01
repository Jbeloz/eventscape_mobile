CREATE TABLE users (
	user_id 			INT AUTO_INCREMENT PRIMARY KEY,
    auth_id				INT NOT NULL UNIQUE,
	email 				VARCHAR(255) NOT NULL UNIQUE,
	password_hash 		VARCHAR(255) NOT NULL,
	first_name 			VARCHAR(100) NOT NULL,
	last_name 			VARCHAR(100) NOT NULL,
	phone_number 		VARCHAR(20) DEFAULT NULL,
	user_role 			ENUM ('customer', 'event_organizer', 'coordinator', 'venue_administrator', 'administrator') NOT NULL DEFAULT 'customer',
	is_active 			TINYINT(1) NOT NULL DEFAULT 1,
	created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (user_role)
);

CREATE TABLE user_photos (
	user_photo_id		INT AUTO_INCREMENT PRIMARY KEY,
    user_id         	INT NOT NULL,
    profile_photo	 	VARCHAR(500) NOT NULL,
    file_name 			VARCHAR(255) NOT NULL,
    file_url 			VARCHAR(500) NOT NULL,
    is_primary          TINYINT(1) NOT NULL DEFAULT 0,
    uploaded_at     	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_photo_user (user_id)
);

CREATE TABLE customers (
    customer_id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL UNIQUE,
    preferences         TEXT DEFAULT NULL,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE event_organizers (
    organizer_id 		INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL UNIQUE,
    company_name        VARCHAR(150) NOT NULL,
    company_address     VARCHAR(255) NOT NULL,
    business_email      VARCHAR(255) NOT NULL UNIQUE,
    business_number     VARCHAR(20) NOT NULL,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_organizer_user (user_id)
);

CREATE TABLE coordinators (
    coordinator_id 		INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL UNIQUE,
    organizer_id 		INT NOT NULL,
    specialization      VARCHAR(100) NOT NULL,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES event_organizers(organizer_id) ON DELETE CASCADE,
    INDEX idx_coordinator_organizer (organizer_id)
);

CREATE TABLE venue_administrators (
    venue_admin_id 		INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL UNIQUE,
    assigned_venue_id   INT DEFAULT NULL,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_venue_id) REFERENCES venues(venue_id) ON DELETE SET NULL
);

CREATE TABLE administrators (
    admin_id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL UNIQUE,
    position            VARCHAR(100) NOT NULL DEFAULT 'System Administrator',
    role_description    TEXT NOT NULL,
    admin_notes         TEXT DEFAULT NULL,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE otp (
    otp_id 				INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL,
    otp_code_hash 		CHAR(64) NOT NULL,
    otp_expiry 			DATETIME NOT NULL,
    otp_used_at 		DATETIME DEFAULT NULL,
    otp_attempts 		INT NOT NULL DEFAULT 0,
    last_otp_sent 		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_otp (user_id, otp_code_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_otp_expiry (otp_expiry)
);

CREATE TABLE password_reset (
    reset_id 			INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL,
    reset_token_hash 	CHAR(64) NOT NULL,
    expires_at 			DATETIME NOT NULL,
    used_at 			DATETIME DEFAULT NULL,
    last_token_sent 	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      	TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

CREATE TABLE email_verification (
    verification_id 	INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL,
    email_token_hash 	CHAR(64) NOT NULL,
    expires_at 			DATETIME NOT NULL,
    is_verified 		TINYINT(1) NOT NULL DEFAULT 0,
    verified_at 		DATETIME DEFAULT NULL,
    last_token_sent 	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_active_email_token (user_id, email_token_hash),
    INDEX idx_email_verification_user (user_id),
    INDEX idx_email_verification_expiry (expires_at)
);

CREATE TABLE event_themes (
    event_theme_id 		INT AUTO_INCREMENT PRIMARY KEY,
    theme_name 			VARCHAR(100) NOT NULL,
    theme_description 	TEXT NOT NULL,
    primary_color 		VARCHAR(100) NOT NULL,
    secondary_color 	VARCHAR(100) DEFAULT NULL,
    is_active 			BOOLEAN NOT NULL DEFAULT TRUE,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(theme_name)
);

CREATE TABLE event_categories (
    category_id 		INT AUTO_INCREMENT PRIMARY KEY,
    category_name 		VARCHAR(50) NOT NULL UNIQUE,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE decoration_styles (
    decoration_style_id 	INT AUTO_INCREMENT PRIMARY KEY,
    style_name 				VARCHAR(50) NOT NULL UNIQUE,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE lighting_styles (
    lighting_style_id 		INT AUTO_INCREMENT PRIMARY KEY,
    style_name 				VARCHAR(50) NOT NULL UNIQUE,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE event_theme_categories (
    theme_category_id 		INT AUTO_INCREMENT PRIMARY KEY,
    event_theme_id 			INT NOT NULL,
    category_id 			INT NOT NULL,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_theme_id) REFERENCES event_themes(event_theme_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES event_categories(category_id) ON DELETE CASCADE
);

CREATE TABLE event_theme_decorations (
    theme_decoration_id 	INT AUTO_INCREMENT PRIMARY KEY,
    event_theme_id 			INT NOT NULL,
    decoration_style_id 	INT NOT NULL,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_theme_id) REFERENCES event_themes(event_theme_id) ON DELETE CASCADE,
    FOREIGN KEY (decoration_style_id) REFERENCES decoration_styles(decoration_style_id) ON DELETE CASCADE
);

CREATE TABLE event_theme_lighting (
    theme_lighting_id 		INT AUTO_INCREMENT PRIMARY KEY,
    event_theme_id 			INT NOT NULL,
    lighting_style_id 		INT NOT NULL,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_theme_id) REFERENCES event_themes(event_theme_id) ON DELETE CASCADE,
    FOREIGN KEY (lighting_style_id) REFERENCES lighting_styles(lighting_style_id) ON DELETE CASCADE
);

CREATE TABLE event_theme_accent_colors (
    accent_color_id 		INT AUTO_INCREMENT PRIMARY KEY,
    event_theme_id 			INT NOT NULL,
    color_value 			VARCHAR(100) NOT NULL,      
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_theme_id) REFERENCES event_themes(event_theme_id) ON DELETE CASCADE
);

CREATE TABLE event_theme_images (
    image_id 				INT AUTO_INCREMENT PRIMARY KEY,
    event_theme_id 			INT NOT NULL,
    image_path 				VARCHAR(255) NOT NULL,
    is_thumbnail 			BOOLEAN NOT NULL DEFAULT FALSE,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_theme_id) REFERENCES event_themes(event_theme_id) ON DELETE CASCADE,
    INDEX idx_event_theme_id(event_theme_id)
);

CREATE TABLE event_categories (
    category_id 			INT AUTO_INCREMENT PRIMARY KEY,
    category_name 			VARCHAR(50) NOT NULL UNIQUE,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE venues (
    venue_id 				INT AUTO_INCREMENT PRIMARY KEY,
    venue_name 				VARCHAR(150) NOT NULL,
    description 			TEXT NOT NULL,
    location 				VARCHAR(255) NOT NULL,
    max_capacity 			INT NOT NULL,      
    created_by 				INT NOT NULL,              
    is_active 				BOOLEAN NOT NULL DEFAULT TRUE,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(venue_name),
    INDEX idx_venue_name (venue_name)
);

CREATE TABLE venue_types (
    venue_type_id 			INT AUTO_INCREMENT PRIMARY KEY,
    type_name 				VARCHAR(100) NOT NULL UNIQUE,  
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE venue_venue_types (
    venue_type_link_id 		INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    venue_type_id 			INT NOT NULL,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    FOREIGN KEY (venue_type_id) REFERENCES venue_types(venue_type_id) ON DELETE CASCADE,
    UNIQUE(venue_id, venue_type_id)
);

CREATE TABLE venue_contacts (
    contact_id 				INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    contact_type 			ENUM('Email','Phone') NOT NULL,
    contact_value 			VARCHAR(100) NOT NULL,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
);

CREATE TABLE venue_specifications (
    specification_id 		INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    specification_name  	VARCHAR(100) NOT NULL,                
    specification_value  	VARCHAR(100) NOT NULL,
    notes 					TEXT DEFAULT NULL,                       
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    UNIQUE(venue_id, specification_name)
);

CREATE TABLE venue_allowed_event_types (
    venue_event_type_id 	INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    category_id 			INT NOT NULL,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES event_categories(category_id) ON DELETE CASCADE,
    UNIQUE(venue_id, category_id)
);

CREATE TABLE venue_images (
    image_id 				INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    image_path 				VARCHAR(255) NOT NULL, 
    is_thumbnail 			BOOLEAN NOT NULL DEFAULT FALSE, 
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    INDEX idx_venue_id (venue_id)
);

CREATE TABLE venue_facilities (
    facility_id 			INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    facility_name 			VARCHAR(100) NOT NULL,
    description 			TEXT DEFAULT NULL,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
);

CREATE TABLE venue_rules (
    rule_id 				INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    rule_text 				TEXT NOT NULL,  
    is_active 				BOOLEAN NOT NULL DEFAULT TRUE,  
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
);

CREATE TABLE venue_floor_plans (
    floor_plan_id 			INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    floor_plan_file 		VARCHAR(255) NOT NULL,
    floor_plan_type       	VARCHAR(100) NOT NULL,
    description           	TEXT DEFAULT NULL, 
    length					DECIMAL(5,2) NOT NULL,
    width	 				DECIMAL(5,2) NOT NULL,
    height	 				DECIMAL(5,2) NOT NULL,
    area_sqm 				DECIMAL(7,2) NOT NULL,
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
);

CREATE TABLE venue_doors (
    door_id 				INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 				INT NOT NULL,
    door_type 				ENUM('Single','Double') NOT NULL,
    width 					DECIMAL(5,2) NOT NULL,
    height	 				DECIMAL(5,2) NOT NULL,
    offset	 				DECIMAL(5,2) NOT NULL, 
    corner_position 		ENUM('Left','Right','Center') NOT NULL DEFAULT 'Center',
    swing_direction 		ENUM('Inward','Outward') NOT NULL DEFAULT 'Inward',
    hinge_position 			ENUM('Left','Right') NOT NULL DEFAULT 'Left',
    created_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 				TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
);

CREATE TABLE venue_base_rates (
    rate_id 					INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 					INT NOT NULL,
    rate_type 					ENUM('Hourly','Daily') NOT NULL,      
    base_price 					DECIMAL(12,2) NOT NULL,             
    weekend_price 				DECIMAL(12,2) NOT NULL,      
    holiday_price 				DECIMAL(12,2) NOT NULL,      
    included_hours 				INT NOT NULL,                   
    min_hours 					INT NOT NULL DEFAULT 2,                        
    notes 						TEXT DEFAULT NULL,
    is_active 					BOOLEAN NOT NULL DEFAULT TRUE,
    created_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

CREATE TABLE venue_overtime_rates (
    overtime_rate_id 			INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 					INT NOT NULL,
    rate_type 					ENUM('Hourly','Daily') NOT NULL,
    start_hour 					INT NOT NULL,
    end_hour 					INT DEFAULT NULL,
    price_per_hour 				DECIMAL(12,2) NOT NULL,
    is_active 					BOOLEAN NOT NULL DEFAULT TRUE,
    created_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

CREATE TABLE venue_packages (
    package_id 					INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 					INT NOT NULL,
    package_name 				VARCHAR(150) NOT NULL,
    description 				TEXT NOT NULL,
    duration_hours 				INT NOT NULL,   
    duration_days 				INT DEFAULT NULL,    
    base_price 					DECIMAL(12,2) NOT NULL,
    min_hours 					INT NOT NULL,        
    notes 						TEXT DEFAULT NULL,
    is_active 					BOOLEAN NOT NULL DEFAULT TRUE,
    created_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id),
    UNIQUE (venue_id, package_name),
	INDEX idx_package_name (package_name)
);

CREATE TABLE venue_package_inclusions (
    inclusion_id 				INT AUTO_INCREMENT PRIMARY KEY,
    package_id 					INT NOT NULL,
    inclusion_name 				VARCHAR(150) NOT NULL,
    is_active 					BOOLEAN NOT NULL DEFAULT TRUE,
    created_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES venue_packages(package_id)
);

CREATE TABLE venue_seasonal_pricing (
    seasonal_price_id 			INT AUTO_INCREMENT PRIMARY KEY,
    venue_id 					INT NOT NULL,
    rate_type 					ENUM('Hourly','Daily','Package','All') NOT NULL,
    package_id 					INT DEFAULT NULL,   
    season_name 				VARCHAR(100) NOT NULL,
    start_date 					DATE NOT NULL,
    end_date 					DATE NOT NULL,
    modifier_type 				ENUM('Fixed','Percentage') NOT NULL,
    modifier_value 				DECIMAL(10,2) NOT NULL,  
    is_active 					BOOLEAN NOT NULL DEFAULT TRUE,
    created_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 					TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id),
    FOREIGN KEY (package_id) REFERENCES venue_packages(package_id),
    INDEX idx_season_name (season_name)
);