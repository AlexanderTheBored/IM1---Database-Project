--
-- PostgreSQL database dump
--

\restrict oYUUt2MCVd9lx290WN7usgox81LQR06v5LackSsATvJbWWt7PaNm9F4rpbDdWNf

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guests (
    guest_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100),
    phone character varying(20),
    street character varying(100),
    city character varying(50),
    province character varying(50),
    country character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: guests_guest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.guests_guest_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: guests_guest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.guests_guest_id_seq OWNED BY public.guests.guest_id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    reservation_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_type character varying(20) DEFAULT 'full'::character varying NOT NULL,
    payment_method character varying(20) DEFAULT 'cash'::character varying NOT NULL,
    payment_date date NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'bank_transfer'::character varying, 'gcash'::character varying])::text[]))),
    CONSTRAINT payments_payment_type_check CHECK (((payment_type)::text = ANY ((ARRAY['deposit'::character varying, 'partial'::character varying, 'full'::character varying, 'refund'::character varying])::text[])))
);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    reservation_id integer NOT NULL,
    guest_id integer NOT NULL,
    room_id integer NOT NULL,
    check_in_date date NOT NULL,
    check_out_date date NOT NULL,
    status character varying(20) DEFAULT 'confirmed'::character varying NOT NULL,
    total_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reservations_check CHECK ((check_out_date > check_in_date)),
    CONSTRAINT reservations_status_check CHECK (((status)::text = ANY ((ARRAY['confirmed'::character varying, 'checked_in'::character varying, 'checked_out'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservations_reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reservations_reservation_id_seq OWNED BY public.reservations.reservation_id;


--
-- Name: room_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_types (
    type_id integer NOT NULL,
    type_name character varying(50) NOT NULL,
    description character varying(255),
    nightly_rate numeric(10,2) NOT NULL,
    max_occupancy integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: room_types_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.room_types_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: room_types_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.room_types_type_id_seq OWNED BY public.room_types.type_id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    room_id integer NOT NULL,
    room_number character varying(10) NOT NULL,
    type_id integer NOT NULL,
    floor integer DEFAULT 1 NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT rooms_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'occupied'::character varying, 'maintenance'::character varying])::text[])))
);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rooms_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rooms_room_id_seq OWNED BY public.rooms.room_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100),
    password_hash character varying(100) NOT NULL,
    role character varying(20) DEFAULT 'customer'::character varying NOT NULL,
    guest_id integer,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'employee'::character varying, 'customer'::character varying])::text[])))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: guests guest_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests ALTER COLUMN guest_id SET DEFAULT nextval('public.guests_guest_id_seq'::regclass);


--
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- Name: reservations reservation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations ALTER COLUMN reservation_id SET DEFAULT nextval('public.reservations_reservation_id_seq'::regclass);


--
-- Name: room_types type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types ALTER COLUMN type_id SET DEFAULT nextval('public.room_types_type_id_seq'::regclass);


