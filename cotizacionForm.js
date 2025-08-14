document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cotizacionForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log('Respuesta del servidor:', data);

      alert('Cotización realizada. Revisa la consola.');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al cotizar.');
    }
  });
});
