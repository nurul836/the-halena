import {createServer} from 'node:http';
import {handler} from '../server/http';
createServer((req,res)=>{void handler(req,res,req.url?.startsWith('/api/cleanup')?'cleanup':undefined);}).listen(8787,'127.0.0.1',()=>console.log('HALENA API listening locally on http://127.0.0.1:8787'));
