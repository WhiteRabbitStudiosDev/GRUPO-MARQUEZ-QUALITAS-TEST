import express from 'express';
import fetch from 'node-fetch';
import { Builder } from 'xml2js';

const app = express();
app.use(express.json());

// Códigos fijos de ejemplo (ajusta a tu info real)
const CLAVE_AGENTE = 'AGT12345';
const CLAVE_AMIS = '05818';
const PAQUETE = '1';

app.post('/cotizar', async (req, res) => {
  const d = req.body;
  const hoy = new Date().toISOString().split('T')[0];
  const fin = new Date();
  fin.setFullYear(fin.getFullYear() + 1);
  const finVigencia = fin.toISOString().split('T')[0];

  // Armamos el objeto XML
  const xmlObj = {
    Movimientos: {
      Movimiento: {
        $: { TipoMovimiento: '3', NoNegocio: 'WR-TEST-001' },
        DatosAsegurado: {
          Nombre: d.nombre,
          CodigoPostal: d.cp
        },
        DatosVehiculo: {
          ClaveAmis: CLAVE_AMIS,
          Modelo: d.anio,
          DescripcionVehiculo: d.modelo,
          Uso: d.uso,
          Servicio: d.uso === '2' ? '2' : '1', // Uber/Didi servicio público
          Paquete: PAQUETE
        },
        DatosGenerales: {
          FechaEmision: hoy,
          FechaInicio: hoy,
          FechaTermino: finVigencia,
          Moneda: '00',
          Agente: CLAVE_AGENTE,
          FormaPago: 'C',
          PorcentajeDescuento: '0',
          ConsideracionesAdicionalesDG: {
            $: { NoConsideracion: '32' },
            TipoRegla: '',
            ValorRegla: `${d.celular}|No||${d.fecha_nacimiento}|Mexicana|${d.conductor === 'si' ? 'Conductor habitual' : 'No conductor'}||${d.email}|CURPXXXXXXX|RFCXXXXXXX`
          }
        }
      }
    }
  };

  const builder = new Builder({ headless: true });
  const xml = builder.buildObject(xmlObj);

  // Petición SOAP al ambiente de pruebas de Quálitas
  const soapEnvelope = `<?xml version="1.0"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <TuMetodoCotizacion xmlns="http://tempuri.org/">
        <xml>${xml}</xml>
      </TuMetodoCotizacion>
    </soap:Body>
  </soap:Envelope>`;

  try {
    const response = await fetch('https://qa.qualitas.com.mx:8443/WsEmision/WsEmision.asmx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/TuMetodoCotizacion'
      },
      body: soapEnvelope
    });

    const result = await response.text();
    res.json({ enviado: xml, respuesta: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Servidor iniciado en puerto 3000'));
