export default function Contacto() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-poncho">Contacto</h1>
      <form className="mt-6 max-w-xl grid gap-4">
        <label className="grid gap-1">
          <span>Nombre</span>
          <input className="border rounded-xl p-3" required />
        </label>
        <label className="grid gap-1">
          <span>Email</span>
          <input type="email" className="border rounded-xl p-3" required />
        </label>
        <label className="grid gap-1">
          <span>Mensaje</span>
          <textarea className="border rounded-xl p-3" rows={5} required />
        </label>
        <button className="bg-poncho text-white rounded-xl px-5 py-3">Enviar</button>
      </form>
    </main>
  );
}
