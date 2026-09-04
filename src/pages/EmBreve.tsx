import Layout from "@/components/Layout";

export default function EmBreve() {
  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div>
          <h1 className="mb-2 text-xl font-semibold text-foreground">Em breve</h1>
          <p className="text-muted-foreground">
            Esta área ainda não está disponível para o seu perfil.
          </p>
        </div>
      </div>
    </Layout>
  );
}
