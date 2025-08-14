import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// Datos fijos de tu cuenta
const CLAVE_AGENTE = '69101';
const NUM_NEGOCIO = '08386 AG_ALEJANDRO_DANIEL_MARQUEZ_CORONA';
const C_USUARIO = 'LINEA';
const C_TARIFA = 'LINEA';
const CLAVE_AMIS = '05818'; // ejemplo, cámbialo según el auto

app.post('/cotizar', async (req, res) => {
  const d = req.body;
  const hoy = new Date().toISOString().split('T')[0];
  const fin = new Date();
  fin.setFullYear(fin.getFullYear() + 1);
  const finVigencia = fin.toISOString().split('T')[0];

  // PLANTILLA XML COMPLETA
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<Movimientos>
  <Movimiento TipoMovimiento="3" NoPoliza="" NoCotizacion="" NoEndoso="" TipoEndoso="" NoOTra="" NoNegocio="${NUM_NEGOCIO}">
    <DatosAsegurado NoAsegurado="">
      <Nombre>${d.nombre}</Nombre>
      <Direccion>Direccion Ejemplo</Direccion>
      <Colonia>Colonia Ejemplo</Colonia>
      <Poblacion>Municipio Ejemplo</Poblacion>
      <Estado>09</Estado>
      <CodigoPostal>${d.cp}</CodigoPostal>
    </DatosAsegurado>

    <DatosVehiculo NoInciso="1">
      <ClaveAmis>${CLAVE_AMIS}</ClaveAmis>
      <Modelo>${d.anio}</Modelo>
      <DescripcionVehiculo>${d.modelo}</DescripcionVehiculo>
      <Uso>${d.uso}</Uso>
      <Servicio>${d.uso === '2' ? '2' : '1'}</Servicio>
      <Paquete>1</Paquete>
      <Motor/>
      <Serie/>
      <Coberturas NoCobertura="01">
        <SumaAsegurada>350000</SumaAsegurada>
        <TipoSuma>1</TipoSuma>
        <Deducible>5</Deducible>
        <Prima>0</Prima>
      </Coberturas>
      <Coberturas NoCobertura="03">
        <SumaAsegurada>350000</SumaAsegurada>
        <TipoSuma>1</TipoSuma>
        <Deducible>10</Deducible>
        <Prima>0</Prima>
      </Coberturas>
      <Coberturas NoCobertura="04">
        <SumaAsegurada>1000000</SumaAsegurada>
        <TipoSuma>1</TipoSuma>
        <Prima>0</Prima>
      </Coberturas>
    </DatosVehiculo>

    <DatosGenerales>
      <FechaEmision>${hoy}</FechaEmision>
      <FechaInicio>${hoy}</FechaInicio>
      <FechaTermino>${finVigencia}</FechaTermino>
      <Moneda>00</Moneda>
      <Agente>${CLAVE_AGENTE}</Agente>
      <FormaPago>C</FormaPago>
      <TarifaValores>${C_TARIFA}</TarifaValores>
      <TarifaCuotas>${C_TARIFA}</TarifaCuotas>
      <TarifaDerechos>${C_TARIFA}</TarifaDerechos>
      <PorcentajeDescuento>0</PorcentajeDescuento>
      <ConsideracionesAdicionalesDG NoConsideracion="32">
        <TipoRegla/>
        <ValorRegla>${d.celular}|No||${d.fecha_nacimiento}|Mexicana|${d.conductor === 'si' ? 'Conductor habitual' : 'No conductor'}||${d.email}|CURPXXXXXXX|RFCXXXXXXX</ValorRegla>
      </ConsideracionesAdicionalesDG>
    </DatosGenerales>

    <Primas>
      <Derecho>340</Derecho>
    </Primas>
  </Movimiento>
</Movimientos>`;

  // Envolvemos en SOAP
  const soapEnvelope = `<?xml version="1.0"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <TuMetodoCotizacion xmlns="http://tempuri.org/">
        <cUsuario>${C_USUARIO}</cUsuario>
        <cTarifa>${C_TARIFA}</cTarifa>
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
