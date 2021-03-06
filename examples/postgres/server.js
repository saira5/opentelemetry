'use strict';

const api = require('@opentelemetry/api');
// eslint-disable-next-line import/order
const tracer = require('./tracer')('postgres-server-service');
const { SpanKind, SpanStatusCode } = require('@opentelemetry/api');
const express = require('express');
const setupPg = require('./setupPsql');

const pool = setupPg.startPsql();

const app = express();

app.get('/:cmd', (req, res) => {
  const cmd = req.path.slice(1);
  if (!req.query.id) {
    res.status(400).send('No id provided');
    return;
  }
  let queryText = `SELECT id, text FROM test WHERE id = ${req.query.id}`;
  if (cmd === 'insert') {
    if (!req.query.text) {
      res.status(400).send('No text provided');
      return;
    }
    queryText = {
      text: 'INSERT INTO test (id, text) VALUES($1, $2) ON CONFLICT(id) DO UPDATE SET text=$2',
      values: [req.query.id, req.query.text],
    };
  }
  const currentSpan = api.trace.getSpan(api.context.active());
  console.log(`traceid: ${currentSpan.spanContext().traceId}`);
  const span = tracer.startSpan(cmd, {
    kind: SpanKind.SERVER,
  });
  api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, span), () => {
    try {
      pool.query(queryText, (err, ret) => {
        if (err) throw err;
        res.send(ret.rows);
      });
    } catch (e) {
      res.status(400).send({ message: e.message });
      span.setStatus(SpanStatusCode.ERROR);
    }
    span.end();
  });
});

// start server
const port = 3000;
app.listen(port, () => {
  console.log(`Node HTTP listening on ${port}`);
});
