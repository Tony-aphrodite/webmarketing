import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import {
  Building2,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Shield,
  Zap,
  Heart,
  Play,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              WebMarketing
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#servicios"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Servicios
            </Link>
            <Link
              href="#beneficios"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Beneficios
            </Link>
            <Link
              href="#testimonios"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Testimonios
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Iniciar Sesión
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:pt-32 md:pb-20">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          {/* Left: Text */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma de Marketing Integral
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Impulsa tu{" "}
              <span className="bg-gradient-to-r from-primary via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Presencia
              </span>{" "}
              Digital
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Conectamos propietarios, inquilinos y empresas con estrategias de
              marketing personalizadas. Diagnosticamos, recomendamos y
              transformamos tu negocio.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className={buttonVariants({
                  size: "lg",
                  className: "gap-2 px-8 shadow-lg shadow-primary/25",
                })}
              >
                Comenzar Ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#servicios"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "gap-2 px-8",
                })}
              >
                <Play className="h-4 w-4" />
                Explorar Servicios
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Registro gratuito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Diagnóstico personalizado
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Resultados en minutos
              </span>
            </div>
          </div>

          {/* Right: Hero image collage */}
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-primary/10">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=1000&fit=crop&crop=center"
                alt="Modern luxury home interior"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
            </div>
            {/* Floating card 1 */}
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-primary/10 bg-card/95 p-4 shadow-xl backdrop-blur-sm sm:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">+500 Propiedades</p>
                  <p className="text-xs text-muted-foreground">Registradas este año</p>
                </div>
              </div>
            </div>
            {/* Floating card 2 */}
            <div className="absolute -right-2 top-8 rounded-2xl border border-primary/10 bg-card/95 p-4 shadow-xl backdrop-blur-sm sm:-right-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">4.9 / 5.0</p>
                  <p className="text-xs text-muted-foreground">Satisfacción</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by strip */}
      <section className="border-y border-primary/5 bg-secondary/30 px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-12">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Servicios que ofrecemos
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted-foreground/70 sm:gap-10">
            <span>Fotografía</span>
            <span className="text-primary/30">|</span>
            <span>Tours Virtuales</span>
            <span className="text-primary/30">|</span>
            <span>SEO</span>
            <span className="text-primary/30">|</span>
            <span>Redes Sociales</span>
            <span className="text-primary/30">|</span>
            <span>Branding</span>
            <span className="text-primary/30">|</span>
            <span>Google Ads</span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="relative px-4 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-primary">
              Nuestros Servicios
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Soluciones para Cada Necesidad
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Ya seas propietario, inquilino o empresa, tenemos las herramientas
              y servicios perfectos para ti.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Propietarios */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&crop=center"
                  alt="Modern property exterior"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-sm">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold">Propietarios</h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  Registra tus propiedades, recibe recomendaciones de marketing y
                  maximiza tu inversión inmobiliaria.
                </p>
                <ul className="space-y-2">
                  {[
                    "Registro con galería de fotos",
                    "Marketing inmobiliario personalizado",
                    "Conexión con inquilinos perfilados",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Registrar propiedad
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Inquilinos */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&crop=center"
                  alt="Cozy apartment living room"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-sm">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold">Inquilinos</h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  Completa tu perfil de preferencias y te conectaremos con las
                  mejores opciones de vivienda.
                </p>
                <ul className="space-y-2">
                  {[
                    "Perfil de preferencias detallado",
                    "Búsqueda personalizada inteligente",
                    "Asesoría profesional de mudanza",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Buscar vivienda
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* PYMES */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute right-4 top-4 z-10">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm">
                  Popular
                </span>
              </div>
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&crop=center"
                  alt="Business team collaboration"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-sm">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold">
                  Empresas (PYMES)
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  Diagnosticamos la madurez digital de tu empresa y te
                  recomendamos los servicios ideales.
                </p>
                <ul className="space-y-2">
                  {[
                    "Diagnóstico empresarial completo",
                    "Estrategias de marketing digital",
                    "Branding y presencia online",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Realizar diagnóstico
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature showcase with image */}
      <section className="px-4 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl shadow-primary/10">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&crop=face"
                alt="Professional woman with laptop"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 rounded-2xl border border-primary/10 bg-card p-5 shadow-xl sm:-right-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">95%</p>
                  <p className="text-xs text-muted-foreground">
                    Clientes satisfechas
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-primary">
              Nuestra Misión
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Hacemos Crecer tu Negocio con Estrategia
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Cada cliente es único. Por eso nuestro sistema analiza tu
              situación actual y crea un plan de marketing personalizado que
              realmente funciona.
            </p>
            <div className="mt-8 space-y-4">
              {[
                {
                  title: "Diagnóstico Inteligente",
                  desc: "Evaluamos tu presencia digital y nivel de urgencia.",
                },
                {
                  title: "Recomendaciones Personalizadas",
                  desc: "Servicios seleccionados según tus necesidades reales.",
                },
                {
                  title: "Resultados Medibles",
                  desc: "Seguimiento transparente del impacto en tu negocio.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        id="beneficios"
        className="border-y border-primary/10 bg-gradient-to-b from-secondary/50 to-background px-4 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-primary">
              Por Qué Elegirnos
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo Que Necesitas en un Solo Lugar
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: "Rápido y Eficiente",
                desc: "Diagnóstico y recomendaciones en minutos, no en semanas.",
              },
              {
                icon: Heart,
                title: "Personalizado",
                desc: "Cada recomendación es única, basada en tu situación real.",
              },
              {
                icon: Shield,
                title: "Confiable",
                desc: "Datos seguros y servicios verificados para tu tranquilidad.",
              },
              {
                icon: Star,
                title: "Resultados Reales",
                desc: "Estrategias probadas que generan crecimiento tangible.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-transparent bg-card p-6 text-center transition-all duration-300 hover:border-primary/10 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-2 font-semibold">{item.title}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-primary">
              Testimonios
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Lo Que Dicen Nuestros Clientes
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "María García",
                role: "Propietaria",
                text: "Gracias a WebMarketing logré alquilar mi apartamento en tiempo récord. Las fotos profesionales y la estrategia digital hicieron toda la diferencia.",
                img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
              },
              {
                name: "Carolina Ruiz",
                role: "Empresaria PYMES",
                text: "El diagnóstico empresarial fue revelador. Ahora tengo una estrategia digital clara y mis ventas han aumentado significativamente.",
                img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
              },
              {
                name: "Ana Martínez",
                role: "Inquilina",
                text: "Encontré mi hogar ideal en menos de una semana. El perfil de preferencias me conectó con exactamente lo que buscaba.",
                img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-primary/10 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary/80 text-primary/80"
                    />
                  ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.img}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-primary/20">
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=600&fit=crop&crop=center"
                alt="Beautiful modern interior"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-rose-400/85" />
            </div>
            <div className="relative px-8 py-16 text-center text-primary-foreground sm:px-16">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Comienza Tu Transformación Hoy
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
                Regístrate gratis y descubre cómo podemos ayudarte a alcanzar
                tus metas de marketing.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className={buttonVariants({
                    size: "lg",
                    variant: "secondary",
                    className: "gap-2 px-8 font-semibold shadow-lg",
                  })}
                >
                  Crear Cuenta Gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-secondary/30 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">WebMarketing</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                href="#servicios"
                className="transition-colors hover:text-primary"
              >
                Servicios
              </Link>
              <Link
                href="#beneficios"
                className="transition-colors hover:text-primary"
              >
                Beneficios
              </Link>
              <Link
                href="#testimonios"
                className="transition-colors hover:text-primary"
              >
                Testimonios
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-primary/10 pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} WebMarketing. Todos los derechos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
