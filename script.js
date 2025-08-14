
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cotizacionForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Tomamos todos los datos del formulario
    const formData = Object.fromEntries(new FormData(form));

    try {
      // Enviamos al backend que construirá el XML y lo mandará al WS de Quálitas
      const res = await fetch('/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log('Respuesta del servidor:', data);

      alert('Cotización realizada. Revisa la consola para más detalles.');
    } catch (err) {
      console.error('Error:', err);
      alert('Ocurrió un error al cotizar.');
    }
  });
});
