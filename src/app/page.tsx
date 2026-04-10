import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <h1 className="text-xl font-bold">WebMarketing</h1>
          <div className="flex gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Iniciar Sesión
            </Link>
            <Link href="/register" className={buttonVariants()}>
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h2 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Marketing Residencial y Empresarial en un Solo Lugar
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Conectamos propietarios, inquilinos y empresas con los servicios de
          marketing que necesitan. Diagnosticamos tu situación y te recomendamos
          la mejor estrategia.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Comenzar Ahora
          </Link>
          <Link href="#servicios" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Ver Servicios
          </Link>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="border-t bg-muted/50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-12 text-center text-3xl font-bold">
            Nuestras Líneas de Negocio
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Building2 className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Propietarios</CardTitle>
                <CardDescription>
                  Registra tus propiedades y recibe recomendaciones de marketing
                  para maximizar tu inversión inmobiliaria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Registro de propiedades con imágenes</li>
                  <li>Marketing personalizado</li>
                  <li>Conexión con inquilinos perfilados</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Inquilinos</CardTitle>
                <CardDescription>
                  Completa tu perfil de preferencias y te conectaremos con las
                  mejores opciones de vivienda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Formulario de preferencias</li>
                  <li>Búsqueda personalizada</li>
                  <li>Asistencia en negociación</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Empresas (PYMES)</CardTitle>
                <CardDescription>
                  Diagnosticamos la madurez digital de tu empresa y te
                  recomendamos los servicios de marketing ideales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Diagnóstico empresarial</li>
                  <li>Nivel de urgencia y recomendaciones</li>
                  <li>Servicios personalizados</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WebMarketing. Todos los derechos
          reservados.
        </div>
      </footer>
    </div>
  );
}
