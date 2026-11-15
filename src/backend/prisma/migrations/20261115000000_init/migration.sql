-- Migración inicial de CanchaYa (issue #27).
-- Copia fiel del DDL de specs/data-model.md (sección 9), validado en MySQL 8.4.13.
-- Incluye lo que Prisma no puede modelar: columna generada active_slot, CHECK y charset ASCII de booking_code.

CREATE TABLE courts (
  id           VARCHAR(10)   NOT NULL,
  name         VARCHAR(80)   NOT NULL,
  sport        ENUM('FUTBOL_7','PADEL','TENIS','BASQUETBOL') NOT NULL,
  hourly_rate  DECIMAL(10,2) NOT NULL,
  is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT chk_courts_rate CHECK (hourly_rate > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE bookings (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_code    CHAR(11) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  court_id        VARCHAR(10)  NOT NULL,
  booking_date    DATE         NOT NULL,
  start_time      TIME         NOT NULL,
  end_time        TIME         NOT NULL,
  customer_name   VARCHAR(80)  NOT NULL,
  customer_phone  VARCHAR(25)  NOT NULL,
  customer_email  VARCHAR(254) NOT NULL,
  status          ENUM('CONFIRMADA','CANCELADA','COMPLETADA') NOT NULL DEFAULT 'CONFIRMADA',
  active_slot     TINYINT GENERATED ALWAYS AS
                    (CASE WHEN status = 'CONFIRMADA' THEN 1 ELSE NULL END) STORED,
  created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                    ON UPDATE CURRENT_TIMESTAMP(3),
  cancelled_at    DATETIME(3)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_code (booking_code),
  UNIQUE KEY uq_bookings_active_slot (court_id, booking_date, start_time, active_slot),
  KEY idx_bookings_court_date_status (court_id, booking_date, status),
  CONSTRAINT fk_bookings_court FOREIGN KEY (court_id) REFERENCES courts (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_bookings_code
    CHECK (REGEXP_LIKE(booking_code, '^CY-[2-9A-HJ-NP-Z]{8}$', 'c')),
  CONSTRAINT chk_bookings_start CHECK (start_time >= '08:00:00'),
  CONSTRAINT chk_bookings_end CHECK (end_time > start_time AND end_time <= '23:00:00'),
  CONSTRAINT chk_bookings_cancelled
    CHECK ((status = 'CANCELADA') = (cancelled_at IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE booking_events (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id   BIGINT UNSIGNED NOT NULL,
  event_type   ENUM('CREATED','CANCELLED') NOT NULL,
  occurred_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  details      JSON         NULL,
  PRIMARY KEY (id),
  KEY idx_booking_events_booking (booking_id, occurred_at),
  CONSTRAINT fk_booking_events_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