--
-- Name: rooms room_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms ALTER COLUMN room_id SET DEFAULT nextval('public.rooms_room_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: guests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.guests VALUES (1, 'Maria', 'Santos', 'maria.santos@email.com', '0917-111-2233', '12 Mango Avenue', 'Cebu City', 'Cebu', 'Philippines', '2026-07-16 11:53:02.159337');
INSERT INTO public.guests VALUES (2, 'Juan', 'Dela Cruz', 'juan.delacruz@email.com', '0918-444-5566', '88 Roxas Boulevard', 'Manila', 'Metro Manila', 'Philippines', '2026-07-16 11:53:02.159337');
INSERT INTO public.guests VALUES (3, 'Ana', 'Reyes', 'ana.reyes@email.com', '0919-777-8899', '5 Bonifacio Street', 'Davao City', 'Davao del Sur', 'Philippines', '2026-07-16 11:53:02.159337');
INSERT INTO public.guests VALUES (4, 'Carlos', 'Garcia', 'carlos.garcia@email.com', '0920-222-3344', '23 EDSA', 'Quezon City', 'Metro Manila', 'Philippines', '2026-07-16 11:53:02.159337');
INSERT INTO public.guests VALUES (5, 'Patricia', 'Villanueva', 'pat.villanueva@email.com', '0921-555-6677', '7 Osmeña Boulevard', 'Cebu City', 'Cebu', 'Philippines', '2026-07-16 11:53:02.159337');
INSERT INTO public.guests VALUES (6, 'Aike', 'Dineros', 'aike.dineros@email.com', '0922-888-9900', '45 Lahug Drive', 'Cebu City', 'Cebu', 'Philippines', '2026-07-16 11:53:02.159337');
INSERT INTO public.guests VALUES (7, 'Bubbles', 'Librado', 'bubbles.librado@email.com', '0923-333-4455', '9 Banilad Road', 'Mandaue City', 'Cebu', 'Philippines', '2026-07-16 11:53:02.159337');
INSERT INTO public.guests VALUES (8, 'larp', 'larp', 'bingusbogos12@gmail.com', '1234567890', NULL, NULL, NULL, NULL, '2026-07-17 11:37:20.887846');
INSERT INTO public.guests VALUES (9, 'Leigh', 'Lamayo', 'leighlamayolemon@gmail.com', '019123456', NULL, NULL, NULL, NULL, '2026-07-17 12:28:15.884984');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payments VALUES (1, 1, 10000.00, 'deposit', 'cash', '2026-07-15', '2026-07-16 11:53:02.159337');
INSERT INTO public.payments VALUES (2, 1, 10000.00, 'partial', 'gcash', '2026-07-16', '2026-07-16 11:53:02.159337');
INSERT INTO public.payments VALUES (3, 2, 1500.00, 'deposit', 'card', '2026-07-15', '2026-07-16 11:53:02.159337');
INSERT INTO public.payments VALUES (4, 3, 2500.00, 'deposit', 'bank_transfer', '2026-07-14', '2026-07-16 11:53:02.159337');
INSERT INTO public.payments VALUES (5, 4, 1400.00, 'full', 'cash', '2026-07-12', '2026-07-16 11:53:02.159337');
INSERT INTO public.payments VALUES (6, 5, 4000.00, 'deposit', 'gcash', '2026-07-15', '2026-07-16 11:53:02.159337');
INSERT INTO public.payments VALUES (7, 6, 3000.00, 'deposit', 'gcash', '2026-07-14', '2026-07-16 11:53:02.159337');
INSERT INTO public.payments VALUES (8, 7, 12000.00, 'full', 'card', '2026-07-16', '2026-07-16 11:53:02.159337');


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.reservations VALUES (1, 1, 23, '2026-07-15', '2026-07-17', 'checked_in', 20000.00, '2026-07-16 11:53:02.159337');
INSERT INTO public.reservations VALUES (2, 2, 10, '2026-07-15', '2026-07-18', 'checked_in', 4500.00, '2026-07-16 11:53:02.159337');
INSERT INTO public.reservations VALUES (3, 3, 15, '2026-07-20', '2026-07-23', 'confirmed', 7500.00, '2026-07-16 11:53:02.159337');
INSERT INTO public.reservations VALUES (4, 4, 1, '2026-07-10', '2026-07-12', 'checked_out', 1400.00, '2026-07-16 11:53:02.159337');
INSERT INTO public.reservations VALUES (5, 5, 18, '2026-07-22', '2026-07-24', 'confirmed', 8000.00, '2026-07-16 11:53:02.159337');
INSERT INTO public.reservations VALUES (6, 6, 16, '2026-07-20', '2026-07-23', 'confirmed', 7500.00, '2026-07-16 11:53:02.159337');
INSERT INTO public.reservations VALUES (7, 7, 20, '2026-07-16', '2026-07-19', 'checked_in', 12000.00, '2026-07-16 11:53:02.159337');


--
-- Data for Name: room_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.room_types VALUES (1, 'The Standard Room', 'Classic and urban room. Best for solo and short-term stay.', 700.00, 1, '2026-07-16 11:53:02.159337');
INSERT INTO public.room_types VALUES (2, 'The Superior Room', 'A noticeable upgrade in size and furnishings. Enhanced decor and a small seating area.', 1500.00, 2, '2026-07-16 11:53:02.159337');
INSERT INTO public.room_types VALUES (3, 'The Deluxe Room', 'Where luxury begins to feel tangible. Premium floor level and high-end interior design.', 2500.00, 2, '2026-07-16 11:53:02.159337');
INSERT INTO public.room_types VALUES (4, 'The Junior Suite', 'Very large single room with a distinct living area separated from the sleeping area.', 4000.00, 3, '2026-07-16 11:53:02.159337');
INSERT INTO public.room_types VALUES (5, 'The Presidential Suite', 'The pinnacle of hotel luxury. Panoramic views, expansive square footage, and impeccable service.', 10000.00, 4, '2026-07-16 11:53:02.159337');


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.rooms VALUES (1, '101', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (2, '102', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (3, '103', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (4, '104', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (5, '105', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (6, '106', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (7, '107', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (8, '108', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (9, '109', 1, 1, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (10, '210', 2, 2, 'occupied', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (11, '211', 2, 2, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (12, '212', 2, 2, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (13, '213', 2, 2, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (14, '214', 2, 2, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (15, '315', 3, 3, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (16, '316', 3, 3, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (17, '317', 3, 3, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (18, '318', 4, 3, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (19, '319', 4, 3, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (20, '420', 4, 4, 'occupied', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (21, '421', 4, 4, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (22, '422', 4, 4, 'available', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (23, 'King', 5, 4, 'occupied', '2026-07-16 11:53:02.159337');
INSERT INTO public.rooms VALUES (24, 'Queen', 5, 4, 'available', '2026-07-16 11:53:02.159337');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'admin', NULL, '$2b$10$TFQHX/sVQT42F5235MuhK..OyBaqGlQVICUL6gy4LOzKDJkrOK9Ya', 'admin', NULL, '2026-07-16 10:42:53.933779');
INSERT INTO public.users VALUES (2, 'employee', NULL, '$2b$10$6e2IxmuFfWcTg40Qbca3R.MH8UccnQUUT6MdmCKuraaeXfny6wJMC', 'employee', NULL, '2026-07-16 10:42:54.068921');
INSERT INTO public.users VALUES (4, 'larplarp', 'bingusbogos12@gmail.com', '$2b$10$8/f9TrrUD2oCNyHGg1LFheApbj4LWSwHkeA2ZAPU51axR4aItMQty', 'customer', 8, '2026-07-17 11:37:20.887846');
INSERT INTO public.users VALUES (5, 'Proximiny', 'leighlamayolemon@gmail.com', '$2b$10$CZGq4Muxp0Azvs7nusTOnOsSgJtRXxIi1fi8uNbkegXTX.5F3fpCq', 'customer', 9, '2026-07-17 12:28:15.884984');


--
-- Name: guests_guest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.guests_guest_id_seq', 9, true);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 8, true);


--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reservations_reservation_id_seq', 7, true);


--
-- Name: room_types_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.room_types_type_id_seq', 5, true);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rooms_room_id_seq', 24, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 5, true);


--
-- Name: guests guests_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_email_key UNIQUE (email);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (guest_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: room_types room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_pkey PRIMARY KEY (type_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: rooms rooms_room_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_number_key UNIQUE (room_number);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: payments payments_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(reservation_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservations reservations_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(guest_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservations reservations_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rooms rooms_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.room_types(type_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(guest_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict oYUUt2MCVd9lx290WN7usgox81LQR06v5LackSsATvJbWWt7PaNm9F4rpbDdWNf

