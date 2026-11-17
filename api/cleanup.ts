import type {IncomingMessage,ServerResponse} from 'node:http';
import {handler} from '../server/http';
export default function cleanup(req:IncomingMessage,res:ServerResponse){return handler(req,res,'cleanup');}
