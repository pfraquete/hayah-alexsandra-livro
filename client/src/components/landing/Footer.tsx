export function Footer() {
  return (
    <footer className="mt-10 py-12 text-center text-sm text-[#b18da0]">
      <div className="container mx-auto px-4">
        <p>
          &copy; {new Date().getFullYear()} Livro Alexsandra Sardinha. Todos os direitos reservados.
        </p>
        <p className="mt-2">
          Desenvolvido com carinho por você 💗
        </p>
      </div>
    </footer>
  );
}
