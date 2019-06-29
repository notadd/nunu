import { createNunu } from '../lib/fastify';
import fastify from 'fastify';
const app = fastify();
const nunu = createNunu({});
app.register(nunu)
app.listen(9000)