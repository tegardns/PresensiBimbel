--
-- PostgreSQL database dump
--

\restrict 8IG7r6dkScwlzQ14WlssSX3JzKNcgJPuihwZGHaqkwizfCfegSrOJQPeY2WieRK

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'diselesaikan',
    'tertunda',
    'disetujui',
    'ditolak',
    'selesai'
);


ALTER TYPE public."AttendanceStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'admin',
    'tutor'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "tutorId" text NOT NULL,
    "studentId" text NOT NULL,
    "subjectName" text NOT NULL,
    "durationMin" integer NOT NULL,
    "photoUrl" text NOT NULL,
    notes text,
    "feeNet" integer NOT NULL,
    status public."AttendanceStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Attendance" OWNER TO postgres;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    "levelId" text NOT NULL,
    "parentName" text,
    "parentPhone" text,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Student" OWNER TO postgres;

--
-- Name: Tutor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tutor" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text NOT NULL,
    phone text,
    "bankName" text,
    "bankAccount" text
);


ALTER TABLE public."Tutor" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attendance" (id, "tutorId", "studentId", "subjectName", "durationMin", "photoUrl", notes, "feeNet", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Student" (id, "fullName", "levelId", "parentName", "parentPhone", "isActive") FROM stdin;
\.


--
-- Data for Name: Tutor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tutor" (id, "userId", "fullName", phone, "bankName", "bankAccount") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "passwordHash", role, "isActive", "createdAt") FROM stdin;
2f036827-3b25-43bb-b1a5-29029a069acc	admin@bimbel.com	$2b$10$ruuG5ETmk16WkyD6hqptveeYANnA4QJs.S5a.YoUhZ56UQR2HkJt2	admin	t	2026-04-24 04:53:08.453
94b3ecd2-b708-45c5-a5ae-3ad7d83eddbc	tutor1@bimbel.com	$2b$10$iRqLW/ww77DmQQXoJOeSIOfHqEOouxy2cauaCHM62i3NbSaiotNqu	tutor	t	2026-04-24 05:28:37.021
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8a6ab225-0aa5-4939-bbb2-a7dc67c8f969	bf7431c5e0fc147ebf6672be7b681a2e5789a27a59a328a2d8d261f535b6c6d2	2026-04-24 10:53:07.181558+07	20260424035306_init	\N	\N	2026-04-24 10:53:07.07031+07	1
\.


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: Tutor Tutor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tutor"
    ADD CONSTRAINT "Tutor_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Tutor_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Tutor_userId_key" ON public."Tutor" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Tutor Tutor_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tutor"
    ADD CONSTRAINT "Tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 8IG7r6dkScwlzQ14WlssSX3JzKNcgJPuihwZGHaqkwizfCfegSrOJQPeY2WieRK

