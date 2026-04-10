import Link from "next/link";
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
            <Link
              href="/register"
              className={buttonVariants({ size: "sm" })}
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-32 sm:pt-40">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-accent/50 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma de Marketing Integral
          </div>

          <h2 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Impulsa tu{" "}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Negocio Inmobiliario
            </span>{" "}
            y Empresarial
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Conectamos propietarios, inquilinos y empresas con estrategias de
            marketing personalizadas. Diagnosticamos, recomendamos y
            transformamos tu presencia digital.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
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
              Explorar Servicios
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
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
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Soluciones para Cada Necesidad
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Ya seas propietario, inquilino o empresa, tenemos las herramientas
              y servicios perfectos para ti.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Propietarios */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold">Propietarios</h4>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  Registra tus propiedades, recibe recomendaciones de marketing y
                  maximiza el valor de tu inversión inmobiliaria.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Registro con galería de fotos",
                    "Marketing inmobiliario personalizado",
                    "Conexión con inquilinos perfilados",
                    "Fotografía y tours virtuales",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Registrar propiedad
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Inquilinos */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold">Inquilinos</h4>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  Completa tu perfil de preferencias y te conectaremos con las
                  mejores opciones de vivienda disponibles.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Perfil de preferencias detallado",
                    "Búsqueda personalizada inteligente",
                    "Asesoría profesional de mudanza",
                    "Comparación de opciones",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Buscar vivienda
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* PYMES */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/8 transition-transform duration-300 group-hover:scale-150" />
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Popular
                </span>
              </div>
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold">Empresas (PYMES)</h4>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  Diagnosticamos la madurez digital de tu empresa y te
                  recomendamos los servicios de marketing ideales.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Diagnóstico empresarial completo",
                    "Nivel de urgencia personalizado",
                    "Estrategias de marketing digital",
                    "Branding y presencia online",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Realizar diagnóstico
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
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
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo Que Necesitas en un Solo Lugar
            </h3>
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
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
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
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Lo Que Dicen Nuestros Clientes
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "María García",
                role: "Propietaria",
                text: "Gracias a WebMarketing logré alquilar mi apartamento en tiempo récord. Las fotos profesionales y la estrategia digital hicieron toda la diferencia.",
              },
              {
                name: "Carolina Ruiz",
                role: "Empresaria PYMES",
                text: "El diagnóstico empresarial fue revelador. Ahora tengo una estrategia digital clara y mis ventas han aumentado significativamente.",
              },
              {
                name: "Ana Martínez",
                role: "Inquilina",
                text: "Encontré mi hogar ideal en menos de una semana. El perfil de preferencias me conectó con exactamente lo que buscaba.",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-primary/10 bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary/80 text-primary/80"
                    />
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-rose-400 px-8 py-16 text-center text-primary-foreground shadow-xl shadow-primary/20 sm:px-16">
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h3 className="text-3xl font-bold sm:text-4xl">
                Comienza Tu Transformación Hoy
              </h3>
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
              <Link href="#servicios" className="transition-colors hover:text-primary">
                Servicios
              </Link>
              <Link href="#beneficios" className="transition-colors hover:text-primary">
                Beneficios
              </Link>
              <Link href="#testimonios" className="transition-colors hover:text-primary">
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
